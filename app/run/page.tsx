"use client";

import { useEffect, useState } from "react";

import { AddressStartPointForm } from "@/components/address-start-point-form";
import { CompletionHistory } from "@/components/completion-history";
import { CourseCandidatePicker } from "@/components/course-candidate-picker";
import { KakaoMap } from "@/components/kakao-map";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import type { CompletionRecord } from "@/lib/completion-log-client";
import {
  fetchCompletionRecords,
  submitCompletion,
} from "@/lib/completion-log-client";
import type { CourseCandidate } from "@/lib/course-candidates-client";
import { fetchCourseCandidates } from "@/lib/course-candidates-client";
import type { Coordinates } from "@/lib/geolocation";
import { getCurrentPosition } from "@/lib/geolocation";
import { isWithinSouthKorea } from "@/lib/korea-boundary";
import { searchAddress } from "@/lib/kakao/geocoder";

type StartPointState =
  | { status: "locating" }
  | { status: "need-address" }
  | { status: "address-error"; message: string }
  | { status: "confirmed"; coordinates: Coordinates; source: "gps" | "address" };

type CandidateState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "empty" }
  | { status: "error" }
  | {
      status: "ready";
      candidates: CourseCandidate[];
      selectedId: string | null;
    };

export default function RunPage() {
  const [state, setState] = useState<StartPointState>({ status: "locating" });
  const [distanceKm, setDistanceKm] = useState("");
  const [candidateState, setCandidateState] = useState<CandidateState>({
    status: "idle",
  });
  const [isCompleting, setIsCompleting] = useState(false);
  const [completedCandidateId, setCompletedCandidateId] = useState<
    string | null
  >(null);
  const [records, setRecords] = useState<CompletionRecord[]>([]);

  useEffect(() => {
    fetchCompletionRecords().then(setRecords);
  }, []);

  useEffect(() => {
    let cancelled = false;

    getCurrentPosition()
      .then((coordinates) => {
        if (cancelled) return;
        setState(
          isWithinSouthKorea(coordinates)
            ? { status: "confirmed", coordinates, source: "gps" }
            : { status: "need-address" }
        );
      })
      .catch(() => {
        if (cancelled) return;
        setState({ status: "need-address" });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleAddressSubmit(address: string) {
    let coordinates: Coordinates | null;
    try {
      coordinates = await searchAddress(address);
    } catch {
      setState({
        status: "address-error",
        message: "지도 서비스를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
      });
      return;
    }

    if (!coordinates) {
      setState({
        status: "address-error",
        message: "주소를 찾을 수 없습니다. 다시 입력해 주세요.",
      });
      return;
    }

    if (!isWithinSouthKorea(coordinates)) {
      setState({
        status: "address-error",
        message: "대한민국 내 주소를 입력해 주세요.",
      });
      return;
    }

    setState({ status: "confirmed", coordinates, source: "address" });
  }

  async function handleDistanceSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (state.status !== "confirmed") return;

    const parsedDistance = Number(distanceKm);
    if (!Number.isFinite(parsedDistance) || parsedDistance <= 0) return;

    setCandidateState({ status: "loading" });
    const candidates = await fetchCourseCandidates(
      state.coordinates,
      parsedDistance
    );

    if (candidates === null) {
      setCandidateState({ status: "error" });
    } else {
      setCandidateState(
        candidates.length === 0
          ? { status: "empty" }
          : { status: "ready", candidates, selectedId: null }
      );
    }
    setCompletedCandidateId(null);
  }

  async function handleComplete(selectedCandidate: CourseCandidate) {
    setIsCompleting(true);
    const record = await submitCompletion(selectedCandidate.distanceKm);
    setIsCompleting(false);

    if (record) {
      setRecords((current) => [record, ...current]);
      setCompletedCandidateId(selectedCandidate.id);
    }
  }

  const confirmed = state.status === "confirmed";
  const selectedCandidate =
    candidateState.status === "ready"
      ? candidateState.candidates.find(
          (candidate) => candidate.id === candidateState.selectedId
        )
      : undefined;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-6 py-12">
      <div className="flex flex-col gap-1">
        <span className="font-heading text-4xl font-bold tracking-tight text-primary">
          RunningMate
        </span>
        <h1 className="font-heading text-sm font-medium text-muted-foreground">
          출발 지점 확인
        </h1>
      </div>

      {state.status === "locating" && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Spinner />
          현재 위치를 확인하는 중입니다…
        </div>
      )}

      {(state.status === "need-address" || state.status === "address-error") && (
        <AddressStartPointForm
          onSubmit={handleAddressSubmit}
          errorMessage={
            state.status === "address-error" ? state.message : undefined
          }
        />
      )}

      {confirmed && (
        <>
          <KakaoMap
            center={state.coordinates}
            candidates={
              candidateState.status === "ready"
                ? candidateState.candidates
                : []
            }
            selectedCandidateId={
              candidateState.status === "ready"
                ? candidateState.selectedId
                : null
            }
          />
          <Alert>
            <AlertTitle>출발 지점이 확인되었습니다</AlertTitle>
            <AlertDescription>
              {state.source === "gps" ? "현재 위치" : "입력한 주소"}를 기준으로
              코스를 추천할 수 있습니다.
            </AlertDescription>
          </Alert>
        </>
      )}

      <form onSubmit={handleDistanceSubmit} className="flex flex-col gap-4">
        <Field data-invalid={confirmed && candidateState.status === "empty"}>
          <FieldLabel htmlFor="distance">원하는 거리 (km)</FieldLabel>
          <Input
            id="distance"
            type="number"
            min="1"
            step="0.5"
            disabled={!confirmed}
            value={distanceKm}
            onChange={(event) => setDistanceKm(event.target.value)}
          />
          <FieldDescription>
            {confirmed
              ? "거리를 입력하면 순환 코스를 추천합니다."
              : "출발 지점이 확인되면 입력할 수 있습니다."}
          </FieldDescription>
        </Field>
        <Button
          type="submit"
          disabled={
            !confirmed ||
            distanceKm.trim().length === 0 ||
            candidateState.status === "loading"
          }
        >
          {candidateState.status === "loading" ? (
            <Spinner data-icon="inline-start" />
          ) : null}
          코스 찾기
        </Button>
      </form>

      {candidateState.status === "error" && (
        <Alert variant="destructive">
          <AlertTitle>코스 검색에 실패했습니다</AlertTitle>
          <AlertDescription>
            잠시 후 다시 시도해 주세요.
          </AlertDescription>
        </Alert>
      )}

      {candidateState.status === "empty" && (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>추천할 수 있는 코스가 없습니다</EmptyTitle>
            <EmptyDescription>
              이 위치·거리로는 추천할 수 있는 코스가 없습니다. 다른 거리를
              입력해 보세요.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {candidateState.status === "ready" && (
        <CourseCandidatePicker
          candidates={candidateState.candidates}
          selectedId={candidateState.selectedId}
          onSelect={(id) =>
            setCandidateState((current) =>
              current.status === "ready"
                ? { ...current, selectedId: id }
                : current
            )
          }
        />
      )}

      {selectedCandidate && (
        <Button
          variant="outline"
          disabled={isCompleting || completedCandidateId === selectedCandidate.id}
          onClick={() => handleComplete(selectedCandidate)}
        >
          {isCompleting ? <Spinner data-icon="inline-start" /> : null}
          {completedCandidateId === selectedCandidate.id
            ? "완주 표시됨"
            : "완주 표시"}
        </Button>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-xl font-semibold tracking-tight">
          완주 기록
        </h2>
        <CompletionHistory records={records} />
      </section>
    </main>
  );
}
