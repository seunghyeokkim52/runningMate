import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/valhalla/generate-candidates", () => ({
  generateCourseCandidates: vi.fn(),
}));

import { POST } from "@/app/api/course-candidates/route";
import { generateCourseCandidates } from "@/lib/valhalla/generate-candidates";

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/course-candidates", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("POST /api/course-candidates", () => {
  beforeEach(() => {
    vi.mocked(generateCourseCandidates).mockReset();
  });

  it("유효한 요청이면 생성된 후보를 반환한다", async () => {
    vi.mocked(generateCourseCandidates).mockResolvedValue([
      { id: "a", distanceKm: 5, path: [] },
    ]);

    const response = await POST(
      makeRequest({ start: { lat: 35.2285, lng: 128.8894 }, distanceKm: 5 })
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.candidates).toHaveLength(1);
  });

  it("start 좌표가 없으면 400을 반환한다", async () => {
    const response = await POST(makeRequest({ distanceKm: 5 }));

    expect(response.status).toBe(400);
    expect(generateCourseCandidates).not.toHaveBeenCalled();
  });

  it("distanceKm이 0 이하이면 400을 반환한다", async () => {
    const response = await POST(
      makeRequest({ start: { lat: 35.2285, lng: 128.8894 }, distanceKm: 0 })
    );

    expect(response.status).toBe(400);
    expect(generateCourseCandidates).not.toHaveBeenCalled();
  });
});
