"use client";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { COLORS, S, SCORE_HELP } from "@/lib/ui";

const StreamMap = dynamic(() => import("@/components/StreamMap"), { ssr: false, loading: () => <div className="h-64 animate-pulse rounded-2xl bg-muted" /> });
type Obs = { id: string; timestamp: string; healthScore: number; waterClarity: number; pH: number; temperature: number; macroinvertebrateScore: number; habitatScore: number; pollutionSigns: string | null };
type Detail = { stream: S; observations: Obs[]; latestScore: number; status: "good" | "moderate" | "poor"; trend: string };

function statusSurface(status: Detail["status"]) {
  if (status === "good") return "from-emerald-950 via-teal-950 to-slate-950";
  if (status === "poor") return "from-rose-950 via-slate-950 to-slate-950";
  return "from-amber-950 via-teal-950 to-slate-950";
}

export default function StreamDetail({ params }: { params: { id: string } }) {
  const id = params.id;
  const [d, setD] = useState<Detail | null>(null);
  const [err, setErr] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    fetch(`/api/streams/${id}`).then(r => r.ok ? r.json() : Promise.reject()).then(setD).catch(() => setErr("Stream not found."));
    setText(localStorage.getItem(`summary:${id}`) ?? "");
  }, [id]);
  async function generate() {
    setBusy(true); setSaved(false); setErr("");
    try {
      const response = await fetch("/api/ai-summary", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ streamId: id }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not generate a summary.");
      setText(result.summary ?? "");
    } catch { setErr("Could not generate a summary. Try again."); }
    finally { setBusy(false); }
  }
  if (err && !d) return <Alert variant="destructive">{err}</Alert>;
  if (!d) return <div className="space-y-5"><Skeleton className="h-48 rounded-3xl" /><Skeleton className="h-20 rounded-2xl" /><Skeleton className="h-80 rounded-2xl" /></div>;

  const obs = d.observations.filter(o => (!from || o.timestamp >= from) && (!to || o.timestamp <= `${to}T23:59:59`));
  const chartData = obs.map(o => ({ date: o.timestamp.slice(0, 10), score: o.healthScore }));
  const latest = obs.at(-1);
  const recent = [...obs].reverse().slice(0, 10);
  const readings = latest ? [
    { label: "Water clarity", value: `${latest.waterClarity}%`, hint: "Transparency", icon: "◌", tone: "text-sky-800 bg-sky-50" },
    { label: "Water temperature", value: `${latest.temperature} °C`, hint: "Field measurement", icon: "≈", tone: "text-orange-800 bg-orange-50" },
    { label: "pH level", value: `${latest.pH}`, hint: "Acidity / alkalinity", icon: "pH", tone: "text-violet-800 bg-violet-50" },
    { label: "Macroinvertebrates", value: `${latest.macroinvertebrateScore}/10`, hint: "Sensitive taxa score", icon: "✳", tone: "text-emerald-800 bg-emerald-50" },
  ] : [];

  return <div className="space-y-7 pb-10">
    <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-teal-800"><span aria-hidden="true">←</span> Back to watershed overview</Link>
    {err && <Alert variant="destructive">{err}</Alert>}
    <section className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${statusSurface(d.status)} px-6 py-7 text-white shadow-xl shadow-slate-950/10 sm:px-9 sm:py-9`}>
      <div aria-hidden="true" className="pointer-events-none absolute -right-14 -top-36 h-96 w-96 rounded-full border border-white/10 bg-white/[0.03]" />
      <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">Stream profile · Community monitored</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{d.stream.name}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">{d.stream.description || "A local waterway monitored through community field observations."}</p>
          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-slate-200"><span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">{d.stream.lat.toFixed(4)}, {d.stream.lng.toFixed(4)}</span><span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">{d.observations.length} observations</span><span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">{d.trend}</span></div>
        </div>
        <div className="flex items-center gap-4 md:pr-3">
          <div className="grid h-32 w-32 shrink-0 place-items-center rounded-full border-[7px] border-white/15 bg-white/5 shadow-inner" style={{ boxShadow: `inset 0 0 0 3px ${COLORS[d.status]}55` }}>
            <div className="text-center"><div className="text-4xl font-semibold tracking-tight">{d.latestScore}</div><div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-200">Health score</div></div>
          </div>
          <div><Badge className={`border-0 capitalize ${d.status === "good" ? "bg-emerald-300 text-emerald-950" : d.status === "poor" ? "bg-rose-300 text-rose-950" : "bg-amber-300 text-amber-950"}`}>{d.status} condition</Badge><p className="mt-2 max-w-28 text-xs leading-5 text-slate-300">{SCORE_HELP}</p></div>
        </div>
      </div>
    </section>

    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Latest field readings">
      {readings.map(item => <Card key={item.label} className="rounded-2xl border-0 shadow-sm ring-1 ring-slate-200/80"><CardContent className="flex items-start justify-between p-5"><div><p className="text-sm font-medium text-muted-foreground">{item.label}</p><p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{item.value}</p><p className="mt-1 text-xs text-muted-foreground">{item.hint}</p></div><span className={`grid h-10 w-10 place-items-center rounded-xl text-sm font-bold ${item.tone}`} aria-hidden="true">{item.icon}</span></CardContent></Card>)}
    </section>

    <section className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,.75fr)]">
      <Card className="rounded-3xl border-0 shadow-sm ring-1 ring-slate-200/80">
        <CardHeader className="flex-row flex-wrap items-end justify-between gap-3 px-5 pb-3 sm:px-6">
          <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">Longitudinal signal</p><CardTitle className="mt-1">Health score trend</CardTitle><p className="mt-1 text-xs text-muted-foreground">Score over community observations</p></div>
          <div className="flex gap-2"><label className="grid gap-1 text-[11px] font-medium text-muted-foreground">From<Input aria-label="Filter observations from" type="date" value={from} onChange={e => setFrom(e.target.value)} className="h-9 w-36 rounded-lg bg-white text-xs" /></label><label className="grid gap-1 text-[11px] font-medium text-muted-foreground">To<Input aria-label="Filter observations to" type="date" value={to} onChange={e => setTo(e.target.value)} className="h-9 w-36 rounded-lg bg-white text-xs" /></label></div>
        </CardHeader>
        <CardContent className="px-3 pb-5 sm:px-6">
          {chartData.length ? <div className="h-72"><ResponsiveContainer><LineChart data={chartData} margin={{ top: 10, right: 12, left: -18, bottom: 4 }}><defs><linearGradient id="scoreLine" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#0f766e" /><stop offset="100%" stopColor="#0284c7" /></linearGradient></defs><CartesianGrid stroke="#e2e8f0" strokeDasharray="4 5" vertical={false} /><XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} minTickGap={24} /><YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} /><Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 10px 30px rgba(15,23,42,.08)" }} /><Line type="monotone" dataKey="score" name="Health score" stroke="url(#scoreLine)" strokeWidth={3} dot={false} activeDot={{ r: 5, fill: "#0f766e", stroke: "white", strokeWidth: 2 }} /></LineChart></ResponsiveContainer></div> : <p className="rounded-xl bg-slate-50 p-8 text-center text-sm text-muted-foreground">No observations in this date range.</p>}
          <p className="mt-2 text-xs text-muted-foreground">Composite score from 0 to 100 · {chartData.length} observations shown</p>
        </CardContent>
      </Card>
      <div className="space-y-5">
        <Card className="overflow-hidden rounded-3xl border-0 shadow-sm ring-1 ring-slate-200/80"><CardHeader className="px-5 pb-2"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">Site location</p><CardTitle className="mt-1">On the map</CardTitle></CardHeader><CardContent className="px-2 pb-2"><StreamMap streams={[d.stream]} focus={id} /></CardContent></Card>
        <Card className="rounded-3xl border-0 bg-gradient-to-br from-teal-950 to-slate-900 text-white shadow-sm"><CardContent className="p-5"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-200">Habitat & field notes</p><div className="mt-4 flex items-end justify-between"><div><p className="text-sm text-slate-300">Habitat quality</p><p className="mt-1 text-3xl font-semibold">{latest ? `${latest.habitatScore}/100` : "—"}</p></div><div className="text-right"><p className="text-sm text-slate-300">Pollution signs</p><p className="mt-1 max-w-36 text-sm font-medium">{latest?.pollutionSigns || "None reported"}</p></div></div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-teal-300" style={{ width: `${latest?.habitatScore ?? 0}%` }} /></div><p className="mt-4 border-t border-white/10 pt-3 text-xs leading-5 text-slate-300">This score combines water clarity, pH, temperature, macroinvertebrate diversity, visible pollution, and habitat quality.</p></CardContent></Card>
      </div>
    </section>

    <section className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(310px,.8fr)]">
      <Card className="overflow-hidden rounded-3xl border-0 shadow-sm ring-1 ring-slate-200/80">
        <div className="flex flex-wrap items-end justify-between gap-3 px-5 py-5 sm:px-6"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">Observation log</p><h2 className="mt-1 text-xl font-semibold tracking-tight">Recent field samples</h2></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">Latest {recent.length}</span></div>
        <div className="overflow-x-auto"><Table><TableHeader><TableRow className="bg-slate-50"><TableHead>Date</TableHead><TableHead>Score</TableHead><TableHead>Clarity</TableHead><TableHead>pH</TableHead><TableHead>Temp</TableHead><TableHead>Macro</TableHead><TableHead>Habitat</TableHead><TableHead>Pollution</TableHead></TableRow></TableHeader><TableBody>{recent.map(o => <TableRow key={o.id}><TableCell className="whitespace-nowrap text-xs">{o.timestamp.slice(0, 10)}</TableCell><TableCell className="font-semibold" style={{ color: COLORS[o.healthScore >= 70 ? "good" : o.healthScore >= 40 ? "moderate" : "poor"] }}>{o.healthScore}</TableCell><TableCell>{o.waterClarity}%</TableCell><TableCell>{o.pH}</TableCell><TableCell>{o.temperature} °C</TableCell><TableCell>{o.macroinvertebrateScore}/10</TableCell><TableCell>{o.habitatScore}</TableCell><TableCell className="max-w-36 truncate">{o.pollutionSigns || "None"}</TableCell></TableRow>)}</TableBody></Table></div>
      </Card>
      <Card className="rounded-3xl border-0 shadow-sm ring-1 ring-slate-200/80"><CardHeader className="px-5 pb-3 sm:px-6"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">Human-reviewed output</p><CardTitle className="mt-1">One Health insight</CardTitle><p className="text-sm leading-5 text-muted-foreground">Draft a plain-language summary, review it, then save or export with your data.</p></CardHeader><CardContent className="space-y-3 px-5 pb-5 sm:px-6">
        <Button onClick={generate} disabled={busy} className="w-full rounded-xl bg-teal-800 hover:bg-teal-900">{busy ? "Generating summary…" : text ? "Regenerate summary" : "Generate insight"}</Button>
        {text && <><label className="block text-xs font-medium text-slate-600">Edit the draft before saving or exporting<Textarea value={text} onChange={e => { setText(e.target.value); setSaved(false); }} rows={7} className="mt-2 rounded-xl bg-white text-sm leading-6" /></label><div className="flex items-center gap-3"><Button variant="outline" className="rounded-xl" onClick={() => { localStorage.setItem(`summary:${id}`, text); setSaved(true); }}>Save draft</Button>{saved && <span role="status" className="text-sm font-medium text-emerald-700">Saved in this browser</span>}</div></>}
        <a href={`/api/fhir/export?streamId=${id}${text ? `&summary=${encodeURIComponent(text)}` : ""}`} className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-900"><span>Download FHIR R4 bundle</span><span aria-hidden="true">↓</span></a>
        <p className="text-[11px] leading-5 text-muted-foreground">AI text is a draft. Review and edit it before sharing. Saved summaries stay in this browser.</p>
      </CardContent></Card>
    </section>
  </div>;
}
