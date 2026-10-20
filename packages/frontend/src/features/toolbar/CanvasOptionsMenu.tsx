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
  onApplyPalette?: (palette: {
    bg: string;
    border: string;
    font: string;
    name: string;
  }) => void;
  hasDiagram: boolean;
}

const PALETTES = [
  {
    name: "Skripsi Formal",
    bg: "#ffffff",
    border: "#475569",
    font: "#0f172a",
    label: "🎓 Skripsi",
  },
  {
    name: "Modern Indigo",
    bg: "#eef2ff",
    border: "#6366f1",
    font: "#1e1b4b",
    label: "💎 Indigo",
  },
  {
    name: "Forest Emerald",
    bg: "#ecfdf5",
    border: "#10b981",
    font: "#064e3b",
    label: "🌿 Emerald",
  },
  {
    name: "Sunset Amber",
    bg: "#fffbeb",
    border: "#f59e0b",
    font: "#78350f",
    label: "🌅 Amber",
  },
  {
    name: "Sky Cyan",
    bg: "#f0f9ff",
    border: "#0ea5e9",
    font: "#0c4a6e",
    label: "☁️ Sky",
  },
  {
    name: "Cyber Violet",
    bg: "#181825",
    border: "#a855f7",
    font: "#f8fafc",
    label: "🌌 Cyber",
  },
];

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
}: Props) {
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
        title="Canvas, tema warna, & opsi sistem"
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
        <div className="absolute right-0 top-full mt-1.5 w-80 max-h-[min(560px,calc(100vh-80px))] flex flex-col bg-surface-2/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150 overflow-hidden">
          {/* Header & Segmented Tab Navigation */}
          <div className="px-3 pt-2.5 pb-2 border-b border-border/60 shrink-0 bg-surface-1/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-text flex items-center gap-1.5">
                <span>⚙️</span> Pengaturan Kanvas
              </span>
              <span className="text-[10px] text-text-muted font-mono">
                uml-flow
              </span>
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
                <span>Tampilan & Warna</span>
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
                <span>Sistem & Tools</span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="overflow-y-auto flex-1 p-2 space-y-3 custom-scrollbar">
            {activeTab === "appearance" ? (
              <>
                {/* Tema Warna Diagram */}
                {onApplyPalette && (
                  <div className="p-2.5 rounded-lg bg-surface-3/40 border border-border/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-text flex items-center gap-1.5">
                        <span>🎨</span> Tema Warna Diagram
                      </span>
                      <span className="text-[9px] text-text-muted">
                        1-Klik Semua Node
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {PALETTES.map((p) => (
                        <button
                          key={p.name}
                          onClick={() => {
                            onApplyPalette(p);
                            setOpen(false);
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
                    Navigasi & Garis Kanvas
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
                          <div className="font-medium">Mode Cetak Monokrom</div>
                          <div className="text-[10px] text-text-muted">
                            Hitam-putih kontras tinggi untuk cetak
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
                        <div className="font-medium">Snap to Grid</div>
                        <div className="text-[10px] text-text-muted">
                          Ratakan pergerakan node ke grid 20px
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
                        <div className="font-medium">Garis Siku (Orthogonal)</div>
                        <div className="text-[10px] text-text-muted">
                          {edgeRouting === "orthogonal"
                            ? "Sudut belok siku 90 derajat"
                            : "Garis lurus langsung (straight)"}
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
                        <div className="font-medium">Background Kanvas</div>
                        <div className="text-[10px] text-text-muted">
                          Latar grid warna {canvasTheme === "light" ? "Terang" : "Gelap"}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-3 text-text-muted border border-border/50 font-medium">
                      {canvasTheme === "light" ? "Light" : "Dark"}
                    </span>
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Engine Toggles */}
                <div className="space-y-1">
                  <div className="px-1 text-[10px] uppercase tracking-wider text-text-muted font-semibold">
                    Mesin & Auto-Sync
                  </div>

                  {/* Auto compile toggle */}
                  <button
                    onClick={onAutoCompileToggle}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-text hover:bg-surface-3 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">⚡</span>
                      <div>
                        <div className="font-medium">Auto Compile</div>
                        <div className="text-[10px] text-text-muted">
                          Live update saat mengetik di editor DSL
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
                          <div className="font-medium">Two-Way Live Sync</div>
                          <div className="text-[10px] text-text-muted">
                            Sinkronisasi kanvas visual ke kode DSL
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
                    Alat & Aksi
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {/* Presentation Mode */}
                    {onPresentationMode && (
                      <button
                        onClick={() => {
                          onPresentationMode();
                          setOpen(false);
                        }}
                        disabled={!hasDiagram}
                        className="flex items-center gap-2 p-2 rounded-lg bg-surface-2 hover:bg-surface-4 border border-border text-xs text-text text-left transition-all disabled:opacity-35 disabled:cursor-not-allowed shadow-2xs group"
                        title="Fullscreen distraction-free canvas"
                      >
                        <span className="text-sm group-hover:scale-110 transition-transform">
                          ⛶
                        </span>
                        <div className="min-w-0">
                          <div className="font-medium truncate">Presentasi</div>
                          <div className="text-[9px] text-text-muted">
                            Fullscreen
                          </div>
                        </div>
                      </button>
                    )}

                    {/* Undo History */}
                    {onShowHistory && (
                      <button
                        onClick={() => {
                          onShowHistory();
                          setOpen(false);
                        }}
                        className="flex items-center gap-2 p-2 rounded-lg bg-surface-2 hover:bg-surface-4 border border-border text-xs text-text text-left transition-all shadow-2xs group"
                        title="Timeline snapshot perubahan"
                      >
                        <span className="text-sm group-hover:scale-110 transition-transform">
                          🕐
                        </span>
                        <div className="min-w-0">
                          <div className="font-medium truncate">Riwayat</div>
                          <div className="text-[9px] text-text-muted">
                            Timeline undo
                          </div>
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
                        className="flex items-center gap-2 p-2 rounded-lg bg-surface-2 hover:bg-surface-4 border border-border text-xs text-text text-left transition-all disabled:opacity-35 disabled:cursor-not-allowed shadow-2xs group"
                        title="Periksa aturan syntax diagram"
                      >
                        <span className="text-sm group-hover:scale-110 transition-transform">
                          ✓
                        </span>
                        <div className="min-w-0">
                          <div className="font-medium truncate">Validasi</div>
                          <div className="text-[9px] text-text-muted">
                            Cek syntax
                          </div>
                        </div>
                      </button>
                    )}

                    {/* Keyboard Shortcuts */}
                    <button
                      onClick={() => {
                        onShowShortcuts();
                        setOpen(false);
                      }}
                      className="flex items-center gap-2 p-2 rounded-lg bg-surface-2 hover:bg-surface-4 border border-border text-xs text-text text-left transition-all shadow-2xs group"
                      title="Lihat semua tombol cepat & tips"
                    >
                      <span className="text-sm group-hover:scale-110 transition-transform">
                        ⌨
                      </span>
                      <div className="min-w-0 flex-1 flex items-center justify-between">
                        <div>
                          <div className="font-medium truncate">Shortcuts</div>
                          <div className="text-[9px] text-text-muted">
                            Tombol cepat
                          </div>
                        </div>
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-surface-4 text-text-muted">
                          ?
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
