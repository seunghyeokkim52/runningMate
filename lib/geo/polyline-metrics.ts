import type { Coordinates } from "@/lib/geolocation";

const EARTH_RADIUS_M = 6371000;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

export function haversineMeters(a: Coordinates, b: Coordinates): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/** a에서 b를 바라보는 진행 방향(도, 0=북쪽 기준 시계방향)을 계산한다. */
export function bearingDegrees(a: Coordinates, b: Coordinates): number {
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const dLng = toRad(b.lng - a.lng);

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

export type PathSample = {
  position: Coordinates;
  bearingDeg: number;
  distanceM: number;
};

/** path를 따라 intervalM 간격마다 위치·진행 방향·시작점부터의 누적 거리를 샘플링한다. */
export function sampleAlongPath(
  path: Coordinates[],
  intervalM: number
): PathSample[] {
  if (path.length < 2 || intervalM <= 0) return [];

  const samples: PathSample[] = [];
  let accumulated = 0;
  let nextTarget = intervalM;

  for (let i = 0; i < path.length - 1; i++) {
    const segmentStart = path[i];
    const segmentEnd = path[i + 1];
    const segmentLength = haversineMeters(segmentStart, segmentEnd);
    const bearing = bearingDegrees(segmentStart, segmentEnd);

    while (segmentLength > 0 && nextTarget <= accumulated + segmentLength) {
      const fraction = (nextTarget - accumulated) / segmentLength;
      samples.push({
        position: {
          lat:
            segmentStart.lat + (segmentEnd.lat - segmentStart.lat) * fraction,
          lng:
            segmentStart.lng + (segmentEnd.lng - segmentStart.lng) * fraction,
        },
        bearingDeg: bearing,
        distanceM: nextTarget,
      });
      nextTarget += intervalM;
    }

    accumulated += segmentLength;
  }

  return samples;
}
