import { CalendarDays, Clock, SquarePen, Trash2 } from 'lucide-react';
import type { Task } from '../../types/task';
import { formatDate, formatTime, isOverdue } from '../../utils/date';
import { Checkbox } from '../common/Checkbox';
import { IconButton } from '../common/Button';
import { PriorityBadge, StatusBadge } from '../common/Badges';
import { useTaskActions } from '../../context/TaskActionsContext';
import { useTasks } from '../../hooks/useTasks';
import { SwipeableRow } from './SwipeableRow';

interface TaskItemProps {
  task: Task;
  /** Hide the date when the list is already for a single day. */
  showDate?: boolean;
}

/** A single row from the Figma task list: checkbox · title · delete · edit. */
export function TaskItem({ task, showDate = true }: TaskItemProps) {
  const { openView, openEdit, confirmDelete, toggleStatus } = useTaskActions();
  const { pendingStatusIds } = useTasks();
  const done = task.status === 'Completed';
  const overdue = isOverdue(task.scheduledAt, task.status);

  return (
    <li className="border-b border-ink-100 last:border-b-0">
      <SwipeableRow onDelete={() => confirmDelete(task)} label={task.title}>
        <div className="flex items-start gap-3 py-3.5">
          <div className="pt-0.5">
            <Checkbox
              checked={done}
              loading={pendingStatusIds.has(task.id)}
              onChange={() => toggleStatus(task)}
              label={done ? `Mark "${task.title}" as in progress` : `Mark "${task.title}" as completed`}
            />
          </div>

          <button type="button" onClick={() => openView(task)} className="min-w-0 flex-1 text-left focus-visible:outline-none">
            <span className={`block truncate text-sm font-medium ${done ? 'text-ink-400 line-through' : 'text-ink-900'}`}>
              {task.title}
            </span>
            {task.description && <span className="mt-0.5 block truncate text-xs text-ink-500">{task.description}</span>}
            <span className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[11px] text-ink-500">
              {showDate && (
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="size-3.5" aria-hidden />
                  {formatDate(task.scheduledAt)}
                </span>
              )}
              <span className={`inline-flex items-center gap-1 ${overdue ? 'font-medium text-red-600' : ''}`}>
                <Clock className="size-3.5" aria-hidden />
                {formatTime(task.scheduledAt)}
                {overdue && ' · Overdue'}
              </span>
              <PriorityBadge priority={task.priority} />
              <StatusBadge status={task.status} />
            </span>
          </button>

          <div className="-my-1 flex shrink-0 items-center">
            <IconButton label={`Delete "${task.title}"`} tone="danger" onClick={() => confirmDelete(task)}>
              <Trash2 className="size-[18px]" />
            </IconButton>
            <IconButton label={`Edit "${task.title}"`} onClick={() => openEdit(task)}>
              <SquarePen className="size-[18px]" />
            </IconButton>
          </div>
        </div>
      </SwipeableRow>
    </li>
  );
}

export function TaskList({ tasks, showDate = true }: { tasks: Task[]; showDate?: boolean }) {
  return (
    <ul>
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} showDate={showDate} />
      ))}
    </ul>
  );
}
