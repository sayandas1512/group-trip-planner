"use client";
import { useState } from "react";
import { TripOption, Participant, Commitment } from "@/lib/types";
import { avatarColor, initials } from "@/lib/avatarColor";

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
  const [error, setError] = useState("");
  const [justLockedIn, setJustLockedIn] = useState<{ name: string; destination: string } | null>(null);

  async function handleCommit() {
    if (!selectedParticipant || !selectedOption) return;
    setLoading(true);
    setError("");
    setJustLockedIn(null);
    try {
      const res = await fetch(`/api/trips/${tripId}/commit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participant_id: selectedParticipant, option_id: selectedOption }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }
      const name = participants.find((p) => p.id === selectedParticipant)?.name ?? "You";
      const destination = options.find((o) => o.id === selectedOption)?.destination ?? "your pick";
      setJustLockedIn({ name, destination });
      setSelectedParticipant("");
      setSelectedOption("");
      onCommitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <h2 className="section-title">✅ Commitment tracker</h2>
      <ul className="commit-status-list">
        {participants.map((p) => {
          const c = commitments.find((c) => c.participant_id === p.id && c.committed);
          const opt = c ? options.find((o) => o.id === c.option_id) : null;
          return (
            <li key={p.id} className={c && opt ? "locked" : ""}>
              <span className="avatar" style={{ background: avatarColor(p.name), width: 26, height: 26, fontSize: 11 }}>
                {initials(p.name)}
              </span>
              {c && opt ? `${p.name} locked in on ${opt.destination} 🎉` : `${p.name}: not committed yet`}
            </li>
          );
        })}
      </ul>

      <div className="commit-form">
        <select
          value={selectedParticipant}
          onChange={(e) => {
            setSelectedParticipant(e.target.value);
            setJustLockedIn(null);
          }}
        >
          <option value="">Your name</option>
          {participants.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select
          value={selectedOption}
          onChange={(e) => {
            setSelectedOption(e.target.value);
            setJustLockedIn(null);
          }}
        >
          <option value="">Choose your option</option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>{o.destination}</option>
          ))}
        </select>
        <button disabled={loading} onClick={handleCommit}>
          {loading ? "Locking in..." : "Lock in my choice 🔒"}
        </button>
      </div>
      {justLockedIn && (
        <p className="success">
          ✅ {justLockedIn.name} is locked in on {justLockedIn.destination}! Pick the next person above if others still need to commit.
        </p>
      )}
      {error && <p className="error">{error}</p>}
    </section>
  );
}
