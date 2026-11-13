import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section' | 'article';
  /** Flat on phones (like the Figma), boxed panel on large screens. */
  flatOnMobile?: boolean;
  children: ReactNode;
}

export function Card({ as: Tag = 'div', flatOnMobile = false, className = '', children, ...rest }: CardProps) {
  const style = flatOnMobile
    ? 'lg:rounded-xl lg:border lg:border-ink-100 lg:bg-white lg:p-5 lg:shadow-card'
    : 'rounded-xl border border-ink-100 bg-white';
  return (
    <Tag className={`${style} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

interface SectionHeaderProps {
  id?: string;
  title: string;
  action?: ReactNode;
}

export function SectionHeader({ id, title, action }: SectionHeaderProps) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 id={id} className="truncate text-base font-semibold text-ink-900">
        {title}
      </h2>
      {action}
    </div>
  );
}
