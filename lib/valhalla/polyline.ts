import type { Coordinates } from "@/lib/geolocation";

/** Valhalla가 사용하는 precision-6 인코딩 폴리라인을 좌표 배열로 디코드한다. */
export function decodePolyline6(encoded: string): Coordinates[] {
  const coordinates: Coordinates[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    lat += decodeSignedValue();
    lng += decodeSignedValue();
    coordinates.push({ lat: lat / 1e6, lng: lng / 1e6 });
  }

  return coordinates;

  function decodeSignedValue(): number {
    let result = 0;
    let shift = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    return result & 1 ? ~(result >> 1) : result >> 1;
  }
}
