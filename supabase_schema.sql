-- Trips: one row per group trip being planned
create table trips (
  id uuid primary key default gen_random_uuid(),
  name text not null,                     -- e.g. "College Friends Trip"
  created_by text not null,               -- Riya's name
  deadline timestamptz not null,          -- commitment deadline
  budget_cap numeric,                     -- optional overall guardrail
  status text not null default 'collecting'
    check (status in ('collecting','options_generated','decided')),
  created_at timestamptz not null default now()
);

-- Participants: the 5 friends, seeded by Riya when she creates the trip
create table participants (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  name text not null,
  submitted boolean not null default false
);

-- Preferences: one row per participant, submitted via their form
create table preferences (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  participant_id uuid not null references participants(id) on delete cascade,
  budget_min numeric,
  budget_max numeric,
  date_ranges jsonb not null default '[]',        -- [{ "start": "2026-11-01", "end": "2026-11-05" }]
  destination_types text[] not null default '{}', -- e.g. {beach, mountain}
  dealbreakers text[] not null default '{}',       -- e.g. {"no camping", "no red-eye flights"}
  submitted_at timestamptz not null default now(),
  unique (participant_id)
);

-- Options: the ranked candidates generated after all preferences are in
create table options (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  destination text not null,
  date_range jsonb not null,
  est_cost_per_person numeric,
  fit_scores jsonb not null default '{}',   -- { "<participant_id>": 0.0-1.0 }
  gemini_summary text,                       -- Gemini's plain-English explanation only
  rank int not null,
  created_at timestamptz not null default now()
);

-- Commitments: who has locked in on which option (separate from preferences)
create table commitments (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  participant_id uuid not null references participants(id) on delete cascade,
  option_id uuid references options(id),
  committed boolean not null default false,
  committed_at timestamptz,
  unique (participant_id)
);
