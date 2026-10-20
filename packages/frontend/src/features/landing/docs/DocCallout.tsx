import React from "react";

export type CalloutType = "tip" | "note" | "important" | "academic";

interface DocCalloutProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}

export function DocCallout({ type = "note", title, children }: DocCalloutProps) {
  const configs = {
    tip: {
      border: "border-emerald-500/40 bg-emerald-500/5",
      badgeBg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      icon: "💡",
      defaultTitle: "Tips Praktis",
    },
    note: {
      border: "border-indigo-500/40 bg-indigo-500/5",
      badgeBg: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
      icon: "ℹ️",
      defaultTitle: "Catatan",
    },
    important: {
      border: "border-amber-500/40 bg-amber-500/5",
      badgeBg: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      icon: "⚠️",
      defaultTitle: "Penting",
    },
    academic: {
      border: "border-purple-500/40 bg-purple-500/5",
      badgeBg: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      icon: "🎓",
      defaultTitle: "Standar Skripsi / Akademik",
    },
  };

  const c = configs[type];

  return (
    <div
      className={`my-4 p-4 rounded-xl border ${c.border} text-xs sm:text-sm text-text-muted leading-relaxed relative overflow-hidden backdrop-blur-xs`}
    >
      <div className="flex items-center gap-2 mb-2 font-semibold text-text">
        <span className="text-base">{c.icon}</span>
        <span
          className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${c.badgeBg}`}
        >
          {title || c.defaultTitle}
        </span>
      </div>
      <div>{children}</div>
    </div>
  );
}
