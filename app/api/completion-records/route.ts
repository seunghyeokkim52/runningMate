import { NextResponse } from "next/server";

import {
  addCompletionRecord,
  listCompletionRecords,
} from "@/lib/completion-log/store";

export async function GET() {
  return NextResponse.json({ records: listCompletionRecords() });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const distanceKm = body?.distanceKm;

  if (typeof distanceKm !== "number" || distanceKm <= 0) {
    return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  }

  const record = addCompletionRecord(distanceKm);

  return NextResponse.json({ record });
}
