"use client";
import { useEffect, useState } from "react";
import PreferenceForm from "@/components/PreferenceForm";
import OptionsList from "@/components/OptionsList";
import CommitmentTracker from "@/components/CommitmentTracker";
import { Trip, Participant, TripOption, Commitment } from "@/lib/types";

export default function TripPage({ params }: { params: { id: string } }) {
  const tripId = params.id;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [options, setOptions] = useState<TripOption[]>([]);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState<string>("");
  const [generating, setGenerating] = useState(false);

  async function load() {
    const res = await fetch(`/api/trips/${tripId}`);
    const data = await res.json();
    if (res.ok) {
      setTrip(data.trip);
      setParticipants(data.participants ?? []);
      setOptions(data.options ?? []);
      setCommitments(data.commitments ?? []);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  async function handleGenerate() {
    setGenerating(true);
    await fetch(`/api/trips/${tripId}/generate-options`, { method: "POST" });
    await load();
    setGenerating(false);
  }

  if (!trip) return <main className="container">Loading...</main>;

  const allSubmitted = participants.length > 0 && participants.every((p) => p.submitted);

  return (
    <main className="container">
      <h1>{trip.name}</h1>
      <p className="subtitle">Coordinator: {trip.created_by} · Commit by {trip.deadline}</p>

      <section className="card">
        <h2>Who&apos;s submitted</h2>
        <ul>
          {participants.map((p) => (
            <li key={p.id}>{p.name}: {p.submitted ? "submitted" : "not yet"}</li>
          ))}
        </ul>
      </section>

      {options.length === 0 && (
        <>
          <section className="card">
            <h2>Submit your preferences</h2>
            <select value={selectedParticipant} onChange={(e) => setSelectedParticipant(e.target.value)}>
              <option value="">Select your name</option>
              {participants.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {selectedParticipant && (
              <PreferenceForm tripId={tripId} participantId={selectedParticipant} onSubmitted={load} />
            )}
          </section>

          <button disabled={!allSubmitted || generating} onClick={handleGenerate}>
            {generating ? "Generating options..." : allSubmitted ? "Generate ranked options" : "Waiting for everyone to submit"}
          </button>
        </>
      )}

      {options.length > 0 && (
        <>
          <OptionsList options={options} participants={participants} />
          <CommitmentTracker
            tripId={tripId}
            options={options}
            participants={participants}
            commitments={commitments}
            onCommitted={load}
          />
        </>
      )}
    </main>
  );
}
