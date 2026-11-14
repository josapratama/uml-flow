import React from "react";
import { useI18n } from "../../i18n";

export type AnnotationTool = "pen" | "highlighter";

interface Props {
  activeTool: AnnotationTool;
  onChangeTool: (tool: AnnotationTool) => void;
  activeColor: string;
  onChangeColor: (color: string) => void;
  strokeCount: number;
  onUndoStroke: () => void;
  onClearAll: () => void;
  onClose: () => void;
}

const COLORS = [
  { id: "#ef4444", label: "Merah Koreksi" },
  { id: "#f59e0b", label: "Amber Stabilo" },
  { id: "#10b981", label: "Hijau Selesai" },
  { id: "#3b82f6", label: "Biru Catatan" },
  { id: "#a855f7", label: "Ungu Sorot" },
];

export function AnnotationToolbar({
  activeTool,
  onChangeTool,
  activeColor,
  onChangeColor,
  strokeCount,
  onUndoStroke,
  onClearAll,
  onClose,
}: Props) {
  const { locale } = useI18n();
  const isId = locale === "id";

  return (
    <div className="absolute top-14 right-3 z-30 bg-surface-2/95 backdrop-blur-xl border border-accent/40 rounded-2xl p-2 shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-1 duration-150 select-none">
      {/* Tool Selector: Pen vs Highlighter */}
      <div className="flex items-center gap-1 bg-surface-3 p-1 rounded-xl border border-border">
        <button
          onClick={() => onChangeTool("pen")}
          className={`h-7 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeTool === "pen"
              ? "bg-accent text-white shadow-xs"
              : "text-text-muted hover:text-text"
          }`}
          title={isId ? "Pena Garis Bebas" : "Freehand Pen"}
        >
          <span>✏️</span>
          <span className="hidden sm:inline">{isId ? "Pena" : "Pen"}</span>
        </button>

        <button
          onClick={() => onChangeTool("highlighter")}
          className={`h-7 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeTool === "highlighter"
              ? "bg-accent text-white shadow-xs"
              : "text-text-muted hover:text-text"
          }`}
          title={isId ? "Stabilo Transparan" : "Highlighter"}
        >
          <span>🖍️</span>
          <span className="hidden sm:inline">{isId ? "Stabilo" : "Highlight"}</span>
        </button>
      </div>

      {/* Color Palette */}
      <div className="flex items-center gap-1 px-1">
        {COLORS.map((c) => {
          const isSelected = activeColor === c.id;
          return (
            <button
              key={c.id}
              onClick={() => onChangeColor(c.id)}
              className={`w-5 h-5 rounded-full transition-transform ${
                isSelected ? "scale-125 ring-2 ring-accent ring-offset-2 ring-offset-surface-2" : "hover:scale-110"
              }`}
              style={{ backgroundColor: c.id }}
              title={c.label}
            />
          );
        })}
      </div>

      <div className="w-px h-5 bg-border mx-0.5" />

      {/* Undo Last Stroke */}
      <button
        onClick={onUndoStroke}
        disabled={strokeCount === 0}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-surface-3 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs"
        title={isId ? "Urungkan Coretan (Ctrl+Z)" : "Undo Stroke"}
      >
        ↩
      </button>

      {/* Clear All */}
      <button
        onClick={onClearAll}
        disabled={strokeCount === 0}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-rose-400 hover:bg-rose-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs"
        title={isId ? "Hapus Semua Coretan" : "Clear All"}
      >
        🗑️
      </button>

      {/* Close Annotation Toolbar */}
      <button
        onClick={onClose}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-surface-3 transition-colors text-xs ml-0.5"
        title={isId ? "Tutup Mode Coretan" : "Exit Annotation Mode"}
      >
        ✕
      </button>
    </div>
  );
}
