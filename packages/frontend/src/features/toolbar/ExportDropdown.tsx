import React, { useState, useRef, useEffect } from "react";

interface ExportOption {
  id: string;
  label: string;
  icon: string;
  description: string;
  category: "doc" | "image" | "code";
  requiredType?: "class" | "erd" | "state";
}

const EXPORT_OPTIONS: ExportOption[] = [
  // --- Dokumen & Skripsi ---
  {
    id: "pdf",
    label: "PDF Dokumen (A4)",
    icon: "📄",
    description: "Format A4 siap cetak dengan caption",
    category: "doc",
  },
  {
    id: "academic-caption",
    label: "Format Naskah Skripsi",
    icon: "🎓",
    description: "Salin narasi & caption Bab Skripsi",
    category: "doc",
  },

  // --- Gambar Visual ---
  {
    id: "png",
    label: "PNG Image (2x)",
    icon: "🖼️",
    description: "Raster resolusi tinggi (retina)",
    category: "image",
  },
  {
    id: "svg",
    label: "SVG Vector",
    icon: "📐",
    description: "Grafik vektor tajam tanpa pecah",
    category: "image",
  },

  // --- Kode & Skema Database ---
  {
    id: "sql",
    label: "SQL DDL Schema",
    icon: "🗄️",
    description: "CREATE TABLE DDL database",
    category: "code",
    requiredType: "erd",
  },
  {
    id: "typescript",
    label: "TypeScript Interface",
    icon: "🔷",
    description: "Interface & Class models",
    category: "code",
    requiredType: "class",
  },
  {
    id: "java",
    label: "Java Classes",
    icon: "☕",
    description: "POJO class & attributes",
    category: "code",
    requiredType: "class",
  },
  {
    id: "xstate",
    label: "XState Machine",
    icon: "⚙️",
    description: "XState v5 state machine",
    category: "code",
    requiredType: "state",
  },
  {
    id: "dsl",
    label: "UML DSL Code",
    icon: "📝",
    description: "Source code UML Flow",
    category: "code",
  },
  {
    id: "json",
    label: "JSON Model",
    icon: "📋",
    description: "Data model AST diagram",
    category: "code",
  },
];

interface Props {
  onExport: (format: string) => void;
  disabled?: boolean;
  diagramType?: string;
}

export function ExportDropdown({ onExport, disabled, diagramType }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
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

  const renderGroup = (
    title: string,
    badge: string,
    category: "doc" | "image" | "code",
  ) => {
    const items = EXPORT_OPTIONS.filter((opt) => opt.category === category);
    if (items.length === 0) return null;

    return (
      <div className="space-y-0.5">
        <div className="px-2.5 pt-2 pb-1 flex items-center justify-between text-[10px] uppercase tracking-wider text-text-muted font-semibold">
          <span>{title}</span>
          <span className="text-[9px] lowercase font-normal opacity-70">
            {badge}
          </span>
        </div>
        {items.map((opt) => {
          const isDisabled =
            opt.requiredType !== undefined && opt.requiredType !== diagramType;

          return (
            <button
              key={opt.id}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-colors text-xs group ${
                isDisabled
                  ? "opacity-35 cursor-not-allowed"
                  : "hover:bg-surface-3 active:scale-[0.99]"
              }`}
              onClick={() => {
                if (!isDisabled) {
                  onExport(opt.id);
                  setOpen(false);
                }
              }}
              title={
                isDisabled
                  ? `Khusus diagram ${opt.requiredType?.toUpperCase()}`
                  : opt.description
              }
              disabled={isDisabled}
            >
              <span className="w-6 h-6 rounded-md bg-surface-3/80 group-hover:bg-surface-4 flex items-center justify-center shrink-0 text-sm shadow-2xs">
                {opt.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-text group-hover:text-accent transition-colors flex items-center gap-1.5">
                  <span className="truncate">{opt.label}</span>
                  {isDisabled && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-surface-4 text-text-muted font-normal shrink-0">
                      {opt.requiredType} only
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-text-muted truncate">
                  {opt.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div ref={ref} className="relative">
      <button
        className={`h-8 px-2.5 text-xs font-medium rounded-lg border transition-all flex items-center gap-1.5 disabled:opacity-35 disabled:cursor-not-allowed ${
          open
            ? "bg-surface-4 text-text border-accent shadow-xs"
            : "bg-surface-3 text-text-muted hover:text-text hover:bg-surface-4 border-border"
        }`}
        onClick={() => setOpen(!open)}
        disabled={disabled}
        title="Export diagram as image, code, or data"
      >
        <span>📥</span>
        <span className="hidden 2xl:inline">Export</span>
        <svg
          width="8"
          height="8"
          viewBox="0 0 10 10"
          className={`transition-transform opacity-60 ${open ? "rotate-180" : ""}`}
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
        <div className="absolute right-0 top-full mt-1.5 w-76 max-h-[min(560px,calc(100vh-80px))] flex flex-col bg-surface-2/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150 overflow-hidden">
          {/* Header */}
          <div className="px-3 py-2 border-b border-border/60 flex items-center justify-between shrink-0 bg-surface-1/40">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">📥</span>
              <span className="text-xs font-semibold text-text">Export & Bagikan</span>
            </div>
            {diagramType && (
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-surface-3 text-accent border border-border/50">
                {diagramType}
              </span>
            )}
          </div>

          {/* Scrollable Grouped Items */}
          <div className="overflow-y-auto flex-1 p-1.5 space-y-1.5 custom-scrollbar">
            {renderGroup("Dokumen & Skripsi", "akademik", "doc")}
            <div className="h-px bg-border/40 mx-2" />
            {renderGroup("Gambar & Visual", "grafis", "image")}
            <div className="h-px bg-border/40 mx-2" />
            {renderGroup("Kode & Database", "skema/dsl", "code")}
          </div>

          {/* Quick Clipboard Action Bar (Sticky Footer) */}
          <div className="border-t border-border/60 bg-surface-3/30 p-2 shrink-0">
            <div className="text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-1.5 px-0.5 flex items-center justify-between">
              <span>⚡ Salin Cepat</span>
              <span className="text-[9px] lowercase font-normal">clipboard</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  onExport("clipboard-png");
                  setOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-4 border border-border/70 text-xs font-medium text-text hover:border-accent transition-all active:scale-95 shadow-2xs"
                title="Salin gambar PNG resolusi tinggi ke clipboard"
              >
                <span>🖼️</span>
                <span>Salin PNG</span>
              </button>
              <button
                onClick={() => {
                  onExport("clipboard-svg");
                  setOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-4 border border-border/70 text-xs font-medium text-text hover:border-accent transition-all active:scale-95 shadow-2xs"
                title="Salin kode vektor SVG ke clipboard"
              >
                <span>📎</span>
                <span>Salin SVG</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
