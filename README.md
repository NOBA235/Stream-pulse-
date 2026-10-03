# StreamPulse
Citizen stream observations -> Stream Health Score -> map, trends, Gemini One Health summaries, FHIR export.
**OneAquaHealth IEEE Global Hackathon 2026 - Track 2: Data-to-Insight.**

## Track alignment
Turns citizen-collected data into actionable stream health and One Health insights, with a human-in-the-loop edit step and standards-based (FHIR R4) export.

## Stack
Next.js 14 (App Router, TypeScript), Tailwind CSS + shadcn/ui (`components.json` included; add more with `npx shadcn@latest add <name>`), Leaflet/react-leaflet, Recharts, Prisma + Supabase Postgres, Gemini API (`gemini-3.5-flash`), FHIR R4 JSON.

## Setup
```
npm install
cp .env.example .env     # set the Supabase URLs below
npx prisma generate
npm run seed             # creates schema and demo data only if the database has no streams
npm run dev              # http://localhost:3000
```
Before running the app, copy `.env.example` to `.env` and set `DATABASE_URL` to your Supabase **Transaction pooler** connection string (port `6543`, with `pgbouncer=true`) and `DIRECT_URL` to the Supabase direct connection string. If your local network cannot reach the direct connection, use Supabase's session pooler connection on port `5432` for `DIRECT_URL`. Keep both values private and set them as server-side environment variables in Vercel. Without `GEMINI_API_KEY`, summaries use a deterministic fallback.

`npm run db:push` applies the Prisma schema. `npm run seed` adds the five-stream, 70-observation demo dataset only when the database is empty. `npm run seed:reset` deletes all existing streams and observations before recreating the demo dataset; use it only when you intend to replace that data.

The **Research resilience** page reads research sites and weather observations from the OneAquaHealth API over HTTPS. It is read-only, has no effect on StreamPulse scores, and reports a temporary data error if the upstream service is unavailable. `ENORA_API_BASE_URL` can point to another HTTPS API origin; HTTP URLs are rejected.

After starting StreamPulse, open `/resilience`, select a OneAquaHealth research site, and choose a date range to view daily weather. For the full indicator set, open the [OneAquaHealth Resilience Map](https://apps.oneaquahealth.eu/resmap/). To submit citizen observations, first join the [OneAquaHealth Community](https://www.oneaquahealth.eu/community/), then use the [Citizen Science App](https://apps.oneaquahealth.eu/login).

## Architecture
```
Seed / POST /api/observations -> health.ts score -> Prisma (Supabase Postgres)
  GET /api/streams[/id] -> Dashboard (Leaflet) + Detail (Recharts)
  POST /api/ai-summary -> Gemini (or fallback) -> editable text
  GET /api/fhir/export?streamId= -> FHIR Bundle (Location + Observations + DiagnosticReport)
  GET /api/enora/sites + /api/enora/weather -> HTTPS OneAquaHealth read-only proxy -> Research resilience page
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
