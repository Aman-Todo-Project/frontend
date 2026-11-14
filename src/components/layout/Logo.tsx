import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

export function Logo() {
  return (
    <Link to="/tasks" className="flex shrink-0 items-center gap-2.5" aria-label="TaskFlow home">
      <span className="flex size-9 items-center justify-center bg-blue text-white">
        <Check className="size-5" strokeWidth={3} aria-hidden />
      </span>
      <span className="text-18 font-semibold tracking-tight text-text-placeholder">
        Task<span className="text-blue">Flow</span>
      </span>
    </Link>
  );
}
