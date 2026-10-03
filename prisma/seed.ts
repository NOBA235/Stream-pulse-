import { PrismaClient } from "@prisma/client";
import { scoreObservation } from "../src/lib/health";
const db = new PrismaClient();
const rng = (a: number) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
// q = starting quality (0-1), drift = change per observation
const STREAMS = [
  { name: "Mill Creek", lat: 40.452, lng: -79.94, q: 0.85, drift: -0.005, description: "Forested headwaters, popular with hikers." },
  { name: "Harbor Run", lat: 40.431, lng: -79.98, q: 0.3, drift: 0.02, description: "Urban channel recovering after a cleanup program." },
  { name: "Cedar Brook", lat: 40.47, lng: -80.02, q: 0.6, drift: 0, description: "Residential stream with moderate runoff." },
  { name: "Quarry Creek", lat: 40.41, lng: -79.9, q: 0.65, drift: -0.03, description: "Downstream of a construction site." },
  { name: "Willow Fork", lat: 40.49, lng: -79.96, q: 0.45, drift: 0.01, description: "Farmland edge, seasonal algae blooms." },
];
const SIGNS = ["trash", "odor", "algae", "oil sheen", "foam"];
async function main() {
  const reset = process.argv.includes("--reset");
  const existingStreams = await db.stream.count();
  if (existingStreams > 0 && !reset) {
    console.log(`Found ${existingStreams} existing streams; skipping demo seed. Use npm run seed:reset only when you intend to replace all stream data.`);
    return;
  }
  if (reset) { await db.observation.deleteMany(); await db.stream.deleteMany(); }
  const rand = rng(42), N = 14, now = Date.now(), span = 180 * 864e5;
  for (const s of STREAMS) {
    const stream = await db.stream.create({ data: { name: s.name, description: s.description, lat: s.lat, lng: s.lng } });
    for (let i = 0; i < N; i++) {
      const q = Math.max(0.05, Math.min(0.98, s.q + s.drift * i + (rand() - 0.5) * 0.12));
      const o = { waterClarity: Math.round(q * 100 + (rand() - 0.5) * 10), pH: +(7.6 - (1 - q) * 1.9 + (rand() - 0.5) * 0.4).toFixed(1),
        temperature: +(12 + (1 - q) * 11 + (rand() - 0.5) * 2).toFixed(1), macroinvertebrateScore: Math.round(q * 10),
        habitatScore: Math.round(q * 100), pollutionSigns: SIGNS.slice(0, Math.round((1 - q) * 4)).join(",") || null };
      await db.observation.create({ data: { streamId: stream.id, ...o,
        timestamp: new Date(now - span + (span * i) / (N - 1)), notes: q < 0.4 ? "Murky water, strong smell near outfall." : null,
        healthScore: scoreObservation(o) } });
    }
  }
  console.log(`Seeded ${STREAMS.length} streams, ${STREAMS.length * N} observations.`);
}
main().finally(() => db.$disconnect());
