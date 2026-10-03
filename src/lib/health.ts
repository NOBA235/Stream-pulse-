// Stream Health Score (0-100): weighted mean of six indicator sub-scores.
export type Indicators = { waterClarity: number; pH: number; temperature: number;
  macroinvertebrateScore: number; pollutionSigns?: string | null; habitatScore: number };
export type Status = "good" | "moderate" | "poor";
const clamp = (n: number) => Math.max(0, Math.min(100, n));
export const parseSigns = (s?: string | null) => (s ?? "").split(",").map(x => x.trim()).filter(Boolean);

export const WEIGHTS = { clarity: 0.2, ph: 0.15, temp: 0.1, macro: 0.25, pollution: 0.15, habitat: 0.15 };

export function scoreObservation(o: Indicators): number {
  const ph = o.pH >= 6.5 && o.pH <= 8.5 ? 100 : clamp(100 - 25 * Math.min(Math.abs(o.pH - 6.5), Math.abs(o.pH - 8.5)));
  const temp = o.temperature <= 18 ? 100 : clamp(100 - ((o.temperature - 18) * 100) / 12); // cool water holds more oxygen
  const s = WEIGHTS.clarity * clamp(o.waterClarity) + WEIGHTS.ph * ph + WEIGHTS.temp * temp +
    WEIGHTS.macro * clamp(o.macroinvertebrateScore * 10) +
    WEIGHTS.pollution * clamp(100 - 25 * parseSigns(o.pollutionSigns).length) +
    WEIGHTS.habitat * clamp(o.habitatScore);
  return Math.round(s * 10) / 10;
}
export const statusOf = (s: number): Status => (s >= 70 ? "good" : s >= 40 ? "moderate" : "poor");

/** Compares the mean of the latest 3 scores with the 3 before them. Input: oldest -> newest. */
export function trendOf(scores: number[]): "improving" | "worsening" | "stable" {
  if (scores.length < 4) return "stable";
  const avg = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
  const d = avg(scores.slice(-3)) - avg(scores.slice(-6, -3));
  return d > 3 ? "improving" : d < -3 ? "worsening" : "stable";
}
