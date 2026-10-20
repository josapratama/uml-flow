import React from "react";
import type { CanvasTheme } from "../../hooks/useTheme";
import { useI18n } from "../../i18n";

interface CanvasControlsProps {
  canvasTheme: CanvasTheme;
  scale: number;
  showSearch: boolean;
  onToggleSearch: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onZoomToFit: () => void;
  edgeRouting?: "straight" | "orthogonal";
  onEdgeRoutingToggle?: () => void;
}

export function CanvasControls({
  canvasTheme,
  scale,
  showSearch,
  onToggleSearch,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onZoomToFit,
  edgeRouting,
  onEdgeRoutingToggle,
}: CanvasControlsProps) {
  const { t } = useI18n();

  return (
    <div
      className={`absolute top-3 right-3 flex items-center gap-1 rounded-xl px-2 py-1 shadow-lg backdrop-blur-md z-10 border transition-all ${
        canvasTheme === "dark"
          ? "bg-surface-2/90 border-border/80 text-text"
          : "bg-white/90 border-slate-200 text-slate-700"
      }`}
    >
      <button
        onClick={onToggleSearch}
        className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs transition-colors ${
          showSearch
            ? "bg-accent text-white shadow-xs"
            : canvasTheme === "dark"
            ? "hover:bg-surface-3 text-text"
            : "hover:bg-slate-100 text-slate-700"
        }`}
        title={`${t("canvas.search")} (Ctrl+F)`}
      >
        🔍
      </button>

      <div className="w-px h-4 bg-border/60 mx-0.5" />

      <button
        onClick={onZoomIn}
        className={`w-7 h-7 flex items-center justify-center rounded-lg font-medium transition-colors ${
          canvasTheme === "dark"
            ? "hover:bg-surface-3 text-text"
            : "hover:bg-slate-100 text-slate-700"
        }`}
        title={`${t("canvas.zoomIn")} (+)`}
      >
        +
      </button>

      <span className="text-[11px] font-mono min-w-[36px] text-center opacity-80">
        {Math.round(scale * 100)}%
      </span>

      <button
        onClick={onZoomOut}
        className={`w-7 h-7 flex items-center justify-center rounded-lg font-medium transition-colors ${
          canvasTheme === "dark"
            ? "hover:bg-surface-3 text-text"
            : "hover:bg-slate-100 text-slate-700"
        }`}
        title={`${t("canvas.zoomOut")} (-)`}
      >
        −
      </button>

      <button
        onClick={onZoomReset}
        className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs transition-colors ${
          canvasTheme === "dark"
            ? "hover:bg-surface-3 text-text"
            : "hover:bg-slate-100 text-slate-700"
        }`}
        title={`${t("canvas.zoomReset")} (100%)`}
      >
        ⟲
      </button>

      <button
        onClick={onZoomToFit}
        className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs transition-colors ${
          canvasTheme === "dark"
            ? "hover:bg-surface-3 text-text"
            : "hover:bg-slate-100 text-slate-700"
        }`}
        title={t("canvas.zoomFit")}
      >
        ⊡
      </button>

      {onEdgeRoutingToggle && (
        <>
          <div className="w-px h-4 bg-border/60 mx-0.5" />
          <button
            onClick={onEdgeRoutingToggle}
            className={`h-7 px-2 flex items-center justify-center gap-1 rounded-lg text-xs font-medium transition-all ${
              edgeRouting === "orthogonal"
                ? "bg-accent text-white shadow-xs font-semibold"
                : canvasTheme === "dark"
                ? "hover:bg-surface-3 text-text opacity-70 hover:opacity-100"
                : "hover:bg-slate-100 text-slate-700 opacity-70 hover:opacity-100"
            }`}
            title={
              edgeRouting === "orthogonal"
                ? t("toolbar.orthogonalTooltip")
                : t("toolbar.straightTooltip")
            }
          >
            <span>{edgeRouting === "orthogonal" ? "⌐" : "↗"}</span>
            <span className="text-[10px]">
              {edgeRouting === "orthogonal"
                ? t("canvas.modeSiku")
                : t("canvas.modeLurus")}
            </span>
          </button>
        </>
      )}
    </div>
  );
}
