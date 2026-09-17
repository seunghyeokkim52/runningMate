import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/valhalla/client", () => ({ routePedestrianLoop: vi.fn() }));

import {
  findCandidateForBearing,
  generateCourseCandidates,
} from "@/lib/valhalla/generate-candidates";
import { routePedestrianLoop } from "@/lib/valhalla/client";

const START = { lat: 35.2285, lng: 128.8894 };

describe("generateCourseCandidates", () => {
  beforeEach(() => {
    vi.mocked(routePedestrianLoop).mockReset();
  });

  it("첫 시도에서 허용 오차 안에 들어오면 3개 후보를 반환한다", async () => {
    vi.mocked(routePedestrianLoop).mockResolvedValue({
      distanceKm: 5.1,
      path: [START],
    });

    const candidates = await generateCourseCandidates(START, 5);

    expect(candidates).toHaveLength(3);
    expect(candidates.every((c) => c.distanceKm === 5.1)).toBe(true);
  });

  it("거리가 벗어나면 반경을 조정해 재시도한 뒤 수렴하면 후보로 채택한다", async () => {
    vi.mocked(routePedestrianLoop)
      .mockResolvedValueOnce({ distanceKm: 8, path: [START] }) // 너무 김 → 반경 축소
      .mockResolvedValueOnce({ distanceKm: 5, path: [START] })
      .mockResolvedValueOnce({ distanceKm: 8, path: [START] })
      .mockResolvedValueOnce({ distanceKm: 5, path: [START] })
      .mockResolvedValueOnce({ distanceKm: 8, path: [START] })
      .mockResolvedValueOnce({ distanceKm: 5, path: [START] });

    const candidates = await generateCourseCandidates(START, 5);

    expect(candidates).toHaveLength(3);
    expect(candidates.every((c) => c.distanceKm === 5)).toBe(true);
  });

  it("한 방향이 4번째 시도에서야 수렴해도(3회 한도였다면 실패) 후보로 채택한다", async () => {
    vi.mocked(routePedestrianLoop)
      .mockResolvedValueOnce({ distanceKm: 8, path: [START] })
      .mockResolvedValueOnce({ distanceKm: 8, path: [START] })
      .mockResolvedValueOnce({ distanceKm: 8, path: [START] })
      .mockResolvedValueOnce({ distanceKm: 5, path: [START] });

    const candidate = await findCandidateForBearing(START, 0, 5);

    expect(candidate?.distanceKm).toBe(5);
  });

  it("경로를 찾지 못하면 해당 방향의 후보를 제외한다", async () => {
    vi.mocked(routePedestrianLoop).mockResolvedValue(null);

    const candidates = await generateCourseCandidates(START, 5);

    expect(candidates).toEqual([]);
  });

  it("최대 시도 횟수 안에 수렴하지 못하면 해당 방향의 후보를 제외한다", async () => {
    vi.mocked(routePedestrianLoop).mockResolvedValue({
      distanceKm: 100,
      path: [START],
    });

    const candidates = await generateCourseCandidates(START, 5);

    expect(candidates).toEqual([]);
  });
});
