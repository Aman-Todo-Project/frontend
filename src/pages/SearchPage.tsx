import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, SearchX } from 'lucide-react';
import { AppHeader } from '../components/layout/AppHeader';
import { Card } from '../components/common/Card';
import { IconButton } from '../components/common/Button';
import { InlineLoader, Spinner } from '../components/common/Loader';
import { SearchInput } from '../components/common/SearchInput';
import { EmptyState, ErrorState } from '../components/common/States';
import { TaskList } from '../components/tasks/TaskItem';
import { useDebounce } from '../hooks/useDebounce';
import { useTaskSearch } from '../hooks/useTaskSearch';

/** Search screen from the Figma: back arrow, search field, matching tasks. */
export default function SearchPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const debounced = useDebounce(query.trim(), 350);
  const { results, loading, error, retry } = useTaskSearch(debounced);

  const setQuery = (value: string) => setParams(value ? { q: value } : {}, { replace: true });
  const goBack = () => ((window.history.state?.idx ?? 0) > 0 ? navigate(-1) : navigate('/'));

  let body;
  if (!debounced) {
    body = (
      <EmptyState icon={<Search />} title="Search your tasks" description="Type a word from a task's title or description." />
    );
  } else if (error) {
    body = <ErrorState message={error} onRetry={retry} />;
  } else if (loading && results.length === 0) {
    body = <InlineLoader label="Searching…" />;
  } else if (results.length === 0) {
    body = (
      <EmptyState
        icon={<SearchX />}
        title="No matching tasks"
        description={`Nothing found for “${debounced}”. Try a different keyword.`}
      />
    );
  } else {
    body = (
      <>
        <p className="flex items-center gap-2 text-xs text-ink-500" aria-live="polite">
          {results.length} {results.length === 1 ? 'result' : 'results'} for “{debounced}”
          {loading && <Spinner className="size-3.5" />}
        </p>
        <TaskList tasks={results} />
      </>
    );
  }

  return (
    <div className="min-h-dvh">
      <div className="hidden lg:block">
        <AppHeader showSearch={false} />
      </div>
      <main className="mx-auto max-w-2xl px-4 pb-16 pt-4 sm:px-6 lg:pt-8">
        <Card flatOnMobile>
          <div className="flex items-center gap-2">
            <IconButton label="Go back" onClick={goBack} className="-ml-2 text-ink-900">
              <ArrowLeft className="size-5" />
            </IconButton>
            <div className="flex-1">
              <SearchInput value={query} onChange={setQuery} autoFocus />
            </div>
          </div>
          <div className="mt-4">{body}</div>
        </Card>
      </main>
    </div>
  );
}
