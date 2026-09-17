import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { routePedestrianLoop } from "@/lib/valhalla/client";

const START = { lat: 35.2285, lng: 128.8894 };
const APEX = { lat: 35.23, lng: 128.891 };

describe("routePedestrianLoop", () => {
  beforeEach(() => {
    vi.stubEnv("VALHALLA_BASE_URL", "https://valhalla.example.test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("정상 응답이면 총 거리와 경로를 반환한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          trip: {
            legs: [{ shape: "gtdebAobxytFw|A_cBv|A~bB" }],
            summary: { length: 1.839 },
          },
        }),
      })
    );

    const result = await routePedestrianLoop([START, APEX, START]);

    expect(result?.distanceKm).toBe(1.839);
    expect(result?.path).toHaveLength(3);
  });

  it("HTTP 응답이 실패면 null을 반환한다", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    await expect(routePedestrianLoop([START, APEX, START])).resolves.toBeNull();
  });

  it("경로 데이터가 없는 응답이면 null을 반환한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) })
    );

    await expect(routePedestrianLoop([START, APEX, START])).resolves.toBeNull();
  });

  it("VALHALLA_BASE_URL이 없으면 에러를 던진다", async () => {
    vi.stubEnv("VALHALLA_BASE_URL", "");

    await expect(routePedestrianLoop([START, APEX, START])).rejects.toThrow(
      "VALHALLA_BASE_URL_MISSING"
    );
  });
});
