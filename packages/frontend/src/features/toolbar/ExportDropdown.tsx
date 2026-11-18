import React, { useState, useRef, useEffect } from "react";
import { useI18n, type Locale } from "../../i18n";

interface ExportOption {
  id: string;
  label: string;
  icon: string;
  description: string;
  category: "doc" | "image" | "code";
  requiredType?: "class" | "erd" | "state";
  requiredTypes?: Array<"class" | "erd" | "state">;
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
    {
      id: "academic-a4",
      label: isId ? "Lembar Lampiran Skripsi A4 (PDF)" : "Academic A4 Thesis Sheet (PDF)",
      icon: "📑",
      description: isId ? "Format resmi A4 dengan margin 4-4-3-3cm & Kop Diagram" : "Standard A4 layout with margins & title block",
      category: "doc",
    },
    {
      id: "html",
      label: isId ? "Web Interaktif Mandiri (.html)" : "Interactive Web Page (.html)",
      icon: "🌐",
      description: isId ? "File HTML mandiri dengan pan, zoom & cari node offline" : "Standalone offline HTML with zoom, pan & search",
      category: "doc",
    },
    {
      id: "thesis-bundle",
      label: isId ? "Paket Lampiran Skripsi (.md)" : "Thesis Appendix Bundle (.md)",
      icon: "📦",
      description: isId ? "Bundel naskah lengkap: narasi, metrik, SQL & model" : "Full appendix bundle with narrative, metrics & code",
      category: "doc",
    },
    {
      id: "test-cases",
      label: isId ? "Matriks Pengujian Sistem (.md)" : "Test Case Matrix (.md)",
      icon: "🧪",
      description: isId ? "Tabel uji White-Box basis path & functional" : "White-box basis path & functional test table",
      category: "doc",
    },
    {
      id: "usecase-narrative",
      label: isId ? "Skenario Narasi Use Case (.md)" : "Use Case Scenario Spec (.md)",
      icon: "📋",
      description: isId ? "Tabel spesifikasi skenario Bab 3/4 Skripsi" : "OMG UML 2.5 scenario tables for SRS",
      category: "doc",
    },
    {
      id: "data-dictionary",
      label: isId ? "Kamus Data Basis Data (.md)" : "ERD Data Dictionary (.md)",
      icon: "📚",
      description: isId ? "Tabel kamus data teknis perancangan DB" : "Technical database data dictionary tables",
      category: "doc",
    },
    {
      id: "tikz",
      label: "LaTeX TikZ Vector (.tex)",
      icon: "📑",
      description: isId ? "Kode gambar vektor native LaTeX / Overleaf" : "Native LaTeX / Overleaf TikZ vector code",
      category: "doc",
    },

    // --- Gambar Visual ---
    {
      id: "clipboard-png",
      label: isId ? "Salin PNG ke Clipboard" : "Copy PNG to Clipboard",
      icon: "📋",
      description: isId ? "Salin gambar langsung untuk di-paste (Ctrl+V)" : "Direct copy to paste into Docs/Notion",
      category: "image",
    },
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
    {
      id: "clipboard-svg",
      label: isId ? "Salin SVG Markup" : "Copy SVG Code",
      icon: "📋",
      description: isId ? "Salin teks markup SVG ke clipboard" : "Copy raw SVG markup to clipboard",
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
      id: "python-pydantic",
      label: "Python (Pydantic v2)",
      icon: "🐍",
      description: isId ? "Skema BaseModel Pydantic v2" : "Pydantic v2 BaseModel schemas",
      category: "code",
      requiredTypes: ["class", "erd"],
    },
    {
      id: "python-sqlalchemy",
      label: "Python (SQLAlchemy 2.0)",
      icon: "🐍",
      description: isId ? "ORM Mapped declarative models" : "SQLAlchemy 2.0 Mapped declarative models",
      category: "code",
      requiredTypes: ["class", "erd"],
    },
    {
      id: "csharp",
      label: "C# (.NET 8 POCO)",
      icon: "🔷",
      description: isId ? "POCO Class & Interface C# 12" : "C# 12 / .NET 8 POCO & entity models",
      category: "code",
      requiredTypes: ["class", "erd"],
    },
    {
      id: "golang",
      label: "Go Structs & Models",
      icon: "🐹",
      description: isId ? "Struct Go dengan json/db tags" : "Go structs with json/db tags & methods",
      category: "code",
      requiredTypes: ["class", "erd"],
    },
    {
      id: "graphql",
      label: "GraphQL Schema (SDL)",
      icon: "🕸️",
      description: isId ? "Definisi type, input & query SDL" : "GraphQL types, inputs & queries SDL",
      category: "code",
      requiredTypes: ["class", "erd"],
    },
    {
      id: "rust",
      label: "Rust Structs & Enums",
      icon: "🦀",
      description: isId ? "Struct Rust dengan serde derive" : "Idiomatic Rust structs with serde",
      category: "code",
      requiredTypes: ["class", "erd"],
    },
    {
      id: "openapi-yaml",
      label: "OpenAPI 3.1 Spec (YAML)",
      icon: "📜",
      description: isId ? "Spesifikasi Swagger API RESTful (YAML)" : "OpenAPI 3.1 REST API specification (YAML)",
      category: "code",
      requiredTypes: ["class", "erd"],
    },
    {
      id: "openapi-json",
      label: "OpenAPI 3.1 Spec (JSON)",
      icon: "📜",
      description: isId ? "Spesifikasi Swagger API RESTful (JSON)" : "OpenAPI 3.1 REST API specification (JSON)",
      category: "code",
      requiredTypes: ["class", "erd"],
    },
    {
      id: "prisma",
      label: "Prisma Schema (.prisma)",
      icon: "💎",
      description: isId ? "Skema ORM Prisma Next.js/Node.js" : "Prisma ORM schema for Node.js / Next.js",
      category: "code",
      requiredTypes: ["class", "erd"],
    },
    {
      id: "mock-data",
      label: isId ? "Generator Data Dummy (Seed)" : "Mock Data & Database Seed",
      icon: "🎲",
      description: isId ? "Generate JSON mock atau SQL INSERT seed" : "Generate realistic JSON mock or SQL INSERT seed",
      category: "code",
      requiredTypes: ["class", "erd"],
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
      id: "mermaid",
      label: "Mermaid.js (.mmd)",
      icon: "🧜‍♀️",
      description: isId ? "Kode markdown diagram GitHub / Notion" : "GitHub / Notion markdown diagram code",
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
          const isDisabled = opt.requiredTypes
            ? !opt.requiredTypes.includes(diagramType as any)
            : opt.requiredType !== undefined && opt.requiredType !== diagramType;

          const requiredText = opt.requiredTypes
            ? opt.requiredTypes.map((t) => t.toUpperCase()).join(" / ")
            : opt.requiredType?.toUpperCase();

          return (
            <button
              key={opt.id}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-colors text-xs group ${isDisabled
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
                    ? `Khusus diagram ${requiredText}`
                    : `${requiredText} diagram only`
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
        className={`h-8 px-2.5 text-xs font-medium rounded-lg border transition-all flex items-center gap-1.5 disabled:opacity-35 disabled:cursor-not-allowed ${open
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
