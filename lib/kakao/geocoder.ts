import type { Coordinates } from "@/lib/geolocation";
import { loadKakaoMapsSdk } from "@/lib/kakao/load-sdk";

/** 주소 문자열을 좌표로 변환한다. 찾지 못하면 null을 반환한다. */
export async function searchAddress(
  address: string
): Promise<Coordinates | null> {
  await loadKakaoMapsSdk();

  return new Promise((resolve) => {
    const geocoder = new window.kakao.maps.services.Geocoder();

    geocoder.addressSearch(address, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK && result[0]) {
        resolve({ lat: Number(result[0].y), lng: Number(result[0].x) });
      } else {
        resolve(null);
      }
    });
  });
}
