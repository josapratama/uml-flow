import React, { useState, useRef, useEffect } from "react";
import { useI18n } from "../../i18n";

interface Props {
  hasDiagram: boolean;
  onValidate?: () => void;
  onShowMetrics?: () => void;
  onOpenSimulator?: () => void;
  onOpenCommandPalette?: () => void;
  onShareLink?: () => void;
  onOpenThesisBundle?: () => void;
  onOpenTestCases?: () => void;
  onOpenMockData?: () => void;
  onOpenDependencyMatrix?: () => void;
  onOpenUseCaseNarrative?: () => void;
  onOpenDataDictionary?: () => void;
  onOpenAcademicA4?: () => void;
  onOpenShortcuts?: () => void;
}

export function ToolsMenu({
  hasDiagram,
  onValidate,
  onShowMetrics,
  onOpenSimulator,
  onOpenCommandPalette,
  onOpenThesisBundle,
  onOpenTestCases,
  onOpenMockData,
  onOpenDependencyMatrix,
  onOpenUseCaseNarrative,
  onOpenDataDictionary,
  onOpenAcademicA4,
  onOpenShortcuts,
}: Props) {
  const { locale } = useI18n();
  const isId = locale === "id";
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
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`h-8 px-2 sm:px-2.5 text-xs font-medium rounded-lg border transition-all flex items-center gap-1.5 whitespace-nowrap shadow-xs active:scale-95 ${
          open
            ? "border-accent bg-accent/15 text-accent font-semibold"
            : "border-border bg-surface-3 hover:bg-surface-4 text-text-muted hover:text-text"
        }`}
        title={isId ? "Alat & Fitur Analisis Lengkap" : "Tools & Analysis Features"}
      >
        <span>🛠️</span>
        <span className="hidden sm:inline">{isId ? "Alat" : "Tools"}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={`opacity-60 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-64 bg-surface-2 border border-border rounded-xl shadow-xl z-50 p-1.5 text-xs animate-in fade-in zoom-in-95 duration-100 divide-y divide-border/60">
          {/* Section: Diagnostics & Simulation */}
          <div className="py-1">
            <div className="px-2 py-1 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
              {isId ? "Diagnostik & Simulasi" : "Diagnostics & Simulator"}
            </div>

            {onOpenSimulator && (
              <button
                disabled={!hasDiagram}
                onClick={() => {
                  setOpen(false);
                  onOpenSimulator();
                }}
                className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left text-text hover:bg-surface-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed group"
              >
                <span className="text-emerald-400 group-hover:scale-110 transition-transform">▶️</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-text">{isId ? "Simulasi Alur Interaktif" : "Flow Simulator"}</div>
                  <div className="text-[10px] text-text-muted truncate">{isId ? "Langkah demi langkah eksekusi alur" : "Step-by-step diagram walk"}</div>
                </div>
              </button>
            )}

            {onShowMetrics && (
              <button
                disabled={!hasDiagram}
                onClick={() => {
                  setOpen(false);
                  onShowMetrics();
                }}
                className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left text-text hover:bg-surface-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed group"
              >
                <span className="text-blue-400 group-hover:scale-110 transition-transform">📊</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-text">{isId ? "Metrik & Kompleksitas Cyclomatic" : "Diagram Metrics"}</div>
                  <div className="text-[10px] text-text-muted truncate">{isId ? "McCabe complexity V(G) & laporan" : "McCabe complexity V(G) report"}</div>
                </div>
              </button>
            )}

            {onValidate && (
              <button
                disabled={!hasDiagram}
                onClick={() => {
                  setOpen(false);
                  onValidate();
                }}
                className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left text-text hover:bg-surface-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed group"
              >
                <span className="text-emerald-400 font-bold group-hover:scale-110 transition-transform">✓</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-text">{isId ? "Periksa Kesehatan Diagram" : "Validate Health"}</div>
                  <div className="text-[10px] text-text-muted truncate">{isId ? "Audit relasi gantung & linter" : "Lint orphan nodes & errors"}</div>
                </div>
              </button>
            )}

            {onOpenCommandPalette && (
              <button
                onClick={() => {
                  setOpen(false);
                  onOpenCommandPalette();
                }}
                className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left text-text hover:bg-surface-3 transition-colors group"
              >
                <span className="text-amber-400 group-hover:scale-110 transition-transform">⚡</span>
                <div className="flex-1 min-w-0 flex items-center justify-between">
                  <div className="font-medium text-text">Command Palette</div>
                  <kbd className="font-mono text-[9px] px-1 py-0.5 rounded bg-surface-3 border border-border/80 text-text-muted">Ctrl+K</kbd>
                </div>
              </button>
            )}

            {onOpenShortcuts && (
              <button
                onClick={() => {
                  setOpen(false);
                  onOpenShortcuts();
                }}
                className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left text-text hover:bg-surface-3 transition-colors group"
              >
                <span className="text-sky-400 group-hover:scale-110 transition-transform">⌨️</span>
                <div className="flex-1 min-w-0 flex items-center justify-between">
                  <div className="font-medium text-text">{isId ? "Pintasan Keyboard" : "Keyboard Shortcuts"}</div>
                  <kbd className="font-mono text-[9px] px-1 py-0.5 rounded bg-surface-3 border border-border/80 text-text-muted">?</kbd>
                </div>
              </button>
            )}
          </div>

          {/* Section: Academic & Testing */}
          <div className="py-1">
            <div className="px-2 py-1 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
              {isId ? "Akademik & Pengujian" : "Academic & Testing"}
            </div>

            {onOpenAcademicA4 && (
              <button
                disabled={!hasDiagram}
                onClick={() => {
                  setOpen(false);
                  onOpenAcademicA4();
                }}
                className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left text-text hover:bg-surface-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed group"
              >
                <span>📑</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-text">{isId ? "Lembar Lampiran Skripsi A4" : "Academic A4 Thesis Sheet"}</div>
                  <div className="text-[10px] text-text-muted truncate">{isId ? "Cetak PDF bingkai formal & Kop Diagram" : "Print-ready PDF with border & title block"}</div>
                </div>
              </button>
            )}

            {onOpenUseCaseNarrative && (
              <button
                disabled={!hasDiagram}
                onClick={() => {
                  setOpen(false);
                  onOpenUseCaseNarrative();
                }}
                className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left text-text hover:bg-surface-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed group"
              >
                <span>📋</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-text">{isId ? "Skenario Narasi Use Case" : "Use Case Scenarios"}</div>
                  <div className="text-[10px] text-text-muted truncate">{isId ? "Tabel spesifikasi skenario Bab 3/4" : "SRS use case scenario tables"}</div>
                </div>
              </button>
            )}

            {onOpenDataDictionary && (
              <button
                disabled={!hasDiagram}
                onClick={() => {
                  setOpen(false);
                  onOpenDataDictionary();
                }}
                className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left text-text hover:bg-surface-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed group"
              >
                <span>📚</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-text">{isId ? "Kamus Data ERD (Data Dict)" : "ERD Data Dictionary"}</div>
                  <div className="text-[10px] text-text-muted truncate">{isId ? "Tabel kamus data teknis basis data" : "Technical data dictionary tables"}</div>
                </div>
              </button>
            )}

            {onOpenThesisBundle && (
              <button
                disabled={!hasDiagram}
                onClick={() => {
                  setOpen(false);
                  onOpenThesisBundle();
                }}
                className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left text-text hover:bg-surface-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed group"
              >
                <span>🎓</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-text">{isId ? "Bundle Lampiran Skripsi" : "Thesis Appendix Bundle"}</div>
                  <div className="text-[10px] text-text-muted truncate">{isId ? "Format Bab 3/4 tesis markdown" : "Chapter 3/4 thesis markdown"}</div>
                </div>
              </button>
            )}

            {onOpenTestCases && (
              <button
                disabled={!hasDiagram}
                onClick={() => {
                  setOpen(false);
                  onOpenTestCases();
                }}
                className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left text-text hover:bg-surface-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed group"
              >
                <span>🧪</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-text">{isId ? "Matriks Skenario Test Case" : "Test Case Matrix"}</div>
                  <div className="text-[10px] text-text-muted truncate">{isId ? "White-box & basis path testing" : "White-box & branch testing"}</div>
                </div>
              </button>
            )}

            {onOpenMockData && (
              <button
                disabled={!hasDiagram}
                onClick={() => {
                  setOpen(false);
                  onOpenMockData();
                }}
                className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left text-text hover:bg-surface-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed group"
              >
                <span>🗄️</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-text">{isId ? "Generator Mock Data SQL/JSON" : "Mock Data Generator"}</div>
                  <div className="text-[10px] text-text-muted truncate">{isId ? "Data dummy otomatis dari ERD/Class" : "Seed SQL & JSON array dummy"}</div>
                </div>
              </button>
            )}

            {onOpenDependencyMatrix && (
              <button
                disabled={!hasDiagram}
                onClick={() => {
                  setOpen(false);
                  onOpenDependencyMatrix();
                }}
                className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left text-text hover:bg-surface-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed group"
              >
                <span>🧱</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-text">{isId ? "Matriks Ketergantungan (DSM)" : "Dependency Structure Matrix"}</div>
                  <div className="text-[10px] text-text-muted truncate">{isId ? "Deteksi siklus dependensi sirkular" : "Circular cycle detection"}</div>
                </div>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
