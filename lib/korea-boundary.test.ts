import { describe, expect, it } from "vitest";

import { isWithinSouthKorea } from "@/lib/korea-boundary";

describe("isWithinSouthKorea", () => {
  it("서울시청 좌표는 경계 안이다", () => {
    expect(isWithinSouthKorea({ lat: 37.5665, lng: 126.978 })).toBe(true);
  });

  it("김해시청 좌표는 경계 안이다", () => {
    expect(isWithinSouthKorea({ lat: 35.2285, lng: 128.8894 })).toBe(true);
  });

  it("부산시청 좌표는 경계 안이다", () => {
    expect(isWithinSouthKorea({ lat: 35.1796, lng: 129.0756 })).toBe(true);
  });

  it("제주시청 좌표는 경계 안이다", () => {
    expect(isWithinSouthKorea({ lat: 33.4996, lng: 126.5312 })).toBe(true);
  });

  it("도쿄 좌표는 경계 밖이다", () => {
    expect(isWithinSouthKorea({ lat: 35.6762, lng: 139.6503 })).toBe(false);
  });

  it("베이징 좌표는 경계 밖이다", () => {
    expect(isWithinSouthKorea({ lat: 39.9042, lng: 116.4074 })).toBe(false);
  });
});
