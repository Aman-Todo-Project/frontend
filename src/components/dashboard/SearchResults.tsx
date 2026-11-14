import { Spinner } from '../common/Loader';
import { ErrorState } from '../common/States';
import { TaskList } from '../tasks/TaskItem';
import { useDebounce } from '../../hooks/useDebounce';
import { useTaskSearch } from '../../hooks/useTaskSearch';

/**
 * Suggestions under the dashboard search bar (Figma search state): matching tasks as
 * checkbox + title rows, updated as the user types.
 */
export function SearchResults({ query }: { query: string }) {
  const debounced = useDebounce(query.trim(), 250);
  const { results, loading, error, retry } = useTaskSearch(debounced);
  // Still typing, or waiting for the first response for this query.
  const pending = query.trim() !== debounced || (loading && results.length === 0);

  if (!query.trim()) {
    return <p className="mt-6.5 text-12 text-text-muted">Type a word from a task's title or description.</p>;
  }
  if (error) {
    return (
      <div className="mt-6.5">
        <ErrorState message={error} onRetry={retry} />
      </div>
    );
  }
  if (pending && results.length === 0) {
    return (
      <p className="mt-6.5 flex items-center gap-2 text-12 text-text-muted" role="status">
        <Spinner className="size-3.5" /> Searching…
      </p>
    );
  }
  if (results.length === 0) {
    return (
      <p className="mt-6.5 text-12 text-text-muted" role="status">
        No tasks match “{debounced}”.
      </p>
    );
  }
  return (
    <section aria-label="Search results" className="mt-1.75">
      <p className="sr-only" role="status">
        {results.length} {results.length === 1 ? 'task' : 'tasks'} found
      </p>
      <TaskList tasks={results} checkOnly />
    </section>
  );
}
