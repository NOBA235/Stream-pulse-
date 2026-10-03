import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { statusOf, trendOf } from "@/lib/health";
export const dynamic = "force-dynamic";
// GET /api/streams/:id -> stream, observations (oldest first), latest score, status, trend
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const s = await db.stream.findUnique({ where: { id: params.id }, include: { observations: { orderBy: { timestamp: "asc" } } } });
  if (!s) return NextResponse.json({ error: "Stream not found" }, { status: 404 });
  const { observations, ...stream } = s, scores = observations.map(o => o.healthScore ?? 0), latest = scores.at(-1) ?? null;
  return NextResponse.json({ stream, observations, latestScore: latest, status: latest == null ? null : statusOf(latest), trend: trendOf(scores) });
}
