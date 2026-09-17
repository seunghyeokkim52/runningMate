"use client";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CompletionRecord } from "@/lib/completion-log-client";

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function CompletionHistory({
  records,
}: {
  records: CompletionRecord[];
}) {
  if (records.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>아직 완주 기록이 없습니다</EmptyTitle>
          <EmptyDescription>
            코스를 뛰고 완주를 표시하면 여기에 기록이 남습니다.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>날짜</TableHead>
          <TableHead className="text-right">거리</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((record) => (
          <TableRow key={record.id}>
            <TableCell>{formatDate(record.completedAt)}</TableCell>
            <TableCell className="text-right">
              {record.distanceKm.toFixed(1)}km
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
