import React from "react";

export * from "./DocCallout";
export * from "./DocCodeBlock";
export * from "./DocSyntaxTable";

export function Section({
  id,
  title,
  icon,
  badge,
  children,
}: {
  id: string;
  title: string;
  icon?: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-20 scroll-mt-20">
      <div className="flex items-center justify-between pb-3 mb-6 border-b border-border/80">
        <h2 className="text-xl sm:text-2xl font-extrabold text-text flex items-center gap-2.5">
          {icon && <span className="text-xl">{icon}</span>}
          <span>{title}</span>
        </h2>
        {badge && (
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30">
            {badge}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

export function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base sm:text-lg font-bold mt-7 mb-2.5 text-text flex items-center gap-2">
      <span className="w-1.5 h-4 rounded-full bg-accent inline-block" />
      <span>{children}</span>
    </h3>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs sm:text-sm text-text-muted mb-3.5 leading-relaxed">
      {children}
    </p>
  );
}

export function B({ children }: { children: React.ReactNode }) {
  return <strong className="text-text font-semibold">{children}</strong>;
}

export function Ul({ children }: { children: React.ReactNode }) {
  return (
    <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-text-muted mb-4 ml-2 marker:text-accent">
      {children}
    </ul>
  );
}

export function Ol({ children }: { children: React.ReactNode }) {
  return (
    <ol className="list-decimal list-inside space-y-1.5 text-xs sm:text-sm text-text-muted mb-4 ml-2 marker:font-bold marker:text-accent">
      {children}
    </ol>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="px-1.5 py-0.5 text-[11px] font-mono font-medium rounded bg-surface-3 border border-border text-text shadow-2xs">
      {children}
    </kbd>
  );
}
