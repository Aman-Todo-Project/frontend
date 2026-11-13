import { describe, expect, it } from 'vitest';
import reducer, { createTask, deleteTask, fetchWeeks, setTaskStatus, type TasksState } from '../tasksSlice';
import type { WeekGroup } from '../../types/task';

const initial = reducer(undefined, { type: 'init' });

const week = (weekStart: string): WeekGroup => ({
  weekStart,
  weekEnd: weekStart,
  openTasks: 1,
  completedTasks: 0,
  totalTasks: 1,
  tasks: [],
});

const pending = (state: TasksState, requestId: string) =>
  reducer(state, { type: fetchWeeks.pending.type, meta: { requestId, arg: undefined, requestStatus: 'pending' } });
const fulfilled = (state: TasksState, requestId: string, payload: WeekGroup[]) =>
  reducer(state, { type: fetchWeeks.fulfilled.type, payload, meta: { requestId, arg: undefined, requestStatus: 'fulfilled' } });

describe('tasksSlice', () => {
  it('starts in a loading state', () => {
    expect(initial).toMatchObject({ weeks: [], loading: true, error: null, version: 0, pendingStatusIds: [] });
  });

  it('stores weeks from the latest request', () => {
    let s = pending(initial, 'a');
    s = fulfilled(s, 'a', [week('2026-11-09')]);
    expect(s.loading).toBe(false);
    expect(s.weeks.map((w) => w.weekStart)).toEqual(['2026-11-09']);
  });

  it('ignores a response from an older, slower request', () => {
    let s = pending(initial, 'old');
    s = pending(s, 'new');
    s = fulfilled(s, 'new', [week('2026-11-16')]);
    s = fulfilled(s, 'old', [week('2026-11-09')]);
    expect(s.weeks.map((w) => w.weekStart)).toEqual(['2026-11-16']);
  });

  it('keeps the error message from a failed request', () => {
    let s = pending(initial, 'a');
    s = reducer(s, {
      type: fetchWeeks.rejected.type,
      payload: { message: 'Unable to reach the server.', fieldErrors: {} },
      meta: { requestId: 'a', arg: undefined, requestStatus: 'rejected', rejectedWithValue: true },
    });
    expect(s).toMatchObject({ loading: false, error: 'Unable to reach the server.' });
  });

  it('tracks pending status changes for the checkbox spinner', () => {
    const arg = { id: 't1', status: 'Completed' as const };
    let s = reducer(initial, { type: setTaskStatus.pending.type, meta: { arg, requestId: 'r', requestStatus: 'pending' } });
    expect(s.pendingStatusIds).toEqual(['t1']);
    s = reducer(s, { type: setTaskStatus.fulfilled.type, meta: { arg, requestId: 'r', requestStatus: 'fulfilled' } });
    expect(s.pendingStatusIds).toEqual([]);
    expect(s.version).toBe(1);
  });

  it('clears the spinner when a status change fails', () => {
    const arg = { id: 't1', status: 'Completed' as const };
    let s = reducer(initial, { type: setTaskStatus.pending.type, meta: { arg, requestId: 'r', requestStatus: 'pending' } });
    s = reducer(s, { type: setTaskStatus.rejected.type, meta: { arg, requestId: 'r', requestStatus: 'rejected' } });
    expect(s.pendingStatusIds).toEqual([]);
    expect(s.version).toBe(0);
  });

  it('bumps version after create and delete so search can refetch', () => {
    let s = reducer(initial, { type: createTask.fulfilled.type });
    s = reducer(s, { type: deleteTask.fulfilled.type });
    expect(s.version).toBe(2);
  });
});
