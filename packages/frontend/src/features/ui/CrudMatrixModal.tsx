import React, { useState, useEffect, useMemo } from "react";
import type { Diagram } from "@uml-editor/shared";
import {
  extractCrudMatrix,
  formatCrudCell,
  exportCrudMatrixMarkdown,
  exportCrudMatrixCSV,
  exportCrudMatrixExcel,
  type CrudMatrix,
  type CrudCell,
} from "../../services/crud-matrix-generator";
import { showToast } from "./Toast";
import { useI18n } from "../../i18n";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  diagram: Diagram | null;
}

export function CrudMatrixModal({ isOpen, onClose, diagram }: Props) {
  const { locale } = useI18n();
  const isId = locale === "id";

  const [matrixData, setMatrixData] = useState<CrudMatrix | null>(null);
  const [newEntityName, setNewEntityName] = useState("");
  const [newProcessName, setNewProcessName] = useState("");
  const [showAddCols, setShowAddCols] = useState(false);

  const storageKey = `uml_flow_crud_matrix_${diagram?.id || diagram?.name || "default"}`;

  // Initialize from cache or extract when diagram changes
  useEffect(() => {
    if (diagram && isOpen) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && Array.isArray(parsed.processes) && Array.isArray(parsed.entities)) {
            setMatrixData(parsed);
            return;
          }
        }
      } catch {}
      setMatrixData(extractCrudMatrix(diagram));
    }
  }, [diagram, isOpen, storageKey]);

  // Persist customized matrix whenever it updates
  useEffect(() => {
    if (matrixData && diagram && isOpen) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(matrixData));
      } catch {}
    }
  }, [matrixData, diagram, isOpen, storageKey]);

  const toggleFlag = (proc: string, ent: string, flag: keyof CrudCell) => {
    if (!matrixData) return;
    setMatrixData((prev) => {
      if (!prev) return prev;
      const currentCell = prev.matrix[proc]?.[ent] || {
        C: false,
        R: false,
        U: false,
        D: false,
      };
      const updatedCell = {
        ...currentCell,
        [flag]: !currentCell[flag],
      };
      return {
        ...prev,
        matrix: {
          ...prev.matrix,
          [proc]: {
            ...prev.matrix[proc],
            [ent]: updatedCell,
          },
        },
      };
    });
  };

  const handleAddEntity = () => {
    const trimmed = newEntityName.trim();
    if (!trimmed || !matrixData) return;
    if (matrixData.entities.includes(trimmed)) {
      showToast(isId ? "Entitas sudah ada" : "Entity already exists", "info");
      return;
    }
    setMatrixData((prev) => {
      if (!prev) return prev;
      const newMatrix = { ...prev.matrix };
      for (const p of prev.processes) {
        newMatrix[p] = {
          ...newMatrix[p],
          [trimmed]: { C: false, R: false, U: false, D: false },
        };
      }
      return {
        ...prev,
        entities: [...prev.entities, trimmed],
        matrix: newMatrix,
      };
    });
    setNewEntityName("");
  };

  const handleAddProcess = () => {
    const trimmed = newProcessName.trim();
    if (!trimmed || !matrixData) return;
    if (matrixData.processes.includes(trimmed)) {
      showToast(isId ? "Proses sudah ada" : "Process already exists", "info");
      return;
    }
    setMatrixData((prev) => {
      if (!prev) return prev;
      const newRow: Record<string, CrudCell> = {};
      for (const ent of prev.entities) {
        newRow[ent] = { C: false, R: false, U: false, D: false };
      }
      return {
        ...prev,
        processes: [...prev.processes, trimmed],
        matrix: {
          ...prev.matrix,
          [trimmed]: newRow,
        },
      };
    });
    setNewProcessName("");
  };

  const handleResetHeuristics = () => {
    if (!diagram) return;
    try {
      localStorage.removeItem(storageKey);
    } catch {}
    setMatrixData(extractCrudMatrix(diagram));
    showToast(isId ? "Heuristik CRUD di-reset ulang" : "CRUD heuristics reset", "info");
  };

  const markdownContent = useMemo(() => {
    if (!matrixData || !diagram) return "";
    return exportCrudMatrixMarkdown(matrixData, diagram.name || "Sistem Informasi");
  }, [matrixData, diagram]);

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdownContent);
      showToast(
        isId
          ? "Matriks CRUD berhasil disalin ke clipboard!"
          : "CRUD Matrix copied to clipboard!",
        "success"
      );
    } catch {
      showToast(isId ? "Gagal menyalin" : "Failed to copy", "error");
    }
  };

  const handleDownloadCSV = () => {
    if (!matrixData || !diagram) return;
    const csv = exportCrudMatrixCSV(matrixData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `matriks_crud_${(diagram.name || "diagram").toLowerCase().replace(/[^a-z0-9]/g, "_")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(isId ? "File CSV berhasil diunduh!" : "CSV downloaded!", "success");
  };

  const handleDownloadExcel = () => {
    if (!matrixData || !diagram) return;
    const xls = exportCrudMatrixExcel(matrixData, diagram.name || "Sistem Informasi");
    const blob = new Blob([xls], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `matriks_crud_${(diagram.name || "diagram").toLowerCase().replace(/[^a-z0-9]/g, "_")}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(isId ? "File Excel (.xls) berhasil diunduh!" : "Excel (.xls) downloaded!", "success");
  };

  const handleDownloadMarkdown = () => {
    if (!diagram) return;
    const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `matriks_crud_${(diagram.name || "diagram").toLowerCase().replace(/[^a-z0-9]/g, "_")}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(isId ? "File markdown berhasil diunduh!" : "Markdown downloaded!", "success");
  };

  if (!isOpen || !diagram || !matrixData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface-1 border border-border rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🗂️</span>
            <div>
              <h2 className="text-base font-semibold text-text flex items-center gap-2">
                <span>{isId ? "Matriks CRUD (Proses × Entitas)" : "CRUD Matrix (Process × Entity)"}</span>
                <span className="text-xs font-normal text-text-muted bg-surface-3 px-2 py-0.5 rounded-full border border-border">
                  {diagram.name}
                </span>
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                {isId
                  ? "Pemetaan operasi Create, Read, Update, Delete untuk Bab 3/4 Skripsi & SRS"
                  : "Mapping of Create, Read, Update, Delete operations for SRS & Thesis Chapter 3"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text p-1.5 rounded-lg hover:bg-surface-3 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Action Bar */}
        <div className="px-6 py-2.5 bg-surface-2/60 border-b border-border flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-text-muted">{isId ? "Operasi:" : "Legend:"}</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">C = Create</span>
            <span className="px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 font-bold border border-blue-500/30">R = Read</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30">U = Update</span>
            <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 font-bold border border-rose-500/30">D = Delete</span>
            <button
              onClick={() => setShowAddCols((v) => !v)}
              className="ml-2 text-accent hover:underline font-medium"
            >
              {showAddCols ? (isId ? "Tutup Tambah Entitas" : "Hide Entity/Process Controls") : (isId ? "+ Tambah Entitas/Proses" : "+ Add Entity/Process")}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetHeuristics}
              title={isId ? "Reset deteksi otomatis" : "Reset auto-heuristics"}
              className="px-2.5 py-1.5 bg-surface-3 hover:bg-surface-4 text-text-muted hover:text-text rounded-lg border border-border transition-colors font-medium"
            >
              ↺ {isId ? "Reset" : "Reset"}
            </button>
            <button
              onClick={handleDownloadCSV}
              className="px-2.5 py-1.5 bg-surface-3 hover:bg-surface-4 text-text rounded-lg border border-border transition-colors font-medium flex items-center gap-1.5"
            >
              <span>📊</span>
              <span>CSV</span>
            </button>
            <button
              onClick={handleDownloadExcel}
              className="px-2.5 py-1.5 bg-surface-3 hover:bg-surface-4 text-text rounded-lg border border-border transition-colors font-medium flex items-center gap-1.5"
            >
              <span>📗</span>
              <span>Excel</span>
            </button>
            <button
              onClick={handleDownloadMarkdown}
              className="px-2.5 py-1.5 bg-surface-3 hover:bg-surface-4 text-text rounded-lg border border-border transition-colors font-medium flex items-center gap-1.5"
            >
              <span>📥</span>
              <span>Markdown</span>
            </button>
            <button
              onClick={handleCopyMarkdown}
              className="px-3 py-1.5 bg-accent text-white font-medium rounded-lg hover:bg-accent/90 transition-colors shadow-xs flex items-center gap-1.5"
            >
              <span>📋</span>
              <span>{isId ? "Salin Markdown" : "Copy Markdown"}</span>
            </button>
          </div>
        </div>

        {/* Expandable Add Entity / Process Box */}
        {showAddCols && (
          <div className="px-6 py-3 bg-surface-3/50 border-b border-border flex flex-wrap gap-4 text-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span className="font-medium text-text-muted">{isId ? "Tambah Entitas:" : "Add Entity:"}</span>
              <input
                type="text"
                value={newEntityName}
                onChange={(e) => setNewEntityName(e.target.value)}
                placeholder="cth: Transaksi"
                className="px-2.5 py-1 rounded bg-surface-1 border border-border text-text focus:outline-none focus:border-accent w-36"
                onKeyDown={(e) => e.key === "Enter" && handleAddEntity()}
              />
              <button
                onClick={handleAddEntity}
                className="px-2.5 py-1 bg-accent/20 text-accent font-medium rounded hover:bg-accent/30 transition-colors"
              >
                +
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-text-muted">{isId ? "Tambah Proses:" : "Add Process:"}</span>
              <input
                type="text"
                value={newProcessName}
                onChange={(e) => setNewProcessName(e.target.value)}
                placeholder="cth: Verifikasi Pembayaran"
                className="px-2.5 py-1 rounded bg-surface-1 border border-border text-text focus:outline-none focus:border-accent w-48"
                onKeyDown={(e) => e.key === "Enter" && handleAddProcess()}
              />
              <button
                onClick={handleAddProcess}
                className="px-2.5 py-1 bg-accent/20 text-accent font-medium rounded hover:bg-accent/30 transition-colors"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="border border-border rounded-xl overflow-hidden shadow-xs bg-surface-2">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-surface-3/90 border-b border-border text-text-muted font-semibold">
                  <th className="py-2.5 px-3 text-center w-12 border-r border-border/60">No</th>
                  <th className="py-2.5 px-4 text-left min-w-[200px] border-r border-border/60">
                    {isId ? "Proses / Use Case" : "Process / Use Case"}
                  </th>
                  {matrixData.entities.map((ent) => (
                    <th key={ent} className="py-2.5 px-3 text-center min-w-[120px] border-r border-border/60 last:border-r-0">
                      <span className="font-semibold text-text">{ent}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {matrixData.processes.map((proc, idx) => (
                  <tr key={proc} className="hover:bg-surface-3/40 transition-colors">
                    <td className="py-2 px-3 text-center text-text-muted border-r border-border/60 font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-4 font-medium text-text border-r border-border/60">
                      {proc}
                    </td>
                    {matrixData.entities.map((ent) => {
                      const cell = matrixData.matrix[proc]?.[ent] || {
                        C: false,
                        R: false,
                        U: false,
                        D: false,
                      };
                      return (
                        <td key={ent} className="py-2 px-2 text-center border-r border-border/60 last:border-r-0">
                          <div className="inline-flex items-center gap-1 justify-center">
                            <button
                              onClick={() => toggleFlag(proc, ent, "C")}
                              title="Toggle Create (C)"
                              className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] transition-all ${
                                cell.C
                                  ? "bg-emerald-500 text-white shadow-xs scale-105"
                                  : "bg-surface-3 text-text-muted hover:bg-surface-4"
                              }`}
                            >
                              C
                            </button>
                            <button
                              onClick={() => toggleFlag(proc, ent, "R")}
                              title="Toggle Read (R)"
                              className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] transition-all ${
                                cell.R
                                  ? "bg-blue-500 text-white shadow-xs scale-105"
                                  : "bg-surface-3 text-text-muted hover:bg-surface-4"
                              }`}
                            >
                              R
                            </button>
                            <button
                              onClick={() => toggleFlag(proc, ent, "U")}
                              title="Toggle Update (U)"
                              className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] transition-all ${
                                cell.U
                                  ? "bg-amber-500 text-white shadow-xs scale-105"
                                  : "bg-surface-3 text-text-muted hover:bg-surface-4"
                              }`}
                            >
                              U
                            </button>
                            <button
                              onClick={() => toggleFlag(proc, ent, "D")}
                              title="Toggle Delete (D)"
                              className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] transition-all ${
                                cell.D
                                  ? "bg-rose-500 text-white shadow-xs scale-105"
                                  : "bg-surface-3 text-text-muted hover:bg-surface-4"
                              }`}
                            >
                              D
                            </button>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-surface-2 flex items-center justify-between text-xs text-text-muted">
          <span>
            {matrixData.processes.length} {isId ? "Proses" : "Processes"} × {matrixData.entities.length} {isId ? "Entitas" : "Entities"}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-surface-3 hover:bg-surface-4 text-text rounded-lg border border-border transition-colors font-medium"
          >
            {isId ? "Tutup" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
