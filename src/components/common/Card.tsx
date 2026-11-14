import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: "div" | "section" | "article";
  /** Flat on phones (like the Figma), boxed panel on large screens. */
  flatOnMobile?: boolean;
  children: ReactNode;
}

export function Card({
  as: Tag = "div",
  flatOnMobile = false,
  className = "",
  children,
  ...rest
}: CardProps) {
  const style = flatOnMobile
    ? "lg:rounded-xl lg:border lg:border-ink-100 lg:bg-white lg:p-5 lg:shadow-card"
    : "rounded-xl border border-ink-100 bg-white";
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
    <div className="mb-[3px] flex items-baseline justify-between gap-3">
      <h2
        id={id}
        className="truncate text-18 font-semibold leading-6.75 text-text-placeholder"
      >
        {title}
      </h2>
      {action}
    </div>
  );
}
