export default function ReadOnlyField({ label, children, plain = false }) {
  return (
    <div className="ro-field">
      <dt>{label}</dt>
      <dd className={plain ? 'ro-field__plain' : undefined}>{children}</dd>
    </div>
  );
}
