"use client";
import { useState, FormEvent } from "react";
import { DESTINATION_TYPE_ICONS } from "@/lib/destinationImages";

const DESTINATION_TYPES = ["beach", "mountain", "heritage", "nature", "city", "wellness", "nightlife", "adventure"];

export default function PreferenceForm({
  tripId,
  participantId,
  alreadySubmitted,
  onSubmitted,
}: {
  tripId: string;
  participantId: string;
  alreadySubmitted?: boolean;
  onSubmitted: () => void;
}) {
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [types, setTypes] = useState<string[]>([]);
  const [dealbreakers, setDealbreakers] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [justSubmitted, setJustSubmitted] = useState(!!alreadySubmitted);

  function toggleType(t: string) {
    setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/trips/${tripId}/preferences`, {
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
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }
      setJustSubmitted(true);
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (justSubmitted) {
    return (
      <div className="submitted-confirm">
        <div className="submitted-confirm-icon">🔒</div>
        <h3>You&apos;re in!</h3>
        <p>
          Your preferences are saved and locked in — this can&apos;t be changed once submitted, so everyone&apos;s
          answers stay exactly as they entered them. Sit tight while the rest of the group submits theirs.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="pref-form">
      <label>
        <span className="field-icon">💰</span>Budget range per person
        <div className="row">
          <input type="number" placeholder="Min" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} />
          <input type="number" placeholder="Max" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} />
        </div>
      </label>
      <label>
        <span className="field-icon">📅</span>Available dates
        <div className="row">
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
      </label>
      <fieldset>
        <legend>🌴 Destination types you&apos;d want</legend>
        <div className="chip-grid">
          {DESTINATION_TYPES.map((t) => (
            <label key={t} className={`chip ${types.includes(t) ? "selected" : ""}`}>
              <input type="checkbox" checked={types.includes(t)} onChange={() => toggleType(t)} />
              <span>{DESTINATION_TYPE_ICONS[t]}</span> {t}
            </label>
          ))}
        </div>
      </fieldset>
      <label>
        <span className="field-icon">🚫</span>Dealbreakers (comma-separated, e.g. &quot;no camping, no red-eye flights&quot;)
        <input value={dealbreakers} onChange={(e) => setDealbreakers(e.target.value)} />
      </label>
      {error && <p className="error">{error}</p>}
      <button disabled={loading} type="submit">
        {loading ? "Submitting..." : "Submit my preferences"}
      </button>
    </form>
  );
}
