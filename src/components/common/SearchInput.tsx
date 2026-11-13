import type { Ref } from 'react';
import { Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';

const shell =
  'flex h-12 w-full items-center gap-2 rounded-md border border-ink-200 bg-white pl-4 pr-2 text-sm transition-colors';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  ref?: Ref<HTMLInputElement>;
}

/** The Figma search bar: text on the left, magnifier on the right. */
export function SearchInput({ value, onChange, autoFocus, ref }: SearchInputProps) {
  return (
    <div className={`${shell} focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10`}>
      <input
        ref={ref}
        type="search"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && onChange('')}
        placeholder="Search for a task"
        aria-label="Search tasks by title or description"
        className="h-full min-w-0 flex-1 bg-transparent text-ink-900 placeholder:text-ink-400 focus:outline-none"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          className="flex size-8 items-center justify-center rounded-md text-ink-400 hover:bg-ink-100 hover:text-ink-900"
          aria-label="Clear search"
        >
          <X className="size-4" />
        </button>
      ) : (
        <Search className="mr-1.5 size-5 text-ink-700" aria-hidden />
      )}
    </div>
  );
}

/** Looks like the search bar but navigates to the search page. */
export function SearchLink({ className = '' }: { className?: string }) {
  return (
    <Link
      to="/search"
      className={`${shell} justify-between text-ink-400 hover:border-ink-400 focus-visible:outline-2 focus-visible:outline-brand-500 ${className}`}
    >
      <span>Search for a task</span>
      <Search className="mr-1.5 size-5 text-ink-700" aria-hidden />
    </Link>
  );
}
