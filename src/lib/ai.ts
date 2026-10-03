import { parseSigns } from "./health";
export type SummaryInput = { name: string; score: number; status: string; trend: string;
  latest: { pH: number; temperature: number; waterClarity: number; macroinvertebrateScore: number; habitatScore: number; pollutionSigns: string | null } };

function fallback(i: SummaryInput): string {
  const s = parseSigns(i.latest.pollutionSigns), l = i.latest;
  const issues = [s.length ? `visible pollution (${s.join(", ")})` : "", l.macroinvertebrateScore <= 4 ? "low macroinvertebrate diversity" : "",
    l.temperature > 22 ? "warm water" : "", l.pH < 6.5 || l.pH > 8.5 ? "out-of-range pH" : ""].filter(Boolean);
  const risk = i.status === "poor" ? "This may increase human exposure to waterborne pathogens and reduce local biodiversity."
    : i.status === "moderate" ? "Some risk to sensitive wildlife; contact with the water may carry mild health risk after rain."
    : "Low current risk to people and animals.";
  const act = i.status === "good" ? "Keep monitoring monthly and protect the riparian buffer."
    : "Investigate upstream runoff, increase sampling frequency, and organize a community cleanup.";
  return `${i.name} is ${i.status} (score ${i.score}/100, ${i.trend})${issues.length ? ` due to ${issues.join(", ")}` : ""}. ${risk} Recommended action: ${act}`;
}

export async function generateSummary(i: SummaryInput): Promise<{ summary: string; source: "gemini" | "fallback" }> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { summary: fallback(i), source: "fallback" };
  try {
    const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: "You are a One Health analyst. In under 90 words of plain language, cover: 1) current status, 2) potential risks to human and animal health, 3) recommended actions. Do not invent data." }] },
        contents: [{ role: "user", parts: [{ text: JSON.stringify(i) }] }] }),
    });
    if (!r.ok) throw new Error(String(r.status));
    const j = await r.json();
    const text = (j.candidates?.[0]?.content?.parts ?? []).filter((p: any) => p.text && !p.thought).map((p: any) => p.text).join("").trim();
    if (!text) throw new Error("empty");
    return { summary: text, source: "gemini" };
  } catch { return { summary: fallback(i), source: "fallback" }; }
}
