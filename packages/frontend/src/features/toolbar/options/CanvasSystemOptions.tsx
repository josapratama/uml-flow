import React, { useState } from "react";
import { useI18n } from "../../../i18n";
import { isSoundEnabled, setSoundEnabled, playSnapSound } from "../../../services/sound-fx";

interface CanvasSystemOptionsProps {
  autoCompile: boolean;
  onAutoCompileToggle: () => void;
  autoSyncCanvas?: boolean;
  onAutoSyncCanvasToggle?: () => void;
  hasDiagram: boolean;
  onPresentationMode?: () => void;
  onShowHistory?: () => void;
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
  onCloseMenu,
}: CanvasSystemOptionsProps) {
  const { t, locale } = useI18n();
  const isId = locale === "id";
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playSnapSound();
  };

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

        {/* Sound FX Toggle */}
        <button
          onClick={handleToggleSound}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-text hover:bg-surface-3 transition-colors text-left group"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">{soundOn ? "🔊" : "🔇"}</span>
            <div>
              <div className="font-medium">{isId ? "Efek Suara UI" : "UI Sound FX"}</div>
              <div className="text-[10px] text-text-muted">
                {isId ? "Haptic audio saat snap & eksekusi" : "Haptic audio on snap & actions"}
              </div>
            </div>
          </div>
          <div
            className={`w-7 h-4 rounded-full transition-colors p-0.5 flex items-center shrink-0 ${
              soundOn
                ? "bg-accent justify-end"
                : "bg-surface-4 justify-start"
            }`}
          >
            <div className="w-3 h-3 rounded-full bg-white shadow-xs" />
          </div>
        </button>
      </div>

      <div className="h-px bg-border/40 mx-1" />

      {/* Quick Action Grid */}
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
                📺
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
                🕒
              </span>
              <div className="min-w-0">
                <div className="font-medium truncate">{t("toolbar.historyTimeline")}</div>
                <div className="text-[9px] text-text-muted">
                  {isId ? "Riwayat aksi" : "Undo history"}
                </div>
              </div>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
