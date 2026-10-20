import React from "react";

export function PropRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-text-muted mb-0.5">
        {label}
      </div>
      <div className="text-xs text-text">{children}</div>
    </div>
  );
}
