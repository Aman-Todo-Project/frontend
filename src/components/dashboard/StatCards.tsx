import checkIcon from "../../assets/images/check.png";
import crossIcon from "../../assets/images/cross.png";

interface StatCardsProps {
  completed: number;
  open: number;
  caption: string;
}

/** "Task Complete" / "Task Pending" cards from the Figma (162×96, 17px apart). */
export function StatCards({ completed, open, caption }: StatCardsProps) {
  return (
    <section aria-label="Task summary" className="grid grid-cols-2 gap-4.25">
      <StatCard
        icon={checkIcon}
        label="Task Complete"
        value={completed}
        caption={caption}
        className="bg-card-complete"
      />
      <StatCard
        icon={crossIcon}
        label="Task Pending"
        value={open}
        caption={caption}
        className="bg-card-pending"
      />
    </section>
  );
}

interface StatCardProps {
  icon: string;
  label: string;
  value: number;
  caption: string;
  className: string;
}

function StatCard({ icon, label, value, caption, className }: StatCardProps) {
  return (
    <div className={`h-24 min-w-0 pl-3.75 pr-2 pt-4 ${className}`}>
      <div className="flex items-center gap-2.75">
        <img src={icon} alt="" aria-hidden className="size-7 shrink-0" />
        <p className="truncate text-12 text-text-placeholder">{label}</p>
      </div>
      <p className="ml-9.75 mt-[3px] flex min-w-0 items-baseline gap-1.5">
        <span className="text-22 font-semibold leading-8.25 tabular-nums text-text-placeholder">
          {String(value).padStart(2, "0")}
        </span>
        <span className="truncate text-10 text-text-caption">{caption}</span>
      </p>
    </div>
  );
}
