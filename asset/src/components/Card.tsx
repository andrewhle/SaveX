import type { ReactNode } from "react";

type CardProps = Readonly<{
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}>;

export function Card({ title, action, children, className = "" }: CardProps) {
  return (
    <section
      className={`flex flex-col rounded-2xl border border-border bg-surface p-5 ${className}`}
    >
      <header className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {action ? <span className="text-xs text-muted">{action}</span> : null}
      </header>
      <div className="flex flex-1 flex-col justify-center py-6">{children}</div>
    </section>
  );
}
