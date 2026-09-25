import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const tripId = params.id;
  const body = await req.json();
  const { participant_id, option_id } = body;

  if (!participant_id || !option_id) {
    return NextResponse.json({ error: "participant_id and option_id are required" }, { status: 400 });
  }

  const supabase = supabaseServer();

  const { error } = await supabase.from("commitments").upsert(
    {
      trip_id: tripId,
      participant_id,
      option_id,
      committed: true,
      committed_at: new Date().toISOString(),
    },
    { onConflict: "participant_id" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
