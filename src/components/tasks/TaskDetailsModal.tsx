import { CalendarDays, Clock, SquarePen, Trash2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { PriorityBadge, StatusBadge } from '../common/Badges';
import { STATUSES, type Task } from '../../types/task';
import { formatDate, formatDateTime, formatTime, isOverdue } from '../../utils/date';
import { useTasks } from '../../hooks/useTasks';

interface TaskDetailsModalProps {
  task: Task;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, status: Task['status']) => void;
}

export function TaskDetailsModal({ task, onClose, onEdit, onDelete, onStatusChange }: TaskDetailsModalProps) {
  const { pendingStatusIds } = useTasks();
  const pending = pendingStatusIds.has(task.id);
  const overdue = isOverdue(task.scheduledAt, task.status);

  return (
    <Modal
      open
      onClose={onClose}
      title={task.title}
      footer={
        <>
          <Button variant="secondary" size="lg" className="flex-1" icon={<Trash2 className="size-4" />} onClick={() => onDelete(task)}>
            Delete
          </Button>
          <Button size="lg" className="flex-1" icon={<SquarePen className="size-4" />} onClick={() => onEdit(task)}>
            Edit
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
          {overdue && <span className="rounded bg-danger-50 px-1.5 py-0.5 text-[11px] font-medium text-red-700">Overdue</span>}
        </div>

        <div>
          <p className="mb-1 text-xs font-medium text-ink-500">Description</p>
          <p className={`whitespace-pre-wrap text-sm leading-6 ${task.description ? 'text-ink-700' : 'italic text-ink-400'}`}>
            {task.description || 'No description'}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-3">
          <div className="rounded-md border border-ink-100 p-3">
            <dt className="flex items-center gap-1.5 text-xs text-ink-500">
              <CalendarDays className="size-3.5" aria-hidden /> Date
            </dt>
            <dd className="mt-1 text-sm font-medium text-ink-900">{formatDate(task.scheduledAt)}</dd>
          </div>
          <div className="rounded-md border border-ink-100 p-3">
            <dt className="flex items-center gap-1.5 text-xs text-ink-500">
              <Clock className="size-3.5" aria-hidden /> Time
            </dt>
            <dd className="mt-1 text-sm font-medium text-ink-900">{formatTime(task.scheduledAt)}
              {task.endAt && ` – ${formatTime(task.endAt)}`}
            </dd>
          </div>
        </dl>

        <div>
          <p className="mb-1.5 text-xs font-medium text-ink-500" id="status-label">
            Status
          </p>
          <div className="grid grid-cols-2 gap-1 rounded-md bg-ink-100 p-1" role="radiogroup" aria-labelledby="status-label">
            {STATUSES.map((s) => {
              const active = task.status === s;
              return (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  disabled={pending}
                  onClick={() => !active && onStatusChange(task, s)}
                  className={`h-9 rounded text-sm font-medium transition-all disabled:opacity-60 ${
                    active ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-900'
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-ink-400">
          Created {formatDateTime(task.createdAt)} · Updated {formatDateTime(task.updatedAt)}
        </p>
      </div>
    </Modal>
  );
}

export default TaskDetailsModal;
