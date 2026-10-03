import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

const dimensions = [
  { value: "20%", title: "Water clarity", detail: "A simple field reading of transparency." },
  { value: "15%", title: "pH balance", detail: "A signal of water acidity or alkalinity." },
  { value: "10%", title: "Temperature", detail: "Warm water can hold less dissolved oxygen." },
  { value: "25%", title: "Macroinvertebrates", detail: "Sensitive taxa help indicate stream condition." },
  { value: "15%", title: "Pollution signs", detail: "Visible indicators such as odor, algae, or litter." },
  { value: "15%", title: "Habitat quality", detail: "The condition and complexity of stream habitat." },
];

export default function About() {
  return <div className="space-y-7 pb-10">
    <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#073b3a] via-[#075451] to-[#0b7285] px-6 py-9 text-white shadow-xl shadow-teal-950/10 sm:px-10 sm:py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">The idea behind StreamPulse</p>
      <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">One stream connects<br className="hidden sm:block" /> many kinds of health.</h1>
      <p className="mt-5 max-w-2xl text-sm leading-6 text-teal-50/85 sm:text-base">One Health recognizes that people, animals, and ecosystems share the same environment. StreamPulse helps communities make local stream observations easier to understand and act on.</p>
      <Link href="/" className="mt-7 inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-teal-950 transition hover:bg-teal-50">Explore the watershed <span className="ml-2" aria-hidden="true">→</span></Link>
    </section>

    <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
      <Card className="rounded-3xl border-0 shadow-sm ring-1 ring-slate-200/80"><CardContent className="p-6 sm:p-7"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">Why waterway health matters</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">Local signals, shared impact</h2><p className="mt-4 text-sm leading-6 text-slate-600">A polluted stream can harm aquatic life, affect recreation, and point to problems upstream. Repeated observations help surface changes that a single visit might miss.</p><p className="mt-3 text-sm leading-6 text-slate-600">StreamPulse combines community-collected measurements into a 0-100 score, plots changes over time, and drafts a plain-language summary. A person can review and edit the draft before saving or exporting it.</p></CardContent></Card>
      <Card className="rounded-3xl border-0 bg-gradient-to-br from-teal-950 to-slate-900 text-white shadow-sm"><CardContent className="p-6 sm:p-7"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-200">From observation to insight</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">A transparent workflow</h2><ol className="mt-5 space-y-4 text-sm">
        {["Record stream conditions and habitat observations.", "Calculate a consistent score and show its trend.", "Draft a One Health summary for human review.", "Export a FHIR R4 bundle for interoperable sharing."].map((step, i) => <li key={step} className="flex items-start gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/10 text-xs font-semibold text-teal-200">0{i + 1}</span><span className="pt-1 leading-5 text-slate-200">{step}</span></li>)}
      </ol></CardContent></Card>
    </section>

    <section><div className="mb-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">How the score is composed</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">Six field signals, one overview</h2><p className="mt-1 text-sm text-muted-foreground">The score supports comparison and discussion; it is not a substitute for laboratory testing.</p></div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{dimensions.map((dimension, i) => <Card key={dimension.title} className="rounded-2xl border-0 shadow-sm ring-1 ring-slate-200/80"><CardContent className="flex gap-4 p-5"><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-sm font-bold ${["bg-sky-50 text-sky-800", "bg-violet-50 text-violet-800", "bg-orange-50 text-orange-800", "bg-emerald-50 text-emerald-800", "bg-rose-50 text-rose-800", "bg-teal-50 text-teal-800"][i]}`}>{dimension.value}</span><div><h3 className="font-semibold">{dimension.title}</h3><p className="mt-1 text-sm leading-5 text-muted-foreground">{dimension.detail}</p></div></CardContent></Card>)}</div>
    </section>

    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-teal-100 bg-teal-50/70 px-5 py-4 text-sm"><span className="text-teal-950"><strong>Built for the OneAquaHealth IEEE Global Hackathon 2026</strong> · Track 2: Data-to-Insight</span><Link href="/resilience" className="font-semibold text-teal-800 underline">Explore research weather data</Link></div>
  </div>;
}
