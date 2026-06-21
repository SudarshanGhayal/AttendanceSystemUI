export default function SummaryCard({ label, value, sub, tone }) {
  return (
    <div className={`summary-card${tone ? ` tone-${tone}` : ''}`}>
      <div className="summary-card-label">{label}</div>
      <div className="summary-card-value">{value}</div>
      {sub && <div className="summary-card-sub">{sub}</div>}
    </div>
  );
}