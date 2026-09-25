"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [deadline, setDeadline] = useState("");
  const [budgetCap, setBudgetCap] = useState("");
  const [names, setNames] = useState(["", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const participant_names = names.map((n) => n.trim()).filter(Boolean);
    const res = await fetch("/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        created_by: createdBy,
        deadline,
        budget_cap: budgetCap ? Number(budgetCap) : null,
        participant_names,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    router.push(`/trip/${data.trip.id}`);
  }

  return (
    <main className="container">
      <h1>Plan a trip your group actually books</h1>
      <p className="subtitle">
        One link for everyone. Ranked options with per-person fit. A commitment tracker so
        &quot;we voted&quot; turns into &quot;we&apos;re going.&quot;
      </p>
      <form onSubmit={handleSubmit} className="card">
        <label>
          Trip name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Your name (coordinator)
          <input value={createdBy} onChange={(e) => setCreatedBy(e.target.value)} required />
        </label>
        <label>
          Commitment deadline
          <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
        </label>
        <label>
          Overall budget cap per person (optional)
          <input type="number" value={budgetCap} onChange={(e) => setBudgetCap(e.target.value)} />
        </label>
        <fieldset>
          <legend>Participant names</legend>
          {names.map((n, i) => (
            <input
              key={i}
              value={n}
              placeholder={`Friend ${i + 1}`}
              onChange={(e) => {
                const next = [...names];
                next[i] = e.target.value;
                setNames(next);
              }}
            />
          ))}
        </fieldset>
        {error && <p className="error">{error}</p>}
        <button disabled={loading} type="submit">
          {loading ? "Creating..." : "Create trip & get the link"}
        </button>
      </form>
    </main>
  );
}
