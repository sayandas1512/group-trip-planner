"use client";
import { useState, FormEvent } from "react";

const DESTINATION_TYPES = ["beach", "mountain", "heritage", "nature", "city", "wellness", "nightlife", "adventure"];

export default function PreferenceForm({
  tripId,
  participantId,
  onSubmitted,
}: {
  tripId: string;
  participantId: string;
  onSubmitted: () => void;
}) {
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [types, setTypes] = useState<string[]>([]);
  const [dealbreakers, setDealbreakers] = useState("");
  const [loading, setLoading] = useState(false);

  function toggleType(t: string) {
    setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch(`/api/trips/${tripId}/preferences`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participant_id: participantId,
        budget_min: budgetMin ? Number(budgetMin) : null,
        budget_max: budgetMax ? Number(budgetMax) : null,
        date_ranges: start && end ? [{ start, end }] : [],
        destination_types: types,
        dealbreakers: dealbreakers.split(",").map((d) => d.trim()).filter(Boolean),
      }),
    });
    setLoading(false);
    onSubmitted();
  }

  return (
    <form onSubmit={handleSubmit} className="pref-form">
      <label>
        Budget range per person
        <div className="row">
          <input type="number" placeholder="Min" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} />
          <input type="number" placeholder="Max" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} />
        </div>
      </label>
      <label>
        Available dates
        <div className="row">
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
      </label>
      <fieldset>
        <legend>Destination types you&apos;d want</legend>
        {DESTINATION_TYPES.map((t) => (
          <label key={t} className="checkbox">
            <input type="checkbox" checked={types.includes(t)} onChange={() => toggleType(t)} />
            {t}
          </label>
        ))}
      </fieldset>
      <label>
        Dealbreakers (comma-separated, e.g. &quot;no camping, no red-eye flights&quot;)
        <input value={dealbreakers} onChange={(e) => setDealbreakers(e.target.value)} />
      </label>
      <button disabled={loading} type="submit">
        {loading ? "Submitting..." : "Submit my preferences"}
      </button>
    </form>
  );
}
