const DEFAULT_BASE_URL = "https://api.enora-oah.eu";

export function enoraUrl(path: string) {
  const base = process.env.ENORA_API_BASE_URL || DEFAULT_BASE_URL;
  const url = new URL(base);
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) {
    throw new Error("ENORA_API_BASE_URL must be an HTTPS origin without credentials or query parameters.");
  }
  url.pathname = `${url.pathname.replace(/\/$/, "")}${path}`;
  return url;
}

export async function enoraGet(path: string, query?: Record<string, string>) {
  const url = enoraUrl(path);
  for (const [key, value] of Object.entries(query ?? {})) url.searchParams.set(key, value);
  const response = await fetch(url, { headers: { Accept: "application/json" }, redirect: "error", signal: AbortSignal.timeout(8000), next: { revalidate: 300 } });
  if (!response.ok) throw new Error(`Environmental data service returned ${response.status}.`);
  return response.json() as Promise<unknown>;
}

export type ResearchSite = { code: string; name: string; city: { id: string; name: string }; latitude: number; longitude: number };
export type WeatherObservation = {
  siteCode: string; date: string; t2mMeanC?: number; t2mMinC?: number; t2mMaxC?: number;
  precipTotalMm?: number; rh2mMeanPct?: number; windMeanMs?: number;
};

export function isResearchSite(value: unknown): value is ResearchSite {
  if (!value || typeof value !== "object") return false;
  const site = value as Record<string, unknown>;
  const city = site.city as Record<string, unknown> | null;
  return typeof site.code === "string" && typeof site.name === "string" &&
    typeof site.latitude === "number" && typeof site.longitude === "number" &&
    !!city && typeof city.id === "string" && typeof city.name === "string";
}

export function isWeatherObservation(value: unknown): value is WeatherObservation {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return typeof row.siteCode === "string" && typeof row.date === "string" && Number.isFinite(Date.parse(row.date));
}
