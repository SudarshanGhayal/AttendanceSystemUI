/**
 * BloomRing — the dashboard's signature element: today's attendance
 * breakdown rendered as concentric "petals" (rather than a generic
 * donut chart), echoing the rose/nursery subject matter.
 */
export default function BloomRing({ present, half, absent, leave, notMarked, total }) {
  const segments = [
    { key: 'present', value: present, color: 'var(--color-present)', label: 'Present' },
    { key: 'half', value: half, color: 'var(--color-half)', label: 'Half Day' },
    { key: 'absent', value: absent, color: 'var(--color-absent)', label: 'Absent' },
    { key: 'leave', value: leave, color: 'var(--color-leave)', label: 'Leave' },
    { key: 'notMarked', value: notMarked, color: '#D8D0C0', label: 'Not Marked' },
  ].filter((s) => s.value > 0);

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let offsetAccum = 0;
  const safeTotal = total || 1;

  return (
    <div className="bloom-ring-wrap">
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r={radius} fill="none" stroke="#EFE7D8" strokeWidth="18" />
        {segments.map((seg) => {
          const fraction = seg.value / safeTotal;
          const dash = fraction * circumference;
          const circle = (
            <circle
              key={seg.key}
              cx="90"
              cy="90"
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="18"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offsetAccum}
              strokeLinecap="butt"
              transform="rotate(-90 90 90)"
            />
          );
          offsetAccum += dash;
          return circle;
        })}
        <text x="90" y="84" textAnchor="middle" fontFamily="Source Serif 4, serif" fontSize="30" fontWeight="600" fill="var(--color-primary-dark)">
          {present + half}
        </text>
        <text x="90" y="104" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="11" letterSpacing="0.04em" fill="var(--color-ink-muted)">
          OF {total} WORKING
        </text>
      </svg>
      <ul className="bloom-legend">
        {segments.map((seg) => (
          <li key={seg.key}>
            <span className="bloom-dot" style={{ background: seg.color }} />
            {seg.label} <strong>{seg.value}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}