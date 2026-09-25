# Group Trip Planner

Solves group trip decision paralysis for a 5-person friend group: one link to
collect preferences, a deterministic matching engine that ranks 2-3 options,
Gemini that explains (never decides) each option, and a commitment tracker
that's separate from voting.

## Setup

1. Create a Supabase project. Run `supabase_schema.sql` in its SQL editor.
2. Get a Gemini API key from Google AI Studio.
3. Copy `.env.local.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`
4. `npm install && npm run dev`

## Deploy to Vercel

```
vercel login
vercel
# add the four env vars when prompted, or via the Vercel dashboard
vercel --prod
```

The GitHub repo is connected to the Vercel project, so pushes to `main` deploy
to production automatically; preview deployments are created for other
branches/PRs. Run `vercel --prod` manually only if you need to deploy without
pushing (e.g. re-deploying after changing env vars).

## How it works

- `lib/matching.ts` — deterministic scoring + ranking. No LLM call.
- `lib/gemini.ts` — explains the ranking it's given, cannot change it.
- `app/api/trips/*` — trip creation, preference submission, option
  generation, commitment.
- `app/trip/[id]/page.tsx` — the single hub page every participant visits.
