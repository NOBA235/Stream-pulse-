"use client";
import { useEffect, useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { ResearchSite, WeatherObservation } from "@/lib/enora";

function dateDaysAgo(days: number) { const date = new Date(); date.setDate(date.getDate() - days); return date.toISOString().slice(0, 10); }

export default function ResiliencePage() {
  const [sites, setSites] = useState<ResearchSite[] | null>(null);
  const [siteCode, setSiteCode] = useState("");
  const [observations, setObservations] = useState<WeatherObservation[] | null>(null);
  const [error, setError] = useState("");
  const [start, setStart] = useState(dateDaysAgo(30));
  const [end, setEnd] = useState(dateDaysAgo(0));
  useEffect(() => {
    fetch("/api/enora/sites").then(async r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => { setSites(data.sites); if (data.sites[0]) setSiteCode(data.sites[0].code); })
      .catch(() => setError("Research site data is unavailable right now."));
  }, []);
  useEffect(() => {
    if (!siteCode) return;
    setObservations(null); setError("");
    const query = new URLSearchParams({ siteCode, start, end });
    fetch(`/api/enora/weather?${query}`).then(async r => { const data = await r.json(); if (!r.ok) throw new Error(data.error); return data; })
      .then(data => setObservations(data.observations)).catch(() => { setObservations([]); setError("Weather data is unavailable for this site and date range."); });
  }, [siteCode, start, end]);
  const site = sites?.find(item => item.code === siteCode);
  const chartData = useMemo(() => (observations ?? []).slice().sort((a, b) => a.date.localeCompare(b.date)), [observations]);
  const meanTemp = useMemo(() => {
    const values = chartData.flatMap(row => typeof row.t2mMeanC === "number" ? [row.t2mMeanC] : []);
    return values.length ? (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1) : "—";
  }, [chartData]);
  const totalRain = useMemo(() => {
    const values = chartData.flatMap(row => typeof row.precipTotalMm === "number" ? [row.precipTotalMm] : []);
    return values.length ? `${values.reduce((sum, value) => sum + value, 0).toFixed(1)} mm` : "—";
  }, [chartData]);

  return <div className="space-y-7 pb-10">
    <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#073b3a] via-[#075451] to-[#0b7285] px-6 py-8 text-white shadow-xl shadow-teal-950/10 sm:px-9 sm:py-10">
      <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-28 h-80 w-80 rounded-full border border-white/10 bg-white/[0.04]" />
      <div className="relative max-w-3xl"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">OneAquaHealth data connection</p><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Research site resilience</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-teal-50/85">Explore daily weather around European research sites. This context complements StreamPulse observations and stays separate from local health scores.</p></div>
    </section>
    {error && <Alert>{error}</Alert>}
    {!sites && !error ? <Skeleton className="h-20 rounded-2xl" /> : sites && <>
      <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-slate-200/80"><CardContent className="flex flex-wrap items-end justify-between gap-4 p-5 sm:px-6">
        <div className="grid gap-1.5 text-sm"><span className="font-semibold text-slate-800">Research site</span><select aria-label="Research site" value={siteCode} onChange={e => setSiteCode(e.target.value)} className="h-10 min-w-64 rounded-xl border border-input bg-white px-3 text-sm">
          {sites.map(item => <option key={item.code} value={item.code}>{item.name} | {item.city.name}</option>)}
        </select></div>
        <div className="flex flex-wrap gap-3"><label className="grid gap-1 text-xs font-medium text-muted-foreground">From<Input type="date" value={start} max={end} onChange={e => setStart(e.target.value)} className="h-10 rounded-xl bg-white" /></label><label className="grid gap-1 text-xs font-medium text-muted-foreground">To<Input type="date" value={end} min={start} max={dateDaysAgo(0)} onChange={e => setEnd(e.target.value)} className="h-10 rounded-xl bg-white" /></label></div>
      </CardContent></Card>
      {site && <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-sm"><p className="font-semibold text-slate-800">{site.name}<span className="font-normal text-muted-foreground"> · {site.city.name}</span></p><p className="text-xs text-muted-foreground">{site.latitude.toFixed(4)}, {site.longitude.toFixed(4)} · Site {site.code}</p></div>}
      {!observations ? <Skeleton className="h-80 rounded-2xl" /> : <>
        <div className="grid gap-3 sm:grid-cols-2">
          <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-slate-200/80"><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm font-medium text-muted-foreground">Average daily temperature</p><p className="mt-2 text-3xl font-semibold tracking-tight text-sky-800">{meanTemp}{meanTemp !== "—" && " °C"}</p></div><span className="grid h-11 w-11 place-items-center rounded-xl bg-sky-50 text-xl text-sky-800">°</span></CardContent></Card>
          <Card className="rounded-2xl border-0 shadow-sm ring-1 ring-slate-200/80"><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm font-medium text-muted-foreground">Total precipitation</p><p className="mt-2 text-3xl font-semibold tracking-tight text-teal-800">{totalRain}</p></div><span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-xl text-teal-800">⌁</span></CardContent></Card>
        </div>
        <Card className="rounded-3xl border-0 shadow-sm ring-1 ring-slate-200/80"><CardHeader className="flex-row flex-wrap items-end justify-between gap-2 px-5 pb-2 sm:px-6"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">Daily observations</p><CardTitle className="mt-1">Weather conditions</CardTitle></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{chartData.length} days</span></CardHeader><CardContent className="px-3 pb-5 sm:px-6">
          {chartData.length ? <div className="h-80"><ResponsiveContainer><LineChart data={chartData} margin={{ top: 12, right: 14, left: -8, bottom: 4 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="4 5" vertical={false} /><XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} minTickGap={22} /><YAxis yAxisId="temp" tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} label={{ value: "°C", angle: -90, position: "insideLeft", fill: "#64748b" }} /><YAxis yAxisId="rain" orientation="right" tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} label={{ value: "mm", angle: 90, position: "insideRight", fill: "#64748b" }} /><Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 10px 30px rgba(15,23,42,.08)" }} /><Line yAxisId="temp" type="monotone" dataKey="t2mMeanC" name="Mean temperature (°C)" stroke="#0284c7" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} /><Line yAxisId="rain" type="monotone" dataKey="precipTotalMm" name="Precipitation (mm)" stroke="#0f766e" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} /></LineChart></ResponsiveContainer></div> : <p className="rounded-xl bg-slate-50 p-8 text-center text-sm text-muted-foreground">No weather observations for this site and date range.</p>}
          <p className="mt-3 border-t pt-3 text-xs leading-5 text-muted-foreground">Source: OneAquaHealth resilience weather. Weather context is displayed separately and does not change StreamPulse health scores.</p>
        </CardContent></Card>
        <Card className="rounded-3xl border-0 bg-gradient-to-br from-teal-950 to-slate-900 text-white shadow-sm"><CardContent className="grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-200">Continue exploring</p><h2 className="mt-2 text-xl font-semibold">More from OneAquaHealth</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Open the full Resilience Map for health, urban, and satellite indicators, or join the community to contribute citizen observations.</p></div><div className="flex flex-wrap gap-2"><a className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-teal-950 transition hover:bg-teal-50" href="https://apps.oneaquahealth.eu/resmap/" target="_blank" rel="noreferrer">Open Resilience Map ↗</a><a className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10" href="https://www.oneaquahealth.eu/community/" target="_blank" rel="noreferrer">Citizen science info ↗</a></div></CardContent></Card>
      </>}
    </>}
  </div>;
}
