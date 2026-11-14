import { Check } from 'lucide-react';
import { Spinner } from './Loader';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  loading?: boolean;
  disabled?: boolean;
}

/** Figma task checkbox: 20px square, 1px blue border on white, thin blue tick when done. */
export function Checkbox({ checked, onChange, label, loading = false, disabled = false }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={`flex size-5 shrink-0 items-center justify-center border border-blue bg-white transition-colors hover:bg-card-complete focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue ${
        checked ? 'text-blue' : 'text-transparent'
      }`}
    >
      {loading ? <Spinner className="size-3 text-blue" /> : <Check className="size-3.5" strokeWidth={1.75} aria-hidden />}
    </button>
  );
}
