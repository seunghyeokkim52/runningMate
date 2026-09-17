import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CompletionHistory } from "@/components/completion-history";

describe("CompletionHistory", () => {
  it("기록이 없으면 빈 상태를 보여준다", () => {
    render(<CompletionHistory records={[]} />);

    expect(
      screen.getByText("아직 완주 기록이 없습니다")
    ).toBeInTheDocument();
  });

  it("기록이 있으면 날짜와 거리를 표로 보여준다", () => {
    render(
      <CompletionHistory
        records={[
          {
            id: "1",
            distanceKm: 5.2,
            completedAt: "2026-01-01T00:00:00.000Z",
          },
        ]}
      />
    );

    expect(screen.getByText("5.2km")).toBeInTheDocument();
  });
});
