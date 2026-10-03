export type Status = "good" | "moderate" | "poor";
export type S = { id: string; name: string; description: string | null; lat: number; lng: number;
  latestScore: number | null; averageScore: number | null; status: Status | null; trend: string; observationCount: number };
export const COLORS: Record<Status, string> = { good: "#15803d", moderate: "#b45309", poor: "#b91c1c" };
export const SCORE_HELP = "Stream Health Score (0-100) blends water clarity, pH, temperature, macroinvertebrate diversity, visible pollution and habitat quality. 70+ is good, 40-69 moderate, below 40 poor.";
