import React from "react";
import type { CanvasTheme } from "../../../hooks/useTheme";
import { PALETTE_PRESETS, type PalettePreset } from "../../../config/palettePresets";
import { useI18n } from "../../../i18n";

interface CanvasAppearanceOptionsProps {
  canvasTheme: CanvasTheme;
  onThemeToggle: () => void;
  isMonochrome?: boolean;
  onMonochromeToggle?: () => void;
  snapEnabled: boolean;
  onSnapToggle: () => void;
  edgeRouting: "straight" | "orthogonal";
  onEdgeRoutingToggle: () => void;
  onApplyPalette?: (palette: PalettePreset) => void;
  onCloseMenu: () => void;
}

export function CanvasAppearanceOptions({
  canvasTheme,
  onThemeToggle,
  isMonochrome,
  onMonochromeToggle,
  snapEnabled,
  onSnapToggle,
  edgeRouting,
  onEdgeRoutingToggle,
  onApplyPalette,
  onCloseMenu,
}: CanvasAppearanceOptionsProps) {
  const { t, locale } = useI18n();
  const isId = locale === "id";

  return (
    <>
      {/* Tema Warna Diagram */}
      {onApplyPalette && (
        <div className="p-2.5 rounded-lg bg-surface-3/40 border border-border/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-text flex items-center gap-1.5">
              <span>🎨</span> {t("toolbar.diagramColorTheme")}
            </span>
            <span className="text-[9px] text-text-muted">
              {t("toolbar.diagramColorThemeBadge")}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {PALETTE_PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => {
                  onApplyPalette(p);
                  onCloseMenu();
                }}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-surface-2 hover:bg-surface-4 border border-border text-[11px] text-text transition-all truncate hover:border-accent shadow-2xs group"
                title={p.name}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full border shrink-0 shadow-2xs group-hover:scale-110 transition-transform"
                  style={{
                    backgroundColor: p.bg,
                    borderColor: p.border,
                  }}
                />
                <span className="truncate">{p.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tampilan Visual Toggles */}
      <div className="space-y-1">
        <div className="px-1 text-[10px] uppercase tracking-wider text-text-muted font-semibold">
          {t("toolbar.navLines")}
        </div>

        {/* Mode Cetak Monokrom */}
        {onMonochromeToggle && (
          <button
            onClick={onMonochromeToggle}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-text hover:bg-surface-3 transition-colors text-left group"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">
                {isMonochrome ? "⬛" : "⬜"}
              </span>
              <div>
                <div className="font-medium">{t("toolbar.monochromePrintMode")}</div>
                <div className="text-[10px] text-text-muted">
                  {t("toolbar.monochromePrintModeDesc")}
                </div>
              </div>
            </div>
            <div
              className={`w-7 h-4 rounded-full transition-colors p-0.5 flex items-center shrink-0 ${
                isMonochrome
                  ? "bg-accent justify-end"
                  : "bg-surface-4 justify-start"
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-white shadow-xs" />
            </div>
          </button>
        )}

        {/* Snap to Grid */}
        <button
          onClick={onSnapToggle}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-text hover:bg-surface-3 transition-colors text-left group"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">⊞</span>
            <div>
              <div className="font-medium flex items-center gap-1.5">
                <span>{t("toolbar.snapToGrid")}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-semibold ${
                    snapEnabled
                      ? "bg-accent/20 text-accent border border-accent/30"
                      : "bg-surface-4 text-text-muted border border-border/40"
                  }`}
                >
                  {snapEnabled
                    ? isId
                      ? "AKTIF (20px)"
                      : "ON (20px)"
                    : isId
                      ? "NONAKTIF"
                      : "OFF"}
                </span>
              </div>
              <div className="text-[10px] text-text-muted">
                {t("toolbar.snapToGridDesc")}
              </div>
            </div>
          </div>
          <div
            className={`w-7 h-4 rounded-full transition-colors p-0.5 flex items-center shrink-0 ${
              snapEnabled
                ? "bg-accent justify-end"
                : "bg-surface-4 justify-start"
            }`}
          >
            <div className="w-3 h-3 rounded-full bg-white shadow-xs" />
          </div>
        </button>

        {/* Orthogonal Lines */}
        <button
          onClick={onEdgeRoutingToggle}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-text hover:bg-surface-3 transition-colors text-left group"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">↗</span>
            <div>
              <div className="font-medium">{t("toolbar.orthogonalRouting")}</div>
              <div className="text-[10px] text-text-muted">
                {edgeRouting === "orthogonal"
                  ? t("toolbar.orthogonalDesc")
                  : t("toolbar.straightDesc")}
              </div>
            </div>
          </div>
          <div
            className={`w-7 h-4 rounded-full transition-colors p-0.5 flex items-center shrink-0 ${
              edgeRouting === "orthogonal"
                ? "bg-accent justify-end"
                : "bg-surface-4 justify-start"
            }`}
          >
            <div className="w-3 h-3 rounded-full bg-white shadow-xs" />
          </div>
        </button>

        {/* Canvas Theme */}
        <button
          onClick={onThemeToggle}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-text hover:bg-surface-3 transition-colors text-left group"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">
              {canvasTheme === "light" ? "☀️" : "🌙"}
            </span>
            <div>
              <div className="font-medium">{t("toolbar.canvasBackground")}</div>
              <div className="text-[10px] text-text-muted">
                {t("toolbar.canvasBackgroundDesc")}
              </div>
            </div>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-3 text-text-muted border border-border/50 font-medium">
            {canvasTheme === "light" ? (isId ? "Terang" : "Light") : (isId ? "Gelap" : "Dark")}
          </span>
        </button>
      </div>
    </>
  );
}
