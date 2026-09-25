"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { HERO_IMAGE_URL } from "@/lib/destinationImages";

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
    try {
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
      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong");
      }
      router.push(`/trip/${data.trip.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <div className="hero" style={{ backgroundImage: `url(${HERO_IMAGE_URL})` }}>
        <div className="hero-inner">
          <span className="hero-eyebrow">✈️ Group trips, sorted</span>
          <h1>Plan a trip your group actually books</h1>
          <p className="subtitle" style={{ color: "rgba(255,255,255,0.92)" }}>
            One link for everyone. Ranked options with per-person fit. A commitment tracker so
            &quot;we voted&quot; turns into &quot;we&apos;re going.&quot;
          </p>
        </div>
      </div>

      <div className="container">
        <form onSubmit={handleSubmit} className="card floating">
          <label>
            <span className="field-icon">🧳</span>Trip name
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Goa squad 2026" required />
          </label>
          <label>
            <span className="field-icon">👤</span>Your name (coordinator)
            <input value={createdBy} onChange={(e) => setCreatedBy(e.target.value)} placeholder="You" required />
          </label>
          <div className="row">
            <label>
              <span className="field-icon">📅</span>Commitment deadline
              <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
            </label>
            <label>
              <span className="field-icon">💰</span>Budget cap / person (optional)
              <input type="number" value={budgetCap} onChange={(e) => setBudgetCap(e.target.value)} placeholder="e.g. 8000" />
            </label>
          </div>
          <fieldset>
            <legend>👥 Participant names</legend>
            <div className="row" style={{ flexWrap: "wrap" }}>
              {names.map((n, i) => (
                <input
                  key={i}
                  style={{ flex: "1 1 30%", minWidth: 120 }}
                  value={n}
                  placeholder={`Friend ${i + 1}`}
                  onChange={(e) => {
                    const next = [...names];
                    next[i] = e.target.value;
                    setNames(next);
                  }}
                />
              ))}
            </div>
          </fieldset>
          {error && <p className="error">{error}</p>}
          <button disabled={loading} type="submit">
            {loading ? "Creating..." : "Create trip & get the link 🚀"}
          </button>
        </form>

        <div className="steps">
          <div className="step">
            <div className="step-icon">📝</div>
            <h4>Collect preferences</h4>
            <p>Everyone submits budget, dates &amp; vibe in one link.</p>
          </div>
          <div className="step">
            <div className="step-icon">🏆</div>
            <h4>Get ranked options</h4>
            <p>A fair matching engine scores fit for each person.</p>
          </div>
          <div className="step">
            <div className="step-icon">✅</div>
            <h4>Lock it in</h4>
            <p>A commitment tracker turns votes into bookings.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
