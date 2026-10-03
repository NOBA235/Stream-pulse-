export default function About() {
  return <article className="max-w-2xl space-y-3"><h1 className="text-2xl font-bold">About One Health</h1>
    <p>One Health recognizes that the health of people, animals and ecosystems is linked. A polluted stream can expose children and pets to pathogens, harm fish and insects, and signal problems upstream.</p>
    <p>StreamPulse turns citizen-collected stream observations into a 0-100 Stream Health Score, maps it, and drafts a plain-language One Health summary with Gemini. A person reviews and edits that summary before it is saved or exported.</p>
    <p>Data exports as a FHIR R4 Bundle, so health and environmental systems can read it. Built for the OneAquaHealth IEEE Global Hackathon 2026, Track 2: Data-to-Insight.</p></article>;
}
