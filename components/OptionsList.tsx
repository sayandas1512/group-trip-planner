import { TripOption, Participant } from "@/lib/types";

export default function OptionsList({ options, participants }: { options: TripOption[]; participants: Participant[] }) {
  return (
    <section className="card">
      <h2>Ranked options</h2>
      {options.map((opt) => (
        <div key={opt.id} className="option">
          <h3>#{opt.rank} {opt.destination}</h3>
          <p>
            {opt.date_range.start} to {opt.date_range.end} · ~₹{opt.est_cost_per_person} per person
          </p>
          <ul className="fit-list">
            {participants.map((p) => (
              <li key={p.id}>{p.name}: {Math.round((opt.fit_scores[p.id] ?? 0) * 100)}% fit</li>
            ))}
          </ul>
          {opt.gemini_summary && <p className="summary">{opt.gemini_summary}</p>}
        </div>
      ))}
    </section>
  );
}
