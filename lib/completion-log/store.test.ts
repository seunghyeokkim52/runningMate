import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  __resetCompletionRecordsForTests,
  addCompletionRecord,
  listCompletionRecords,
} from "@/lib/completion-log/store";

describe("completion-log store", () => {
  beforeEach(() => {
    __resetCompletionRecordsForTests();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("완주 기록을 추가하면 거리와 시각이 담긴다", () => {
    const record = addCompletionRecord(5.2);

    expect(record.distanceKm).toBe(5.2);
    expect(new Date(record.completedAt).toString()).not.toBe("Invalid Date");
  });

  it("기록 목록을 최신순으로 반환한다", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
    const first = addCompletionRecord(3);

    vi.setSystemTime(new Date("2026-01-02T00:00:00.000Z"));
    const second = addCompletionRecord(4);

    const records = listCompletionRecords();

    expect(records.map((r) => r.id)).toEqual([second.id, first.id]);
  });

  it("기록이 없으면 빈 배열을 반환한다", () => {
    expect(listCompletionRecords()).toEqual([]);
  });
});
