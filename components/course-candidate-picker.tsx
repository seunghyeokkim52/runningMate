"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { CourseCandidate } from "@/lib/course-candidates-client";

export function CourseCandidatePicker({
  candidates,
  selectedId,
  onSelect,
}: {
  candidates: CourseCandidate[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <ToggleGroup
      value={selectedId ? [selectedId] : []}
      onValueChange={(values) => {
        if (values[0]) onSelect(values[0]);
      }}
      className="flex-wrap"
    >
      {candidates.map((candidate) => (
        <ToggleGroupItem
          key={candidate.id}
          value={candidate.id}
          variant="outline"
          size="lg"
        >
          {candidate.distanceKm.toFixed(1)}km 코스
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
