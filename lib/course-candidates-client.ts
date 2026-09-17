import type { Coordinates } from "@/lib/geolocation";

export type CourseCandidate = {
  id: string;
  distanceKm: number;
  path: Coordinates[];
};

/** 서버의 코스 후보 API를 호출한다. 요청 자체가 실패하면 null, 후보가 없으면 빈 배열을 반환한다. */
export async function fetchCourseCandidates(
  start: Coordinates,
  distanceKm: number
): Promise<CourseCandidate[] | null> {
  const response = await fetch("/api/course-candidates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ start, distanceKm }),
  }).catch(() => null);

  if (!response?.ok) return null;

  const data = await response.json();
  return Array.isArray(data?.candidates) ? data.candidates : null;
}
