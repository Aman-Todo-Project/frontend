import { ProgressBar, percent } from '../common/ProgressBar';

export function WeeklyProgress({ completed, total }: { completed: number; total: number }) {
  return (
    <section aria-labelledby="weekly-progress-heading">
      <h2 id="weekly-progress-heading" className="text-18 font-semibold leading-6.75 text-black">
        Weekly Progress
      </h2>
      <div className="mt-3.75">
        <ProgressBar
          value={percent(completed, total)}
          label={total === 0 ? 'No tasks this week' : `${completed} of ${total} tasks completed this week`}
          size="lg"
        />
      </div>
    </section>
  );
}
