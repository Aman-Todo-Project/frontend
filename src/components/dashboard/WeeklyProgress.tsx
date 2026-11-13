import { ProgressBar, percent } from '../common/ProgressBar';

export function WeeklyProgress({ completed, total }: { completed: number; total: number }) {
  const pct = Math.round(percent(completed, total));
  return (
    <section aria-labelledby="weekly-progress-heading">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 id="weekly-progress-heading" className="text-base font-semibold text-ink-900">
          Weekly Progress
        </h2>
        <span className="text-xs text-ink-500">
          {total === 0 ? 'No tasks this week' : `${completed} of ${total} done · ${pct}%`}
        </span>
      </div>
      <ProgressBar value={pct} label="Tasks completed this week" size="lg" />
    </section>
  );
}
