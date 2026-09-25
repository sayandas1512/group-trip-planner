import { DateRange, Preference } from "./types";
import { CANDIDATE_DESTINATIONS, CandidateDestination } from "./destinations";

// Finds the date window covered by the most participants, using a sweep line
// over each person's submitted date ranges. This is what "date fit" means for
// every candidate option below -- it's computed once, not per destination.
export function findBestDateWindow(preferences: Preference[]): { range: DateRange; coverage: number } {
  type Event = { time: number; delta: number };
  const events: Event[] = [];

  for (const pref of preferences) {
    for (const r of pref.date_ranges) {
      events.push({ time: new Date(r.start).getTime(), delta: 1 });
      events.push({ time: new Date(r.end).getTime(), delta: -1 });
    }
  }

  if (events.length === 0) {
    const today = new Date().toISOString().slice(0, 10);
    return { range: { start: today, end: today }, coverage: 0 };
  }

  events.sort((a, b) => a.time - b.time);

  let running = 0;
  let best = 0;
  let bestStart = events[0].time;
  let bestEnd = events[0].time;
  let windowStart = events[0].time;

  for (const e of events) {
    if (e.delta > 0 && running === 0) windowStart = e.time;
    running += e.delta;
    if (running > best) {
      best = running;
      bestStart = windowStart;
      bestEnd = e.time;
    }
  }

  return {
    range: {
      start: new Date(bestStart).toISOString().slice(0, 10),
      end: new Date(bestEnd).toISOString().slice(0, 10),
    },
    coverage: best,
  };
}

function violatesDealbreaker(dest: CandidateDestination, dealbreakers: string[]): boolean {
  const lowerTags = dest.tags.map((t) => t.toLowerCase());
  return dealbreakers.some((db) => {
    const clean = db.toLowerCase().replace("no ", "").trim();
    if (!clean) return false;
    return lowerTags.some((tag) => clean.includes(tag) || tag.includes(clean));
  });
}

function budgetFit(dest: CandidateDestination, budgetMin: number | null, budgetMax: number | null, days: number): number {
  const estTotal = dest.costPerDay * days;
  if (budgetMax == null) return 0.7; // no stated ceiling, assume roughly OK
  if (estTotal <= budgetMax && (budgetMin == null || estTotal >= budgetMin * 0.5)) return 1;
  if (estTotal <= budgetMax * 1.2) return 0.5;
  return 0;
}

function typeFit(dest: CandidateDestination, wanted: string[]): number {
  if (wanted.length === 0) return 0.6;
  const overlap = dest.types.filter((t) => wanted.includes(t)).length;
  return Math.min(1, overlap / Math.max(1, wanted.length));
}

export interface ScoredOption {
  destination: string;
  dateRange: DateRange;
  estCostPerPerson: number;
  fitScores: Record<string, number>; // keyed by participant_id
  minFit: number;
}

// The ranking engine. Deliberately NOT an LLM call -- deterministic, auditable,
// and it's the thing Gemini is only ever allowed to explain, never rewrite.
export function generateRankedOptions(preferences: Preference[], days = 3): ScoredOption[] {
  const { range } = findBestDateWindow(preferences);
  const results: ScoredOption[] = [];

  for (const dest of CANDIDATE_DESTINATIONS) {
    const excluded = preferences.some((p) => violatesDealbreaker(dest, p.dealbreakers));
    if (excluded) continue;

    const fitScores: Record<string, number> = {};
    for (const p of preferences) {
      const bFit = budgetFit(dest, p.budget_min, p.budget_max, days);
      const tFit = typeFit(dest, p.destination_types);
      fitScores[p.participant_id] = Math.round((0.5 * bFit + 0.5 * tFit) * 100) / 100;
    }

    // Rank by the group's WEAKEST fit, not the average -- an option can't win
    // by delighting three people and ignoring the other two.
    const minFit = Math.min(...Object.values(fitScores));
    results.push({
      destination: dest.name,
      dateRange: range,
      estCostPerPerson: dest.costPerDay * days,
      fitScores,
      minFit,
    });
  }

  return results.sort((a, b) => b.minFit - a.minFit).slice(0, 3);
}
