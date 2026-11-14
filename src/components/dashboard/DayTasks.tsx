import { useState } from 'react';
import { CalendarCheck, Plus } from 'lucide-react';
import type { Task } from '../../types/task';
import { formatDayLabel, todayKey } from '../../utils/date';
import { useTaskActions } from '../../context/TaskActionsContext';
import { Button } from '../common/Button';
import { SectionHeader } from '../common/Card';
import { EmptyState } from '../common/States';
import { TaskList } from '../tasks/TaskItem';

interface DayTasksProps {
  day: string;
  tasks: Task[];
  /** Desktop: show time, priority and status under each title. */
  details?: boolean;
}

/** Rows shown before "View All". */
const VISIBLE_TASKS = 4;

/**
 * "Tasks Today" list from the Figma, for whichever day is selected in the strip.
 * Shows the first few tasks; "View All" adds the rest to the same list, which then
 * scrolls inside its own box. Remount (key by day) to collapse it again.
 */
export function DayTasks({ day, tasks, details = false }: DayTasksProps) {
  const { openCreate } = useTaskActions();
  const label = formatDayLabel(day);
  const isPast = day < todayKey();
  const [showAll, setShowAll] = useState(false);
  const hasHidden = tasks.length > VISIBLE_TASKS;
  const visible = showAll ? tasks : tasks.slice(0, VISIBLE_TASKS);

  return (
    <section aria-labelledby="day-tasks-heading">
      <SectionHeader
        id="day-tasks-heading"
        title={`Tasks ${label === 'Today' || label === 'Tomorrow' || label === 'Yesterday' ? label : `on ${label}`}`}
        action={
          hasHidden && (
            <Button
              variant="link"
              size="sm"
              className="translate-y-0.5"
              aria-expanded={showAll}
              aria-controls="day-tasks-list"
              onClick={() => setShowAll((v) => !v)}
            >
              {showAll ? 'View Less' : 'View All'}
            </Button>
          )
        }
      />
      {tasks.length ? (
        <div
          id="day-tasks-list"
          // About five rows tall, then the list scrolls on its own.
          className={showAll ? 'max-h-80 overflow-y-auto overscroll-contain' : undefined}
          tabIndex={showAll ? 0 : undefined}
          aria-label={showAll ? 'All tasks for this day' : undefined}
        >
          <TaskList tasks={visible} details={details} showDate={false} />
        </div>
      ) : (
        <EmptyState
          compact
          icon={<CalendarCheck />}
          title="Nothing planned"
          description={isPast ? 'No tasks were scheduled for this day.' : 'Enjoy the free time, or plan something.'}
          action={
            !isPast && (
              <Button variant="secondary" size="sm" icon={<Plus className="size-4" />} onClick={() => openCreate(day)}>
                Add a task
              </Button>
            )
          }
        />
      )}
    </section>
  );
}
