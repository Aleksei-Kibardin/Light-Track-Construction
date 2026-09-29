import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import type { FixtureType } from "../types/configurator";

export function createGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;

  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);

  gradient.addColorStop(0, "rgba(255,255,255,0.9)");
  gradient.addColorStop(0.18, "rgba(255,255,255,0.35)");
  gradient.addColorStop(0.55, "rgba(255,255,255,0.07)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  return new THREE.CanvasTexture(canvas);
}

type PointedSpec = {
  barrelTop: number;
  barrelBottom: number;
  barrelHeight: number;
  rimRadius: number;
  lensRadius: number;
  lightAngle: number;
  lightDistance: number;
  lightIntensity: number;
  glowScale: number;
};

const POINTED: Record<"spot", PointedSpec> = {
  spot: {
    barrelTop: 0.069,
    barrelBottom: 0.069,
    barrelHeight: 0.155,
    rimRadius: 0.063,
    lensRadius: 0.057,
    lightAngle: 0.65,
    lightDistance: 2.5,
    lightIntensity: 2.6,
    glowScale: 0.25,
  },
};

const LINEAR_INTENSITY = 1.8;

export class Fixture {
  readonly group = new THREE.Group();

  private material: THREE.MeshStandardMaterial;
  private detailMaterial: THREE.MeshStandardMaterial;
  private lensMaterial: THREE.MeshStandardMaterial;
  private glowMaterial: THREE.SpriteMaterial;
  private light: THREE.SpotLight;
  private lightTarget: THREE.Object3D;

  private geometries: THREE.BufferGeometry[] = [];
  private type: FixtureType;
  private lightColor = new THREE.Color("#ffe0aa");

  constructor(
    material: THREE.MeshStandardMaterial,
    glowTexture: THREE.Texture,
    type: FixtureType = "spot",
  ) {
    this.material = material;
    this.type = type;

    this.detailMaterial = new THREE.MeshStandardMaterial({
      color: "#353a37",
      metalness: 0.85,
      roughness: 0.24,
    });

    this.lensMaterial = new THREE.MeshStandardMaterial({
      color: "#fff0d9",
      emissive: "#ffe0aa",
      emissiveIntensity: 1.7,
      roughness: 0.15,
      metalness: 0.05,
      toneMapped: false,
    });

    this.glowMaterial = new THREE.SpriteMaterial({
      map: glowTexture,
      color: "#ffe0aa",
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    });

    this.light = new THREE.SpotLight("#ffe0aa", 2.6, 2.5, 0.65, 1, 2);
    this.lightTarget = new THREE.Object3D();
    this.light.target = this.lightTarget;

    this.build();
  }

  setType(type: FixtureType) {
    if (type === this.type) return;
    this.type = type;
    this.build();
  }

  private trackGeometry<T extends THREE.BufferGeometry>(geometry: T): T {
    this.geometries.push(geometry);
    return geometry;
  }

  private addMesh(
    parent: THREE.Object3D,
    geometry: THREE.BufferGeometry,
    meshMaterial: THREE.Material,
    position: [number, number, number],
  ) {
    const mesh = new THREE.Mesh(this.trackGeometry(geometry), meshMaterial);
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  private build() {
    for (const geometry of this.geometries) geometry.dispose();
    this.geometries = [];
    this.group.clear();

    if (this.type === "linear") {
      this.buildLinear();
    } else {
      this.buildPointed();
    }

    this.lensMaterial.color.copy(this.lightColor);
    this.lensMaterial.emissive.copy(this.lightColor);
    this.glowMaterial.color.copy(this.lightColor);
    this.light.color.copy(this.lightColor);
  }

  private buildLinear() {
    const length = 0.6;
    const trackBottom = -0.0335;
    const trimHeight = 0.006;
    const barHeight = 0.004;

    const trimY = trackBottom - trimHeight / 2;
    const barY = trackBottom - trimHeight - barHeight / 2;

    const trim = this.addMesh(
      this.group,
      new RoundedBoxGeometry(length + 0.008, trimHeight, 0.055, 2, 0.003),
      this.detailMaterial,
      [0, trimY, 0],
    );
    trim.castShadow = false;
    trim.receiveShadow = false;

    const bar = this.addMesh(
      this.group,
      new RoundedBoxGeometry(length, barHeight, 0.045, 2, 0.005),
      this.lensMaterial,
      [0, barY, 0],
    );
    bar.castShadow = false;
    bar.receiveShadow = false;

    this.light.angle = 1.45;
    this.light.distance = 2;
    this.light.intensity = LINEAR_INTENSITY;
    this.light.position.set(0, barY - 0.02, 0);
    this.lightTarget.position.set(0, -1.5, 0);

    this.group.add(this.light, this.lightTarget);
  }

  private buildPointed() {
    const spec = POINTED[this.type as "spot"];

    this.addMesh(
      this.group,
      new THREE.CylinderGeometry(0.019, 0.019, 0.2, 24),
      this.detailMaterial,
      [0, -0.09, 0],
    );

    const pivot = new THREE.Group();
    pivot.position.y = -0.13;
    pivot.rotation.x = -0.8;
    this.group.add(pivot);

    const barrel = new THREE.Group();
    barrel.position.y = -0.067;
    pivot.add(barrel);

    this.addMesh(
      barrel,
      new THREE.CylinderGeometry(
        spec.barrelTop,
        spec.barrelBottom,
        spec.barrelHeight,
        48,
      ),
      this.material,
      [0, 0, 0],
    );

    const rimY = -spec.barrelHeight / 2 - 0.004;
    const lensY = rimY + 0.006;

    const rim = this.addMesh(
      barrel,
      new THREE.TorusGeometry(spec.rimRadius, 0.006, 12, 48),
      this.detailMaterial,
      [0, rimY, 0],
    );
    rim.rotation.x = Math.PI / 2;

    const lens = this.addMesh(
      barrel,
      new THREE.CylinderGeometry(spec.lensRadius, spec.lensRadius, 0.005, 40),
      this.lensMaterial,
      [0, lensY, 0],
    );
    lens.castShadow = false;

    const glow = new THREE.Sprite(this.glowMaterial);
    glow.position.y = rimY - 0.004;
    glow.scale.set(spec.glowScale, spec.glowScale, 1);
    barrel.add(glow);

    this.light.angle = spec.lightAngle;
    this.light.distance = spec.lightDistance;
    this.light.intensity = spec.lightIntensity;
    this.light.position.set(0, rimY - 0.1, 0.075);
    this.lightTarget.position.set(0, -0.85, 0.42);

    this.group.add(this.light, this.lightTarget);
  }

  setTemperature(color: THREE.Color) {
    this.lightColor.copy(color);
    this.lensMaterial.color.copy(color);
    this.lensMaterial.emissive.copy(color);
    this.glowMaterial.color.copy(color);
    this.light.color.copy(color);
  }

  setPresence(value: number) {
    this.group.visible = value > 0.005;
    this.group.scale.setScalar(Math.max(0.001, value));

    const base =
      this.type === "linear"
        ? LINEAR_INTENSITY
        : POINTED[this.type as "spot"].lightIntensity;

    this.light.intensity = base * value;
  }

  dispose() {
    for (const geometry of this.geometries) geometry.dispose();
    this.geometries = [];
    this.detailMaterial.dispose();
    this.lensMaterial.dispose();
    this.glowMaterial.dispose();
    this.light.dispose();
  }
}
