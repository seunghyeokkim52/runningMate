export type CompletionRecord = {
  id: string;
  distanceKm: number;
  completedAt: string;
};

/** 완주를 기록한다. 실패하면 null을 반환한다. */
export async function submitCompletion(
  distanceKm: number
): Promise<CompletionRecord | null> {
  const response = await fetch("/api/completion-records", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ distanceKm }),
  }).catch(() => null);

  if (!response?.ok) return null;

  const data = await response.json();
  return data?.record ?? null;
}

/** 완주 기록 목록을 불러온다. 실패하면 빈 배열을 반환한다. */
export async function fetchCompletionRecords(): Promise<CompletionRecord[]> {
  const response = await fetch("/api/completion-records").catch(() => null);

  if (!response?.ok) return [];

  const data = await response.json();
  return Array.isArray(data?.records) ? data.records : [];
}
