export type CompletionRecord = {
  id: string;
  distanceKm: number;
  completedAt: string;
};

// 인터림: 실제 로그인/계정이 없는 동안 고정된 단일 테스트 사용자로만 기록을 구분한다.
const FIXED_TEST_USER_ID = "test-user";

const recordsByUser = new Map<string, CompletionRecord[]>();

export function addCompletionRecord(distanceKm: number): CompletionRecord {
  const record: CompletionRecord = {
    id: crypto.randomUUID(),
    distanceKm,
    completedAt: new Date().toISOString(),
  };

  const records = recordsByUser.get(FIXED_TEST_USER_ID) ?? [];
  records.push(record);
  recordsByUser.set(FIXED_TEST_USER_ID, records);

  return record;
}

export function listCompletionRecords(): CompletionRecord[] {
  const records = recordsByUser.get(FIXED_TEST_USER_ID) ?? [];
  return [...records].sort((a, b) => b.completedAt.localeCompare(a.completedAt));
}

/** 테스트에서만 사용한다. 모듈 스코프 저장소를 초기화한다. */
export function __resetCompletionRecordsForTests(): void {
  recordsByUser.clear();
}
