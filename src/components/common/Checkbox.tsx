import { Check } from 'lucide-react';
import { Spinner } from './Loader';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  loading?: boolean;
  disabled?: boolean;
}

/** Square checkbox from the Figma task list. */
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
      className={`flex size-5 shrink-0 items-center justify-center rounded-[4px] border-[1.5px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${
        checked ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink-400 bg-white text-transparent hover:border-brand-500'
      }`}
    >
      {loading ? (
        <Spinner className={`size-3 ${checked ? 'text-white' : ''}`} />
      ) : (
        <Check className="size-3.5" strokeWidth={3} aria-hidden />
      )}
    </button>
  );
}
