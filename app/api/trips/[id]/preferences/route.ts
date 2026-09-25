import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const tripId = params.id;
  const body = await req.json();
  const { participant_id, budget_min, budget_max, date_ranges, destination_types, dealbreakers } = body;

  if (!participant_id) {
    return NextResponse.json({ error: "participant_id is required" }, { status: 400 });
  }

  const supabase = supabaseServer();

  const { data: participant } = await supabase
    .from("participants")
    .select("submitted")
    .eq("id", participant_id)
    .single();

  if (participant?.submitted) {
    return NextResponse.json(
      { error: "Preferences are already submitted for this participant and can't be changed." },
      { status: 409 }
    );
  }

  const { error: prefError } = await supabase.from("preferences").upsert(
    {
      trip_id: tripId,
      participant_id,
      budget_min: budget_min ?? null,
      budget_max: budget_max ?? null,
      date_ranges: date_ranges ?? [],
      destination_types: destination_types ?? [],
      dealbreakers: dealbreakers ?? [],
    },
    { onConflict: "participant_id" }
  );

  if (prefError) return NextResponse.json({ error: prefError.message }, { status: 500 });

  await supabase.from("participants").update({ submitted: true }).eq("id", participant_id);

  return NextResponse.json({ ok: true });
}
