import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { generateRankedOptions } from "@/lib/matching";
import { summarizeOption } from "@/lib/gemini";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const tripId = params.id;
  const supabase = supabaseServer();

  const [{ data: preferences }, { data: participants }] = await Promise.all([
    supabase.from("preferences").select("*").eq("trip_id", tripId),
    supabase.from("participants").select("*").eq("trip_id", tripId),
  ]);

  if (!preferences || preferences.length === 0) {
    return NextResponse.json({ error: "No preferences submitted yet" }, { status: 400 });
  }

  const ranked = generateRankedOptions(preferences);

  const rows = await Promise.all(
    ranked.map(async (opt, i) => ({
      trip_id: tripId,
      destination: opt.destination,
      date_range: opt.dateRange,
      est_cost_per_person: opt.estCostPerPerson,
      fit_scores: opt.fitScores,
      gemini_summary: await summarizeOption(opt, participants ?? []),
      rank: i + 1,
    }))
  );

  const { error: delErr } = await supabase.from("options").delete().eq("trip_id", tripId);
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

  const { error: insErr } = await supabase.from("options").insert(rows);
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

  await supabase.from("trips").update({ status: "options_generated" }).eq("id", tripId);

  return NextResponse.json({ ok: true, count: rows.length });
}
