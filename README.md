# StreamPulse
Citizen stream observations -> Stream Health Score -> map, trends, Gemini One Health summaries, FHIR export.
**OneAquaHealth IEEE Global Hackathon 2026 - Track 2: Data-to-Insight.**

## Track alignment
Turns citizen-collected data into actionable stream health and One Health insights, with a human-in-the-loop edit step and standards-based (FHIR R4) export.

## Stack
Next.js 14 (App Router, TypeScript), Tailwind CSS + shadcn/ui (`components.json` included; add more with `npx shadcn@latest add <name>`), Leaflet/react-leaflet, Recharts, Prisma + SQLite, Gemini API (`gemini-3.5-flash`), FHIR R4 JSON.

## Setup
```
npm install
cp .env.example .env     # add GEMINI_API_KEY (optional)
npm run seed             # 5 streams, 70 observations over 6 months
npm run dev              # http://localhost:3000
```
Without `GEMINI_API_KEY`, summaries use a deterministic fallback. Deploy on Vercel with Postgres by changing the Prisma provider and `DATABASE_URL`.

## Architecture
```
Seed / POST /api/observations -> health.ts score -> Prisma (SQLite)
  GET /api/streams[/id] -> Dashboard (Leaflet) + Detail (Recharts)
  POST /api/ai-summary -> Gemini (or fallback) -> editable text
  GET /api/fhir/export?streamId= -> FHIR Bundle (Location + Observations + DiagnosticReport)
```
Score = clarity 20% + pH 15% + temperature 10% + macroinvertebrates 25% + pollution signs 15% + habitat 15%.

## Screenshots
Add `docs/dashboard.png` and `docs/detail.png` after running locally.

## Demo video script (3-5 min)
1. 0:00 Problem: citizen data is rich but hard to act on.
2. 0:30 Dashboard: colored map, filters, summary cards.
3. 1:15 Open Harbor Run (improving) and Quarry Creek (worsening); show the chart and score tooltip.
4. 2:15 Generate the Gemini summary, edit it, save it.
5. 3:00 Download the FHIR bundle and show the Location and Observation resources.
6. 3:45 Impact and scale: FHIR interoperability with health and environmental systems.
