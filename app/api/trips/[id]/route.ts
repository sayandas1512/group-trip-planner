import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = supabaseServer();
  const tripId = params.id;

  const [{ data: trip }, { data: participants }, { data: options }, { data: commitments }, { data: preferences }] =
    await Promise.all([
      supabase.from("trips").select("*").eq("id", tripId).single(),
      supabase.from("participants").select("*").eq("trip_id", tripId),
      supabase.from("options").select("*").eq("trip_id", tripId).order("rank"),
      supabase.from("commitments").select("*").eq("trip_id", tripId),
      supabase.from("preferences").select("*").eq("trip_id", tripId),
    ]);

  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

  return NextResponse.json({ trip, participants, options, commitments, preferences });
}
