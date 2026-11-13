import { useEffect, useState } from 'react';
import { CalendarPlus, Plus } from 'lucide-react';
import type { WeekGroup } from '../../types/task';
import { useTaskActions } from '../../context/TaskActionsContext';
import { Button } from '../common/Button';
import { SectionHeader } from '../common/Card';
import { EmptyState } from '../common/States';
import { WeekCard } from './WeekCard';

interface WeekListProps {
  weeks: WeekGroup[];
  /** Week to open automatically (e.g. the week picked in the day strip). */
  focusWeek?: string;
}

export function WeekList({ weeks, focusWeek }: WeekListProps) {
  const { openCreate } = useTaskActions();
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(focusWeek ? [focusWeek] : []));

  // Open the focused week whenever it changes (other weeks keep their state).
  useEffect(() => {
    if (focusWeek) setExpanded((prev) => (prev.has(focusWeek) ? prev : new Set(prev).add(focusWeek)));
  }, [focusWeek]);

  const allExpanded = weeks.length > 0 && weeks.every((w) => expanded.has(w.weekStart));

  const toggle = (weekStart: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(weekStart)) next.delete(weekStart);
      else next.add(weekStart);
      return next;
    });

  return (
    <section aria-labelledby="weekly-heading">
      <SectionHeader
        id="weekly-heading"
        title="All Weeks"
        action={
          weeks.length > 0 && (
            <Button
              variant="link"
              size="sm"
              onClick={() => setExpanded(allExpanded ? new Set() : new Set(weeks.map((w) => w.weekStart)))}
            >
              {allExpanded ? 'Collapse all' : 'Expand all'}
            </Button>
          )
        }
      />
      {weeks.length === 0 ? (
        <EmptyState
          icon={<CalendarPlus />}
          title="No tasks yet"
          description="Add your first task and it will show up here, grouped by week."
          action={
            <Button icon={<Plus className="size-4" />} onClick={() => openCreate()}>
              Add Task
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {weeks.map((week) => (
            <WeekCard
              key={week.weekStart}
              week={week}
              expanded={expanded.has(week.weekStart)}
              onToggle={() => toggle(week.weekStart)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
