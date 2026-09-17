import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/kakao/load-sdk", () => ({ loadKakaoMapsSdk: vi.fn() }));

import { KakaoMap } from "@/components/kakao-map";
import { loadKakaoMapsSdk } from "@/lib/kakao/load-sdk";

function stubKakao() {
  const setCenter = vi.fn();
  const setPosition = vi.fn();

  function LatLng(this: unknown, lat: number, lng: number) {
    return { lat, lng };
  }
  function Map() {
    return { setCenter, setBounds: vi.fn() };
  }
  function Marker() {
    return { setPosition };
  }
  function LatLngBounds() {
    return { extend: vi.fn() };
  }
  function Polyline() {
    return { setMap: vi.fn() };
  }

  // 테스트용 최소 구현만 제공하므로 실제 Window["kakao"] 타입과는 다르다.
  window.kakao = {
    maps: {
      LatLng: vi.fn(LatLng),
      LatLngBounds: vi.fn(LatLngBounds),
      Map: vi.fn(Map),
      Marker: vi.fn(Marker),
      Polyline: vi.fn(Polyline),
    },
  } as unknown as Window["kakao"];

  return { setCenter, setPosition };
}

describe("KakaoMap", () => {
  beforeEach(() => {
    vi.mocked(loadKakaoMapsSdk).mockResolvedValue();
  });

  afterEach(() => {
    // @ts-expect-error 테스트 간 window.kakao를 정리한다.
    delete window.kakao;
  });

  it("center prop이 마운트 이후 바뀌면 지도와 마커를 새 위치로 옮긴다", async () => {
    const { setCenter, setPosition } = stubKakao();

    const { rerender } = render(
      <KakaoMap center={{ lat: 35.2285, lng: 128.8894 }} />
    );

    await vi.waitFor(() => expect(window.kakao.maps.Map).toHaveBeenCalled());

    rerender(<KakaoMap center={{ lat: 35.24, lng: 128.9 }} />);

    await vi.waitFor(() => expect(setCenter).toHaveBeenCalled());
    expect(setPosition).toHaveBeenCalled();
  });
});
