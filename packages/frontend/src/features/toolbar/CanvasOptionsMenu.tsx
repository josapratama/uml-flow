import React, { useState, useRef, useEffect } from "react";
import type { CanvasTheme } from "../../hooks/useTheme";

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
  hasDiagram: boolean;
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
  hasDiagram,
}: Props) {
  const [open, setOpen] = useState(false);
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
        title="Canvas & View Options"
      >
        <span className="text-sm">⚙️</span>
        <span className="hidden 2xl:inline">Options</span>
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
        <div className="absolute right-0 top-full mt-1.5 w-64 bg-surface-2/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-text-muted font-semibold border-b border-border/50">
            Canvas Settings
          </div>

          {/* Auto compile toggle */}
          <button
            onClick={onAutoCompileToggle}
            className="w-full flex items-center justify-between px-3 py-2 text-xs text-text hover:bg-surface-3 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">⚡</span>
              <div>
                <div className="font-medium">Auto Compile</div>
                <div className="text-[10px] text-text-muted">Live compile as you type</div>
              </div>
            </div>
            <div
              className={`w-8 h-4 rounded-full transition-colors p-0.5 flex items-center ${
                autoCompile ? "bg-accent justify-end" : "bg-surface-4 justify-start"
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-white shadow-xs" />
            </div>
          </button>

          {/* Two-Way Live Sync toggle */}
          {onAutoSyncCanvasToggle && (
            <button
              onClick={onAutoSyncCanvasToggle}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-text hover:bg-surface-3 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">🔄</span>
                <div>
                  <div className="font-medium">Two-Way Live Sync</div>
                  <div className="text-[10px] text-text-muted">Auto-sync visual changes to DSL</div>
                </div>
              </div>
              <div
                className={`w-8 h-4 rounded-full transition-colors p-0.5 flex items-center ${
                  autoSyncCanvas ? "bg-accent justify-end" : "bg-surface-4 justify-start"
                }`}
              >
                <div className="w-3 h-3 rounded-full bg-white shadow-xs" />
              </div>
            </button>
          )}

          {/* Snap to grid toggle */}
          <button
            onClick={onSnapToggle}
            className="w-full flex items-center justify-between px-3 py-2 text-xs text-text hover:bg-surface-3 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">⊞</span>
              <div>
                <div className="font-medium">Snap to Grid</div>
                <div className="text-[10px] text-text-muted">Align nodes to 20px grid</div>
              </div>
            </div>
            <div
              className={`w-8 h-4 rounded-full transition-colors p-0.5 flex items-center ${
                snapEnabled ? "bg-accent justify-end" : "bg-surface-4 justify-start"
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-white shadow-xs" />
            </div>
          </button>

          {/* Edge routing toggle */}
          <button
            onClick={onEdgeRoutingToggle}
            className="w-full flex items-center justify-between px-3 py-2 text-xs text-text hover:bg-surface-3 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">↗</span>
              <div>
                <div className="font-medium">Orthogonal Lines</div>
                <div className="text-[10px] text-text-muted">
                  {edgeRouting === "orthogonal" ? "90-degree step angles" : "Direct straight lines"}
                </div>
              </div>
            </div>
            <div
              className={`w-8 h-4 rounded-full transition-colors p-0.5 flex items-center ${
                edgeRouting === "orthogonal" ? "bg-accent justify-end" : "bg-surface-4 justify-start"
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-white shadow-xs" />
            </div>
          </button>

          {/* Monochrome toggle */}
          {onMonochromeToggle && (
            <button
              onClick={onMonochromeToggle}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-text hover:bg-surface-3 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">{isMonochrome ? "⬜" : "🎨"}</span>
                <div>
                  <div className="font-medium">Monochrome Mode</div>
                  <div className="text-[10px] text-text-muted">Clean high-contrast print mode</div>
                </div>
              </div>
              <div
                className={`w-8 h-4 rounded-full transition-colors p-0.5 flex items-center ${
                  isMonochrome ? "bg-accent justify-end" : "bg-surface-4 justify-start"
                }`}
              >
                <div className="w-3 h-3 rounded-full bg-white shadow-xs" />
              </div>
            </button>
          )}

          {/* Canvas theme toggle */}
          <button
            onClick={onThemeToggle}
            className="w-full flex items-center justify-between px-3 py-2 text-xs text-text hover:bg-surface-3 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">{canvasTheme === "light" ? "☀️" : "🌙"}</span>
              <div>
                <div className="font-medium">Canvas Background</div>
                <div className="text-[10px] text-text-muted">
                  Current: {canvasTheme === "light" ? "Light theme" : "Dark theme"}
                </div>
              </div>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-3 text-text-muted border border-border/50">
              {canvasTheme === "light" ? "Light" : "Dark"}
            </span>
          </button>

          <div className="h-px bg-border/50 my-1" />

          {/* Presentation mode */}
          {onPresentationMode && (
            <button
              onClick={() => {
                onPresentationMode();
                setOpen(false);
              }}
              disabled={!hasDiagram}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-text hover:bg-surface-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-left"
            >
              <span className="text-base">⛶</span>
              <div>
                <div className="font-medium">Presentation Mode</div>
                <div className="text-[10px] text-text-muted">Fullscreen distraction-free canvas</div>
              </div>
            </button>
          )}

          {/* Undo history */}
          {onShowHistory && (
            <button
              onClick={() => {
                onShowHistory();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-text hover:bg-surface-3 transition-colors text-left"
            >
              <span className="text-base">🕐</span>
              <div>
                <div className="font-medium">Undo History Timeline</div>
                <div className="text-[10px] text-text-muted">Inspect change stack snapshots</div>
              </div>
            </button>
          )}

          {/* Validate Rules */}
          {onValidate && (
            <button
              onClick={() => {
                onValidate();
                setOpen(false);
              }}
              disabled={!hasDiagram}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-text hover:bg-surface-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-left"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">✓</span>
                <div>
                  <div className="font-medium">Validate Rules</div>
                  <div className="text-[10px] text-text-muted">Check UML/ERD syntax & constraints</div>
                </div>
              </div>
            </button>
          )}

          {/* Keyboard shortcuts */}
          <button
            onClick={() => {
              onShowShortcuts();
              setOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2 text-xs text-text hover:bg-surface-3 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">⌨</span>
              <div>
                <div className="font-medium">Keyboard Shortcuts</div>
                <div className="text-[10px] text-text-muted">View all hotkeys & tips</div>
              </div>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-3 text-text-muted border border-border/50">
              ?
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
