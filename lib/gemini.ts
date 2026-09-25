import { ScoredOption } from "./matching";
import { Participant } from "./types";

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent";

// This is the whole guardrail from Check 07 ("judgment protected"), written
// into the prompt itself: Gemini explains a ranking it did not produce and
// cannot change.
const SYSTEM_INSTRUCTION = `You are a neutral summarizer for a group trip planning tool.
You will be given one already-ranked trip option and a fit score (0 to 1) for each
participant, plus that participant's stated preferences. Write 3 to 4 plain-English
sentences explaining why this option does or doesn't fit the group, referencing specific
people where useful. Do NOT change the ranking, do NOT compare this option to others,
do NOT declare a winner, and do NOT make the decision for the group. Only explain the
scores you are given.`;

export async function summarizeOption(option: ScoredOption, participants: Participant[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return "Gemini summary unavailable (missing GEMINI_API_KEY).";

  const scoreLines = participants
    .map((p) => `${p.name}: fit ${option.fitScores[p.id] ?? "n/a"}`)
    .join("\n");

  const prompt = `Option: ${option.destination}
Dates: ${option.dateRange.start} to ${option.dateRange.end}
Estimated cost per person: ${option.estCostPerPerson}
Fit scores:
${scoreLines}`;

  try {
    const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
    });

    if (!res.ok) return `Gemini summary unavailable (${res.status}).`;

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ?? "Gemini summary unavailable.";
  } catch {
    return "Gemini summary unavailable (network error).";
  }
}
