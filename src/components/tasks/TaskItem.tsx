import { CalendarDays, Clock } from "lucide-react";
import type { Task } from "../../types/task";
import { formatDate, formatTime, isOverdue } from "../../utils/date";
import { Checkbox } from "../common/Checkbox";
import { PriorityBadge, StatusBadge } from "../common/Badges";
import { useTaskActions } from "../../context/TaskActionsContext";
import { useTasks } from "../../hooks/useTasks";
import { SwipeableRow } from "./SwipeableRow";
import trashIcon from "../../assets/images/trash.png";
import editIcon from "../../assets/images/edit.png";

interface TaskItemProps {
  task: Task;
  /** Show date/time/priority/status under the title (search results). The Figma rows show the title only. */
  details?: boolean;
  /** With `details`, hide the date when the list is already for a single day. */
  showDate?: boolean;
  /**
   * Search suggestions: the task can only be checked / unchecked. No edit or delete
   * icons, no swipe-to-delete, and tapping the title toggles it too.
   */
  checkOnly?: boolean;
}

const iconButton =
  "flex size-6 items-center justify-center transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue";

/**
 * Figma task row (64px): checkbox · title · trash · edit, with a divider that starts
 * under the title. Tap the title to see the full task.
 */
export function TaskItem({
  task,
  details = false,
  showDate = true,
  checkOnly = false,
}: TaskItemProps) {
  const { openView, openEdit, confirmDelete, toggleStatus } = useTaskActions();
  const { pendingStatusIds } = useTasks();
  const done = task.status === "Completed";
  const overdue = isOverdue(task.scheduledAt, task.status);

  const row = (
        <div className="flex items-start gap-3 min-h-10 mt-4.75">
          <Checkbox
            checked={done}
            loading={pendingStatusIds.has(task.id)}
            onChange={() => toggleStatus(task)}
            label={
              done
                ? `Mark "${task.title}" as in progress`
                : `Mark "${task.title}" as completed`
            }
          />

          <div className="flex min-w-0 flex-1 items-center gap-3 pb-4 border-b border-divider ">
            <button
              type="button"
              onClick={() => (checkOnly ? toggleStatus(task) : openView(task))}
              tabIndex={checkOnly ? -1 : undefined}
              aria-hidden={checkOnly || undefined}
              className="min-w-0 flex-1 text-left focus-visible:outline-none"
            >
              <span
                className={`block truncate text-14 font-medium text-text-placeholder ${done ? "line-through" : ""}`}
              >
                {task.title}
              </span>
              {details && (
                <span className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[11px] text-text-label">
                  {showDate && (
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="size-3.5" aria-hidden />
                      {formatDate(task.scheduledAt)}
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center gap-1 ${overdue ? "font-medium text-red-600" : ""}`}
                  >
                    <Clock className="size-3.5" aria-hidden />
                    {formatTime(task.scheduledAt)}
                    {task.endAt && ` – ${formatTime(task.endAt)}`}
                    {overdue && " · Overdue"}
                  </span>
                  <PriorityBadge priority={task.priority} />
                  <StatusBadge status={task.status} />
                </span>
              )}
            </button>

            {!checkOnly && (
            <div className="-mr-0.25 flex shrink-0 -translate-y-0.5 items-center gap-2.75">
              <button
                type="button"
                aria-label={`Delete "${task.title}"`}
                title="Delete"
                onClick={() => confirmDelete(task)}
                className={iconButton}
              >
                <img src={trashIcon} alt="" aria-hidden className="size-6" />
              </button>
              <button
                type="button"
                aria-label={`Edit "${task.title}"`}
                title="Edit"
                onClick={() => openEdit(task)}
                className={iconButton}
              >
                <img src={editIcon} alt="" aria-hidden className="size-6" />
              </button>
            </div>
            )}
          </div>
        </div>
  );

  return (
    <li>
      {checkOnly ? (
        row
      ) : (
        <SwipeableRow onDelete={() => confirmDelete(task)} label={task.title}>
          {row}
        </SwipeableRow>
      )}
    </li>
  );
}

export function TaskList({
  tasks,
  details = false,
  showDate = true,
  checkOnly = false,
  className,
}: {
  tasks: Task[];
  details?: boolean;
  showDate?: boolean;
  checkOnly?: boolean;
  className?: string;
}) {
  return (
    <ul className={className}>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          details={details}
          showDate={showDate}
          checkOnly={checkOnly}
        />
      ))}
    </ul>
  );
}
