import { TripOption, Participant, Commitment } from "@/lib/types";
import { destinationImageUrl } from "@/lib/destinationImages";

// Slice colors follow rank order (1st/2nd/3rd), matching the badge colors
// already used on the ranked-options cards.
const SLICE_COLORS = ["#ff5a5f", "#00a699", "#ffb400"];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

export default function FinalVerdict({
  options,
  participants,
  commitments,
}: {
  options: TripOption[];
  participants: Participant[];
  commitments: Commitment[];
}) {
  const allCommitted =
    participants.length > 0 &&
    participants.every((p) => commitments.some((c) => c.participant_id === p.id && c.committed));

  if (!allCommitted) return null;

  const tally = options.map((opt, i) => ({
    option: opt,
    color: SLICE_COLORS[i % SLICE_COLORS.length],
    voters: participants.filter((p) =>
      commitments.some((c) => c.participant_id === p.id && c.committed && c.option_id === opt.id)
    ),
  }));

  const winner = tally.reduce((best, cur) => (cur.voters.length > best.voters.length ? cur : best), tally[0]);
  const withVotes = tally.filter((t) => t.voters.length > 0);
  const total = participants.length;

  let cursor = 0;
  const slices = withVotes.map((t) => {
    const angle = (t.voters.length / total) * 360;
    const path = arcPath(60, 60, 60, cursor, cursor + angle);
    cursor += angle;
    return { ...t, path };
  });

  return (
    <section className="card verdict-card">
      <h2 className="section-title">🏁 The Final Call</h2>
      <div
        className="verdict-banner"
        style={{ backgroundImage: `url(${destinationImageUrl(winner.option.destination)})` }}
      >
        <div className="verdict-banner-overlay">
          <span className="verdict-eyebrow">The group is going to</span>
          <h3>{winner.option.destination} 🎉</h3>
          <p>
            {winner.voters.length} of {total} locked it in{" "}
            {winner.voters.length < total && "— the majority pick"}
          </p>
        </div>
      </div>

      <div className="verdict-body">
        <svg viewBox="0 0 120 120" className="verdict-pie">
          {slices.length === 1 ? (
            <circle cx={60} cy={60} r={60} fill={slices[0].color} />
          ) : (
            slices.map((s) => <path key={s.option.id} d={s.path} fill={s.color} />)
          )}
        </svg>
        <ul className="verdict-legend">
          {withVotes.map((t) => (
            <li key={t.option.id}>
              <span className="legend-dot" style={{ background: t.color }} />
              <span>
                <strong>{t.option.destination}</strong> — {t.voters.length} {t.voters.length === 1 ? "vote" : "votes"}
                <br />
                <span className="legend-names">{t.voters.map((v) => v.name).join(", ")}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
