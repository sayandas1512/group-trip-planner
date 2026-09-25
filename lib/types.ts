export type DateRange = { start: string; end: string };

export interface Trip {
  id: string;
  name: string;
  created_by: string;
  deadline: string;
  budget_cap: number | null;
  status: "collecting" | "options_generated" | "decided";
  created_at: string;
}

export interface Participant {
  id: string;
  trip_id: string;
  name: string;
  submitted: boolean;
}

export interface Preference {
  id: string;
  trip_id: string;
  participant_id: string;
  budget_min: number | null;
  budget_max: number | null;
  date_ranges: DateRange[];
  destination_types: string[];
  dealbreakers: string[];
  submitted_at: string;
}

export interface TripOption {
  id: string;
  trip_id: string;
  destination: string;
  date_range: DateRange;
  est_cost_per_person: number | null;
  fit_scores: Record<string, number>;
  gemini_summary: string | null;
  rank: number;
  created_at: string;
}

export interface Commitment {
  id: string;
  trip_id: string;
  participant_id: string;
  option_id: string | null;
  committed: boolean;
  committed_at: string | null;
}
