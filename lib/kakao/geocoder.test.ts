import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/kakao/load-sdk", () => ({ loadKakaoMapsSdk: vi.fn() }));

import { searchAddress } from "@/lib/kakao/geocoder";
import { loadKakaoMapsSdk } from "@/lib/kakao/load-sdk";

function stubKakao(
  addressSearch: (
    address: string,
    callback: (
      result: Array<{ address_name: string; x: string; y: string }>,
      status: "OK" | "ZERO_RESULT" | "ERROR"
    ) => void
  ) => void
) {
  // 테스트용 최소 구현만 제공하므로 실제 Window["kakao"] 타입과는 다르다.
  window.kakao = {
    maps: {
      services: {
        Geocoder: class {
          addressSearch = addressSearch;
        },
        Status: { OK: "OK", ZERO_RESULT: "ZERO_RESULT", ERROR: "ERROR" },
      },
    },
  } as unknown as Window["kakao"];
}

describe("searchAddress", () => {
  afterEach(() => {
    vi.mocked(loadKakaoMapsSdk).mockReset();
    // @ts-expect-error 테스트 간 window.kakao를 정리한다.
    delete window.kakao;
  });

  it("주소를 찾으면 좌표를 반환한다", async () => {
    vi.mocked(loadKakaoMapsSdk).mockResolvedValue();
    stubKakao((_address, callback) => {
      callback(
        [{ address_name: "김해시 분성로 100", x: "128.8894", y: "35.2285" }],
        "OK"
      );
    });

    await expect(searchAddress("김해시 분성로 100")).resolves.toEqual({
      lat: 35.2285,
      lng: 128.8894,
    });
  });

  it("결과가 없으면 null을 반환한다", async () => {
    vi.mocked(loadKakaoMapsSdk).mockResolvedValue();
    stubKakao((_address, callback) => {
      callback([], "ZERO_RESULT");
    });

    await expect(searchAddress("존재하지 않는 주소")).resolves.toBeNull();
  });

  it("SDK 로딩에 실패하면 에러로 reject한다", async () => {
    vi.mocked(loadKakaoMapsSdk).mockRejectedValue(
      new Error("KAKAO_SDK_LOAD_FAILED")
    );

    await expect(searchAddress("아무 주소")).rejects.toThrow(
      "KAKAO_SDK_LOAD_FAILED"
    );
  });
});
