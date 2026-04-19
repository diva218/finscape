export default function RiskBadge({ level, message }) {
  return (
    <div className={`risk-badge risk-${level}`}>
      <strong>{level.toUpperCase()}</strong>
      <span>{message}</span>
    </div>
  );
}
