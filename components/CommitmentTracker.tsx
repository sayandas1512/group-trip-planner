"use client";
import { useState } from "react";
import { TripOption, Participant, Commitment } from "@/lib/types";

export default function CommitmentTracker({
  tripId,
  options,
  participants,
  commitments,
  onCommitted,
}: {
  tripId: string;
  options: TripOption[];
  participants: Participant[];
  commitments: Commitment[];
  onCommitted: () => void;
}) {
  const [selectedParticipant, setSelectedParticipant] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCommit() {
    if (!selectedParticipant || !selectedOption) return;
    setLoading(true);
    await fetch(`/api/trips/${tripId}/commit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participant_id: selectedParticipant, option_id: selectedOption }),
    });
    setLoading(false);
    onCommitted();
  }

  return (
    <section className="card">
      <h2>Commitment tracker</h2>
      <ul>
        {participants.map((p) => {
          const c = commitments.find((c) => c.participant_id === p.id && c.committed);
          const opt = c ? options.find((o) => o.id === c.option_id) : null;
          return (
            <li key={p.id}>
              {p.name}: {c && opt ? `locked in on ${opt.destination}` : "not committed yet"}
            </li>
          );
        })}
      </ul>

      <div className="commit-form">
        <select value={selectedParticipant} onChange={(e) => setSelectedParticipant(e.target.value)}>
          <option value="">Your name</option>
          {participants.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)}>
          <option value="">Choose your option</option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>{o.destination}</option>
          ))}
        </select>
        <button disabled={loading} onClick={handleCommit}>
          {loading ? "Locking in..." : "Lock in my choice"}
        </button>
      </div>
    </section>
  );
}
