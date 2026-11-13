import type { InputHTMLAttributes, ReactNode, Ref, TextareaHTMLAttributes } from 'react';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
}

export function FormField({ label, htmlFor, required, hint, error, children }: FormFieldProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label htmlFor={htmlFor} className="text-xs font-medium text-ink-500">
          {label}
          {required && (
            <span className="ml-0.5 text-red-500" aria-hidden>
              *
            </span>
          )}
        </label>
        {hint && <span className="text-xs text-ink-400">{hint}</span>}
      </div>
      {children}
      {error && (
        <p id={`${htmlFor}-error`} className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

const fieldBase =
  'w-full rounded-md border bg-white text-sm text-ink-900 placeholder:text-ink-400 transition-colors focus:outline-none focus:ring-4 disabled:bg-ink-100';
const fieldState = (error?: string) =>
  error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : 'border-ink-200 focus:border-brand-500 focus:ring-brand-500/10';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  ref?: Ref<HTMLInputElement>;
}

export function Input({ error, leftIcon, rightIcon, className = '', id, ref, ...rest }: InputProps) {
  return (
    <div className="relative">
      {leftIcon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 [&>svg]:size-4">{leftIcon}</span>
      )}
      <input
        ref={ref}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error && id ? `${id}-error` : undefined}
        className={`${fieldBase} ${fieldState(error)} h-11 ${leftIcon ? 'pl-9' : 'pl-3.5'} ${rightIcon ? 'pr-10' : 'pr-3'} ${className}`}
        {...rest}
      />
      {rightIcon && <span className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center text-ink-400">{rightIcon}</span>}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export function Textarea({ error, className = '', id, ...rest }: TextareaProps) {
  return (
    <textarea
      id={id}
      aria-invalid={Boolean(error)}
      aria-describedby={error && id ? `${id}-error` : undefined}
      className={`${fieldBase} ${fieldState(error)} resize-none px-3.5 py-2.5 ${className}`}
      {...rest}
    />
  );
}
