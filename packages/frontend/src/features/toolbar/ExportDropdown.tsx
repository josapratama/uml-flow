import React, { useState, useRef, useEffect } from "react";
import { useI18n, type Locale } from "../../i18n";

interface ExportOption {
  id: string;
  label: string;
  icon: string;
  description: string;
  category: "doc" | "image" | "code";
  requiredType?: "class" | "erd" | "state";
}

function getExportOptions(locale: Locale): ExportOption[] {
  const isId = locale === "id";
  return [
    // --- Dokumen & Skripsi ---
    {
      id: "pdf",
      label: isId ? "PDF Dokumen (A4)" : "PDF Document (A4)",
      icon: "📄",
      description: isId ? "Format A4 siap cetak dengan caption" : "Print-ready A4 with figure captions",
      category: "doc",
    },
    {
      id: "academic-caption",
      label: isId ? "Format Naskah Skripsi" : "Academic Paper Caption",
      icon: "🎓",
      description: isId ? "Salin narasi & caption Bab Skripsi" : "Copy thesis narrative & figure labels",
      category: "doc",
    },

    // --- Gambar Visual ---
    {
      id: "png",
      label: "PNG Image (2x)",
      icon: "🖼️",
      description: isId ? "Raster resolusi tinggi (retina)" : "High-resolution retina image",
      category: "image",
    },
    {
      id: "svg",
      label: "SVG Vector",
      icon: "📐",
      description: isId ? "Grafik vektor tajam tanpa pecah" : "Crisp scalable vector graphic",
      category: "image",
    },

    // --- Kode & Skema Database ---
    {
      id: "sql",
      label: "SQL DDL Schema",
      icon: "🗄️",
      description: isId ? "CREATE TABLE DDL database" : "CREATE TABLE DDL statements",
      category: "code",
      requiredType: "erd",
    },
    {
      id: "typescript",
      label: "TypeScript Interface",
      icon: "🔷",
      description: isId ? "Interface & Class models" : "TypeScript type & interface models",
      category: "code",
      requiredType: "class",
    },
    {
      id: "java",
      label: "Java Classes",
      icon: "☕",
      description: isId ? "POJO class & attributes" : "POJO classes with attributes & methods",
      category: "code",
      requiredType: "class",
    },
    {
      id: "xstate",
      label: "XState Machine",
      icon: "⚙️",
      description: isId ? "XState v5 state machine" : "XState v5 state machine config",
      category: "code",
      requiredType: "state",
    },
    {
      id: "dsl",
      label: "UML DSL Code",
      icon: "📝",
      description: isId ? "Source code teks UML Flow" : "UML Flow source code text",
      category: "code",
    },
    {
      id: "json",
      label: "JSON Model",
      icon: "📋",
      description: isId ? "Data model AST diagram" : "AST diagram JSON data model",
      category: "code",
    },
  ];
}

interface Props {
  onExport: (format: string) => void;
  disabled?: boolean;
  diagramType?: string;
}

export function ExportDropdown({ onExport, disabled, diagramType }: Props) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const exportOptions = getExportOptions(locale);

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
    const items = exportOptions.filter((opt) => opt.category === category);
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
                  ? locale === "id"
                    ? `Khusus diagram ${opt.requiredType?.toUpperCase()}`
                    : `${opt.requiredType?.toUpperCase()} diagram only`
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
        title={t("toolbar.exportDiagram")}
      >
        <span>📥</span>
        <span className="hidden 2xl:inline">{t("common.export")}</span>
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
              <span className="text-xs font-semibold text-text">{t("toolbar.exportShareTitle")}</span>
            </div>
            {diagramType && (
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-surface-3 text-accent border border-border/50">
                {diagramType}
              </span>
            )}
          </div>

          {/* Scrollable Grouped Items */}
          <div className="overflow-y-auto flex-1 p-1.5 space-y-1.5 custom-scrollbar">
            {renderGroup(t("toolbar.exportGroupDoc"), t("toolbar.exportGroupDocBadge"), "doc")}
            <div className="h-px bg-border/40 mx-2" />
            {renderGroup(t("toolbar.exportGroupImage"), t("toolbar.exportGroupImageBadge"), "image")}
            <div className="h-px bg-border/40 mx-2" />
            {renderGroup(t("toolbar.exportGroupCode"), t("toolbar.exportGroupCodeBadge"), "code")}
          </div>

          {/* Quick Clipboard Action Bar (Sticky Footer) */}
          <div className="border-t border-border/60 bg-surface-3/30 p-2 shrink-0">
            <div className="text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-1.5 px-0.5 flex items-center justify-between">
              <span>{t("toolbar.quickCopy")}</span>
              <span className="text-[9px] lowercase font-normal">clipboard</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  onExport("clipboard-png");
                  setOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-4 border border-border/70 text-xs font-medium text-text hover:border-accent transition-all active:scale-95 shadow-2xs"
                title={t("toolbar.copyPng")}
              >
                <span>🖼️</span>
                <span>{t("toolbar.copyPng")}</span>
              </button>
              <button
                onClick={() => {
                  onExport("clipboard-svg");
                  setOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-4 border border-border/70 text-xs font-medium text-text hover:border-accent transition-all active:scale-95 shadow-2xs"
                title={t("toolbar.copySvg")}
              >
                <span>📎</span>
                <span>{t("toolbar.copySvg")}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
