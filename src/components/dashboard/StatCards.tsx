import { SquareCheck, SquareX } from 'lucide-react';
import type { ReactNode } from 'react';

interface StatCardsProps {
  completed: number;
  open: number;
  caption: string;
}

/** "Task Complete" / "Task Pending" cards from the Figma. */
export function StatCards({ completed, open, caption }: StatCardsProps) {
  return (
    <section aria-label="Task summary" className="grid grid-cols-2 gap-3">
      <StatCard
        icon={<SquareCheck className="size-5" />}
        label="Completed Tasks"
        value={completed}
        caption={caption}
        className="bg-brand-50"
        iconClass="bg-brand-600 text-white"
      />
      <StatCard
        icon={<SquareX className="size-5" />}
        label="Open Tasks"
        value={open}
        caption={caption}
        className="bg-danger-50"
        iconClass="bg-red-500 text-white"
      />
    </section>
  );
}

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: number;
  caption: string;
  className: string;
  iconClass: string;
}

function StatCard({ icon, label, value, caption, className, iconClass }: StatCardProps) {
  return (
    <div className={`rounded-md p-4 ${className}`}>
      {/* Fixed height so both cards line up even when one label wraps. */}
      <div className="flex min-h-9 items-center gap-2">
        <span className={`flex size-7 shrink-0 items-center justify-center rounded ${iconClass}`} aria-hidden>
          {icon}
        </span>
        <p className="text-xs font-medium leading-tight text-ink-700">{label}</p>
      </div>
      <p className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tabular-nums text-ink-900">{String(value).padStart(2, '0')}</span>
        <span className="truncate text-[11px] text-ink-500">{caption}</span>
      </p>
    </div>
  );
}
