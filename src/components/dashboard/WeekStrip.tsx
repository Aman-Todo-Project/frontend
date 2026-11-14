import { useRef } from "react";
import {
  addDaysKey,
  formatMonthYear,
  parseDateKey,
  todayKey,
  weekDays,
} from "../../utils/date";

interface WeekStripProps {
  weekStart: string;
  selectedDay: string;
  daysWithTasks: ReadonlySet<string>;
  onSelectDay: (day: string) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

const SWIPE_DISTANCE = 50;

export function WeekStrip({
  weekStart,
  selectedDay,
  daysWithTasks,
  onSelectDay,
  onPrevWeek,
  onNextWeek,
}: WeekStripProps) {
  const today = todayKey();
  const startX = useRef<number | null>(null);
  const swiped = useRef(false);

  const hiddenNav =
    "sr-only focus:not-sr-only focus:absolute focus:z-10 focus:bg-white focus:px-2 focus:py-1 focus:text-12 focus:text-blue focus:outline-2 focus:outline-blue";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onPrevWeek}
        className={`${hiddenNav} focus:left-0 focus:-top-7`}
      >
        Previous week
      </button>
      <button
        type="button"
        onClick={onNextWeek}
        className={`${hiddenNav} focus:right-0 focus:-top-7`}
      >
        Next week
      </button>

      <div
        role="group"
        aria-label={`Choose a day, ${formatMonthYear(selectedDay)}`}
        className="-mx-[8.5px] flex touch-pan-y select-none justify-between"
        onPointerDown={(e) => {
          startX.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (startX.current === null) return;
          const dx = e.clientX - startX.current;
          startX.current = null;
          if (Math.abs(dx) < SWIPE_DISTANCE) return;
          swiped.current = true;
          if (dx < 0) onNextWeek();
          else onPrevWeek();
        }}
        onPointerCancel={() => {
          startX.current = null;
        }}
        onClickCapture={(e) => {
          // A swipe that ends on a day must not also select it.
          if (swiped.current) {
            swiped.current = false;
            e.stopPropagation();
          }
        }}
      >
        {[addDaysKey(weekStart, -1), ...weekDays(weekStart)].map((day) => {
          const date = parseDateKey(day);
          const selected = day === selectedDay;
          const isToday = day === today;
          const color = selected
            ? "bg-blue text-white"
            : isToday
              ? "text-blue"
              : "text-text-day hover:text-text-label";
          return (
            <button
              key={day}
              type="button"
              aria-pressed={selected}
              aria-label={date.toLocaleDateString(undefined, {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
              onClick={() => onSelectDay(day)}
              className={`flex h-15.75 w-9.75 flex-col items-center transition-colors ${selected ? "pt-1.5" : "pt-2"} focus-visible:outline-2 focus-visible:outline-blue ${color}`}
            >
              <span className="text-10 leading-5.5">
                {date.toLocaleDateString(undefined, { weekday: "short" })}
              </span>
              <span className="text-14 leading-5.25">
                {String(date.getDate()).padStart(2, "0")}
              </span>
              <span
                className={`mt-1.25 size-1 rounded-full ${daysWithTasks.has(day) ? (selected ? "bg-white" : "bg-blue") : "bg-transparent"}`}
                aria-hidden
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
