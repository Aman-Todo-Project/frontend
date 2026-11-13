import type { Priority, TaskStatus } from '../../types/task';

const priorityStyles: Record<Priority, string> = {
  Low: 'bg-emerald-50 text-emerald-700',
  Medium: 'bg-orange-50 text-orange-700',
  High: 'bg-red-50 text-red-700',
};
const priorityDot: Record<Priority, string> = { Low: 'bg-emerald-500', Medium: 'bg-orange-500', High: 'bg-red-500' };

const base = 'inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[11px] font-medium whitespace-nowrap';

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`${base} ${priorityStyles[priority]}`}>
      <span className={`size-1.5 rounded-full ${priorityDot[priority]}`} aria-hidden />
      {priority}
      <span className="sr-only"> priority</span>
    </span>
  );
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  const done = status === 'Completed';
  return <span className={`${base} ${done ? 'bg-brand-50 text-brand-700' : 'bg-sky-50 text-sky-700'}`}>{status}</span>;
}
