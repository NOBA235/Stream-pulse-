"use client";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { COLORS, S, SCORE_HELP } from "@/lib/ui";
const StreamMap = dynamic(() => import("@/components/StreamMap"), { ssr: false, loading: () => <div className="h-80 animate-pulse rounded-lg bg-muted md:h-[28rem]" /> });
export default function Dashboard() {
  const [streams, setStreams] = useState<S[] | null>(null);
  const [err, setErr] = useState("");
  const [q, setQ] = useState(""), [status, setStatus] = useState("all");
  useEffect(() => { fetch("/api/streams").then(r => r.ok ? r.json() : Promise.reject()).then(setStreams).catch(() => setErr("Could not load streams. Run npm run seed, then reload.")); }, []);
  const shown = useMemo(() => (streams ?? []).filter(s => s.name.toLowerCase().includes(q.toLowerCase()) && (status === "all" || s.status === status)), [streams, q, status]);
  if (err) return <Alert variant="destructive">{err}</Alert>;
  if (!streams) return <div className="space-y-3"><Skeleton className="h-20" /><Skeleton className="h-80" /></div>;
  const avg = streams.length ? Math.round(streams.reduce((a, s) => a + (s.latestScore ?? 0), 0) / streams.length) : 0;
  return <div className="space-y-4">
    <div className="grid grid-cols-3 gap-3 text-center">
      {[["Streams", streams.length], ["Average score", avg], ["Poor health", streams.filter(s => s.status === "poor").length]].map(([l, v]) =>
        <Card key={l}><CardContent className="p-3"><div className="text-2xl font-bold">{v}</div><div className="text-xs text-muted-foreground">{l}</div></CardContent></Card>)}
    </div>
    <p className="text-sm text-muted-foreground">{SCORE_HELP}</p>
    <div className="flex flex-wrap gap-2">
      <Input aria-label="Search streams" placeholder="Search streams" value={q} onChange={e => setQ(e.target.value)} className="w-56" />
      <select aria-label="Filter by health status" value={status} onChange={e => setStatus(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
        <option value="all">All statuses</option><option value="good">Good</option><option value="moderate">Moderate</option><option value="poor">Poor</option></select>
    </div>
    {shown.length === 0 ? <p className="rounded border bg-card p-6 text-center">No streams match these filters.</p> : <>
      <StreamMap streams={shown} />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{shown.map(s => <li key={s.id}>
        <Link href={`/stream/${s.id}`} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Card className="hover:border-primary"><CardContent className="p-4">
          <div className="flex justify-between"><b>{s.name}</b><span className="font-bold" style={{ color: COLORS[s.status ?? "moderate"] }}>{s.latestScore}</span></div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground"><Badge variant={s.status === "poor" ? "destructive" : "secondary"}>{s.status}</Badge>{s.trend} · {s.observationCount} observations</div></CardContent></Card></Link></li>)}</ul></>}
  </div>;
}
