import React from "react";
import { useI18n } from "../../../i18n";

interface CanvasSystemOptionsProps {
  autoCompile: boolean;
  onAutoCompileToggle: () => void;
  autoSyncCanvas?: boolean;
  onAutoSyncCanvasToggle?: () => void;
  hasDiagram: boolean;
  onPresentationMode?: () => void;
  onShowHistory?: () => void;
  onValidate?: () => void;
  onShowShortcuts: () => void;
  onShareLink?: () => void;
  onCloseMenu: () => void;
}

export function CanvasSystemOptions({
  autoCompile,
  onAutoCompileToggle,
  autoSyncCanvas,
  onAutoSyncCanvasToggle,
  hasDiagram,
  onPresentationMode,
  onShowHistory,
  onValidate,
  onShowShortcuts,
  onShareLink,
  onCloseMenu,
}: CanvasSystemOptionsProps) {
  const { t, locale } = useI18n();
  const isId = locale === "id";

  return (
    <>
      {/* Engine Toggles */}
      <div className="space-y-1">
        <div className="px-1 text-[10px] uppercase tracking-wider text-text-muted font-semibold">
          {t("toolbar.engineSync")}
        </div>

        {/* Auto compile toggle */}
        <button
          onClick={onAutoCompileToggle}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-text hover:bg-surface-3 transition-colors text-left group"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">⚡</span>
            <div>
              <div className="font-medium">{t("toolbar.autoCompile")}</div>
              <div className="text-[10px] text-text-muted">
                {t("toolbar.autoCompileDesc")}
              </div>
            </div>
          </div>
          <div
            className={`w-7 h-4 rounded-full transition-colors p-0.5 flex items-center shrink-0 ${
              autoCompile
                ? "bg-accent justify-end"
                : "bg-surface-4 justify-start"
            }`}
          >
            <div className="w-3 h-3 rounded-full bg-white shadow-xs" />
          </div>
        </button>

        {/* Two-Way Live Sync toggle */}
        {onAutoSyncCanvasToggle && (
          <button
            onClick={onAutoSyncCanvasToggle}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-text hover:bg-surface-3 transition-colors text-left group"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">🔄</span>
              <div>
                <div className="font-medium">{t("toolbar.autoSync")}</div>
                <div className="text-[10px] text-text-muted">
                  {t("toolbar.twoWaySyncDesc")}
                </div>
              </div>
            </div>
            <div
              className={`w-7 h-4 rounded-full transition-colors p-0.5 flex items-center shrink-0 ${
                autoSyncCanvas
                  ? "bg-accent justify-end"
                  : "bg-surface-4 justify-start"
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-white shadow-xs" />
            </div>
          </button>
        )}
      </div>

      <div className="h-px bg-border/40 mx-1" />

      {/* Quick Action Grid (2x2) */}
      <div className="space-y-1.5">
        <div className="px-1 text-[10px] uppercase tracking-wider text-text-muted font-semibold">
          {t("toolbar.toolsActions")}
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {/* Presentation Mode */}
          {onPresentationMode && (
            <button
              onClick={() => {
                onPresentationMode();
                onCloseMenu();
              }}
              disabled={!hasDiagram}
              className="flex items-center gap-2 p-2 rounded-lg bg-surface-2 hover:bg-surface-4 border border-border text-xs text-text text-left transition-all disabled:opacity-35 disabled:cursor-not-allowed shadow-2xs group"
              title={t("toolbar.presentationDesc")}
            >
              <span className="text-sm group-hover:scale-110 transition-transform">
                ⛶
              </span>
              <div className="min-w-0">
                <div className="font-medium truncate">{t("toolbar.presentation")}</div>
                <div className="text-[9px] text-text-muted">
                  {isId ? "Layar penuh" : "Fullscreen"}
                </div>
              </div>
            </button>
          )}

          {/* Undo History */}
          {onShowHistory && (
            <button
              onClick={() => {
                onShowHistory();
                onCloseMenu();
              }}
              className="flex items-center gap-2 p-2 rounded-lg bg-surface-2 hover:bg-surface-4 border border-border text-xs text-text text-left transition-all shadow-2xs group"
              title={t("toolbar.historyTimelineDesc")}
            >
              <span className="text-sm group-hover:scale-110 transition-transform">
                🕐
              </span>
              <div className="min-w-0">
                <div className="font-medium truncate">{t("toolbar.historyTimeline")}</div>
                <div className="text-[9px] text-text-muted">
                  {isId ? "Riwayat aksi" : "Undo history"}
                </div>
              </div>
            </button>
          )}

          {/* Validate Rules */}
          {onValidate && (
            <button
              onClick={() => {
                onValidate();
                onCloseMenu();
              }}
              disabled={!hasDiagram}
              className="flex items-center gap-2 p-2 rounded-lg bg-surface-2 hover:bg-surface-4 border border-border text-xs text-text text-left transition-all disabled:opacity-35 disabled:cursor-not-allowed shadow-2xs group"
              title={t("toolbar.validateDiagramDesc")}
            >
              <span className="text-sm group-hover:scale-110 transition-transform">
                ✓
              </span>
              <div className="min-w-0">
                <div className="font-medium truncate">{t("toolbar.validateDiagram")}</div>
                <div className="text-[9px] text-text-muted">
                  {isId ? "Cek sintaks" : "Check syntax"}
                </div>
              </div>
            </button>
          )}

          {/* Keyboard Shortcuts */}
          <button
            onClick={() => {
              onShowShortcuts();
              onCloseMenu();
            }}
            className="flex items-center gap-2 p-2 rounded-lg bg-surface-2 hover:bg-surface-4 border border-border text-xs text-text text-left transition-all shadow-2xs group"
            title={t("toolbar.keyboardShortcutsDesc")}
          >
            <span className="text-sm group-hover:scale-110 transition-transform">
              ⌨
            </span>
            <div className="min-w-0 flex-1 flex items-center justify-between">
              <div>
                <div className="font-medium truncate">{t("toolbar.keyboardShortcuts")}</div>
                <div className="text-[9px] text-text-muted">
                  {isId ? "Pintasan cepat" : "Quick keys"}
                </div>
              </div>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-surface-4 text-text-muted">
                ?
              </span>
            </div>
          </button>

          {/* Share Diagram Link */}
          {onShareLink && (
            <button
              onClick={() => {
                onShareLink();
                onCloseMenu();
              }}
              className="col-span-2 flex items-center justify-between p-2 rounded-lg bg-linear-to-r from-accent/10 to-indigo-500/10 hover:from-accent/20 hover:to-indigo-500/20 border border-accent/30 text-xs text-text text-left transition-all shadow-2xs group"
              title={t("toolbar.shareDiagramLinkDesc")}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm group-hover:scale-110 transition-transform">
                  🔗
                </span>
                <div className="min-w-0">
                  <div className="font-semibold text-accent truncate">{t("toolbar.shareDiagramLink")}</div>
                  <div className="text-[9px] text-text-muted">
                    {t("toolbar.shareDiagramLinkDesc")}
                  </div>
                </div>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/15 text-accent font-semibold font-mono">
                {isId ? "BUKA" : "OPEN"}
              </span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
