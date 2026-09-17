import { describe, expect, it } from "vitest";

import { decodePolyline6 } from "@/lib/valhalla/polyline";

describe("decodePolyline6", () => {
  it("precision-6로 인코딩된 좌표를 원래 좌표로 복원한다", () => {
    const encoded = "gtdebAobxytFw|A_cBv|A~bB";

    const decoded = decodePolyline6(encoded);

    expect(decoded).toHaveLength(3);
    expect(decoded[0].lat).toBeCloseTo(35.2285, 5);
    expect(decoded[0].lng).toBeCloseTo(128.8894, 5);
    expect(decoded[1].lat).toBeCloseTo(35.23, 5);
    expect(decoded[1].lng).toBeCloseTo(128.891, 5);
    expect(decoded[2].lat).toBeCloseTo(35.2285, 5);
    expect(decoded[2].lng).toBeCloseTo(128.8894, 5);
  });

  it("빈 문자열은 빈 배열로 디코드한다", () => {
    expect(decodePolyline6("")).toEqual([]);
  });
});
