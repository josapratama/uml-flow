import React, { useState, useRef, useEffect } from "react";

interface ExportOption {
  id: string;
  label: string;
  icon: string;
  description: string;
}

const EXPORT_OPTIONS: ExportOption[] = [
  {
    id: "png",
    label: "PNG Image",
    icon: "🖼️",
    description: "High-res raster image (2x)",
  },
  {
    id: "svg",
    label: "SVG Vector",
    icon: "📐",
    description: "Scalable vector graphic",
  },
  {
    id: "json",
    label: "JSON Data",
    icon: "📋",
    description: "Diagram model (re-importable)",
  },
  {
    id: "dsl",
    label: "DSL Code",
    icon: "📝",
    description: "UML DSL source text",
  },
  {
    id: "typescript",
    label: "TypeScript",
    icon: "🔷",
    description: "Generate TS interfaces/classes",
  },
  {
    id: "java",
    label: "Java",
    icon: "☕",
    description: "Generate Java classes",
  },
  {
    id: "clipboard-svg",
    label: "Copy as SVG",
    icon: "📎",
    description: "Copy SVG to clipboard",
  },
  {
    id: "clipboard-png",
    label: "Copy as PNG",
    icon: "🖼️",
    description: "Copy PNG image to clipboard",
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
  const isClassDiagram = diagramType === "class";

  // Close on outside click
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
        className="px-2.5 py-1.5 bg-surface-3 text-text text-[11px] border border-border rounded-md hover:bg-surface-4 hover:text-text transition-colors flex items-center gap-1 disabled:opacity-40"
        onClick={() => setOpen(!open)}
        disabled={disabled}
      >
        📥 Export
        <svg
          width="10"
          height="10"
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
        <div className="absolute right-0 top-full mt-1 w-60 bg-surface-2 border border-border rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-border">
            <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">
              Export As
            </span>
          </div>
          {EXPORT_OPTIONS.map((opt) => {
            const isCodeGen = opt.id === "typescript" || opt.id === "java";
            const isDisabled = isCodeGen && !isClassDiagram;
            return (
              <button
                key={opt.id}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                  isDisabled
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:bg-surface-3"
                }`}
                onClick={() => {
                  if (!isDisabled) {
                    onExport(opt.id);
                    setOpen(false);
                  }
                }}
                title={
                  isDisabled ? "Only available for Class diagrams" : undefined
                }
                disabled={isDisabled}
              >
                <span className="text-base">{opt.icon}</span>
                <div className="flex-1">
                  <div className="text-xs text-text font-medium flex items-center gap-1">
                    {opt.label}
                    {isDisabled && (
                      <span className="text-[9px] text-text-muted bg-surface-3 px-1 rounded">
                        class only
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-text-muted">
                    {opt.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
