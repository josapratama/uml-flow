import React, { useState, useRef, useEffect } from "react";
import type { DiagramType } from "@uml-editor/shared";
import { DIAGRAM_TYPES, type DiagramTypeInfo } from "../../data/starter-diagrams";
import { useI18n } from "../../i18n";

interface DiagramTypeBadgeProps {
  currentType?: string;
  onSelectType: (type: DiagramType, inNewTab?: boolean) => void;
}

export function DiagramTypeBadge({
  currentType = "class",
  onSelectType,
}: DiagramTypeBadgeProps) {
  const { locale } = useI18n();
  const isId = locale === "id";
  const [open, setOpen] = useState(false);
  const [targetType, setTargetType] = useState<DiagramType | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setTargetType(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const activeInfo =
    DIAGRAM_TYPES.find((d) => d.id === currentType) || DIAGRAM_TYPES[0];

  const handleApply = (type: DiagramType, inNewTab: boolean) => {
    onSelectType(type, inNewTab);
    setOpen(false);
    setTargetType(null);
  };

  return (
    <div ref={ref} className="relative">
      {/* Topbar Badge Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`h-8 px-2.5 text-xs font-medium rounded-lg border transition-all flex items-center gap-1.5 ${
          open
            ? "bg-accent/15 text-accent border-accent shadow-xs"
            : "bg-surface-3/80 hover:bg-surface-4 text-text border-border hover:border-accent/40"
        }`}
        title={
          isId
            ? `Tipe Diagram Aktif: ${activeInfo.label}. Klik untuk melihat info atau membuat kanvas baru.`
            : `Active Diagram Type: ${activeInfo.label}. Click for info or to switch diagram type.`
        }
      >
        <span className="text-sm shrink-0">{activeInfo.icon}</span>
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-semibold text-text truncate max-w-[120px] sm:max-w-[140px]">
            {activeInfo.label}
          </span>
          <span className="text-[9px] font-mono px-1 py-0.2 rounded font-medium bg-accent/15 text-accent uppercase hidden sm:inline">
            {isId ? "Tipe" : "Type"}
          </span>
        </div>
        <svg
          width="8"
          height="8"
          viewBox="0 0 10 10"
          className={`shrink-0 transition-transform opacity-60 ml-0.5 ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M2 3.5 L5 6.5 L8 3.5"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </button>

      {/* Popover */}
      {open && (
        <div className="absolute left-0 top-full mt-1.5 w-84 sm:w-92 bg-surface-2/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Header Info Aktif */}
          <div className="p-2.5 rounded-lg bg-surface-3/70 border border-border/60 mb-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted">
                {isId ? "Kanvas Aktif Saat Ini" : "Active Canvas"}
              </span>
              <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                ● {isId ? "AKTIF" : "ACTIVE"}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xl p-1.5 rounded-lg bg-surface-4 shrink-0">
                {activeInfo.icon}
              </span>
              <div className="min-w-0">
                <div className="text-xs font-bold text-text truncate">
                  {activeInfo.label}
                </div>
                <div className="text-[10px] text-text-muted leading-tight mt-0.5">
                  {isId ? activeInfo.descId : activeInfo.descEn}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Buat / Ganti Tipe Diagram */}
          <div className="px-1 py-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-text flex items-center gap-1.5">
                <span>✨</span>
                <span>{isId ? "Mulai Kanvas Tipe Lain" : "Start Another Diagram Type"}</span>
              </span>
              <span className="text-[10px] text-text-muted">
                {isId ? "Pilih tipe baru" : "Choose type"}
              </span>
            </div>

            {targetType ? (
              /* Konfirmasi Buka di Tab Baru atau Timpa Kanvas */
              <div className="p-2.5 rounded-lg bg-surface-3 border border-accent/40 animate-in fade-in">
                <div className="text-xs font-semibold text-text flex items-center gap-1.5 mb-1">
                  <span>⚠️</span>
                  <span>
                    {isId
                      ? `Buat diagram ${DIAGRAM_TYPES.find((d) => d.id === targetType)?.label}?`
                      : `Create ${DIAGRAM_TYPES.find((d) => d.id === targetType)?.label}?`}
                  </span>
                </div>
                <p className="text-[10px] text-text-muted mb-2.5 leading-relaxed">
                  {isId
                    ? "Pilih untuk membuka di Tab Baru agar pekerjaan Anda saat ini tetap aman, atau timpa kanvas saat ini."
                    : "Open in a new tab to preserve your current work, or replace current canvas."}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApply(targetType, true)}
                    className="flex-1 py-1.5 px-2 rounded-md bg-accent hover:bg-accent-hover text-white text-[11px] font-semibold transition-colors shadow-xs"
                  >
                    📑 {isId ? "Buka di Tab Baru" : "Open in New Tab"}
                  </button>
                  <button
                    onClick={() => handleApply(targetType, false)}
                    className="py-1.5 px-2.5 rounded-md bg-surface-4 hover:bg-error/20 hover:text-error text-text-muted text-[11px] font-medium transition-colors border border-border"
                  >
                    {isId ? "Timpa Kanvas Ini" : "Replace Current"}
                  </button>
                  <button
                    onClick={() => setTargetType(null)}
                    className="py-1.5 px-2 rounded-md text-text-muted hover:text-text text-[11px] transition-colors"
                  >
                    {isId ? "Batal" : "Cancel"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto custom-scrollbar space-y-1 pr-0.5">
                {DIAGRAM_TYPES.map((d: DiagramTypeInfo) => {
                  const isCurrent = d.id === currentType;
                  return (
                    <button
                      key={d.id}
                      onClick={() => {
                        if (isCurrent) {
                          setOpen(false);
                        } else {
                          setTargetType(d.id);
                        }
                      }}
                      className={`w-full flex items-center justify-between p-1.5 rounded-lg text-left transition-all group ${
                        isCurrent
                          ? "bg-accent/10 border border-accent/30 text-text"
                          : "hover:bg-surface-3 border border-transparent text-text-muted hover:text-text"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm p-1 rounded bg-surface-3 shrink-0">
                          {d.icon}
                        </span>
                        <div className="min-w-0">
                          <div className={`text-xs font-medium truncate ${isCurrent ? "text-accent" : "text-text"}`}>
                            {d.label}
                          </div>
                          <div className="text-[10px] text-text-muted line-clamp-1">
                            {isId ? d.descId : d.descEn}
                          </div>
                        </div>
                      </div>
                      {isCurrent ? (
                        <span className="text-[9px] font-mono text-accent font-semibold shrink-0 ml-1">
                          ✓
                        </span>
                      ) : (
                        <span className="text-[10px] text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
                          →
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
