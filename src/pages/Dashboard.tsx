import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { AddTaskFab } from "../components/layout/AppHeader";
import { Logo } from "../components/layout/Logo";
import { Button } from "../components/common/Button";
import { Skeleton } from "../components/common/Loader";
import { ErrorState } from "../components/common/States";
import { SearchInput } from "../components/common/SearchInput";
import { SearchResults } from "../components/dashboard/SearchResults";
import { WeekStrip } from "../components/dashboard/WeekStrip";
import { StatCards } from "../components/dashboard/StatCards";
import { WeeklyProgress } from "../components/dashboard/WeeklyProgress";
import { DayTasks } from "../components/dashboard/DayTasks";
import { useTasks } from "../hooks/useTasks";
import { useIsDesktop } from "../hooks/useMediaQuery";
import { useTaskActions } from "../context/TaskActionsContext";
import arrowLeftIcon from "../assets/images/arrow-left.png";
import {
  addDaysKey,
  formatMonthYear,
  formatWeekRange,
  startOfWeekKey,
  toDateKey,
  todayKey,
} from "../utils/date";

/*
 * Home (tasks) screen.
 * - Below 576px: the Figma phone frame (390×844): search · day strip · stat cards ·
 *   weekly progress · tasks for the selected day · "+" button.
 * - From 576px: desktop layout with a top bar (logo · search · Add Task) and the same
 *   sections laid out in panels (two columns from 1024px).
 * "View All" adds the day's remaining tasks to the same (then scrollable) list.
 */
export default function Dashboard() {
  const { weeks, loading, error, refresh } = useTasks();
  const { openCreate } = useTaskActions();
  const isDesktop = useIsDesktop();
  const [selectedDay, setSelectedDay] = useState(todayKey);

  // Search happens in place (no separate page). On phones the screen switches to its
  // search state (back arrow + suggestions); on desktop suggestions drop down under the
  // bar. Kept in the URL so the back button closes it.
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

  // Desktop: clicking anywhere outside the search box closes the suggestions.
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const closeSearchRef = useRef(closeSearch);
  closeSearchRef.current = closeSearch;
  useEffect(() => {
    if (!isDesktop || !searching) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      // Ignore clicks inside dialogs (they are portalled outside the search box).
      if ((target as Element).closest?.('[role="dialog"]')) return;
      if (!searchBoxRef.current?.contains(target)) closeSearchRef.current();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isDesktop, searching]);

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

  // ---- Shared sections ----------------------------------------------------
  const weekStrip = (
    <WeekStrip
      weekStart={weekStart}
      selectedDay={selectedDay}
      daysWithTasks={daysWithTasks}
      onSelectDay={setSelectedDay}
      onPrevWeek={() => changeWeek(-1)}
      onNextWeek={() => changeWeek(1)}
    />
  );
  const statCards = (
    <StatCards
      completed={week?.completedTasks ?? 0}
      open={week?.openTasks ?? 0}
      caption={isCurrentWeek ? "This Week" : formatWeekRange(weekStart, weekEnd)}
    />
  );
  const weeklyProgress = (
    <WeeklyProgress
      completed={week?.completedTasks ?? 0}
      total={week?.totalTasks ?? 0}
    />
  );
  const dayTasksList = (
    <DayTasks
      key={selectedDay}
      day={selectedDay}
      tasks={dayTasks}
      details={isDesktop}
    />
  );
  const failed = !loading && Boolean(error) && weeks.length === 0;

  // ---- Desktop --------------------------------------------------------------
  if (isDesktop) {
    return (
      <div className="min-h-dvh bg-canvas">
        <header className="sticky top-0 z-30 border-b border-divider bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:h-18 sm:flex-nowrap sm:px-8 sm:py-0">
            <Logo />
            <div ref={searchBoxRef} className="relative order-last w-full sm:order-none sm:ml-auto sm:max-w-md">
              <SearchInput
                value={query}
                onChange={setQuery}
                onFocus={openSearch}
                onEscape={closeSearch}
              />
              {searching && (
                <div className="absolute inset-x-0 top-full z-40 mt-2 max-h-[min(70vh,480px)] overflow-y-auto border border-border-input bg-white px-5 pb-5 shadow-card">
                  <SearchResults query={query} />
                </div>
              )}
            </div>
            <Button
              size="lg"
              icon={<Plus className="size-4" />}
              className="ml-auto shrink-0 rounded-none! sm:ml-0"
              onClick={() => openCreate(selectedDay)}
            >
              Add Task
            </Button>
          </div>
        </header>

        <main className="mx-auto grid max-w-6xl gap-4 px-4 py-4 sm:gap-6 sm:px-8 sm:py-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-4 sm:space-y-6">
            <Panel>
              <div className="mb-4 flex items-center justify-between gap-4">
                <h1 className="text-18 font-semibold text-text-placeholder">
                  {formatMonthYear(selectedDay)}
                </h1>
                <div className="flex items-center gap-1">
                  <WeekNavButton label="Previous week" onClick={() => changeWeek(-1)}>
                    <ChevronLeft className="size-5" />
                  </WeekNavButton>
                  <button
                    type="button"
                    onClick={() => setSelectedDay(todayKey())}
                    className="h-8 px-3 text-13 text-blue transition-colors hover:bg-card-complete focus-visible:outline-2 focus-visible:outline-blue"
                  >
                    Today
                  </button>
                  <WeekNavButton label="Next week" onClick={() => changeWeek(1)}>
                    <ChevronRight className="size-5" />
                  </WeekNavButton>
                </div>
              </div>
              {weekStrip}
            </Panel>

            <Panel>
              {loading ? (
                <TaskRowsSkeleton />
              ) : failed ? (
                <ErrorState message={error!} onRetry={refresh} />
              ) : (
                dayTasksList
              )}
            </Panel>
          </div>

          <aside className="space-y-4 sm:space-y-6">
            {loading ? (
              <div className="grid grid-cols-2 gap-4.25">
                <Skeleton className="h-24 rounded-none" />
                <Skeleton className="h-24 rounded-none" />
              </div>
            ) : (
              statCards
            )}
            <Panel>
              {loading ? (
                <>
                  <Skeleton className="h-6.75 w-40" />
                  <Skeleton className="mt-3.75 h-6 rounded-none" />
                </>
              ) : (
                weeklyProgress
              )}
            </Panel>
          </aside>
        </main>
      </div>
    );
  }

  // ---- Phone (Figma frame) --------------------------------------------------
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
            <div className="mt-3">{weekStrip}</div>

            {loading ? (
              <div aria-busy>
                <div className="mt-7.5 grid grid-cols-2 gap-4.25">
                  <Skeleton className="h-24 rounded-none" />
                  <Skeleton className="h-24 rounded-none" />
                </div>
                <Skeleton className="mt-7.25 h-6.75 w-40" />
                <Skeleton className="mt-3.75 h-6 rounded-none" />
                <div className="mt-7.25">
                  <TaskRowsSkeleton />
                </div>
              </div>
            ) : failed ? (
              <div className="mt-7.5">
                <ErrorState message={error!} onRetry={refresh} />
              </div>
            ) : (
              <>
                <div className="mt-7.5">{statCards}</div>
                <div className="mt-7.5">{weeklyProgress}</div>
                <div className="mt-7.5">{dayTasksList}</div>
              </>
            )}
          </>
        )}
      </main>

      {!searching && <AddTaskFab />}
    </div>
  );
}

/** White desktop panel, square corners like the Figma inputs and cards. */
function Panel({ children }: { children: ReactNode }) {
  return <section className="border border-border-input bg-white p-4 sm:p-6">{children}</section>;
}

function WeekNavButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex size-8 items-center justify-center text-text-label transition-colors hover:bg-card-complete hover:text-blue focus-visible:outline-2 focus-visible:outline-blue"
    >
      {children}
    </button>
  );
}

function TaskRowsSkeleton() {
  return (
    <div aria-busy>
      <Skeleton className="h-6.75 w-36" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex h-16 items-center gap-3">
          <Skeleton className="size-5 rounded-none" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
  );
}
