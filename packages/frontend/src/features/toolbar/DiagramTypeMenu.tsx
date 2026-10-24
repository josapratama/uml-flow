import React, { useState, useRef, useEffect } from "react";
import type { DiagramType } from "@uml-editor/shared";
import { DIAGRAM_TYPES, type DiagramTypeInfo } from "../../data/starter-diagrams";
import { useI18n } from "../../i18n";

interface DiagramTypeMenuProps {
  currentType?: string;
  onSelectType: (type: DiagramType) => void;
  variant?: "topbar" | "palette";
}

export function DiagramTypeMenu({
  currentType = "class",
  onSelectType,
  variant = "topbar",
}: DiagramTypeMenuProps) {
  const { locale } = useI18n();
  const isId = locale === "id";
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const activeInfo =
    DIAGRAM_TYPES.find((d) => d.id === currentType) || DIAGRAM_TYPES[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`h-8 px-2.5 text-xs font-medium rounded-lg border transition-all flex items-center ${
          variant === "palette" ? "w-full justify-between" : "gap-1.5"
        } ${
          open
            ? "bg-surface-4 text-text border-accent shadow-xs"
            : "bg-surface-3 text-text-muted hover:text-text hover:bg-surface-4 border-border"
        }`}
        title={
          isId
            ? "Pilih tipe diagram atau buat diagram baru secara visual"
            : "Choose diagram type or create new visually"
        }
      >
        <span className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm shrink-0">{activeInfo.icon}</span>
          <span
            className={`font-semibold text-text truncate ${
              variant === "palette"
                ? "max-w-[110px]"
                : "max-w-[85px] sm:max-w-[110px] xl:max-w-[140px]"
            }`}
          >
            {activeInfo.label}
          </span>
        </span>
        <svg
          width="8"
          height="8"
          viewBox="0 0 10 10"
          className={`shrink-0 transition-transform opacity-60 ${open ? "rotate-180" : ""}`}
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

      {open && (
        <div
          className={`absolute ${
            variant === "palette"
              ? "left-0 top-full mt-1.5 w-72 sm:w-80 max-h-[calc(100dvh-150px)]"
              : "left-0 sm:left-auto top-full mt-1.5 w-76 sm:w-84 max-h-[calc(100dvh-75px)]"
          } overflow-y-auto custom-scrollbar bg-surface-2/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150`}
        >
          <div className="px-3 pb-1.5 pt-0.5 border-b border-border/60">
            <div className="text-xs font-semibold text-text flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>🎨</span>
                <span>{isId ? "Tipe Diagram Visual" : "Visual Diagram Type"}</span>
              </span>
              <span className="text-[10px] font-mono text-accent bg-accent/15 px-1.5 py-0.5 rounded">
                9 Tipe
              </span>
            </div>
            <p className="text-[10px] text-text-muted mt-0.5">
              {isId
                ? "Pilih tipe untuk membuat diagram visual langsung tanpa kode:"
                : "Select a type to design visually without writing code:"}
            </p>
          </div>

          <div className="p-1 space-y-0.5">
            {DIAGRAM_TYPES.map((d: DiagramTypeInfo) => {
              const isSelected = d.id === currentType;
              return (
                <button
                  key={d.id}
                  onClick={() => {
                    onSelectType(d.id);
                    setOpen(false);
                  }}
                  className={`w-full flex items-start gap-2 p-1.5 rounded-lg text-left transition-all group ${
                    isSelected
                      ? "bg-accent/15 border border-accent/40 text-text shadow-2xs"
                      : "hover:bg-surface-3 border border-transparent text-text-muted hover:text-text"
                  }`}
                >
                  <span className="text-base p-1 rounded-md bg-surface-3/80 shrink-0 group-hover:scale-110 transition-transform">
                    {d.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-semibold text-xs truncate ${
                          isSelected ? "text-accent" : "text-text"
                        }`}
                      >
                        {d.label}
                      </span>
                      {isSelected && (
                        <span className="text-[9px] font-mono text-accent font-bold">
                          ✓ {isId ? "AKTIF" : "ACTIVE"}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-text-muted line-clamp-1 mt-0.5 leading-tight">
                      {isId ? d.descId : d.descEn}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
