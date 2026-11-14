import type { Ref } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import searchIcon from '../../assets/images/Search.png';

// Figma search bar: 47px tall, 1px #E6E6E6 border, 3px corners, 12px placeholder, magnifier on the right.
const shell =
  'flex h-11.75 w-full items-center gap-2 rounded-[3px] border border-border-input bg-white pl-4.75 pr-3 text-12 transition-colors';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  ref?: Ref<HTMLInputElement>;
}

export function SearchInput({ value, onChange, autoFocus, ref }: SearchInputProps) {
  return (
    <div className={`${shell} focus-within:border-blue focus-within:ring-4 focus-within:ring-blue/10`}>
      <input
        ref={ref}
        type="search"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && onChange('')}
        placeholder="Search for a task"
        aria-label="Search tasks by title or description"
        className="h-full min-w-0 flex-1 bg-transparent text-text-placeholder placeholder:text-text-muted focus:outline-none"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          className="flex size-8 items-center justify-center rounded-md text-text-muted hover:bg-ink-100 hover:text-text-placeholder"
          aria-label="Clear search"
        >
          <X className="size-4" />
        </button>
      ) : (
        <img src={searchIcon} alt="" aria-hidden className="size-6" />
      )}
    </div>
  );
}

/** Looks like the search bar but navigates to the search page. */
export function SearchLink({ className = '' }: { className?: string }) {
  return (
    <Link
      to="/search"
      className={`${shell} justify-between text-text-muted hover:border-text-day focus-visible:outline-2 focus-visible:outline-blue ${className}`}
    >
      <span>Search for a task</span>
      <img src={searchIcon} alt="" aria-hidden className="size-6" />
    </Link>
  );
}
