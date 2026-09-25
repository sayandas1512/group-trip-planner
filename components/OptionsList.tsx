import Image from "next/image";
import { TripOption, Participant } from "@/lib/types";
import { destinationImageUrl } from "@/lib/destinationImages";

function fitTier(score: number): "high" | "mid" | "low" {
  if (score >= 0.66) return "high";
  if (score >= 0.4) return "mid";
  return "low";
}

export default function OptionsList({ options, participants }: { options: TripOption[]; participants: Participant[] }) {
  return (
    <section>
      <h2 className="section-title">🏆 Ranked options</h2>
      {options.map((opt) => (
        <div key={opt.id} className="option-card">
          <div className="option-image-wrap">
            <Image
              src={destinationImageUrl(opt.destination)}
              alt={opt.destination}
              fill
              sizes="(max-width: 720px) 100vw, 720px"
            />
            <span className={`rank-badge ${opt.rank === 1 ? "top" : ""}`}>
              {opt.rank === 1 ? "🥇 Top match" : `#${opt.rank}`}
            </span>
            {opt.est_cost_per_person != null && (
              <span className="price-tag">~₹{opt.est_cost_per_person.toLocaleString("en-IN")} / person</span>
            )}
          </div>
          <div className="option-body">
            <h3>{opt.destination}</h3>
            <p className="option-dates">
              📅 {opt.date_range.start} to {opt.date_range.end}
            </p>
            <ul className="fit-list">
              {participants.map((p) => {
                const score = opt.fit_scores[p.id] ?? 0;
                return (
                  <li key={p.id} className={`fit-pill ${fitTier(score)}`}>
                    {p.name} {Math.round(score * 100)}%
                  </li>
                );
              })}
            </ul>
            {opt.gemini_summary && <p className="summary">{opt.gemini_summary}</p>}
          </div>
        </div>
      ))}
    </section>
  );
}
