import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Compass className="size-6" aria-hidden />
      </span>
      <h1 className="mt-4 text-2xl font-semibold text-ink-900">Page not found</h1>
      <p className="mt-1 text-sm text-ink-500">The page you're looking for doesn't exist.</p>
      <Link
        to="/tasks"
        className="mt-6 inline-flex h-11 items-center rounded-md bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Back to my tasks
      </Link>
    </main>
  );
}
