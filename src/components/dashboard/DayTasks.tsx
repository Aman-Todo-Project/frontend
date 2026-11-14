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
  onViewAll: () => void;
}

/** "Tasks Today" list from the Figma, for whichever day is selected in the strip. */
export function DayTasks({ day, tasks, onViewAll }: DayTasksProps) {
  const { openCreate } = useTaskActions();
  const label = formatDayLabel(day);
  const isPast = day < todayKey();

  return (
    <section aria-labelledby="day-tasks-heading">
      <SectionHeader
        id="day-tasks-heading"
        title={`Tasks ${label === 'Today' || label === 'Tomorrow' || label === 'Yesterday' ? label : `on ${label}`}`}
        action={
          <Button variant="link" size="sm" className="translate-y-0.5" onClick={onViewAll}>
            View All
          </Button>
        }
      />
      {tasks.length ? (
        <TaskList tasks={tasks} />
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
