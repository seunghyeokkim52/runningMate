import type { Coordinates } from "@/lib/geolocation";

// 김해시 행정구역 경계(OpenStreetMap Nominatim, polygon_threshold=0.01로 단순화한 근사치).
// [lng, lat] 순서.
const GIMHAE_BOUNDARY: [number, number][] = [
  [128.6955428, 35.3036734],
  [128.7249827, 35.2122111],
  [128.7507319, 35.2004292],
  [128.7404108, 35.1686865],
  [128.7939718, 35.1573882],
  [128.8692454, 35.1679485],
  [128.8652542, 35.1582303],
  [128.8769272, 35.1516338],
  [128.8791159, 35.2100184],
  [128.9984916, 35.2326888],
  [129.0142563, 35.2709538],
  [128.9665042, 35.3315563],
  [128.8765536, 35.3708993],
  [128.8619624, 35.3951116],
  [128.8064299, 35.3782477],
  [128.7964736, 35.3555704],
  [128.7502384, 35.3402644],
  [128.7401533, 35.3174364],
  [128.7176656, 35.3255249],
  [128.6955428, 35.3036734],
];

/** Ray casting 알고리즘으로 점이 김해시 경계 폴리곤 안에 있는지 판단한다. */
export function isWithinGimhae({ lat, lng }: Coordinates): boolean {
  let inside = false;

  for (
    let i = 0, j = GIMHAE_BOUNDARY.length - 1;
    i < GIMHAE_BOUNDARY.length;
    j = i++
  ) {
    const [xi, yi] = GIMHAE_BOUNDARY[i];
    const [xj, yj] = GIMHAE_BOUNDARY[j];

    const intersects =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;

    if (intersects) inside = !inside;
  }

  return inside;
}
