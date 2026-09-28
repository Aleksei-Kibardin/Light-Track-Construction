import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

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

export class Fixture {
  readonly group = new THREE.Group();

  private lensMaterial: THREE.MeshStandardMaterial;
  private glowMaterial: THREE.SpriteMaterial;
  private light: THREE.SpotLight;

  constructor(
    material: THREE.MeshStandardMaterial,
    glowTexture: THREE.Texture,
  ) {
    const detailMaterial = new THREE.MeshStandardMaterial({
      color: "#353a37",
      metalness: 0.85,
      roughness: 0.24,
    });

    const addMesh = (
      parent: THREE.Object3D,
      geometry: THREE.BufferGeometry,
      meshMaterial: THREE.Material,
      position: [number, number, number],
    ) => {
      const mesh = new THREE.Mesh(geometry, meshMaterial);
      mesh.position.set(...position);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    };

    addMesh(
      this.group,
      new RoundedBoxGeometry(0.135, 0.035, 0.053, 3, 0.007),
      material,
      [0, -0.046, 0],
    );

    addMesh(
      this.group,
      new THREE.CylinderGeometry(0.019, 0.019, 0.075, 24),
      detailMaterial,
      [0, -0.09, 0],
    );

    const pivot = new THREE.Group();
    pivot.position.y = -0.13;
    pivot.rotation.x = -1.22;
    this.group.add(pivot);

    const hinge = addMesh(
      pivot,
      new THREE.CylinderGeometry(0.027, 0.027, 0.13, 32),
      detailMaterial,
      [0, 0, 0],
    );
    hinge.rotation.z = Math.PI / 2;

    const barrel = new THREE.Group();
    barrel.position.y = -0.067;
    pivot.add(barrel);

    addMesh(
      barrel,
      new THREE.CylinderGeometry(0.054, 0.069, 0.155, 48),
      material,
      [0, 0, 0],
    );

    const rim = addMesh(
      barrel,
      new THREE.TorusGeometry(0.063, 0.006, 12, 48),
      detailMaterial,
      [0, -0.081, 0],
    );
    rim.rotation.x = Math.PI / 2;

    this.lensMaterial = new THREE.MeshStandardMaterial({
      color: "#fff0d9",
      emissive: "#ffe0aa",
      emissiveIntensity: 1.7,
      roughness: 0.15,
      metalness: 0.05,
      toneMapped: false,
    });

    const lens = addMesh(
      barrel,
      new THREE.CylinderGeometry(0.057, 0.057, 0.005, 40),
      this.lensMaterial,
      [0, -0.081, 0],
    );
    lens.castShadow = false;

    this.glowMaterial = new THREE.SpriteMaterial({
      map: glowTexture,
      color: "#ffe0aa",
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    });

    const glow = new THREE.Sprite(this.glowMaterial);
    glow.position.y = -0.092;
    glow.scale.set(0.25, 0.25, 1);
    barrel.add(glow);

    this.light = new THREE.SpotLight("#ffe0aa", 2.6, 2.5, 0.65, 1, 2);
    this.light.position.set(0, -0.19, 0.075);

    const target = new THREE.Object3D();
    target.position.set(0, -0.85, 0.42);

    this.group.add(this.light, target);
    this.light.target = target;
  }

  setTemperature(color: THREE.Color) {
    this.lensMaterial.color.copy(color);
    this.lensMaterial.emissive.copy(color);
    this.glowMaterial.color.copy(color);
    this.light.color.copy(color);
  }

  setPresence(value: number) {
    this.group.visible = value > 0.005;
    this.group.scale.setScalar(Math.max(0.001, value));
    this.light.intensity = 2.6 * value;
  }
}
