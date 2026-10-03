// Maps a stream + observations to a FHIR R4 Bundle (Location + one Observation per citizen observation).
type Obs = { id: string; timestamp: Date; waterClarity: number; pH: number; temperature: number;
  macroinvertebrateScore: number; pollutionSigns: string | null; habitatScore: number; notes: string | null; healthScore: number | null };
type Stream = { id: string; name: string; description: string | null; lat: number; lng: number };
const UCUM = "http://unitsofmeasure.org";
const num = (code: string, text: string, value: number, unit: string, ucum: string) =>
  ({ code: { text: `${text} (${code})` }, valueQuantity: { value, unit, system: UCUM, code: ucum } });

export function toFhirBundle(stream: Stream, observations: Obs[], summary?: string | null) {
  const loc = { resourceType: "Location", id: stream.id, name: stream.name, description: stream.description ?? undefined,
    position: { latitude: stream.lat, longitude: stream.lng } };
  const entries = observations.map(o => ({
    fullUrl: `urn:uuid:${o.id}`,
    resource: {
      resourceType: "Observation", id: o.id, status: "final",
      category: [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "survey" }] }],
      code: { text: "Citizen science stream health observation" },
      subject: { reference: `Location/${stream.id}`, display: stream.name },
      effectiveDateTime: o.timestamp.toISOString(),
      note: o.notes ? [{ text: o.notes }] : undefined,
      component: [
        num("clarity", "Water clarity", o.waterClarity, "%", "%"),
        { code: { coding: [{ system: "http://loinc.org", code: "11558-4", display: "pH of Blood" }], text: "Water pH" },
          valueQuantity: { value: o.pH, unit: "pH", system: UCUM, code: "[pH]" } },
        num("temp", "Water temperature", o.temperature, "degC", "Cel"),
        { code: { text: "Macroinvertebrate index (0-10)" }, valueInteger: o.macroinvertebrateScore },
        { code: { text: "Visible pollution signs" }, valueString: o.pollutionSigns || "none" },
        { code: { text: "Habitat score (0-100)" }, valueInteger: o.habitatScore },
        ...(o.healthScore != null ? [{ code: { text: "StreamPulse Health Score (0-100)" }, valueQuantity: { value: o.healthScore } }] : []),
      ],
    },
  }));
  const report = { fullUrl: `urn:uuid:summary-${stream.id}`, resource: { resourceType: "DiagnosticReport", id: `summary-${stream.id}`, status: "final",
    code: { text: "One Health insight summary (human-reviewed)" }, subject: { reference: `Location/${stream.id}` }, conclusion: summary } };
  return { resourceType: "Bundle", type: "collection", timestamp: new Date().toISOString(),
    entry: [{ fullUrl: `urn:uuid:${stream.id}`, resource: loc }, ...entries, ...(summary ? [report] : [])] };
}
