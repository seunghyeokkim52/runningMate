import { NextResponse } from "next/server";

import { generateCourseCandidates } from "@/lib/valhalla/generate-candidates";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const start = body?.start;
  const distanceKm = body?.distanceKm;

  if (
    typeof start?.lat !== "number" ||
    typeof start?.lng !== "number" ||
    typeof distanceKm !== "number" ||
    distanceKm <= 0
  ) {
    return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  }

  const candidates = await generateCourseCandidates(start, distanceKm);

  return NextResponse.json({ candidates });
}
