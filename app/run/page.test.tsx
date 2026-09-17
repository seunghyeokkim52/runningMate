import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/geolocation", () => ({ getCurrentPosition: vi.fn() }));
vi.mock("@/lib/kakao/geocoder", () => ({ searchAddress: vi.fn() }));
vi.mock("@/lib/course-candidates-client", () => ({
  fetchCourseCandidates: vi.fn(),
}));
vi.mock("@/lib/completion-log-client", () => ({
  fetchCompletionRecords: vi.fn(),
  submitCompletion: vi.fn(),
}));
vi.mock("@/components/kakao-map", () => ({
  KakaoMap: ({
    candidates,
    selectedCandidateId,
  }: {
    candidates?: { id: string }[];
    selectedCandidateId?: string | null;
  }) => (
    <div
      data-testid="kakao-map"
      data-candidate-count={candidates?.length ?? 0}
      data-selected-id={selectedCandidateId ?? ""}
    />
  ),
}));

import { getCurrentPosition } from "@/lib/geolocation";
import { searchAddress } from "@/lib/kakao/geocoder";
import { fetchCourseCandidates } from "@/lib/course-candidates-client";
import {
  fetchCompletionRecords,
  submitCompletion,
} from "@/lib/completion-log-client";

import RunPage from "@/app/run/page";

const KOREA_POINT = { lat: 35.2285, lng: 128.8894 };
const OUTSIDE_POINT = { lat: 35.6762, lng: 139.6503 }; // 도쿄

describe("RunPage", () => {
  beforeEach(() => {
    vi.mocked(getCurrentPosition).mockReset();
    vi.mocked(searchAddress).mockReset();
    vi.mocked(fetchCourseCandidates).mockReset();
    vi.mocked(fetchCompletionRecords).mockReset().mockResolvedValue([]);
    vi.mocked(submitCompletion).mockReset();
  });

  it("대한민국 내 위치면 지도와 활성화된 거리 입력을 보여준다", async () => {
    vi.mocked(getCurrentPosition).mockResolvedValue(KOREA_POINT);

    render(<RunPage />);

    expect(await screen.findByTestId("kakao-map")).toBeInTheDocument();
    expect(screen.getByLabelText(/원하는 거리/)).toBeEnabled();
  });

  it("대한민국 밖 위치면 주소 입력 폼을 보여준다", async () => {
    vi.mocked(getCurrentPosition).mockResolvedValue(OUTSIDE_POINT);

    render(<RunPage />);

    expect(await screen.findByLabelText(/출발 지점 주소/)).toBeInTheDocument();
    expect(screen.getByLabelText(/원하는 거리/)).toBeDisabled();
  });

  it("위치 권한 거부/실패 시 주소 입력 폼을 보여준다", async () => {
    vi.mocked(getCurrentPosition).mockRejectedValue(
      new Error("GEOLOCATION_DENIED")
    );

    render(<RunPage />);

    expect(await screen.findByLabelText(/출발 지점 주소/)).toBeInTheDocument();
    expect(screen.getByLabelText(/원하는 거리/)).toBeDisabled();
  });

  it("주소가 대한민국 내로 확인되면 지도와 활성화된 거리 입력을 보여준다", async () => {
    vi.mocked(getCurrentPosition).mockRejectedValue(
      new Error("GEOLOCATION_DENIED")
    );
    vi.mocked(searchAddress).mockResolvedValue(KOREA_POINT);

    render(<RunPage />);

    const addressInput = await screen.findByLabelText(/출발 지점 주소/);
    fireEvent.change(addressInput, {
      target: { value: "서울시 중구 세종대로 110" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /주소로 출발 지점 지정/ })
    );

    expect(await screen.findByTestId("kakao-map")).toBeInTheDocument();
    expect(screen.getByLabelText(/원하는 거리/)).toBeEnabled();
  });

  it("주소가 대한민국 밖이면 안내를 보여주고 거리 입력은 비활성 상태를 유지한다", async () => {
    vi.mocked(getCurrentPosition).mockRejectedValue(
      new Error("GEOLOCATION_DENIED")
    );
    vi.mocked(searchAddress).mockResolvedValue(OUTSIDE_POINT);

    render(<RunPage />);

    const addressInput = await screen.findByLabelText(/출발 지점 주소/);
    fireEvent.change(addressInput, { target: { value: "도쿄 지요다구" } });
    fireEvent.click(
      screen.getByRole("button", { name: /주소로 출발 지점 지정/ })
    );

    expect(
      await screen.findByText("대한민국 내 주소를 입력해 주세요.")
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/원하는 거리/)).toBeDisabled();
  });

  it("지오코딩에 실패하면 안내를 보여주고 거리 입력은 비활성 상태를 유지한다", async () => {
    vi.mocked(getCurrentPosition).mockRejectedValue(
      new Error("GEOLOCATION_DENIED")
    );
    vi.mocked(searchAddress).mockResolvedValue(null);

    render(<RunPage />);

    const addressInput = await screen.findByLabelText(/출발 지점 주소/);
    fireEvent.change(addressInput, { target: { value: "존재하지 않는 주소" } });
    fireEvent.click(
      screen.getByRole("button", { name: /주소로 출발 지점 지정/ })
    );

    expect(
      await screen.findByText("주소를 찾을 수 없습니다. 다시 입력해 주세요.")
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/원하는 거리/)).toBeDisabled();
  });

  it("지도 SDK 로딩 자체가 실패하면 '찾을 수 없음'과 다른 안내를 보여준다", async () => {
    vi.mocked(getCurrentPosition).mockRejectedValue(
      new Error("GEOLOCATION_DENIED")
    );
    vi.mocked(searchAddress).mockRejectedValue(
      new Error("KAKAO_SDK_LOAD_FAILED")
    );

    render(<RunPage />);

    const addressInput = await screen.findByLabelText(/출발 지점 주소/);
    fireEvent.change(addressInput, {
      target: { value: "서울시 중구 세종대로 110" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /주소로 출발 지점 지정/ })
    );

    expect(
      await screen.findByText(
        "지도 서비스를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText("주소를 찾을 수 없습니다. 다시 입력해 주세요.")
    ).not.toBeInTheDocument();
  });

  it("거리를 입력해 코스를 찾으면 후보가 지도와 선택 UI에 표시된다", async () => {
    vi.mocked(getCurrentPosition).mockResolvedValue(KOREA_POINT);
    vi.mocked(fetchCourseCandidates).mockResolvedValue([
      { id: "bearing-0", distanceKm: 5.1, path: [] },
      { id: "bearing-120", distanceKm: 4.9, path: [] },
      { id: "bearing-240", distanceKm: 5.0, path: [] },
    ]);

    render(<RunPage />);

    const distanceInput = await screen.findByLabelText(/원하는 거리/);
    fireEvent.change(distanceInput, { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: /코스 찾기/ }));

    const map = await screen.findByTestId("kakao-map");
    expect(map).toHaveAttribute("data-candidate-count", "3");

    const candidateButton = await screen.findByRole("button", {
      name: /4\.9km 코스/,
    });
    fireEvent.click(candidateButton);

    expect(map).toHaveAttribute("data-selected-id", "bearing-120");
  });

  it("추천 가능한 코스가 없으면 빈 상태를 보여준다", async () => {
    vi.mocked(getCurrentPosition).mockResolvedValue(KOREA_POINT);
    vi.mocked(fetchCourseCandidates).mockResolvedValue([]);

    render(<RunPage />);

    const distanceInput = await screen.findByLabelText(/원하는 거리/);
    fireEvent.change(distanceInput, { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: /코스 찾기/ }));

    expect(
      await screen.findByText("추천할 수 있는 코스가 없습니다")
    ).toBeInTheDocument();
  });

  it("코스 검색 요청 자체가 실패하면 빈 상태가 아닌 오류 안내를 보여준다", async () => {
    vi.mocked(getCurrentPosition).mockResolvedValue(KOREA_POINT);
    vi.mocked(fetchCourseCandidates).mockResolvedValue(null);

    render(<RunPage />);

    const distanceInput = await screen.findByLabelText(/원하는 거리/);
    fireEvent.change(distanceInput, { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: /코스 찾기/ }));

    expect(
      await screen.findByText("코스 검색에 실패했습니다")
    ).toBeInTheDocument();
    expect(
      screen.queryByText("추천할 수 있는 코스가 없습니다")
    ).not.toBeInTheDocument();
  });

  it("페이지 진입 시 완주 기록을 불러와 보여준다", async () => {
    vi.mocked(getCurrentPosition).mockResolvedValue(KOREA_POINT);
    vi.mocked(fetchCompletionRecords).mockResolvedValue([
      { id: "r1", distanceKm: 3.4, completedAt: "2026-01-01T00:00:00.000Z" },
    ]);

    render(<RunPage />);

    expect(await screen.findByText("3.4km")).toBeInTheDocument();
  });

  it("코스를 선택하고 완주를 표시하면 기록 목록에 새 항목이 추가된다", async () => {
    vi.mocked(getCurrentPosition).mockResolvedValue(KOREA_POINT);
    vi.mocked(fetchCourseCandidates).mockResolvedValue([
      { id: "bearing-0", distanceKm: 5.1, path: [] },
    ]);
    vi.mocked(submitCompletion).mockResolvedValue({
      id: "new-record",
      distanceKm: 5.1,
      completedAt: "2026-02-02T00:00:00.000Z",
    });

    render(<RunPage />);

    const distanceInput = await screen.findByLabelText(/원하는 거리/);
    fireEvent.change(distanceInput, { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: /코스 찾기/ }));

    const candidateButton = await screen.findByRole("button", {
      name: /5\.1km 코스/,
    });
    fireEvent.click(candidateButton);

    const completeButton = await screen.findByRole("button", {
      name: /완주 표시/,
    });
    fireEvent.click(completeButton);

    expect(submitCompletion).toHaveBeenCalledWith(5.1);
    expect(await screen.findByText("날짜")).toBeInTheDocument();
    expect(await screen.findByRole("cell", { name: "5.1km" })).toBeInTheDocument();
  });

  it("같은 후보에 완주 표시를 두 번 눌러도 기록은 한 번만 저장된다", async () => {
    vi.mocked(getCurrentPosition).mockResolvedValue(KOREA_POINT);
    vi.mocked(fetchCourseCandidates).mockResolvedValue([
      { id: "bearing-0", distanceKm: 5.1, path: [] },
    ]);
    vi.mocked(submitCompletion).mockResolvedValue({
      id: "new-record",
      distanceKm: 5.1,
      completedAt: "2026-02-02T00:00:00.000Z",
    });

    render(<RunPage />);

    const distanceInput = await screen.findByLabelText(/원하는 거리/);
    fireEvent.change(distanceInput, { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: /코스 찾기/ }));

    const candidateButton = await screen.findByRole("button", {
      name: /5\.1km 코스/,
    });
    fireEvent.click(candidateButton);

    const completeButton = await screen.findByRole("button", {
      name: "완주 표시",
    });
    fireEvent.click(completeButton);

    const completedButton = await screen.findByRole("button", {
      name: "완주 표시됨",
    });
    expect(completedButton).toBeDisabled();

    fireEvent.click(completedButton);

    expect(submitCompletion).toHaveBeenCalledTimes(1);
  });
});
