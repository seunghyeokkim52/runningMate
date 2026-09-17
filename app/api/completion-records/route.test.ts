import { beforeEach, describe, expect, it } from "vitest";

import { GET, POST } from "@/app/api/completion-records/route";
import { __resetCompletionRecordsForTests } from "@/lib/completion-log/store";

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/completion-records", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("/api/completion-records", () => {
  beforeEach(() => {
    __resetCompletionRecordsForTests();
  });

  it("POST로 완주를 기록하고 GET으로 다시 조회할 수 있다", async () => {
    const postResponse = await POST(makeRequest({ distanceKm: 4.7 }));
    expect(postResponse.status).toBe(200);
    const posted = await postResponse.json();
    expect(posted.record.distanceKm).toBe(4.7);

    const getResponse = await GET();
    const { records } = await getResponse.json();

    expect(records).toHaveLength(1);
    expect(records[0].distanceKm).toBe(4.7);
  });

  it("distanceKm이 없으면 400을 반환한다", async () => {
    const response = await POST(makeRequest({}));

    expect(response.status).toBe(400);
  });
});
