import { describe, expect, it } from "vitest";

import {
  bearingDegrees,
  haversineMeters,
  sampleAlongPath,
} from "@/lib/geo/polyline-metrics";

describe("haversineMeters", () => {
  it("같은 위도선을 따라 대략 111km/도의 거리를 계산한다", () => {
    const a = { lat: 35.0, lng: 128.0 };
    const b = { lat: 35.0, lng: 129.0 };

    // 위도 35도에서 경도 1도는 대략 91km.
    expect(haversineMeters(a, b)).toBeGreaterThan(90_000);
    expect(haversineMeters(a, b)).toBeLessThan(92_000);
  });

  it("같은 점 사이의 거리는 0이다", () => {
    const a = { lat: 35.2285, lng: 128.8894 };
    expect(haversineMeters(a, a)).toBe(0);
  });
});

describe("bearingDegrees", () => {
  it("정북 방향은 0도에 가깝다", () => {
    const a = { lat: 35.0, lng: 128.0 };
    const b = { lat: 35.01, lng: 128.0 };
    expect(bearingDegrees(a, b)).toBeCloseTo(0, 0);
  });

  it("정동 방향은 90도에 가깝다", () => {
    const a = { lat: 35.0, lng: 128.0 };
    const b = { lat: 35.0, lng: 128.01 };
    expect(bearingDegrees(a, b)).toBeCloseTo(90, 0);
  });
});

describe("sampleAlongPath", () => {
  it("100m 간격으로 정확히 등분된 직선에서 예상되는 개수만큼 샘플을 뽑는다", () => {
    // 위도 35도에서 경도 0.01도는 대략 910m.
    const path = [
      { lat: 35.0, lng: 128.0 },
      { lat: 35.0, lng: 128.01 },
    ];

    const samples = sampleAlongPath(path, 100);

    expect(samples.length).toBeGreaterThanOrEqual(8);
    expect(samples[0].distanceM).toBe(100);
    expect(samples[0].bearingDeg).toBeCloseTo(90, 0);
  });

  it("점이 2개 미만이면 빈 배열을 반환한다", () => {
    expect(sampleAlongPath([{ lat: 35, lng: 128 }], 100)).toEqual([]);
    expect(sampleAlongPath([], 100)).toEqual([]);
  });
});
