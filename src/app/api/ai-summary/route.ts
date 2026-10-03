import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateSummary } from "@/lib/ai";
import { statusOf, trendOf } from "@/lib/health";
// POST { streamId } -> { summary, source }. The UI lets the user edit the text before saving/exporting (human-in-the-loop).
export async function POST(req: NextRequest) {
  const { streamId } = await req.json();
  const stream = streamId && await db.stream.findUnique({ where: { id: streamId }, include: { observations: { orderBy: { timestamp: "asc" } } } });
  if (!stream || !stream.observations.length) return NextResponse.json({ error: "Stream not found or has no observations" }, { status: 404 });
  const scores = stream.observations.map(o => o.healthScore ?? 0), last = stream.observations.at(-1)!, score = scores.at(-1)!;
  return NextResponse.json(await generateSummary({ name: stream.name, score, status: statusOf(score), trend: trendOf(scores), latest: last }));
}
