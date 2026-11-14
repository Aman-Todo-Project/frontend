interface ProgressBarProps {
  value: number; // 0–100
  label: string;
  /** lg = the Figma "Weekly Progress" bar: 24px tall, square, dark-blue on lavender. */
  size?: 'sm' | 'lg';
  tone?: 'brand' | 'success';
}

export function ProgressBar({ value, label, size = 'sm', tone = 'brand' }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`w-full overflow-hidden ${size === 'lg' ? 'h-6 bg-progress-track' : 'h-1.5 rounded-full bg-ink-100'}`}
    >
      <div
        className={`h-full transition-[width] duration-500 ${size === 'lg' ? '' : 'rounded-full'} ${
          tone === 'success' ? 'bg-emerald-500' : 'bg-dark-blue'
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export const percent = (part: number, total: number) => (total ? (part / total) * 100 : 0);
