import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md';
  /** Prevent closing via backdrop / Escape (e.g. while saving). */
  dismissible?: boolean;
}

let openModals = 0;

/** Bottom sheet on mobile, centered dialog on larger screens. */
export function Modal({ open, onClose, title, description, children, footer, size = 'md', dismissible = true }: ModalProps) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const dismissibleRef = useRef(dismissible);
  dismissibleRef.current = dismissible;
  /** The element that opened the dialog; focus goes back to it on close. */
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    // If focus is already inside the dialog (StrictMode re-run), keep the original opener.
    if (!panel?.contains(document.activeElement)) openerRef.current = document.activeElement as HTMLElement | null;
    const previouslyFocused = openerRef.current;
    openModals += 1;
    document.body.style.overflow = 'hidden';

    const initialFocus =
      panel?.querySelector<HTMLElement>('[data-autofocus]') ?? panel?.querySelector<HTMLElement>('input, textarea, select, button');
    initialFocus?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissibleRef.current) {
        e.stopPropagation();
        onCloseRef.current();
      }
      if (e.key === 'Tab' && panel) {
        const focusables = panel.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    panel?.addEventListener('keydown', onKeyDown);

    return () => {
      panel?.removeEventListener('keydown', onKeyDown);
      openModals -= 1;
      if (openModals === 0) document.body.style.overflow = '';
      // Return focus only once the dialog has really left the page. React's StrictMode
      // re-runs effects while the dialog stays open; stealing focus then would "blur"
      // the first field and make Formik show its error before the user typed anything.
      setTimeout(() => {
        if (!panel?.isConnected) previouslyFocused?.focus?.();
      });
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="absolute inset-0 animate-fade-in bg-ink-900/40 backdrop-blur-[2px]"
        onClick={() => dismissible && onClose()}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className={`relative flex max-h-[92dvh] w-full animate-sheet-up flex-col rounded-t-2xl bg-white shadow-2xl sm:animate-pop-in sm:rounded-xl ${
          size === 'sm' ? 'sm:max-w-sm' : 'sm:max-w-lg'
        }`}
      >
        <div className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-ink-200 sm:hidden" aria-hidden />
        <div className="flex items-start justify-between gap-4 px-5 pb-2 pt-4 sm:px-6 sm:pt-6">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-ink-900">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-1 text-sm text-ink-500">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={!dismissible}
            className="-mr-2 -mt-1 rounded-md p-2 text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900 disabled:opacity-40"
            aria-label="Close dialog"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-4 pt-2 sm:px-6">{children}</div>
        {footer && (
          <div className="flex shrink-0 gap-3 border-t border-ink-100 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
