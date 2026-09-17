import { describe, expect, it } from "vitest";

import { isWithinGimhae } from "@/lib/gimhae-boundary";

describe("isWithinGimhae", () => {
  it("김해시청 좌표는 경계 안이다", () => {
    expect(isWithinGimhae({ lat: 35.2285, lng: 128.8894 })).toBe(true);
  });

  it("서울시청 좌표는 경계 밖이다", () => {
    expect(isWithinGimhae({ lat: 37.5665, lng: 126.978 })).toBe(false);
  });

  it("부산시청 좌표는 경계 밖이다", () => {
    expect(isWithinGimhae({ lat: 35.1796, lng: 129.0756 })).toBe(false);
  });
});
