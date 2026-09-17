import type { Coordinates } from "@/lib/geolocation";
import { routePedestrianLoop } from "@/lib/valhalla/client";

export type CourseCandidate = {
  id: string;
  distanceKm: number;
  path: Coordinates[];
};

const EARTH_RADIUS_KM = 6371;
const CANDIDATE_BEARINGS_DEG = [0, 120, 240];
const DISTANCE_TOLERANCE = 0.1;
const MAX_ADJUST_ATTEMPTS = 5;
// 직선 반경 대비 실제 보행로 경로 길이가 늘어나는 정도를 보정하는 값.
const PATH_TO_CIRCUMFERENCE_FACTOR = 2 * Math.PI * 1.3;

function offset(
  start: Coordinates,
  bearingDeg: number,
  distanceKm: number
): Coordinates {
  const bearing = (bearingDeg * Math.PI) / 180;
  const latRad = (start.lat * Math.PI) / 180;
  const angularDistance = distanceKm / EARTH_RADIUS_KM;

  const newLat = Math.asin(
    Math.sin(latRad) * Math.cos(angularDistance) +
      Math.cos(latRad) * Math.sin(angularDistance) * Math.cos(bearing)
  );
  const newLng =
    (start.lng * Math.PI) / 180 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(latRad),
      Math.cos(angularDistance) - Math.sin(latRad) * Math.sin(newLat)
    );

  return { lat: (newLat * 180) / Math.PI, lng: (newLng * 180) / Math.PI };
}

function buildWaypoints(
  start: Coordinates,
  bearingDeg: number,
  radiusKm: number
): Coordinates[] {
  return [
    start,
    offset(start, bearingDeg, radiusKm),
    offset(start, bearingDeg + 140, radiusKm),
    offset(start, bearingDeg + 220, radiusKm),
    start,
  ];
}

export async function findCandidateForBearing(
  start: Coordinates,
  bearingDeg: number,
  desiredKm: number
): Promise<CourseCandidate | null> {
  let radiusKm = desiredKm / PATH_TO_CIRCUMFERENCE_FACTOR;

  for (let attempt = 0; attempt < MAX_ADJUST_ATTEMPTS; attempt++) {
    const result = await routePedestrianLoop(
      buildWaypoints(start, bearingDeg, radiusKm)
    );
    if (!result) return null;

    const ratio = result.distanceKm / desiredKm;
    if (Math.abs(ratio - 1) <= DISTANCE_TOLERANCE) {
      return {
        id: `bearing-${bearingDeg}`,
        distanceKm: result.distanceKm,
        path: result.path,
      };
    }

    radiusKm = radiusKm / ratio;
  }

  return null;
}

/** 출발 지점에서 원하는 거리(km)에 맞는 순환 코스 후보를 서로 다른 방향으로 찾는다. */
export async function generateCourseCandidates(
  start: Coordinates,
  desiredKm: number
): Promise<CourseCandidate[]> {
  const results = await Promise.all(
    CANDIDATE_BEARINGS_DEG.map((bearing) =>
      findCandidateForBearing(start, bearing, desiredKm)
    )
  );

  return results.filter(
    (candidate): candidate is CourseCandidate => candidate !== null
  );
}
