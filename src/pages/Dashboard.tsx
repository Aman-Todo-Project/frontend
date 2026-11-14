import { useMemo, useState } from "react";
import { AddTaskFab } from "../components/layout/AppHeader";
import { Skeleton } from "../components/common/Loader";
import { ErrorState } from "../components/common/States";
import { SearchInput } from "../components/common/SearchInput";
import { SearchResults } from "../components/dashboard/SearchResults";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import arrowLeftIcon from "../assets/images/arrow-left.png";
import { WeekStrip } from "../components/dashboard/WeekStrip";
import { StatCards } from "../components/dashboard/StatCards";
import { WeeklyProgress } from "../components/dashboard/WeeklyProgress";
import { DayTasks } from "../components/dashboard/DayTasks";
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
 * "View All" adds the day's remaining tasks to the same (then scrollable) list.
 */
export default function Dashboard() {
  const { weeks, loading, error, refresh } = useTasks();
  const [selectedDay, setSelectedDay] = useState(todayKey);

  // Search happens in place: tapping the bar switches the screen to its search state
  // (back arrow + suggestions). Kept in the URL so the phone's back button closes it.
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const searching = params.has("search");
  const query = params.get("search") ?? "";
  const searchPushed = Boolean(
    (location.state as { searchPushed?: boolean } | null)?.searchPushed,
  );
  const openSearch = () => {
    if (!searching) setParams({ search: "" }, { state: { searchPushed: true } });
  };
  const setQuery = (value: string) =>
    setParams({ search: value }, { replace: true, state: location.state });
  const closeSearch = () => {
    // Drop focus so the next tap on the bar opens search again.
    (document.activeElement as HTMLElement | null)?.blur();
    if (searchPushed) navigate(-1);
    else setParams({}, { replace: true });
  };

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

  return (
    <div className="mx-auto min-h-dvh w-full max-w-97.5 bg-page">
      <main className={`px-6 pb-36 ${searching ? "pt-7.75" : "pt-9.25"}`}>
        {searching && (
          <button
            type="button"
            onClick={closeSearch}
            aria-label="Close search"
            className="-ml-0.5 mb-7 flex size-6 items-center justify-center transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-blue"
          >
            <img src={arrowLeftIcon} alt="" aria-hidden className="size-6" />
          </button>
        )}
        <SearchInput
          value={query}
          onChange={setQuery}
          onFocus={openSearch}
          onEscape={closeSearch}
          autoFocus={searching}
        />

        {searching ? (
          <SearchResults query={query} />
        ) : (
        <>

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
              <DayTasks key={selectedDay} day={selectedDay} tasks={dayTasks} />
            </div>
          </>
        )}
        </>
        )}
      </main>

      {!searching && <AddTaskFab />}
    </div>
  );
}
