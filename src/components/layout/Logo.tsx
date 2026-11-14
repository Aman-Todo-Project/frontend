import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

export function Logo() {
  return (
    <Link to="/tasks" className="flex shrink-0 items-center gap-2.5" aria-label="TaskFlow home">
      <span className="flex size-9 items-center justify-center rounded-md bg-brand-600 text-white">
        <Check className="size-5" strokeWidth={3} aria-hidden />
      </span>
      <span className="text-lg font-semibold tracking-tight text-ink-900">
        Task<span className="text-brand-600">Flow</span>
      </span>
    </Link>
  );
}
