import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { scoreObservation } from "@/lib/health";
export const dynamic = "force-dynamic";
// GET /api/observations?streamId=&from=&to=
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams, streamId = p.get("streamId"), from = p.get("from"), to = p.get("to");
  const data = await db.observation.findMany({ orderBy: { timestamp: "asc" },
    where: { ...(streamId && { streamId }), ...((from || to) && { timestamp: { ...(from && { gte: new Date(from) }), ...(to && { lte: new Date(to) }) } }) } });
  return NextResponse.json(data);
}
// POST /api/observations -> adds an observation and computes its health score
export async function POST(req: NextRequest) {
  const b = await req.json();
  const need = ["streamId", "waterClarity", "pH", "temperature", "macroinvertebrateScore", "habitatScore"];
  const missing = need.filter(k => b[k] === undefined || b[k] === null);
  if (missing.length) return NextResponse.json({ error: `Missing: ${missing.join(", ")}` }, { status: 400 });
  const created = await db.observation.create({ data: { streamId: b.streamId, timestamp: b.timestamp ? new Date(b.timestamp) : new Date(),
    waterClarity: +b.waterClarity, pH: +b.pH, temperature: +b.temperature, macroinvertebrateScore: +b.macroinvertebrateScore,
    habitatScore: +b.habitatScore, pollutionSigns: b.pollutionSigns ?? null, notes: b.notes ?? null, healthScore: scoreObservation(b) } });
  return NextResponse.json(created, { status: 201 });
}
