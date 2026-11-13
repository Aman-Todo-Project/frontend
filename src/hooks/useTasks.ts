import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { createTask, deleteTask, fetchWeeks, setTaskStatus, updateTask } from '../store/tasksSlice';
import type { TaskInput, TaskStatus } from '../types/task';

/**
 * Task data and actions from the Redux store.
 * Actions return promises that reject with an `ApiFailure` ({ message, fieldErrors }).
 */
export function useTasks() {
  const dispatch = useAppDispatch();
  const { weeks, loading, error, version, pendingStatusIds } = useAppSelector((s) => s.tasks);

  const pending = useMemo(() => new Set(pendingStatusIds), [pendingStatusIds]);

  const refresh = useCallback(() => dispatch(fetchWeeks()), [dispatch]);
  const create = useCallback((input: TaskInput) => dispatch(createTask(input)).unwrap(), [dispatch]);
  const update = useCallback(
    (id: string, input: Partial<TaskInput>) => dispatch(updateTask({ id, input })).unwrap(),
    [dispatch]
  );
  const setStatus = useCallback(
    (id: string, status: TaskStatus) => dispatch(setTaskStatus({ id, status })).unwrap(),
    [dispatch]
  );
  const remove = useCallback((id: string) => dispatch(deleteTask(id)).unwrap(), [dispatch]);

  return {
    weeks,
    loading,
    error,
    version,
    pendingStatusIds: pending,
    refresh,
    createTask: create,
    updateTask: update,
    setTaskStatus: setStatus,
    deleteTask: remove,
  };
}
