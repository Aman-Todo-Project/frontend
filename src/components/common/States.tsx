import type { ReactNode } from 'react';
import { CloudOff, RotateCw } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
}

export function EmptyState({ icon, title, description, action, compact = false }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center text-center ${compact ? 'py-8' : 'py-14'}`}>
      <div className="flex size-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 [&>svg]:size-6">{icon}</div>
      <h3 className="mt-4 text-sm font-semibold text-ink-900">{title}</h3>
      {description && <p className="mt-1 max-w-xs text-sm text-ink-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <EmptyState
      icon={<CloudOff />}
      title="Couldn't load your tasks"
      description={message}
      action={
        <Button variant="secondary" icon={<RotateCw className="size-4" />} onClick={onRetry}>
          Try again
        </Button>
      }
    />
  );
}
