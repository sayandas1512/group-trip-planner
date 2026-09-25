import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, created_by, deadline, budget_cap, participant_names } = body;

  if (!name || !created_by || !deadline || !Array.isArray(participant_names) || participant_names.length < 2) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = supabaseServer();

  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .insert({ name, created_by, deadline, budget_cap: budget_cap ?? null })
    .select()
    .single();

  if (tripError) return NextResponse.json({ error: tripError.message }, { status: 500 });

  const { error: partError } = await supabase
    .from("participants")
    .insert(participant_names.map((n: string) => ({ trip_id: trip.id, name: n })));

  if (partError) return NextResponse.json({ error: partError.message }, { status: 500 });

  return NextResponse.json({ trip });
}
