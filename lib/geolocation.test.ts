import { afterEach, describe, expect, it } from "vitest";

import { getCurrentPosition } from "@/lib/geolocation";

describe("getCurrentPosition", () => {
  afterEach(() => {
    // @ts-expect-error 테스트 간 navigator.geolocation을 원래 상태로 되돌린다.
    delete navigator.geolocation;
  });

  it("권한이 허용되면 좌표를 반환한다", async () => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (success: PositionCallback) =>
          success({
            coords: { latitude: 35.2285, longitude: 128.8894 },
          } as GeolocationPosition),
      },
    });

    await expect(getCurrentPosition()).resolves.toEqual({
      lat: 35.2285,
      lng: 128.8894,
    });
  });

  it("권한이 거부되면 거부 에러로 reject한다", async () => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (
          _success: PositionCallback,
          error: PositionErrorCallback
        ) => error({} as GeolocationPositionError),
      },
    });

    await expect(getCurrentPosition()).rejects.toThrow("GEOLOCATION_DENIED");
  });

  it("geolocation을 지원하지 않으면 미지원 에러로 reject한다", async () => {
    await expect(getCurrentPosition()).rejects.toThrow(
      "GEOLOCATION_UNSUPPORTED"
    );
  });
});
