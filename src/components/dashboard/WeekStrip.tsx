import { ChevronLeft, ChevronRight } from 'lucide-react';
import { IconButton } from '../common/Button';
import { formatMonthYear, parseDateKey, todayKey, weekDays } from '../../utils/date';

interface WeekStripProps {
  weekStart: string;
  selectedDay: string;
  daysWithTasks: ReadonlySet<string>;
  onSelectDay: (day: string) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

/** Mon–Sun day picker from the Figma home screen. */
export function WeekStrip({ weekStart, selectedDay, daysWithTasks, onSelectDay, onPrevWeek, onNextWeek }: WeekStripProps) {
  const today = todayKey();

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-ink-900" aria-live="polite">
          {formatMonthYear(selectedDay)}
        </p>
        <div className="flex">
          <IconButton label="Previous week" onClick={onPrevWeek}>
            <ChevronLeft className="size-5" />
          </IconButton>
          <IconButton label="Next week" onClick={onNextWeek}>
            <ChevronRight className="size-5" />
          </IconButton>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1" role="group" aria-label="Choose a day">
        {weekDays(weekStart).map((day) => {
          const date = parseDateKey(day);
          const selected = day === selectedDay;
          const isToday = day === today;
          return (
            <button
              key={day}
              type="button"
              aria-pressed={selected}
              aria-label={date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
              onClick={() => onSelectDay(day)}
              className={`flex flex-col items-center gap-1 rounded-md py-2.5 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-brand-500 ${
                selected ? 'bg-brand-600 text-white' : isToday ? 'text-brand-600 hover:bg-brand-50' : 'text-ink-400 hover:bg-ink-100'
              }`}
            >
              <span>{date.toLocaleDateString(undefined, { weekday: 'short' })}</span>
              <span className={`text-sm font-semibold ${selected ? 'text-white' : isToday ? 'text-brand-600' : 'text-ink-700'}`}>
                {String(date.getDate()).padStart(2, '0')}
              </span>
              <span
                className={`size-1 rounded-full ${daysWithTasks.has(day) ? (selected ? 'bg-white' : 'bg-brand-600') : 'bg-transparent'}`}
                aria-hidden
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
