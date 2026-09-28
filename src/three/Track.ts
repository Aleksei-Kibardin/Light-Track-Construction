import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import type { TrackType } from "../types/configurator";

/** Пять точек образуют четыре сегмента. Координаты: X / Z. */
export function createPath(type: TrackType, length: number) {
  let points: [number, number][];

  switch (type) {
    case "line":
      points = [
        [0, 0],
        [1, 0],
        [1, 0],
        [1, 0],
        [1, 0],
      ];
      break;

    case "l":
      points = [
        [0, 0],
        [0.62, 0],
        [0.62, 0.38],
        [0.62, 0.38],
        [0.62, 0.38],
      ];
      break;

    case "u":
      points = [
        [0, 0.26],
        [0, 0],
        [0.48, 0],
        [0.48, 0.26],
        [0.48, 0.26],
      ];
      break;

    case "p":
      points = [
        [0, 0],
        [0.25, 0],
        [0.25, 0.25],
        [0, 0.25],
        [0, 0],
      ];
      break;
  }

  const xs = points.map(([x]) => x);
  const zs = points.map(([, z]) => z);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cz = (Math.min(...zs) + Math.max(...zs)) / 2;

  return points.map(
    ([x, z]) => new THREE.Vector3((x - cx) * length, 0, (z - cz) * length),
  );
}

export class Track {
  readonly group = new THREE.Group();

  private points: THREE.Vector3[];
  private target: THREE.Vector3[];
  private segments: THREE.Group[] = [];

  constructor(
    material: THREE.MeshStandardMaterial,
    type: TrackType,
    length: number,
  ) {
    this.points = createPath(type, length);
    this.target = this.points.map((point) => point.clone());

    const bodyGeometry = new RoundedBoxGeometry(1, 0.067, 0.068, 3, 0.008);
    const grooveGeometry = new THREE.BoxGeometry(1, 0.002, 0.028);

    const grooveMaterial = new THREE.MeshStandardMaterial({
      color: "#101311",
      roughness: 0.52,
      metalness: 0.3,
    });

    for (let i = 0; i < 4; i++) {
      const segment = new THREE.Group();

      const body = new THREE.Mesh(bodyGeometry, material);
      body.castShadow = true;
      body.receiveShadow = true;

      const topDetail = new THREE.Mesh(grooveGeometry, grooveMaterial);
      topDetail.position.y = 0.0338;
      topDetail.scale.z = 0.22;

      const bottomChannel = new THREE.Mesh(grooveGeometry, grooveMaterial);
      bottomChannel.position.y = -0.034;

      segment.add(body, topDetail, bottomChannel);
      this.group.add(segment);
      this.segments.push(segment);
    }

    this.tick(1);
  }

  setShape(type: TrackType, length: number) {
    this.target = createPath(type, length);
  }

  tick(alpha: number) {
    this.points.forEach((point, index) => {
      point.lerp(this.target[index], alpha);
    });

    this.segments.forEach((segment, index) => {
      const a = this.points[index];
      const b = this.points[index + 1];
      const distance = a.distanceTo(b);

      segment.visible = distance > 0.004;
      segment.position.copy(a).lerp(b, 0.5);
      segment.rotation.y = -Math.atan2(b.z - a.z, b.x - a.x);
      segment.scale.x = Math.max(distance + 0.004, 0.001);
    });
  }

  sample(fraction: number) {
    const lengths = this.points
      .slice(0, -1)
      .map((point, index) => point.distanceTo(this.points[index + 1]));

    const total = lengths.reduce((sum, value) => sum + value, 0);
    let remaining = THREE.MathUtils.clamp(fraction, 0, 1) * total;

    for (let i = 0; i < lengths.length; i++) {
      if (lengths[i] < 0.00001) continue;

      if (remaining <= lengths[i]) {
        return this.points[i]
          .clone()
          .lerp(this.points[i + 1], remaining / lengths[i]);
      }

      remaining -= lengths[i];
    }

    return this.points[this.points.length - 1].clone();
  }
  
  project(point: THREE.Vector3): number {
    const local = this.group.worldToLocal(point.clone());
    local.y = 0;

    // Берём длины сегментов
    const lengths = this.points
      .slice(0, -1)
      .map((p, i) => p.distanceTo(this.points[i + 1]));
    const total = lengths.reduce((s, v) => s + v, 0);
    if (total < 1e-5) return 0;

    let bestDist = Infinity;
    let bestT = 0;
    let accum = 0;

    for (let i = 0; i < lengths.length; i++) {
      const a = this.points[i];
      const b = this.points[i + 1];
      const segLen = lengths[i];
      if (segLen < 1e-5) continue;

      const ab = b.clone().sub(a);
      const ap = local.clone().sub(a);
      const t = THREE.MathUtils.clamp(ap.dot(ab) / ab.lengthSq(), 0, 1);
      const closest = a.clone().addScaledVector(ab, t);
      const dist = closest.distanceTo(local);

      if (dist < bestDist) {
        bestDist = dist;
        bestT = (accum + t * segLen) / total;
      }

      accum += segLen;
    }

    return bestT;
  }
}
