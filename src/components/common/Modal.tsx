import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Prevent closing via backdrop / Escape (e.g. while saving). */
  dismissible?: boolean;
  /**
   * Phone (< 576px): bottom sheet that slides up on open and back down on close.
   * Desktop (>= 576px): centered dialog that pops in and fades out.
   * 'dialog' (default): rounded top corners with a drag handle.
   * 'sheet': the Figma "Add New Task" look (square corners, no handle).
   */
  variant?: 'dialog' | 'sheet';
  /** Set to true to play the slide-down animation, then `onClose` is called. */
  closing?: boolean;
}

let openModals = 0;

/** Bottom sheet on mobile, centered dialog on larger screens. */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  dismissible = true,
  variant = 'dialog',
  closing = false,
}: ModalProps) {
  const isSheet = variant === 'sheet';
  const [leaving, setLeaving] = useState(false);
  const isLeaving = leaving || closing;
  /** Close request from the X button, backdrop or Escape: slide down first, then close. */
  const requestClose = () => setLeaving(true);
  const requestCloseRef = useRef(requestClose);
  requestCloseRef.current = requestClose;
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
        requestCloseRef.current();
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

  const header = (
    <div className={isSheet ? 'flex items-center justify-between gap-4 px-6 pb-7 pt-7' : 'flex items-start justify-between gap-4 px-5 pb-2 pt-4'}>
      <div>
        <h2 id={titleId} className={isSheet ? 'text-18 font-medium leading-6.75 text-black' : 'text-lg font-semibold text-ink-900'}>
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
        onClick={requestClose}
        disabled={!dismissible}
        className={
          isSheet
            ? '-mr-1.5 p-1.5 text-black transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-blue disabled:opacity-40'
            : '-mr-2 -mt-1 rounded-md p-2 text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900 disabled:opacity-40'
        }
        aria-label="Close dialog"
      >
        <X className="size-5" strokeWidth={isSheet ? 1.75 : 2} />
      </button>
    </div>
  );

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center desktop:items-center desktop:p-6"
    >
      <div
        className={`absolute inset-0 bg-black/25 ${isLeaving ? 'animate-fade-out' : 'animate-fade-in'}`}
        onClick={() => dismissible && !isLeaving && requestClose()}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        onAnimationEnd={(e) => {
          // Unmount only after the slide-down finished (ignore animations of children).
          if (isLeaving && e.target === e.currentTarget) {
            setLeaving(false); // ready for the next open (dialogs that stay mounted, e.g. ConfirmDialog)
            onCloseRef.current();
          }
        }}
        className={`relative flex max-h-[92dvh] w-full max-w-97.5 flex-col bg-white desktop:max-h-[calc(100dvh-3rem)] desktop:max-w-120 desktop:shadow-2xl ${
          isSheet ? '' : 'rounded-t-2xl shadow-2xl desktop:rounded-xl'
        } ${
          isLeaving
            ? 'pointer-events-none animate-sheet-down desktop:animate-pop-out'
            : 'animate-sheet-up desktop:animate-pop-in'
        }`}
      >
        {!isSheet && <div className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-ink-200 desktop:hidden" aria-hidden />}
        {header}
        <div className={isSheet ? 'overflow-y-auto px-6' : 'overflow-y-auto px-5 pb-4 pt-2'}>{children}</div>
        {footer && (
          <div
            className={
              isSheet
                ? 'flex shrink-0 gap-3 px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-9'
                : 'flex shrink-0 gap-3 border-t border-ink-100 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]'
            }
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
