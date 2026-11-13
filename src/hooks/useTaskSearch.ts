import { useEffect, useState } from 'react';
import { taskService } from '../services/taskService';
import type { Task } from '../types/task';
import { getErrorMessage, isAbortError } from '../utils/errors';
import { useTasks } from './useTasks';

interface SearchState {
  results: Task[];
  loading: boolean;
  error: string | null;
}

/** Runs a search for `query` and re-runs it whenever tasks change. */
export function useTaskSearch(query: string) {
  const { version } = useTasks();
  const [state, setState] = useState<SearchState>({ results: [], loading: false, error: null });
  const [retryKey, setRetryKey] = useState(0);
  const q = query.trim();

  useEffect(() => {
    if (!q) {
      setState({ results: [], loading: false, error: null });
      return;
    }
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    taskService
      .search(q, controller.signal)
      .then((results) => setState({ results, loading: false, error: null }))
      .catch((err) => {
        if (!isAbortError(err)) setState({ results: [], loading: false, error: getErrorMessage(err) });
      });
    return () => controller.abort();
  }, [q, version, retryKey]);

  return { ...state, retry: () => setRetryKey((k) => k + 1) };
}
