import type { Ref } from 'react';
import { X } from 'lucide-react';
import searchIcon from '../../assets/images/Search.png';

// Figma search bar: 47px tall, 1px #E6E6E6 border, 3px corners, 12px placeholder, magnifier on the right.
const shell =
  'flex h-11.75 w-full items-center gap-2 rounded-[3px] border border-border-input bg-white pl-4.75 pr-3 text-12 transition-colors';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  onFocus?: () => void;
  /** Escape on an empty field (Escape first clears the text). */
  onEscape?: () => void;
  ref?: Ref<HTMLInputElement>;
}

export function SearchInput({ value, onChange, autoFocus, onFocus, onEscape, ref }: SearchInputProps) {
  return (
    <div className={`${shell} focus-within:border-blue`}>
      <input
        ref={ref}
        type="search"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onKeyDown={(e) => {
          if (e.key !== 'Escape') return;
          e.preventDefault();
          if (value) onChange('');
          else onEscape?.();
        }}
        placeholder="Search for a task"
        aria-label="Search tasks by title or description"
        className="h-full min-w-0 flex-1 bg-transparent text-text-placeholder placeholder:text-text-muted focus:outline-none"
      />
      {value ? (
        <button
          type="button"
          // Keep focus in the field so the keyboard stays open after clearing.
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="-mr-1 flex size-8 shrink-0 items-center justify-center text-text-placeholder transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-blue"
        >
          <X className="size-5" strokeWidth={1.75} />
        </button>
      ) : (
        <img src={searchIcon} alt="" aria-hidden className="size-6 shrink-0" />
      )}
    </div>
  );
}
