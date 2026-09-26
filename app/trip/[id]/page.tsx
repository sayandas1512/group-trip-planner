"use client";
import { useEffect, useState } from "react";
import PreferenceForm from "@/components/PreferenceForm";
import OptionsList from "@/components/OptionsList";
import CommitmentTracker from "@/components/CommitmentTracker";
import ShareLink from "@/components/ShareLink";
import FinalVerdict from "@/components/FinalVerdict";
import { Trip, Participant, TripOption, Commitment, Preference } from "@/lib/types";
import { avatarColor, initials } from "@/lib/avatarColor";

export default function TripPage({ params }: { params: { id: string } }) {
  const tripId = params.id;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [options, setOptions] = useState<TripOption[]>([]);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");

  async function load() {
    const res = await fetch(`/api/trips/${tripId}`);
    const data = await res.json();
    if (res.ok) {
      setTrip(data.trip);
      setParticipants(data.participants ?? []);
      setOptions(data.options ?? []);
      setCommitments(data.commitments ?? []);
      setPreferences(data.preferences ?? []);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  async function handleGenerate() {
    setGenerating(true);
    setGenerateError("");
    try {
      const res = await fetch(`/api/trips/${tripId}/generate-options`, { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }
      await load();
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  if (!trip) {
    return (
      <main className="container" style={{ paddingTop: 60 }}>
        Loading...
      </main>
    );
  }

  const allSubmitted = participants.length > 0 && participants.every((p) => p.submitted);

  return (
    <main>
      <div
        className="hero trip-hero"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(255,90,95,0.9), rgba(0,166,153,0.85))",
        }}
      >
        <div className="hero-inner">
          <span className="hero-eyebrow">🧳 {trip.name}</span>
          <h1>{trip.name}</h1>
          <p className="subtitle" style={{ color: "rgba(255,255,255,0.92)" }}>
            Coordinated by {trip.created_by} · Commit by {trip.deadline.slice(0, 10)}
          </p>
        </div>
      </div>

      <div className="container">
        <ShareLink tripId={tripId} />

        <section className="card">
          <h2 className="section-title">👥 Who&apos;s submitted</h2>
          <ul className="avatar-list">
            {participants.map((p) => (
              <li key={p.id} className={`avatar-row ${p.submitted ? "submitted" : ""}`}>
                <span className="avatar" style={{ background: avatarColor(p.name) }}>
                  {initials(p.name)}
                </span>
                <span>
                  <span className="avatar-name">{p.name}</span>
                  <br />
                  <span className="avatar-status">{p.submitted ? "Submitted ✓" : "Waiting..."}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        {options.length === 0 && (
          <>
            <section className="card">
              <h2 className="section-title">📝 Submit your preferences</h2>
              <select value={selectedParticipant} onChange={(e) => setSelectedParticipant(e.target.value)}>
                <option value="">Select your name</option>
                {participants.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {selectedParticipant && (
                <PreferenceForm
                  key={selectedParticipant}
                  tripId={tripId}
                  participantId={selectedParticipant}
                  alreadySubmitted={participants.find((p) => p.id === selectedParticipant)?.submitted}
                  onSubmitted={load}
                />
              )}
            </section>

            <button disabled={!allSubmitted || generating} onClick={handleGenerate}>
              {generating ? "Generating options..." : allSubmitted ? "Generate ranked options 🏆" : "Waiting for everyone to submit"}
            </button>
            {generateError && <p className="error">{generateError}</p>}
          </>
        )}

        {options.length > 0 && (
          <>
            <FinalVerdict options={options} participants={participants} commitments={commitments} />
            <OptionsList options={options} participants={participants} preferences={preferences} />
            <CommitmentTracker
              tripId={tripId}
              options={options}
              participants={participants}
              commitments={commitments}
              onCommitted={load}
            />
          </>
        )}
      </div>
    </main>
  );
}
