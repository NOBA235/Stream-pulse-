import { NextResponse } from "next/server";
import { enoraGet, isResearchSite } from "@/lib/enora";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await enoraGet("/api/sites/all");
    if (!Array.isArray(result)) throw new Error("Unexpected research site response.");
    const sites = result.filter(isResearchSite).map(({ code, name, city, latitude, longitude }) => ({ code, name, city, latitude, longitude }));
    return NextResponse.json({ sites, source: "OneAquaHealth research sites" });
  } catch {
    return NextResponse.json({ error: "Research sites are temporarily unavailable." }, { status: 502 });
  }
}
