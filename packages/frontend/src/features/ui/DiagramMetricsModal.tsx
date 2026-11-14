import React, { useMemo } from "react";
import type { Diagram } from "@uml-editor/shared";
import { calculateDiagramMetrics, exportMetricsMarkdown } from "../../services/diagram-metrics";
import { showToast } from "./Toast";
import { useI18n } from "../../i18n";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  diagram: Diagram | null;
}

export function DiagramMetricsModal({ isOpen, onClose, diagram }: Props) {
  const { locale } = useI18n();
  const isId = locale === "id";

  const metrics = useMemo(() => {
    if (!diagram) return null;
    return calculateDiagramMetrics(diagram);
  }, [diagram]);

  if (!isOpen || !diagram || !metrics) return null;

  const handleCopyMarkdown = async () => {
    const md = exportMetricsMarkdown(metrics);
    try {
      await navigator.clipboard.writeText(md);
      showToast(
        isId
          ? "Laporan metrik Markdown berhasil disalin ke clipboard!"
          : "Markdown metrics report copied to clipboard!",
        "success"
      );
    } catch {
      showToast(isId ? "Gagal menyalin laporan" : "Failed to copy report", "error");
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case "Low":
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Low Risk (Sederhana)</span>;
      case "Moderate":
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">Moderate (Sedang)</span>;
      case "High":
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">High Risk (Kompleks)</span>;
      case "Critical":
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">Critical (Sangat Kompleks)</span>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-surface-2 border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent text-lg">
              📊
            </div>
            <div>
              <h2 className="text-base font-bold text-text">
                {isId ? "Analisis Kompleksitas & Metrik Diagram" : "Diagram Complexity & Metrics"}
              </h2>
              <p className="text-xs text-text-muted">
                {isId
                  ? `Analisis McCabe Cyclomatic, basis path & audit arsitektur (${metrics.diagramType.toUpperCase()})`
                  : `McCabe Cyclomatic, basis paths & architecture audit (${metrics.diagramType.toUpperCase()})`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-3 transition-colors"
            title={isId ? "Tutup (Esc)" : "Close (Esc)"}
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-surface-3 border border-border">
              <span className="text-[11px] font-medium text-text-muted block">Cyclomatic V(G)</span>
              <div className="text-2xl font-bold text-text mt-1 flex items-baseline gap-2">
                {metrics.cyclomaticComplexity}
              </div>
              <div className="mt-1">{getRiskBadge(metrics.riskLevel)}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-3 border border-border">
              <span className="text-[11px] font-medium text-text-muted block">Basis Paths</span>
              <div className="text-2xl font-bold text-accent mt-1">
                {metrics.basisPaths}
              </div>
              <span className="text-[10px] text-text-muted mt-1 block">Jalur Uji Mandiri</span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-3 border border-border">
              <span className="text-[11px] font-medium text-text-muted block">Predikat Keputusan</span>
              <div className="text-2xl font-bold text-text mt-1">
                {metrics.predicateCount}
              </div>
              <span className="text-[10px] text-text-muted mt-1 block">Decision Nodes</span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-3 border border-border">
              <span className="text-[11px] font-medium text-text-muted block">Elemen Graph</span>
              <div className="text-lg font-bold text-text mt-1">
                {metrics.totalNodes} <span className="text-xs font-normal text-text-muted">Node</span> / {metrics.totalEdges} <span className="text-xs font-normal text-text-muted">Edge</span>
              </div>
              <span className="text-[10px] text-text-muted mt-1 block">Rasio: {(metrics.totalEdges / Math.max(1, metrics.totalNodes)).toFixed(2)}</span>
            </div>
          </div>

          {/* Specific Domain Section: Class Diagram */}
          {metrics.diagramType === "class" && (
            <div className="p-4 rounded-xl bg-surface-3/60 border border-border space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-2">
                <span>☕</span> Metrik Berorientasi Objek (OO Metrics)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-surface-2 border border-border/60">
                  <span className="text-text-muted block">Classes / Enums</span>
                  <span className="text-sm font-bold text-text mt-0.5 block">{metrics.classCount || 0} / {metrics.enumCount || 0}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-2 border border-border/60">
                  <span className="text-text-muted block">Max DIT (Depth)</span>
                  <span className={`text-sm font-bold mt-0.5 block ${(metrics.maxDIT || 0) > 3 ? "text-amber-400" : "text-emerald-400"}`}>
                    {metrics.maxDIT || 0} {metrics.maxDIT && metrics.maxDIT > 3 ? "(Tinggi)" : "(Aman)"}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-2 border border-border/60">
                  <span className="text-text-muted block">Avg Coupling (CBO)</span>
                  <span className="text-sm font-bold text-text mt-0.5 block">{metrics.avgCBO || 0} per class</span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-2 border border-border/60">
                  <span className="text-text-muted block">Total Methods/Attrs</span>
                  <span className="text-sm font-bold text-text mt-0.5 block">{metrics.totalMethods || 0}m / {metrics.totalAttributes || 0}a</span>
                </div>
              </div>
            </div>
          )}

          {/* Specific Domain Section: ERD */}
          {metrics.diagramType === "erd" && (
            <div className="p-4 rounded-xl bg-surface-3/60 border border-border space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-2">
                <span>🗄️</span> Audit Normalisasi Skema Relasional (ERD)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-surface-2 border border-border/60">
                  <span className="text-text-muted block">Total Entitas</span>
                  <span className="text-sm font-bold text-text mt-0.5 block">{metrics.entityCount || 0} Tabel</span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-2 border border-border/60">
                  <span className="text-text-muted block">Kolom & Keys</span>
                  <span className="text-sm font-bold text-text mt-0.5 block">{metrics.primaryKeyCount || 0} PK / {metrics.foreignKeyCount || 0} FK</span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-2 border border-border/60">
                  <span className="text-text-muted block">Tabel Tanpa PK</span>
                  <span className={`text-sm font-bold mt-0.5 block ${(metrics.missingPKEntities?.length || 0) > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                    {metrics.missingPKEntities?.length || 0}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface-2 border border-border/60">
                  <span className="text-text-muted block">Tabel Yatim (Orphan)</span>
                  <span className={`text-sm font-bold mt-0.5 block ${(metrics.orphanEntities?.length || 0) > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                    {metrics.orphanEntities?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations List */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-2">
              <span>💡</span> {isId ? "Audit Kualitas & Rekomendasi Refactoring" : "Quality Audit & Refactoring Recommendations"}
            </h3>
            <div className="space-y-2">
              {metrics.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-surface-3/50 border border-border text-xs text-text leading-relaxed flex items-start gap-2.5"
                >
                  <span className="text-accent font-bold mt-0.5">•</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-border bg-surface-1">
          <button
            onClick={handleCopyMarkdown}
            className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-xs flex items-center gap-2 active:scale-95 transition-all"
          >
            <span>📋</span>
            <span>{isId ? "Salin Laporan Markdown" : "Copy Markdown Report"}</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border hover:bg-surface-3 text-text-muted hover:text-text text-xs font-medium transition-colors"
          >
            {isId ? "Tutup" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
