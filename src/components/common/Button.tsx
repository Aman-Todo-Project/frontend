import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Spinner } from './Loader';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'link';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700',
  secondary: 'bg-white text-ink-700 ring-1 ring-inset ring-ink-200 hover:bg-ink-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-ink-700 hover:bg-ink-100',
  link: 'text-brand-600 hover:text-brand-700 hover:underline underline-offset-4 !px-0 !h-auto',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-4 text-sm gap-2',
  lg: 'h-12 px-5 text-[15px] gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  className = '',
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {loading ? <Spinner className={`size-4 ${variant === 'primary' || variant === 'danger' ? 'text-white' : ''}`} /> : icon}
      {children}
    </button>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  tone?: 'default' | 'danger';
}

export function IconButton({ label, tone = 'default', className = '', children, type = 'button', ...rest }: IconButtonProps) {
  const toneCls =
    tone === 'danger' ? 'text-ink-400 hover:bg-danger-50 hover:text-red-600' : 'text-ink-400 hover:bg-ink-100 hover:text-ink-900';
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`inline-flex size-9 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-brand-500 disabled:opacity-50 ${toneCls} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
