import React, { useMemo } from "react";
import type { Diagram } from "@uml-editor/shared";
import { analyzeDependencies } from "../../services/dependency-analyzer";
import { useI18n } from "../../i18n";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  diagram: Diagram | null;
  onSelectNode?: (nodeId: string) => void;
}

export function DependencyMatrixModal({ isOpen, onClose, diagram, onSelectNode }: Props) {
  const { locale } = useI18n();
  const isId = locale === "id";

  const result = useMemo(() => {
    if (!diagram) return null;
    return analyzeDependencies(diagram);
  }, [diagram]);

  if (!isOpen || !diagram || !result) return null;

  const { nodes, matrix, couplings, cycles, hasCircularDependency, density, recommendation } = result;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface-1 border border-border rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-2/60">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-xl ${
              hasCircularDependency
                ? "bg-rose-500/10 border-rose-500/20 text-rose-500"
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
            }`}>
              {hasCircularDependency ? "⚠️" : "🕸️"}
            </div>
            <div>
              <h2 className="text-base font-bold text-text">
                {isId
                  ? "Matriks Ketergantungan Arsitektur (DSM) & Siklus Ketergantungan"
                  : "Dependency Structure Matrix (DSM) & Cycle Audit"}
              </h2>
              <p className="text-xs text-text-muted">
                {isId
                  ? `Analisis kopling, stabilitas arsitektur, dan deteksi siklus (circular dependencies) pada '${diagram.name}'`
                  : `Coupling metrics, instability, and circular dependency cycle detection on '${diagram.name}'`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text p-2 rounded-lg hover:bg-surface-3 transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {/* Circular Dependency Warning Alert */}
        {hasCircularDependency && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <span>🚨</span>
              <span>
                {isId
                  ? `Peringatan: Ditemukan ${cycles.length} Siklus Ketergantungan Melingkar (Circular Dependency)!`
                  : `Warning: Detected ${cycles.length} Circular Dependency Cycles!`}
              </span>
            </div>
            <div className="space-y-1">
              {cycles.map((c, idx) => (
                <div key={idx} className="font-mono bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/20 text-[11px]">
                  <strong>Siklus #{idx + 1}:</strong> {c.description}
                </div>
              ))}
            </div>
            <div className="text-[11px] opacity-90">
              {recommendation}
            </div>
          </div>
        )}

        {/* Metrics Overview Ribbon */}
        <div className="grid grid-cols-4 gap-3 px-6 py-3 border-b border-border bg-surface-2/20 text-xs">
          <div className="p-2.5 rounded-xl bg-surface-2 border border-border">
            <div className="text-[10px] text-text-muted">Total Komponen</div>
            <div className="text-lg font-bold text-text">{nodes.length}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-surface-2 border border-border">
            <div className="text-[10px] text-text-muted">Kerapatan Graf (Density)</div>
            <div className="text-lg font-bold text-accent">{density}%</div>
          </div>
          <div className="p-2.5 rounded-xl bg-surface-2 border border-border">
            <div className="text-[10px] text-text-muted">Siklus Melingkar</div>
            <div className={`text-lg font-bold ${hasCircularDependency ? "text-rose-500" : "text-emerald-500"}`}>
              {cycles.length}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-surface-2 border border-border">
            <div className="text-[10px] text-text-muted">Status Struktur</div>
            <div className={`text-sm font-bold mt-1 ${hasCircularDependency ? "text-rose-500" : "text-emerald-500"}`}>
              {hasCircularDependency ? "Cyclic (Perlu Decoupling)" : "Acyclic (Clean & Stable)"}
            </div>
          </div>
        </div>

        {/* Main DSM Matrix & Coupling Table */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* 1. DSM Interactive Grid */}
          <div>
            <h3 className="text-xs font-bold text-text uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>⊞</span>
              <span>Dependency Structure Matrix (DSM)</span>
            </h3>
            <p className="text-[11px] text-text-muted mb-3">
              {isId
                ? "Baris (Sumber) memanggil Kolom (Tujuan). Nilai angka menunjukkan jumlah relasi ketergantungan langsung."
                : "Row (Source) depends on Column (Target). Number indicates dependency count."}
            </p>

            <div className="overflow-x-auto border border-border rounded-xl">
              <table className="w-full text-center text-xs border-collapse">
                <thead className="bg-surface-2 text-text font-semibold border-b border-border">
                  <tr>
                    <th className="p-2.5 text-left border-r border-border text-[11px] bg-surface-3/50 min-w-36">
                      Komponen \ Tujuan
                    </th>
                    {nodes.map((n, j) => (
                      <th
                        key={n.id}
                        className="p-2.5 border-r border-border min-w-16 max-w-24 truncate text-[11px]"
                        title={n.name}
                      >
                        {j + 1}. {n.name.slice(0, 10)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 bg-surface-1">
                  {nodes.map((rowNode, i) => (
                    <tr key={rowNode.id} className="hover:bg-surface-2/40 transition-colors">
                      <td className="p-2.5 text-left border-r border-border font-medium text-text bg-surface-2/20 truncate">
                        <span className="font-mono text-accent text-[11px] mr-1.5">
                          {i + 1}.
                        </span>
                        <span
                          className="cursor-pointer hover:underline"
                          onClick={() => {
                            onSelectNode?.(rowNode.id);
                            onClose();
                          }}
                        >
                          {rowNode.name}
                        </span>
                      </td>
                      {nodes.map((colNode, j) => {
                        const val = matrix[i][j];
                        const isDiag = i === j;
                        const isCrossCycle = val > 0 && matrix[j][i] > 0;

                        return (
                          <td
                            key={colNode.id}
                            className={`p-2 border-r border-border font-mono text-[11px] transition-colors ${
                              isDiag
                                ? "bg-surface-3/40 text-text-muted"
                                : val > 0
                                  ? isCrossCycle
                                    ? "bg-rose-500/20 text-rose-500 font-bold"
                                    : "bg-accent/15 text-accent font-bold"
                                  : "text-text-muted/40"
                            }`}
                            title={
                              isDiag
                                ? "Self"
                                : `${rowNode.name} ➔ ${colNode.name}: ${val} relasi`
                            }
                          >
                            {isDiag ? "•" : val > 0 ? val : ""}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Robert C. Martin Instability (I) Table */}
          <div>
            <h3 className="text-xs font-bold text-text uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>📊</span>
              <span>Metrik Kopling & Stabilitas Komponen (Robert C. Martin)</span>
            </h3>

            <div className="border border-border rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-surface-2 text-text font-semibold border-b border-border">
                  <tr>
                    <th className="p-2.5">Nama Komponen</th>
                    <th className="p-2.5 w-32">Afferent (Ca - Masuk)</th>
                    <th className="p-2.5 w-32">Efferent (Ce - Keluar)</th>
                    <th className="p-2.5 w-44">Instability (I)</th>
                    <th className="p-2.5 w-36">Kategori Stabilitas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 bg-surface-1">
                  {couplings.map((c) => {
                    const isStable = c.instability <= 0.3;
                    const isUnstable = c.instability >= 0.7;

                    return (
                      <tr key={c.nodeId} className="hover:bg-surface-2/40 transition-colors">
                        <td className="p-2.5 font-medium text-text">{c.nodeName}</td>
                        <td className="p-2.5 font-mono text-emerald-500 font-semibold">{c.afferentCoupling}</td>
                        <td className="p-2.5 font-mono text-indigo-500 font-semibold">{c.efferentCoupling}</td>
                        <td className="p-2.5 align-middle">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-surface-3 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  isStable ? "bg-emerald-500" : isUnstable ? "bg-rose-500" : "bg-amber-500"
                                }`}
                                style={{ width: `${Math.round(c.instability * 100)}%` }}
                              />
                            </div>
                            <span className="font-mono text-[11px] font-bold text-text">
                              {c.instability}
                            </span>
                          </div>
                        </td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                              isStable
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                : isUnstable
                                  ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                  : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            }`}
                          >
                            {isStable ? "Sangat Stabil" : isUnstable ? "Fleksibel / Labil" : "Moderat"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-surface-2/40 flex items-center justify-between text-xs text-text-muted">
          <span>
            {isId
              ? "Instability I = Ce / (Ca + Ce). Nilai 0 berarti simpul sangat stabil (banyak modul bergantung padanya)."
              : "Instability I = Ce / (Ca + Ce). Value 0 means highly stable (many incoming dependencies)."}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-surface-3 hover:bg-surface-4 text-text border border-border transition-colors font-medium"
          >
            {isId ? "Tutup" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
