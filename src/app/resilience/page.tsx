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

  return <div className="space-y-4">
    <div><h1 className="text-2xl font-bold">Research site resilience</h1><p className="text-sm text-muted-foreground">Read-only weather context from OneAquaHealth. These sites are separate from StreamPulse’s local streams.</p></div>
    {error && <Alert>{error}</Alert>}
    {!sites && !error ? <Skeleton className="h-16" /> : sites && <>
      <div className="flex flex-wrap items-end gap-3">
        <label className="grid gap-1 text-sm">Research site<select aria-label="Research site" value={siteCode} onChange={e => setSiteCode(e.target.value)} className="h-10 min-w-56 rounded-md border border-input bg-background px-3">
          {sites.map(item => <option key={item.code} value={item.code}>{item.name} · {item.city.name}</option>)}
        </select></label>
        <label className="grid gap-1 text-sm">From<Input type="date" value={start} max={end} onChange={e => setStart(e.target.value)} /></label>
        <label className="grid gap-1 text-sm">To<Input type="date" value={end} min={start} max={dateDaysAgo(0)} onChange={e => setEnd(e.target.value)} /></label>
      </div>
      {site && <p className="text-sm text-muted-foreground">{site.city.name} · {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)} · Site code {site.code}</p>}
      {!observations ? <Skeleton className="h-72" /> : <>
        <div className="grid gap-3 sm:grid-cols-2">
          <Card><CardContent className="p-4"><div className="text-2xl font-bold">{meanTemp}{meanTemp !== "—" && " °C"}</div><div className="text-sm text-muted-foreground">Mean daily temperature average</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-2xl font-bold">{totalRain}</div><div className="text-sm text-muted-foreground">Total precipitation in selected period</div></CardContent></Card>
        </div>
      <Card><CardHeader><CardTitle>Daily temperature and precipitation</CardTitle></CardHeader><CardContent>
          {chartData.length ? <div className="h-80"><ResponsiveContainer><LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" tick={{ fontSize: 11 }} /><YAxis yAxisId="temp" label={{ value: "°C", angle: -90, position: "insideLeft" }} /><YAxis yAxisId="rain" orientation="right" label={{ value: "mm", angle: 90, position: "insideRight" }} /><Tooltip /><Line yAxisId="temp" type="monotone" dataKey="t2mMeanC" name="Mean temp (°C)" stroke="#0369a1" dot={false} /><Line yAxisId="rain" type="monotone" dataKey="precipTotalMm" name="Precipitation (mm)" stroke="#0f766e" dot={false} /></LineChart></ResponsiveContainer></div> : <p className="text-sm text-muted-foreground">No weather observations for this selection.</p>}
          <p className="mt-3 text-xs text-muted-foreground">Source: OneAquaHealth resilience weather. Weather context is displayed separately and does not change StreamPulse health scores.</p>
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Explore OneAquaHealth</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
          <p>Open the full Resilience Map to explore additional health, urban, and satellite indicators and compare research sites.</p>
          <p><a className="text-primary underline" href="https://apps.oneaquahealth.eu/resmap/" target="_blank" rel="noreferrer">OneAquaHealth Resilience Map</a></p>
          <p>To contribute citizen observations, OneAquaHealth asks participants to join its Community before signing in to the Citizen Science App.</p>
          <p><a className="text-primary underline" href="https://www.oneaquahealth.eu/community/" target="_blank" rel="noreferrer">OneAquaHealth Community</a>{" · "}<a className="text-primary underline" href="https://apps.oneaquahealth.eu/login" target="_blank" rel="noreferrer">Citizen Science App</a></p>
        </CardContent></Card>
      </>}
    </>}
  </div>;
}
