import { createPortal } from 'react-dom';
import { Check, LoaderCircle } from 'lucide-react';

export function Spinner({ className = 'size-5' }: { className?: string }) {
  return <LoaderCircle className={`animate-spin text-brand-600 ${className}`} aria-hidden />;
}

/** Full-screen loader, used while a lazy page is downloading. */
export function PageLoader({ label = 'Loading TaskFlow…' }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-white">
      <span className="flex size-14 items-center justify-center rounded-xl bg-brand-600 text-white shadow-float">
        <Check className="size-7" strokeWidth={3} aria-hidden />
      </span>
      <div className="h-1 w-28 overflow-hidden rounded-full bg-brand-100" aria-hidden>
        <div className="h-full w-1/3 animate-loader-bar rounded-full bg-brand-600" />
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}

/** Centered spinner with optional text, for sections that are loading. */
export function InlineLoader({ label }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-10 text-sm text-ink-500">
      <Spinner />
      {label ?? <span className="sr-only">Loading…</span>}
      {label && <span>{label}</span>}
    </div>
  );
}

/** Dimmed overlay with a spinner, shown while a lazy dialog is downloading. */
export function OverlayLoader() {
  return createPortal(
    <div role="status" className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-ink-900/30">
      <span className="flex size-14 items-center justify-center rounded-xl bg-white shadow-card">
        <Spinner className="size-6" />
      </span>
      <span className="sr-only">Loading…</span>
    </div>,
    document.body
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-ink-100 ${className}`} aria-hidden />;
}
