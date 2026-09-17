export {};

declare global {
  type KakaoLatLng = { readonly __brand: "KakaoLatLng" };

  interface KakaoLatLngBounds {
    extend(point: KakaoLatLng): void;
  }

  interface KakaoMapInstance {
    setBounds(bounds: KakaoLatLngBounds): void;
    setCenter(latLng: KakaoLatLng): void;
  }

  interface KakaoPolyline {
    setMap(map: KakaoMapInstance | null): void;
  }

  interface KakaoMarker {
    setPosition(latLng: KakaoLatLng): void;
  }

  interface KakaoCustomOverlay {
    setMap(map: KakaoMapInstance | null): void;
  }

  interface KakaoGeocoderResult {
    address_name: string;
    x: string;
    y: string;
  }

  type KakaoGeocoderStatus = "OK" | "ZERO_RESULT" | "ERROR";

  interface KakaoGeocoder {
    addressSearch(
      address: string,
      callback: (result: KakaoGeocoderResult[], status: KakaoGeocoderStatus) => void
    ): void;
  }

  interface Window {
    kakao: {
      maps: {
        load(callback: () => void): void;
        LatLng: new (lat: number, lng: number) => KakaoLatLng;
        LatLngBounds: new () => KakaoLatLngBounds;
        Map: new (
          container: HTMLElement,
          options: { center: KakaoLatLng; level: number }
        ) => KakaoMapInstance;
        Marker: new (options: {
          position: KakaoLatLng;
          map: KakaoMapInstance;
        }) => KakaoMarker;
        Polyline: new (options: {
          path: KakaoLatLng[];
          strokeWeight: number;
          strokeColor: string;
          strokeOpacity: number;
          strokeStyle: string;
        }) => KakaoPolyline;
        CustomOverlay: new (options: {
          position: KakaoLatLng;
          content: string | HTMLElement;
          xAnchor?: number;
          yAnchor?: number;
          zIndex?: number;
        }) => KakaoCustomOverlay;
        services: {
          Geocoder: new () => KakaoGeocoder;
          Status: { OK: "OK"; ZERO_RESULT: "ZERO_RESULT"; ERROR: "ERROR" };
        };
      };
    };
  }
}
