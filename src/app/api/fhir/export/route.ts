import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toFhirBundle } from "@/lib/fhir";
export const dynamic = "force-dynamic";
// GET /api/fhir/export?streamId=... -> downloadable FHIR R4 Bundle
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("streamId");
  if (!id) return NextResponse.json({ error: "streamId is required" }, { status: 400 });
  const stream = await db.stream.findUnique({ where: { id }, include: { observations: { orderBy: { timestamp: "asc" } } } });
  if (!stream) return NextResponse.json({ error: "Stream not found" }, { status: 404 });
  return new NextResponse(JSON.stringify(toFhirBundle(stream, stream.observations, req.nextUrl.searchParams.get("summary")), null, 2), {
    headers: { "Content-Type": "application/fhir+json", "Content-Disposition": `attachment; filename="${stream.name.replace(/\s+/g, "-")}-fhir.json"` } });
}
