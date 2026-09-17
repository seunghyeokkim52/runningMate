import type { Coordinates } from "@/lib/geolocation";
import { decodePolyline6 } from "@/lib/valhalla/polyline";

export type RouteResult = {
  distanceKm: number;
  path: Coordinates[];
};

type ValhallaLeg = { shape: string };
type ValhallaResponse = {
  trip?: {
    legs?: ValhallaLeg[];
    summary?: { length?: number };
  };
};

/** Valhalla `/route`를 호출해 보행자 경로(순환 포함)를 계산한다. 실패하면 null. */
export async function routePedestrianLoop(
  waypoints: Coordinates[]
): Promise<RouteResult | null> {
  const baseUrl = process.env.VALHALLA_BASE_URL;
  if (!baseUrl) throw new Error("VALHALLA_BASE_URL_MISSING");

  const requestBody = {
    locations: waypoints.map((point) => ({ lat: point.lat, lon: point.lng })),
    costing: "pedestrian",
    units: "kilometers",
    costing_options: {
      pedestrian: {
        use_hills: 0.2,
        walkway_factor: 0.6,
        sidewalk_factor: 0.9,
        alley_factor: 2.5,
      },
    },
  };

  const response = await fetch(
    `${baseUrl}/route?json=${encodeURIComponent(JSON.stringify(requestBody))}`
  );

  if (!response.ok) return null;

  const data = (await response.json()) as ValhallaResponse;
  const legs = data.trip?.legs;
  const distanceKm = data.trip?.summary?.length;

  if (!legs || legs.length === 0 || typeof distanceKm !== "number") {
    return null;
  }

  const path = legs.flatMap((leg) => decodePolyline6(leg.shape));

  return { distanceKm, path };
}
