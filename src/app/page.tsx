"use client";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { COLORS, S, SCORE_HELP } from "@/lib/ui";

const StreamMap = dynamic(() => import("@/components/StreamMap"), { ssr: false, loading: () => <div className="h-80 animate-pulse rounded-2xl bg-muted md:h-[28rem]" /> });

function statusClass(status: S["status"]) {
  if (status === "good") return "bg-emerald-50 text-emerald-800 ring-emerald-200";
  if (status === "poor") return "bg-rose-50 text-rose-800 ring-rose-200";
  return "bg-amber-50 text-amber-800 ring-amber-200";
}

export default function Dashboard() {
  const [streams, setStreams] = useState<S[] | null>(null);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const loadStreams = useCallback(() => {
    setErr("");
    fetch("/api/streams")
      .then(async r => {
        if (r.ok) return r.json();
        const d = await r.json().catch(() => ({}));
        throw new Error(d.error ? `${d.error}${d.hasDatabaseUrl === false ? " (DATABASE_URL is not set on the server)" : ""}` : `HTTP ${r.status}`);
      })
      .then(setStreams)
      .catch((e: Error) => setErr(`Could not load streams: ${e.message}. Check the database connection and environment variables.`));
  }, []);

  useEffect(() => {
    loadStreams();
  }, [loadStreams]);

  const shown = useMemo(() => (streams ?? []).filter(s => s.name.toLowerCase().includes(q.toLowerCase()) && (status === "all" || s.status === status)), [streams, q, status]);
  if (err) return (
    <div className="space-y-4">
      <Alert variant="destructive">{err}</Alert>
      <Button onClick={loadStreams} className="rounded-xl bg-teal-800 hover:bg-teal-900 text-white">
        Retry loading dashboard
      </Button>
    </div>
  );
  if (!streams) return <div className="space-y-5"><Skeleton className="h-56 rounded-3xl" /><Skeleton className="h-24 rounded-2xl" /><Skeleton className="h-96 rounded-2xl" /></div>;

  const scored = streams.filter(s => s.latestScore !== null);
  const avg = scored.length ? Math.round(scored.reduce((sum, s) => sum + (s.latestScore ?? 0), 0) / scored.length) : 0;
  const poor = streams.filter(s => s.status === "poor").length;
  const totalObservations = streams.reduce((sum, s) => sum + s.observationCount, 0);
  const good = streams.filter(s => s.status === "good").length;
  const moderate = streams.filter(s => s.status === "moderate").length;
  const watchlist = [...streams].filter(s => s.latestScore !== null).sort((a, b) => (a.latestScore ?? 0) - (b.latestScore ?? 0)).slice(0, 3);
  const stats = [
    { label: "Monitored streams", value: streams.length, detail: "Across the local watershed", tone: "text-sky-800", icon: "⌁" },
    { label: "Average health", value: `${avg}`, detail: "Composite score out of 100", tone: "text-emerald-800", icon: "◉" },
    { label: "Need attention", value: poor, detail: "Streams scoring below 40", tone: "text-rose-700", icon: "!" },
    { label: "Field observations", value: totalObservations, detail: "Community data points", tone: "text-violet-800", icon: "▤" },
  ];

  return <div className="space-y-8 pb-10">
    <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#073b3a] via-[#075451] to-[#0b7285] px-6 py-8 text-white shadow-xl shadow-teal-950/10 sm:px-10 sm:py-11">
      <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-28 h-80 w-80 rounded-full border border-white/10 bg-white/[0.04]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 right-48 h-80 w-80 rounded-full border border-white/10" />
      <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-teal-50">
            <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,.9)]" /> Watershed field intelligence
          </div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Healthy streams.<br /><span className="text-teal-200">Healthier communities.</span></h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-teal-50/85 sm:text-base">A living picture of local waterway health, built from community observations and translated into clear One Health signals.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#monitoring-network" className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-teal-950 shadow-sm transition hover:bg-teal-50">Explore streams <span aria-hidden="true">↓</span></a>
            <Link href="/resilience" className="rounded-xl border border-white/25 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">Research resilience <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
        <div className="min-w-56 rounded-2xl border border-white/15 bg-black/10 p-5 backdrop-blur-sm lg:min-w-64">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-100/75">Watershed pulse</p>
          <div className="mt-2 flex items-end gap-2"><span className="text-6xl font-semibold tracking-tight">{avg}</span><span className="mb-2 text-sm text-teal-100">/ 100</span></div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-gradient-to-r from-amber-300 via-lime-300 to-emerald-300" style={{ width: `${avg}%` }} /></div>
          <p className="mt-3 text-xs leading-5 text-teal-50/80">Average of {scored.length} scored streams · Updated as new observations arrive</p>
        </div>
      </div>
    </section>

    <section aria-label="Watershed summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => <Card key={stat.label} className="group overflow-hidden rounded-2xl border-white/80 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <CardContent className="flex items-start justify-between p-5">
          <div><p className="text-sm font-medium text-muted-foreground">{stat.label}</p><p className={`mt-2 text-3xl font-semibold tracking-tight ${stat.tone}`}>{stat.value}</p><p className="mt-1 text-xs text-muted-foreground">{stat.detail}</p></div>
          <span className={`grid h-10 w-10 place-items-center rounded-xl ${["bg-sky-50 text-sky-700", "bg-emerald-50 text-emerald-700", "bg-rose-50 text-rose-700", "bg-violet-50 text-violet-700"][index]} text-lg font-bold`} aria-hidden="true">{stat.icon}</span>
        </CardContent>
      </Card>)}
    </section>

    <section className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(270px,.75fr)]">
      <Card className="overflow-hidden rounded-3xl border-0 shadow-sm ring-1 ring-slate-200/80">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pb-4 pt-5 sm:px-6">
          <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">Geographic overview</p><h2 className="mt-1 text-xl font-semibold tracking-tight">Monitoring network</h2></div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> Good</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-amber-600" /> Moderate</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-rose-600" /> Poor</span></div>
        </div>
        <div className="px-3 pb-3 sm:px-4"><StreamMap streams={streams} /></div>
        <div className="border-t bg-slate-50/80 px-5 py-3 text-xs text-muted-foreground sm:px-6">Select a marker to open its stream profile. Marker colors show the latest composite score.</div>
      </Card>
      <Card className="rounded-3xl border-0 shadow-sm ring-1 ring-slate-200/80">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">Field snapshot</p><h2 className="mt-1 text-xl font-semibold tracking-tight">Streams to watch</h2></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{watchlist.length} sites</span></div>
          <div className="mt-5 space-y-4">
            {watchlist.length ? watchlist.map((stream, index) => <Link href={`/stream/${stream.id}`} key={stream.id} className="group flex items-center gap-3 rounded-xl p-2 transition hover:bg-slate-50">
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-semibold ${index === 0 ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"}`}>{String(index + 1).padStart(2, "0")}</span>
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold group-hover:text-teal-800">{stream.name}</span><span className="mt-0.5 block truncate text-xs text-muted-foreground">{stream.trend} · {stream.observationCount} observations</span></span>
              <span className="text-xl font-semibold" style={{ color: COLORS[stream.status ?? "moderate"] }}>{stream.latestScore ?? "—"}</span>
            </Link>) : <p className="text-sm text-muted-foreground">Scores will appear here after observations are added.</p>}
          </div>
          <div className="mt-5 border-t pt-5">
            <div className="mb-3 flex items-center justify-between text-xs"><span className="font-medium text-slate-700">Network condition</span><span className="text-muted-foreground">{streams.length} total</span></div>
            <div className="flex h-2 overflow-hidden rounded-full bg-slate-100"><div className="bg-emerald-500" style={{ width: `${streams.length ? good / streams.length * 100 : 0}%` }} /><div className="bg-amber-500" style={{ width: `${streams.length ? moderate / streams.length * 100 : 0}%` }} /><div className="bg-rose-500" style={{ width: `${streams.length ? poor / streams.length * 100 : 0}%` }} /></div>
            <div className="mt-3 flex justify-between text-xs text-muted-foreground"><span>{good} good</span><span>{moderate} moderate</span><span>{poor} poor</span></div>
          </div>
          <p className="mt-5 rounded-xl bg-teal-50 p-3 text-xs leading-5 text-teal-950"><strong>Why it matters:</strong> stream condition can affect wildlife, recreation, and community exposure. {SCORE_HELP}</p>
        </CardContent>
      </Card>
    </section>

    <section id="monitoring-network" className="scroll-mt-6 space-y-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">Site directory</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">Explore your streams</h2><p className="mt-1 text-sm text-muted-foreground">Open a stream to see its trend, field readings, and a reviewable One Health summary.</p></div>
        <div className="flex flex-wrap gap-2">
          <Input aria-label="Search streams" placeholder="Search streams" value={q} onChange={e => setQ(e.target.value)} className="h-10 w-full rounded-xl bg-white sm:w-52" />
          <select aria-label="Filter by health status" value={status} onChange={e => setStatus(e.target.value)} className="h-10 rounded-xl border border-input bg-white px-3 text-sm">
            <option value="all">All conditions</option><option value="good">Good</option><option value="moderate">Moderate</option><option value="poor">Needs attention</option>
          </select>
        </div>
      </div>
      {shown.length === 0 ? <div className="rounded-2xl border border-dashed bg-white p-10 text-center"><p className="font-semibold">No streams match these filters</p><p className="mt-1 text-sm text-muted-foreground">Try another search or switch to all conditions.</p><button className="mt-4 text-sm font-semibold text-teal-800 underline" onClick={() => { setQ(""); setStatus("all"); }}>Clear filters</button></div> :
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{shown.map(stream => <li key={stream.id}>
          <Link href={`/stream/${stream.id}`} className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2">
            <Card className="h-full rounded-2xl border-white/80 shadow-sm transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg group-hover:shadow-slate-900/5">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate text-lg font-semibold group-hover:text-teal-800">{stream.name}</h3><p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">{stream.description || "Community monitoring site"}</p></div><span className="shrink-0 text-3xl font-semibold tracking-tight" style={{ color: COLORS[stream.status ?? "moderate"] }}>{stream.latestScore ?? "—"}</span></div>
                <div className="mt-4 flex items-center justify-between gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${statusClass(stream.status)}`}>{stream.status ?? "unscored"}</span><span className="text-xs text-muted-foreground">{stream.trend}</span></div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full transition-all" style={{ width: `${stream.latestScore ?? 0}%`, backgroundColor: COLORS[stream.status ?? "moderate"] }} /></div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground"><span>{stream.observationCount} observations</span><span className="font-semibold text-teal-800">View stream <span aria-hidden="true">→</span></span></div>
              </CardContent>
            </Card>
          </Link>
        </li>)}</ul>}
    </section>
    <p className="text-center text-xs leading-5 text-muted-foreground">Stream Health Score blends water clarity, pH, temperature, macroinvertebrate diversity, visible pollution, and habitat quality. Scores are decision support, not a substitute for laboratory testing.</p>
  </div>;
}
