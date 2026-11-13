import { useId } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import type { WeekGroup } from '../../types/task';
import { defaultDateForWeek, formatWeekRange, getWeekRelation } from '../../utils/date';
import { useTaskActions } from '../../context/TaskActionsContext';
import { ProgressBar, percent } from '../common/ProgressBar';
import { TaskList } from '../tasks/TaskItem';

interface WeekCardProps {
  week: WeekGroup;
  expanded: boolean;
  onToggle: () => void;
}

const relationLabel = { current: 'This week', upcoming: 'Upcoming', past: 'Past' } as const;
const relationStyle = {
  current: 'bg-brand-600 text-white',
  upcoming: 'bg-brand-50 text-brand-700',
  past: 'bg-ink-100 text-ink-500',
} as const;

/** One Monday–Sunday week: summary counts, tap to expand its tasks. */
export function WeekCard({ week, expanded, onToggle }: WeekCardProps) {
  const { openCreate } = useTaskActions();
  const panelId = useId();
  const headingId = useId();
  const relation = getWeekRelation(week.weekStart, week.weekEnd);

  return (
    <section
      aria-labelledby={headingId}
      className={`rounded-md border bg-white ${relation === 'current' ? 'border-brand-300' : 'border-ink-200'}`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="w-full rounded-md p-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${relationStyle[relation]}`}>
              {relationLabel[relation]}
            </span>
            <h3 id={headingId} className="mt-1.5 truncate text-[15px] font-semibold text-ink-900">
              {formatWeekRange(week.weekStart, week.weekEnd)}
            </h3>
          </div>
          <dl className="flex shrink-0 gap-2 text-center">
            <div className="min-w-14 rounded bg-danger-50 px-2 py-1.5">
              <dd className="text-sm font-semibold tabular-nums text-red-600">{week.openTasks}</dd>
              <dt className="text-[10px] text-ink-500">Open</dt>
            </div>
            <div className="min-w-14 rounded bg-brand-50 px-2 py-1.5">
              <dd className="text-sm font-semibold tabular-nums text-brand-700">{week.completedTasks}</dd>
              <dt className="text-[10px] text-ink-500">Completed</dt>
            </div>
          </dl>
          <ChevronDown
            className={`size-5 shrink-0 text-ink-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </div>
        <div className="mt-3">
          <ProgressBar value={percent(week.completedTasks, week.totalTasks)} label={`Progress for ${formatWeekRange(week.weekStart, week.weekEnd)}`} />
        </div>
      </button>

      {expanded && (
        <div id={panelId} className="animate-fade-in border-t border-ink-100 px-4 pb-3">
          <TaskList tasks={week.tasks} />
          {relation !== 'past' && (
            <button
              type="button"
              onClick={() => openCreate(defaultDateForWeek(week.weekStart, week.weekEnd))}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-ink-200 py-2.5 text-sm font-medium text-ink-500 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
            >
              <Plus className="size-4" aria-hidden />
              Add task to this week
            </button>
          )}
        </div>
      )}
    </section>
  );
}
