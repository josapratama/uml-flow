import React, { useState, useRef, useEffect } from "react";
import type { CanvasTheme } from "../../hooks/useTheme";
import { CanvasAppearanceOptions } from "./options/CanvasAppearanceOptions";
import { CanvasSystemOptions } from "./options/CanvasSystemOptions";
import { LanguageSwitcher, useI18n } from "../../i18n";

interface Props {
  autoCompile: boolean;
  onAutoCompileToggle: () => void;
  autoSyncCanvas?: boolean;
  onAutoSyncCanvasToggle?: () => void;
  snapEnabled: boolean;
  onSnapToggle: () => void;
  edgeRouting: "straight" | "orthogonal";
  onEdgeRoutingToggle: () => void;
  canvasTheme: CanvasTheme;
  onThemeToggle: () => void;
  isMonochrome?: boolean;
  onMonochromeToggle?: () => void;
  onPresentationMode?: () => void;
  onShowHistory?: () => void;
  onShowShortcuts: () => void;
  onValidate?: () => void;
  onApplyPalette?: (palette: {
    bg: string;
    border: string;
    font: string;
    name: string;
  }) => void;
  hasDiagram: boolean;
  onShareLink?: () => void;
}

export function CanvasOptionsMenu({
  autoCompile,
  onAutoCompileToggle,
  autoSyncCanvas,
  onAutoSyncCanvasToggle,
  snapEnabled,
  onSnapToggle,
  edgeRouting,
  onEdgeRoutingToggle,
  canvasTheme,
  onThemeToggle,
  isMonochrome,
  onMonochromeToggle,
  onPresentationMode,
  onShowHistory,
  onShowShortcuts,
  onValidate,
  onApplyPalette,
  hasDiagram,
  onShareLink,
}: Props) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"appearance" | "system">(
    "appearance",
  );
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

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`h-8 px-2.5 text-xs font-medium rounded-lg border transition-all flex items-center gap-1.5 ${
          open
            ? "bg-surface-4 text-text border-accent shadow-xs"
            : "bg-surface-3 text-text-muted hover:text-text hover:bg-surface-4 border-border"
        }`}
        title={t("toolbar.canvasOptions")}
      >
        <span className="text-sm">⚙️</span>
        <span className="hidden 2xl:inline">{t("common.options")}</span>
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
        <div className="absolute right-0 top-full mt-1.5 w-80 max-h-[min(560px,calc(100vh-80px))] flex flex-col bg-surface-2/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150 overflow-hidden">
          {/* Header & Segmented Tab Navigation */}
          <div className="px-3 pt-2.5 pb-2 border-b border-border/60 shrink-0 bg-surface-1/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-text flex items-center gap-1.5">
                <span>⚙️</span> {t("toolbar.canvasOptions")}
              </span>
              <LanguageSwitcher variant="pill" />
            </div>

            {/* Segmented Control */}
            <div className="grid grid-cols-2 p-0.5 bg-surface-3/80 rounded-lg border border-border/50 text-xs">
              <button
                onClick={() => setActiveTab("appearance")}
                className={`py-1 px-2 rounded-md font-medium text-xs transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "appearance"
                    ? "bg-surface-1 text-text shadow-2xs font-semibold"
                    : "text-text-muted hover:text-text"
                }`}
              >
                <span>🎨</span>
                <span>{t("toolbar.canvasAppearanceTab")}</span>
              </button>
              <button
                onClick={() => setActiveTab("system")}
                className={`py-1 px-2 rounded-md font-medium text-xs transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "system"
                    ? "bg-surface-1 text-text shadow-2xs font-semibold"
                    : "text-text-muted hover:text-text"
                }`}
              >
                <span>⚡</span>
                <span>{t("toolbar.canvasSystemTab")}</span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="overflow-y-auto flex-1 p-2 space-y-3 custom-scrollbar">
            {activeTab === "appearance" ? (
              <CanvasAppearanceOptions
                canvasTheme={canvasTheme}
                onThemeToggle={onThemeToggle}
                isMonochrome={isMonochrome}
                onMonochromeToggle={onMonochromeToggle}
                snapEnabled={snapEnabled}
                onSnapToggle={onSnapToggle}
                edgeRouting={edgeRouting}
                onEdgeRoutingToggle={onEdgeRoutingToggle}
                onApplyPalette={onApplyPalette}
                onCloseMenu={() => setOpen(false)}
              />
            ) : (
              <CanvasSystemOptions
                autoCompile={autoCompile}
                onAutoCompileToggle={onAutoCompileToggle}
                autoSyncCanvas={autoSyncCanvas}
                onAutoSyncCanvasToggle={onAutoSyncCanvasToggle}
                hasDiagram={hasDiagram}
                onPresentationMode={onPresentationMode}
                onShowHistory={onShowHistory}
                onValidate={onValidate}
                onShowShortcuts={onShowShortcuts}
                onShareLink={onShareLink}
                onCloseMenu={() => setOpen(false)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
