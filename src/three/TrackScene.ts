import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Track, createPath } from "./Track";
import { Fixture, createGlowTexture } from "./Fixture";
import {
  finishes,
  type ConfiguratorState,
  MAX_FIXTURES,
} from "../types/configurator";

export class TrackScene {
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(30, 1, 0.05, 60);
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private observer: ResizeObserver;

  private root = new THREE.Group();
  private track: Track;
  private fixtures: Fixture[] = [];
  private presence = Array<number>(MAX_FIXTURES).fill(0);

  private metal = new THREE.MeshStandardMaterial();
  private targetColor = new THREE.Color();
  private lightColor = new THREE.Color();
  private targetLightColor = new THREE.Color();

  private environment: THREE.WebGLRenderTarget;
  private glowTexture = createGlowTexture();

  private state: ConfiguratorState;
  private host: HTMLElement;
  private frame = 0;
  private previousTime = 0;
  private fitDistance: number | null = null;
  private disposed = false;

  private reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    .matches;

  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.6);
  private dragOffset = new THREE.Vector3();
  private intersection = new THREE.Vector3();
  private dragPointer: number | null = null;

  private draggingTrack = false;
  private draggingFixture: number | null = null;

  private hoveredFixture: number | null = null;
  private buttonHovered = false;
  private removeButton: HTMLButtonElement | null = null;

  private fractions: number[] = Array.from(
    { length: MAX_FIXTURES },
    (_, i) => (i + 0.5) / MAX_FIXTURES,
  );

  constructor(
    host: HTMLElement,
    initial: ConfiguratorState,
    _onFixtureRemoved?: (index: number) => void,
  ) {
    this.host = host;
    this.state = { ...initial };

    if (
      Array.isArray(initial.fractions) &&
      initial.fractions.length === MAX_FIXTURES
    ) {
      this.fractions = [...initial.fractions];
    }

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.VSMShadowMap;

    const canvas = this.renderer.domElement;
    canvas.setAttribute(
      "aria-label",
      "Интерактивная 3D-модель трекового освещения",
    );
    canvas.style.touchAction = "none";
    this.host.appendChild(canvas);

    this.host.style.position ||= "relative";

    this.scene.background = new THREE.Color("#eeefeb");
    this.scene.fog = new THREE.Fog("#eeefeb", 10, 24);

    this.environment = this.createEnvironment();
    this.scene.environment = this.environment.texture;
    this.scene.environmentIntensity = 0.85;

    this.scene.add(new THREE.HemisphereLight("#ffffff", "#a5aaa1", 2.1));

    const key = new THREE.DirectionalLight("#fff8ee", 3.6);
    key.position.set(-3, 7, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -5;
    key.shadow.camera.right = 5;
    key.shadow.camera.top = 5;
    key.shadow.camera.bottom = -5;
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 18;
    key.shadow.bias = -0.00015;
    key.shadow.normalBias = 0.014;
    key.shadow.radius = 5;
    key.shadow.blurSamples = 8;
    this.scene.add(key);

    const fill = new THREE.DirectionalLight("#e5edff", 1.4);
    fill.position.set(4, 3, -4);
    this.scene.add(fill);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshStandardMaterial({
        color: "#e5e7e0",
        roughness: 1,
        metalness: 0,
      }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.04;
    floor.receiveShadow = true;
    this.scene.add(floor);

    const grid = new THREE.GridHelper(20, 80, "#bdc3b8", "#bdc3b8");
    grid.position.y = -0.038;

    const gridMaterials = Array.isArray(grid.material)
      ? grid.material
      : [grid.material];

    gridMaterials.forEach((material) => {
      material.transparent = true;
      material.opacity = 0.14;
      material.depthWrite = false;
    });

    this.scene.add(grid);

    this.root.position.y = 0.6;
    this.scene.add(this.root);

    this.track = new Track(this.metal, this.state.trackType, this.state.length);
    this.root.add(this.track.group);

    for (let i = 0; i < MAX_FIXTURES; i++) {
      const type = this.state.fixtures[i] ?? "spot";
      const fixture = new Fixture(this.metal, this.glowTexture, type);
      const fraction = this.fractions[i] ?? (i + 0.5) / MAX_FIXTURES;

      fixture.group.position.copy(this.track.sample(fraction));
      this.orientFixture(fixture, fraction);

      this.presence[i] = i < this.state.fixtures.length ? 1 : 0;
      fixture.setPresence(this.presence[i]);
      this.fixtures.push(fixture);
      this.root.add(fixture.group);
    }

    canvas.addEventListener("pointerdown", this.onPointerDown, true);
    canvas.addEventListener("pointermove", this.onPointerMove);
    canvas.addEventListener("pointerup", this.onPointerUp);
    canvas.addEventListener("pointercancel", this.onPointerUp);
    canvas.addEventListener("lostpointercapture", this.onPointerUp);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.target.set(0, 0.35, 0);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.075;
    this.controls.enablePan = false;
    this.controls.rotateSpeed = 0.45;
    this.controls.zoomSpeed = 0.7;
    this.controls.minPolarAngle = 0;
    this.controls.maxPolarAngle = Math.PI;
    this.controls.minAzimuthAngle = -Math.PI / 2;
    this.controls.maxAzimuthAngle = Math.PI / 2;
    this.controls.minDistance = 1.3;
    this.controls.maxDistance = 12;
    this.controls.addEventListener("start", this.onControlsStart);

    this.update(initial);
    this.metal.color.copy(this.targetColor);
    this.lightColor.copy(this.targetLightColor);
    this.fixtures.forEach((fixture) => fixture.setTemperature(this.lightColor));

    this.resize();
    this.reset();

    this.observer = new ResizeObserver(() => {
      this.resize();
      this.fit();
    });
    this.observer.observe(host);

    this.frame = requestAnimationFrame(this.animate);
  }

  private createEnvironment() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;

    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#7b807a";
    ctx.fillRect(0, 0, 512, 256);

    for (const [x, y, radius] of [
      [100, 65, 120],
      [390, 90, 90],
      [260, 15, 80],
    ]) {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, "#ffffff");
      gradient.addColorStop(0.3, "#e5e7e2");
      gradient.addColorStop(1, "rgba(123,128,122,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 256);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.mapping = THREE.EquirectangularReflectionMapping;

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const result = pmrem.fromEquirectangular(texture);

    texture.dispose();
    pmrem.dispose();

    return result;
  }

  update(next: ConfiguratorState) {
    const trackChanged = next.trackType !== this.state.trackType;
    const lengthChanged = next.length !== this.state.length;
    const geometryChanged = trackChanged || lengthChanged;

    const nextLen = next.fixtures.length;
    const prevLen = this.state.fixtures.length;
    const countChanged = nextLen !== prevLen;

    const typesChanged =
      countChanged ||
      next.fixtures.some((type, i) => type !== this.state.fixtures[i]);

    this.state = { ...next };
    this.track.setShape(next.trackType, next.length);
    if (geometryChanged) this.track.tick(1);

    if (typesChanged) {
      for (let i = 0; i < Math.min(nextLen, MAX_FIXTURES); i++) {
        this.fixtures[i].setType(next.fixtures[i]);
      }
    }

    if (countChanged) {
      this.fractions = Array.from({ length: MAX_FIXTURES }, (_, i) =>
        i < nextLen ? (i + 0.5) / nextLen : 0,
      );

      for (let i = 0; i < MAX_FIXTURES; i++) {
        const active = i < nextLen;
        this.presence[i] = active ? 1 : 0;

        if (active) {
          const fraction = this.fractions[i];
          this.fixtures[i].group.position.copy(this.track.sample(fraction));
          this.orientFixture(this.fixtures[i], fraction);
        }

        this.fixtures[i].setPresence(this.presence[i]);
      }
    } else if (geometryChanged) {
      for (let i = 0; i < nextLen; i++) {
        const fraction = this.fractions[i];
        this.fixtures[i].group.position.copy(this.track.sample(fraction));
        this.orientFixture(this.fixtures[i], fraction);
      }
    }

    const finish = finishes[next.color];
    this.targetColor.set(finish.swatch);
    this.metal.metalness = finish.metalness;
    this.metal.roughness = finish.roughness;

    const stops: [number, string][] = [
      [2700, "#faa33f"],
      [3000, "#ffca8e"],
      [4000, "#fff0dd"],
      [5000, "#edf4ff"],
    ];

    const kelvin = THREE.MathUtils.clamp(next.temperature, 2700, 5000);
    const upper = stops.findIndex(([temperature]) => temperature >= kelvin);

    if (upper <= 0) {
      this.targetLightColor.set(stops[0][1]);
    } else {
      const [lowK, lowColor] = stops[upper - 1];
      const [highK, highColor] = stops[upper];

      this.targetLightColor
        .set(lowColor)
        .lerp(new THREE.Color(highColor), (kelvin - lowK) / (highK - lowK));
    }

    if (geometryChanged) this.fit();
  }

  private orientFixture(fixture: Fixture, fraction: number) {
    const eps = 0.01;
    const p1 = this.track.sample(Math.max(0, fraction - eps));
    const p2 = this.track.sample(Math.min(1, fraction + eps));
    const dir = p2.sub(p1);

    if (dir.lengthSq() < 1e-6) return;

    dir.normalize();
    fixture.group.rotation.y = -Math.atan2(dir.z, dir.x);
  }

  private resize() {
    const width = Math.max(1, this.host.clientWidth);
    const height = Math.max(1, this.host.clientHeight);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private fit() {
    const path = createPath(this.state.trackType, this.state.length);
    const bounds = new THREE.Box3().setFromPoints(path);

    const halfX = (bounds.max.x - bounds.min.x) / 2 + 0.16;
    const halfZ = (bounds.max.z - bounds.min.z) / 2 + 0.25;

    const direction = this.camera.position
      .clone()
      .sub(this.controls.target)
      .normalize();

    if (direction.lengthSq() < 0.1) direction.set(0.3, 0.68, 0.68).normalize();

    const right = new THREE.Vector3()
      .crossVectors(new THREE.Vector3(0, 1, 0), direction)
      .normalize();

    const up = new THREE.Vector3().crossVectors(direction, right).normalize();
    const tanV = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const tanH = tanV * this.camera.aspect;
    const rotation = THREE.MathUtils.degToRad(this.state.rotation);

    let distance = 1.8;

    for (const x of [-halfX, halfX]) {
      for (const y of [-0.22, 0.32]) {
        for (const z of [-halfZ, halfZ]) {
          const point = new THREE.Vector3(x, y, z).applyAxisAngle(
            new THREE.Vector3(0, 1, 0),
            rotation,
          );

          const depth = point.dot(direction);

          distance = Math.max(
            distance,
            depth + Math.abs(point.dot(right)) / tanH,
            depth + Math.abs(point.dot(up)) / tanV,
          );
        }
      }
    }

    this.fitDistance = THREE.MathUtils.clamp(distance * 1.17, 1.8, 11);
  }

  reset() {
    this.root.position.set(0, 0.6, 0);
    this.controls.target.set(0, 0.35, 0);

    const direction = new THREE.Vector3(0.3, 0.68, 0.68).normalize();
    this.camera.position
      .copy(this.controls.target)
      .addScaledVector(direction, 5);
    this.camera.lookAt(this.controls.target);

    this.fit();

    this.camera.position
      .copy(this.controls.target)
      .addScaledVector(direction, this.fitDistance ?? 5);

    this.fitDistance = null;
    this.controls.update();
  }

  private onControlsStart = () => {
    this.fitDistance = null;
  };

  private prepareRay(event: PointerEvent) {
    const rect = this.renderer.domElement.getBoundingClientRect();

    this.pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );

    this.raycaster.setFromCamera(this.pointer, this.camera);
  }

  private hitsProduct() {
    return this.raycaster.intersectObject(this.root, true).some((hit) => {
      if (!(hit.object instanceof THREE.Mesh)) return false;

      let object: THREE.Object3D | null = hit.object;

      while (object) {
        if (!object.visible) return false;
        object = object.parent;
      }

      return true;
    });
  }

  private pickFixture(): number | null {
    for (let i = 0; i < this.fixtures.length; i++) {
      const fixture = this.fixtures[i];
      if (!fixture.group.visible) continue;

      const hits = this.raycaster.intersectObject(fixture.group, true);

      const valid = hits.some((hit) => {
        let object: THREE.Object3D | null = hit.object;
        while (object) {
          if (!object.visible) return false;
          object = object.parent;
        }
        return true;
      });

      if (valid) return i;
    }

    return null;
  }

  private onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0 || this.dragPointer !== null) return;

    this.prepareRay(event);

    const fixtureHit = this.pickFixture();

    if (fixtureHit !== null) {
      if (
        !this.raycaster.ray.intersectPlane(this.dragPlane, this.intersection)
      ) {
        return;
      }

      const fixtureWorld = this.fixtures[fixtureHit].group.getWorldPosition(
        new THREE.Vector3(),
      );

      this.dragPointer = event.pointerId;
      this.draggingFixture = fixtureHit;
      this.draggingTrack = false;
      this.dragOffset.copy(this.intersection).sub(fixtureWorld);
      this.controls.enabled = false;

      this.renderer.domElement.setPointerCapture(event.pointerId);
      this.renderer.domElement.style.cursor = "grabbing";

      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    if (!this.hitsProduct()) return;
    if (!this.raycaster.ray.intersectPlane(this.dragPlane, this.intersection))
      return;

    this.dragPointer = event.pointerId;
    this.draggingTrack = true;
    this.draggingFixture = null;
    this.dragOffset.copy(this.intersection).sub(this.root.position);
    this.controls.enabled = false;

    this.renderer.domElement.setPointerCapture(event.pointerId);
    this.renderer.domElement.style.cursor = "grabbing";

    event.preventDefault();
    event.stopImmediatePropagation();
  };

  private onPointerMove = (event: PointerEvent) => {
    this.prepareRay(event);

    if (this.dragPointer === event.pointerId && this.draggingFixture !== null) {
      if (
        this.raycaster.ray.intersectPlane(this.dragPlane, this.intersection)
      ) {
        const world = this.intersection.clone().sub(this.dragOffset);
        const t = this.track.project(world);

        this.fractions[this.draggingFixture] = t;

        const pos = this.track.sample(t);
        this.fixtures[this.draggingFixture].group.position.copy(pos);
        this.orientFixture(this.fixtures[this.draggingFixture], t);
      }
      return;
    }

    if (this.dragPointer === event.pointerId && this.draggingTrack) {
      if (
        this.raycaster.ray.intersectPlane(this.dragPlane, this.intersection)
      ) {
        this.intersection.sub(this.dragOffset);
        this.root.position.x = THREE.MathUtils.clamp(
          this.intersection.x,
          -0.7,
          0.7,
        );
        this.root.position.z = THREE.MathUtils.clamp(
          this.intersection.z,
          -0.6,
          0.6,
        );
      }
      return;
    }

    if (this.dragPointer === null && event.pointerType === "mouse") {
      const fixtureHit = this.pickFixture();

      if (fixtureHit !== null) {
        this.renderer.domElement.style.cursor = "grab";
        this.hoveredFixture = fixtureHit;
      } else if (this.hitsProduct()) {
        this.renderer.domElement.style.cursor = "grab";
        if (!this.buttonHovered) this.hoveredFixture = null;
      } else {
        this.renderer.domElement.style.cursor = "default";
        if (!this.buttonHovered) this.hoveredFixture = null;
      }
    }
  };

  private onPointerUp = (event: PointerEvent) => {
    if (this.dragPointer !== event.pointerId) return;

    this.dragPointer = null;
    this.draggingTrack = false;
    this.draggingFixture = null;
    this.controls.enabled = true;
    this.renderer.domElement.style.cursor = "default";

    if (this.renderer.domElement.hasPointerCapture(event.pointerId)) {
      this.renderer.domElement.releasePointerCapture(event.pointerId);
    }
  };

  private updateRemoveButton() {
    if (!this.removeButton) return;

    const visible = this.hoveredFixture !== null || this.buttonHovered;

    if (!visible || this.hoveredFixture === null) {
      this.removeButton.style.display = "none";
      return;
    }

    const fixture = this.fixtures[this.hoveredFixture];
    if (!fixture.group.visible) {
      this.removeButton.style.display = "none";
      return;
    }

    const world = new THREE.Vector3();
    fixture.group.getWorldPosition(world);

    const projected = world.clone().project(this.camera);
    const rect = this.host.getBoundingClientRect();

    const x = (projected.x * 0.5 + 0.5) * rect.width;
    const y = (-projected.y * 0.5 + 0.5) * rect.height;

    const offsetX = 0;
    const offsetY = -10;

    this.removeButton.style.display = "block";
    this.removeButton.style.left = `${x - 14 + offsetX}px`;
    this.removeButton.style.top = `${y - 0 + offsetY}px`;
  }

  private animate = (time: number) => {
    if (this.disposed) return;

    const dt = this.previousTime
      ? Math.min((time - this.previousTime) / 1000, 0.05)
      : 1 / 60;

    this.previousTime = time;

    const alpha = this.reducedMotion ? 1 : 1 - Math.exp(-9 * dt);

    this.track.tick(alpha);
    this.metal.color.lerp(this.targetColor, alpha);
    this.lightColor.lerp(this.targetLightColor, alpha);

    this.root.rotation.y = THREE.MathUtils.lerp(
      this.root.rotation.y,
      THREE.MathUtils.degToRad(this.state.rotation),
      alpha,
    );

    this.fixtures.forEach((fixture, index) => {
      const active = index < this.state.fixtures.length;
      const targetPresence = active ? 1 : 0;

      this.presence[index] = THREE.MathUtils.lerp(
        this.presence[index],
        targetPresence,
        alpha,
      );

      fixture.setPresence(this.presence[index]);
      fixture.setTemperature(this.lightColor);
    });

    if (this.fitDistance !== null) {
      const direction = this.camera.position.clone().sub(this.controls.target);
      const distance = THREE.MathUtils.lerp(
        direction.length(),
        this.fitDistance,
        alpha,
      );

      this.camera.position
        .copy(this.controls.target)
        .addScaledVector(direction.normalize(), distance);

      if (Math.abs(distance - this.fitDistance) < 0.001) {
        this.fitDistance = null;
      }
    }

    this.controls.update();
    this.updateRemoveButton();
    this.renderer.render(this.scene, this.camera);

    this.frame = requestAnimationFrame(this.animate);
  };

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frame);
    this.observer.disconnect();

    const canvas = this.renderer.domElement;
    canvas.removeEventListener("pointerdown", this.onPointerDown, true);
    canvas.removeEventListener("pointermove", this.onPointerMove);
    canvas.removeEventListener("pointerup", this.onPointerUp);
    canvas.removeEventListener("pointercancel", this.onPointerUp);
    canvas.removeEventListener("lostpointercapture", this.onPointerUp);

    this.controls.removeEventListener("start", this.onControlsStart);
    this.controls.dispose();

    this.removeButton?.remove();
    this.removeButton = null;
    this.buttonHovered = false;

    for (const fixture of this.fixtures) {
      fixture.dispose();
    }
    this.fixtures = [];

    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();

    this.scene.traverse((object) => {
      const renderable = object as THREE.Mesh;

      if (renderable.geometry) geometries.add(renderable.geometry);

      if (renderable.material) {
        const list = Array.isArray(renderable.material)
          ? renderable.material
          : [renderable.material];

        list.forEach((material) => materials.add(material));
      }

      if (object instanceof THREE.DirectionalLight) {
        object.shadow.dispose();
      }
    });

    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());

    this.glowTexture.dispose();
    this.environment.dispose();
    this.renderer.dispose();
    canvas.remove();
  }
}
