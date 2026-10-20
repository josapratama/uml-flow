import React from "react";
import type { DiagramType } from "@uml-editor/shared";
import type { CanvasTheme } from "../../hooks/useTheme";
import { DIAGRAM_TYPES, type DiagramTypeInfo } from "../../data/starter-diagrams";
import { useI18n } from "../../i18n";

interface CanvasEmptyStateProps {
  canvasTheme: CanvasTheme;
  onCreateNewDiagram?: (type: DiagramType) => void;
}

export function CanvasEmptyState({
  canvasTheme,
  onCreateNewDiagram,
}: CanvasEmptyStateProps) {
  const { locale } = useI18n();
  const isId = locale === "id";
  const isDark = canvasTheme === "dark";

  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center p-6 overflow-y-auto transition-colors duration-200 ${
        isDark ? "bg-[#12121f] text-slate-400" : "bg-[#f8fafc] text-slate-500"
      }`}
    >
      <div className="max-w-2xl w-full text-center">
        {/* Header Icon */}
        <div
          className={`w-12 h-12 mx-auto mb-3 rounded-2xl flex items-center justify-center border shadow-sm ${
            isDark
              ? "bg-[#1f1f33] border-slate-700/60 text-accent"
              : "bg-white border-slate-200 text-accent"
          }`}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="8" y="14" width="7" height="7" rx="1.5" />
          </svg>
        </div>

        <h2
          className={`text-base font-bold mb-1 ${
            isDark ? "text-slate-100" : "text-slate-800"
          }`}
        >
          {isId
            ? "Mulai Mendesain Diagram Secara Visual"
            : "Start Designing Visually"}
        </h2>
        <p className="text-xs text-text-muted mb-6 max-w-md mx-auto">
          {isId
            ? "Pilih tipe diagram di bawah ini untuk langsung membuat dan mengedit kanvas visual tanpa harus menulis kode atau menggunakan contoh:"
            : "Choose a diagram type below to begin editing visually without writing DSL code or loading samples:"}
        </p>

        {/* 9 Starter Diagram Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-left">
          {DIAGRAM_TYPES.map((d: DiagramTypeInfo) => (
            <button
              key={d.id}
              onClick={() => onCreateNewDiagram?.(d.id)}
              className={`p-3 rounded-xl border text-left transition-all group flex flex-col justify-between ${
                isDark
                  ? "bg-[#181829] hover:bg-[#202038] border-slate-800 hover:border-accent/50 shadow-xs"
                  : "bg-white hover:bg-slate-50 border-slate-200 hover:border-accent/40 shadow-xs"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl p-1.5 rounded-lg bg-surface-3 group-hover:scale-110 transition-transform">
                  {d.icon}
                </span>
                <div>
                  <h4
                    className={`text-xs font-bold group-hover:text-accent transition-colors ${
                      isDark ? "text-slate-200" : "text-slate-800"
                    }`}
                  >
                    {d.label}
                  </h4>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-accent font-semibold">
                    {d.category}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-text-muted line-clamp-2 leading-relaxed">
                {isId ? d.descId : d.descEn}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
