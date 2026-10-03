import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { statusOf, trendOf } from "@/lib/health";
export const dynamic = "force-dynamic";
// GET /api/streams -> every stream with latest score, 6-month average, status and trend
export async function GET() {
  const streams = await db.stream.findMany({ include: { observations: { orderBy: { timestamp: "asc" } } } });
  return NextResponse.json(streams.map(({ observations: obs, ...s }) => {
    const scores = obs.map(o => o.healthScore ?? 0);
    const latest = scores.at(-1) ?? null;
    return { ...s, observationCount: obs.length, latestScore: latest,
      averageScore: scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : null,
      status: latest == null ? null : statusOf(latest), trend: trendOf(scores) };
  }));
}
