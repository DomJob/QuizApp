interface SpinnerProps {
  className?: string;
}

export function Spinner({ className = '' }: SpinnerProps) {
  return (
    <div className={`card spinner-wrap ${className}`}>
      <div className="spinner" aria-hidden="true"></div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
