import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchCourseCandidates } from "@/lib/course-candidates-client";

const START = { lat: 35.2285, lng: 128.8894 };

describe("fetchCourseCandidates", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("정상 응답이면 후보 배열을 반환한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ candidates: [{ id: "a", distanceKm: 5, path: [] }] }),
      })
    );

    await expect(fetchCourseCandidates(START, 5)).resolves.toEqual([
      { id: "a", distanceKm: 5, path: [] },
    ]);
  });

  it("HTTP 응답이 실패면 null을 반환한다(빈 배열과 구분)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    await expect(fetchCourseCandidates(START, 5)).resolves.toBeNull();
  });

  it("fetch 자체가 실패(네트워크 오류)해도 null을 반환한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down"))
    );

    await expect(fetchCourseCandidates(START, 5)).resolves.toBeNull();
  });
});
