import { NextRequest, NextResponse } from "next/server";
import { enoraGet, isWeatherObservation } from "@/lib/enora";

export const dynamic = "force-dynamic";

function isDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const siteCode = params.get("siteCode")?.trim() ?? "";
  const start = params.get("start") ?? "";
  const end = params.get("end") ?? "";
  if (!/^[A-Za-z0-9._-]{1,80}$/.test(siteCode) || !isDate(start) || !isDate(end)) {
    return NextResponse.json({ error: "Provide a valid siteCode and start/end dates (YYYY-MM-DD)." }, { status: 400 });
  }
  const from = Date.parse(`${start}T00:00:00Z`), to = Date.parse(`${end}T00:00:00Z`);
  if (!Number.isFinite(from) || !Number.isFinite(to) || from > to || to - from > 366 * 86400000) {
    return NextResponse.json({ error: "Date range must be valid, ordered, and no longer than one year." }, { status: 400 });
  }
  const query = { siteCode, start: `${start}T00:00:00Z`, end: `${end}T23:59:59Z` };
  try {
    const result = await enoraGet("/api/resilience-map/weather", query);
    if (!Array.isArray(result)) throw new Error("Unexpected weather response.");
    const observations = result.filter(isWeatherObservation).filter(row => row.siteCode === siteCode);
    return NextResponse.json({ observations, source: "OneAquaHealth resilience weather" });
  } catch {
    return NextResponse.json({ error: "Weather data is temporarily unavailable." }, { status: 502 });
  }
}
