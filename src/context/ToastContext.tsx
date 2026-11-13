import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { CircleCheck, CircleAlert, X } from 'lucide-react';

type ToastKind = 'success' | 'error';
interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);
let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const push = useCallback(
    (kind: ToastKind, message: string) => {
      const id = nextId++;
      setToasts((t) => [...t.slice(-2), { id, kind, message }]);
      window.setTimeout(() => dismiss(id), kind === 'error' ? 5000 : 3000);
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({ success: (m: string) => push('success', m), error: (m: string) => push('error', m) }),
    [push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-4 sm:top-5"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.kind === 'error' ? 'alert' : 'status'}
            className="pointer-events-auto flex w-full max-w-sm animate-toast-in items-start gap-3 rounded-lg bg-ink-900 px-4 py-3 text-sm text-white shadow-lg"
          >
            {t.kind === 'success' ? (
              <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-400" aria-hidden />
            ) : (
              <CircleAlert className="mt-0.5 size-4 shrink-0 text-red-400" aria-hidden />
            )}
            <p className="flex-1 leading-5">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="-m-1 rounded-lg p-1 text-white/60 hover:text-white"
              aria-label="Dismiss notification"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
