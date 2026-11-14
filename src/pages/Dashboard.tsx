import { useEffect, useMemo, useRef, useState } from "react";
import { AddTaskFab } from "../components/layout/AppHeader";
import { Skeleton } from "../components/common/Loader";
import { ErrorState } from "../components/common/States";
import { SearchLink } from "../components/common/SearchInput";
import { WeekStrip } from "../components/dashboard/WeekStrip";
import { StatCards } from "../components/dashboard/StatCards";
import { WeeklyProgress } from "../components/dashboard/WeeklyProgress";
import { DayTasks } from "../components/dashboard/DayTasks";
import { WeekList } from "../components/dashboard/WeekList";
import { useTasks } from "../hooks/useTasks";
import {
  addDaysKey,
  formatWeekRange,
  startOfWeekKey,
  toDateKey,
  todayKey,
} from "../utils/date";

/*
 * Home (tasks) screen, matched to the Figma frame (390×844, same phone column as Welcome):
 * search · day strip · stat cards · weekly progress · tasks for the selected day · "+" button.
 * "View All" reveals every week's tasks below (hidden by default, as in the Figma).
 */
export default function Dashboard() {
  const { weeks, loading, error, refresh } = useTasks();
  const [selectedDay, setSelectedDay] = useState(todayKey);
  const allWeeksRef = useRef<HTMLDivElement>(null);
  const [showAllWeeks, setShowAllWeeks] = useState(false);

  const weekStart = startOfWeekKey(selectedDay);
  const weekEnd = addDaysKey(weekStart, 6);
  const week = weeks.find((w) => w.weekStart === weekStart);

  const daysWithTasks = useMemo(
    () =>
      new Set(
        weeks.flatMap((w) =>
          w.tasks.map((t) => toDateKey(new Date(t.scheduledAt))),
        ),
      ),
    [weeks],
  );
  const dayTasks = useMemo(
    () =>
      week?.tasks.filter(
        (t) => toDateKey(new Date(t.scheduledAt)) === selectedDay,
      ) ?? [],
    [week, selectedDay],
  );

  const isCurrentWeek = startOfWeekKey(todayKey()) === weekStart;

  const changeWeek = (delta: number) => {
    const target = addDaysKey(weekStart, delta * 7);
    const today = todayKey();
    setSelectedDay(startOfWeekKey(today) === target ? today : target);
  };

  // Scroll once the list has rendered.
  useEffect(() => {
    if (showAllWeeks)
      allWeeksRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }, [showAllWeeks]);

  return (
    <div className="mx-auto min-h-dvh w-full max-w-97.5 bg-page">
      <main className="px-6 pb-36 pt-9.25">
        <SearchLink />

        <div className="mt-3">
          <WeekStrip
            weekStart={weekStart}
            selectedDay={selectedDay}
            daysWithTasks={daysWithTasks}
            onSelectDay={setSelectedDay}
            onPrevWeek={() => changeWeek(-1)}
            onNextWeek={() => changeWeek(1)}
          />
        </div>

        {loading ? (
          <div aria-busy>
            <div className="mt-7.5 grid grid-cols-2 gap-4.25">
              <Skeleton className="h-24 rounded-none" />
              <Skeleton className="h-24 rounded-none" />
            </div>
            <Skeleton className="mt-7.25 h-6.75 w-40" />
            <Skeleton className="mt-3.75 h-6 rounded-none" />
            <Skeleton className="mt-7.25 h-6.75 w-36" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex h-16 items-center gap-3">
                <Skeleton className="size-5 rounded-none" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        ) : error && weeks.length === 0 ? (
          <div className="mt-7.5">
            <ErrorState message={error} onRetry={refresh} />
          </div>
        ) : (
          <>
            <div className="mt-7.5">
              <StatCards
                completed={week?.completedTasks ?? 0}
                open={week?.openTasks ?? 0}
                caption={
                  isCurrentWeek
                    ? "This Week"
                    : formatWeekRange(weekStart, weekEnd)
                }
              />
            </div>
            <div className="mt-7.5">
              <WeeklyProgress
                completed={week?.completedTasks ?? 0}
                total={week?.totalTasks ?? 0}
              />
            </div>

            <div className="mt-7.5">
              <DayTasks
                day={selectedDay}
                tasks={dayTasks}
                onViewAll={() =>
                  showAllWeeks
                    ? allWeeksRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      })
                    : setShowAllWeeks(true)
                }
              />
            </div>
            {/* {showAllWeeks && (
              <div ref={allWeeksRef} className="mt-12 scroll-mt-6">
                <WeekList
                  weeks={weeks}
                  focusWeek={week ? weekStart : undefined}
                />
              </div>
            )} */}
          </>
        )}
      </main>

      <AddTaskFab />
    </div>
  );
}
