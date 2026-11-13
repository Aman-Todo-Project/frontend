import { useMemo, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AppHeader, AddTaskFab } from '../components/layout/AppHeader';
import { Card } from '../components/common/Card';
import { Skeleton } from '../components/common/Loader';
import { ErrorState } from '../components/common/States';
import { SearchLink } from '../components/common/SearchInput';
import { WeekStrip } from '../components/dashboard/WeekStrip';
import { StatCards } from '../components/dashboard/StatCards';
import { WeeklyProgress } from '../components/dashboard/WeeklyProgress';
import { DayTasks } from '../components/dashboard/DayTasks';
import { WeekList } from '../components/dashboard/WeekList';
import { useTasks } from '../hooks/useTasks';
import { addDaysKey, formatLongDate, formatWeekRange, startOfWeekKey, toDateKey, todayKey } from '../utils/date';
import { hasOnboarded } from '../utils/storage';

export default function Dashboard() {
  const { weeks, loading, error, refresh } = useTasks();
  const [selectedDay, setSelectedDay] = useState(todayKey);
  const allWeeksRef = useRef<HTMLDivElement>(null);

  const weekStart = startOfWeekKey(selectedDay);
  const weekEnd = addDaysKey(weekStart, 6);
  const week = weeks.find((w) => w.weekStart === weekStart);

  const daysWithTasks = useMemo(() => new Set(week?.tasks.map((t) => toDateKey(new Date(t.scheduledAt)))), [week]);
  const dayTasks = useMemo(
    () => week?.tasks.filter((t) => toDateKey(new Date(t.scheduledAt)) === selectedDay) ?? [],
    [week, selectedDay]
  );

  if (!hasOnboarded()) return <Navigate to="/welcome" replace />;

  const isCurrentWeek = startOfWeekKey(todayKey()) === weekStart;

  const changeWeek = (delta: number) => {
    const target = addDaysKey(weekStart, delta * 7);
    const today = todayKey();
    setSelectedDay(startOfWeekKey(today) === target ? today : target);
  };

  const showAllWeeks = () => allWeeksRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="min-h-dvh">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-4 pb-32 pt-5 sm:px-6 lg:grid lg:grid-cols-[400px_minmax(0,1fr)] lg:items-start lg:gap-6 lg:pb-12 lg:pt-8">
        <div className="space-y-5 lg:sticky lg:top-24">
          <div>
            <p className="text-xs text-ink-500">{formatLongDate()}</p>
            <h1 className="mt-0.5 text-2xl font-semibold text-ink-900">My Tasks</h1>
          </div>

          <div className="lg:hidden">
            <SearchLink />
          </div>

          <Card flatOnMobile className="space-y-6">
            <WeekStrip
              weekStart={weekStart}
              selectedDay={selectedDay}
              daysWithTasks={daysWithTasks}
              onSelectDay={setSelectedDay}
              onPrevWeek={() => changeWeek(-1)}
              onNextWeek={() => changeWeek(1)}
            />
            {loading ? (
              <div className="space-y-6" aria-busy>
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton className="h-[104px]" />
                  <Skeleton className="h-[104px]" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-6" />
                </div>
              </div>
            ) : (
              <>
                <StatCards
                  completed={week?.completedTasks ?? 0}
                  open={week?.openTasks ?? 0}
                  caption={isCurrentWeek ? 'This Week' : formatWeekRange(weekStart, weekEnd)}
                />
                <WeeklyProgress completed={week?.completedTasks ?? 0} total={week?.totalTasks ?? 0} />
              </>
            )}
          </Card>
        </div>

        <div className="mt-8 space-y-8 lg:mt-0">
          {loading ? (
            <Card flatOnMobile className="space-y-4" aria-busy>
              <Skeleton className="h-5 w-32" />
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex gap-3 border-b border-ink-100 pb-4">
                  <Skeleton className="size-5" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </Card>
          ) : error && weeks.length === 0 ? (
            <ErrorState message={error} onRetry={refresh} />
          ) : (
            <>
              <Card flatOnMobile>
                <DayTasks day={selectedDay} tasks={dayTasks} onViewAll={showAllWeeks} />
              </Card>
              <div ref={allWeeksRef} className="scroll-mt-24">
                <WeekList weeks={weeks} focusWeek={week ? weekStart : undefined} />
              </div>
            </>
          )}
        </div>
      </main>

      <AddTaskFab />
    </div>
  );
}
