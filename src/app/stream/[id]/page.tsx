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
import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { COLORS, S, SCORE_HELP } from "@/lib/ui";
const StreamMap = dynamic(() => import("@/components/StreamMap"), { ssr: false, loading: () => <div className="h-80 animate-pulse rounded-lg bg-muted" /> });
type Obs = { id: string; timestamp: string; healthScore: number; waterClarity: number; pH: number; temperature: number; macroinvertebrateScore: number; habitatScore: number; pollutionSigns: string | null };
export default function StreamDetail({ params }: { params: { id: string } }) {
  const id = params.id;
  const [d, setD] = useState<{ stream: S; observations: Obs[]; latestScore: number; status: "good" | "moderate" | "poor"; trend: string } | null>(null);
  const [err, setErr] = useState(""), [from, setFrom] = useState(""), [to, setTo] = useState("");
  const [text, setText] = useState(""), [busy, setBusy] = useState(false), [saved, setSaved] = useState(false);
  useEffect(() => {
    fetch(`/api/streams/${id}`).then(r => r.ok ? r.json() : Promise.reject()).then(setD).catch(() => setErr("Stream not found."));
    setText(localStorage.getItem(`summary:${id}`) ?? "");
  }, [id]);
  async function generate() {
    setBusy(true); setSaved(false);
    try { const r = await fetch("/api/ai-summary", { method: "POST", body: JSON.stringify({ streamId: id }) }); setText((await r.json()).summary ?? ""); }
    catch { setErr("Could not generate a summary. Try again."); } finally { setBusy(false); }
  }
  if (err) return <Alert variant="destructive">{err}</Alert>;
  if (!d) return <div className="space-y-3"><Skeleton className="h-16" /><Skeleton className="h-80" /></div>;
  const obs = d.observations.filter(o => (!from || o.timestamp >= from) && (!to || o.timestamp <= to + "T23:59:59"));
  const data = obs.map(o => ({ date: o.timestamp.slice(0, 10), score: o.healthScore }));
  return <div className="space-y-4">
    <div><h1 className="text-2xl font-bold">{d.stream.name}</h1><p className="text-muted-foreground">{d.stream.description}</p>
      <p className="mt-1"><span title={SCORE_HELP} className="text-3xl font-bold" style={{ color: COLORS[d.status] }}>{d.latestScore}</span>
        <Badge variant={d.status === "poor" ? "destructive" : "secondary"} className="ml-2">{d.status}</Badge><span className="ml-2 text-sm">{d.trend}</span></p><p className="text-xs text-muted-foreground">{SCORE_HELP}</p></div>
    <StreamMap streams={[d.stream]} focus={id} />
    <div className="flex flex-wrap gap-2 text-sm">
      <label>From <Input type="date" value={from} onChange={e => setFrom(e.target.value)} className="h-9 w-auto" /></label>
      <label>To <Input type="date" value={to} onChange={e => setTo(e.target.value)} className="h-9 w-auto" /></label></div>
    {data.length === 0 ? <p className="rounded border bg-card p-6 text-center">No observations in this date range.</p> :
      <div className="h-64 rounded-lg border bg-card p-2"><ResponsiveContainer><LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" fontSize={11} /><YAxis domain={[0, 100]} /><Tooltip />
        <Line type="monotone" dataKey="score" stroke="#0369a1" strokeWidth={2} /></LineChart></ResponsiveContainer></div>}
    <Card><CardHeader><CardTitle>One Health insight</CardTitle></CardHeader><CardContent className="space-y-2">
      <Button onClick={generate} disabled={busy}>{busy ? "Generating…" : text ? "Regenerate" : "Generate summary"}</Button>
      {text && <><label className="block text-sm">Review and edit before saving or exporting
        <Textarea value={text} onChange={e => { setText(e.target.value); setSaved(false); }} rows={6} className="mt-1" /></label>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={() => { localStorage.setItem(`summary:${id}`, text); setSaved(true); }}>Save summary</Button>
          {saved && <span role="status" className="text-sm text-green-700">Saved</span>}</div></>}
      <Button asChild variant="secondary"><a href={`/api/fhir/export?streamId=${id}${text ? `&summary=${encodeURIComponent(text)}` : ""}`}>Download FHIR bundle</a></Button></CardContent></Card>
    <Card><Table>
      <TableHeader><TableRow>{["Date", "Score", "Clarity", "pH", "Temp °C", "Macro", "Habitat", "Pollution"].map(h => <TableHead key={h}>{h}</TableHead>)}</TableRow></TableHeader>
      <TableBody>{[...obs].reverse().slice(0, 10).map(o => <TableRow key={o.id}><TableCell>{o.timestamp.slice(0, 10)}</TableCell><TableCell className="font-bold">{o.healthScore}</TableCell>
        <TableCell>{o.waterClarity}</TableCell><TableCell>{o.pH}</TableCell><TableCell>{o.temperature}</TableCell><TableCell>{o.macroinvertebrateScore}</TableCell><TableCell>{o.habitatScore}</TableCell><TableCell>{o.pollutionSigns ?? "none"}</TableCell></TableRow>)}</TableBody></Table></Card>
  </div>;
}
