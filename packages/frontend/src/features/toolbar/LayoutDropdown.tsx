import React, { useState, useRef, useEffect } from "react";

interface Props {
  onLayout: (preset: string) => void;
  disabled?: boolean;
}

const PRESETS = [
  {
    id: "auto",
    label: "Auto (Smart)",
    icon: "✨",
    desc: "Best layout for diagram type",
  },
  {
    id: "layered",
    label: "Layered (Hierarchy)",
    icon: "📊",
    desc: "Top-down with ranks",
  },
  {
    id: "force",
    label: "Force-directed",
    icon: "🌐",
    desc: "Organic spring layout",
  },
  {
    id: "radial",
    label: "Radial",
    icon: "🎯",
    desc: "Center outward in rings",
  },
  { id: "grid", label: "Grid", icon: "⊞", desc: "Uniform grid arrangement" },
  {
    id: "linear",
    label: "Linear (Vertical)",
    icon: "📋",
    desc: "Stacked top to bottom",
  },
];

export function LayoutDropdown({ onLayout, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        className="px-1.5 py-1 bg-surface-3 text-text-muted text-[11px] border border-border rounded hover:bg-surface-4 hover:text-text transition-colors disabled:opacity-30 flex items-center gap-1"
        onClick={() => setOpen(!open)}
        disabled={disabled}
        title="Re-layout diagram"
      >
        📐
        <svg
          width="8"
          height="8"
          viewBox="0 0 10 10"
          fill="currentColor"
          className="opacity-50"
        >
          <path
            d="M2 4 L5 7 L8 4"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-52 bg-surface-2 border border-border rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-border">
            <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">
              Re-layout
            </span>
          </div>
          {PRESETS.map((p) => (
            <button
              key={p.id}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-surface-3 transition-colors"
              onClick={() => {
                onLayout(p.id);
                setOpen(false);
              }}
            >
              <span className="text-sm">{p.icon}</span>
              <div>
                <div className="text-[11px] text-text font-medium">
                  {p.label}
                </div>
                <div className="text-[9px] text-text-muted">{p.desc}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
