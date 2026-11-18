import React, { useState, useMemo } from "react";
import type { Diagram } from "@uml-editor/shared";
import {
  extractDataDictionary,
  generateDataDictionaryMarkdown,
  generateDataDictionaryCSV,
  type DataDictionaryTable,
} from "../../services/erd-dictionary";
import { showToast } from "./Toast";
import { useI18n } from "../../i18n";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  diagram: Diagram | null;
}

export function DataDictionaryModal({ isOpen, onClose, diagram }: Props) {
  const { locale } = useI18n();
  const isId = locale === "id";
  const [activeTab, setActiveTab] = useState<"visual" | "markdown" | "csv">("visual");
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const tables: DataDictionaryTable[] = useMemo(() => {
    if (!diagram) return [];
    return extractDataDictionary(diagram);
  }, [diagram]);

  const filteredTables = useMemo(() => {
    if (!searchQuery.trim()) return tables;
    const q = searchQuery.toLowerCase();
    return tables.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.fields.some((f) => f.name.toLowerCase().includes(q) || f.type.toLowerCase().includes(q)),
    );
  }, [tables, searchQuery]);

  const activeTable = useMemo(() => {
    if (selectedTableId) {
      const found = tables.find((t) => t.id === selectedTableId);
      if (found) return found;
    }
    return filteredTables[0] || tables[0] || null;
  }, [selectedTableId, tables, filteredTables]);

  const markdownContent = useMemo(() => {
    if (!diagram) return "";
    return generateDataDictionaryMarkdown(diagram);
  }, [diagram]);

  const csvContent = useMemo(() => {
    if (!diagram) return "";
    return generateDataDictionaryCSV(diagram);
  }, [diagram]);

  if (!isOpen || !diagram) return null;

  const handleCopy = async (content: string, label: string) => {
    try {
      await navigator.clipboard.writeText(content);
      showToast(`${label} ${isId ? "berhasil disalin ke clipboard!" : "copied to clipboard!"}`, "success");
    } catch {
      showToast(isId ? "Gagal menyalin" : "Failed to copy", "error");
    }
  };

  const handleDownloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast(isId ? `File ${filename} berhasil diunduh!` : `${filename} downloaded!`, "success");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-surface-1 border border-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-2/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-xl shadow-inner">
              📚
            </div>
            <div>
              <h2 className="text-base font-bold text-text flex items-center gap-2">
                {isId ? "Kamus Data ERD (Data Dictionary)" : "ERD Data Dictionary Generator"}
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {tables.length} Tabel
                </span>
              </h2>
              <p className="text-xs text-text-muted">
                {isId
                  ? "Tabel kamus data teknis standar Bab 3/4 Perancangan Basis Data Skripsi"
                  : "Standard technical data dictionary for database engineering specifications"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl bg-surface-3 p-1 border border-border text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab("visual")}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  activeTab === "visual"
                    ? "bg-accent text-white shadow-sm"
                    : "text-text-muted hover:text-text"
                }`}
              >
                {isId ? "Tabel Interaktif" : "Interactive Table"}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("markdown")}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  activeTab === "markdown"
                    ? "bg-accent text-white shadow-sm"
                    : "text-text-muted hover:text-text"
                }`}
              >
                Markdown
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("csv")}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  activeTab === "csv"
                    ? "bg-accent text-white shadow-sm"
                    : "text-text-muted hover:text-text"
                }`}
              >
                CSV / Excel
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-3 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden flex flex-col p-6 min-h-[420px]">
          {tables.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="text-4xl mb-3">🗄️</div>
              <h3 className="text-sm font-semibold text-text mb-1">
                {isId ? "Belum Ada Entitas ERD" : "No ERD Entities Found"}
              </h3>
              <p className="text-xs text-text-muted max-w-sm">
                {isId
                  ? "Tambahkan entitas ERD (contoh: entity Mahasiswa { id: int <<pk>> }) pada diagram Anda untuk men-generate kamus data otomatis."
                  : "Add ERD entity definitions to your diagram to auto-generate the data dictionary."}
              </p>
            </div>
          ) : activeTab === "markdown" ? (
            <div className="flex-1 flex flex-col min-h-0">
              <pre className="flex-1 p-4 rounded-xl bg-surface-2 border border-border text-xs font-mono text-text overflow-auto select-all leading-relaxed whitespace-pre-wrap">
                {markdownContent}
              </pre>
            </div>
          ) : activeTab === "csv" ? (
            <div className="flex-1 flex flex-col min-h-0">
              <pre className="flex-1 p-4 rounded-xl bg-surface-2 border border-border text-xs font-mono text-text overflow-auto select-all leading-relaxed whitespace-pre-wrap">
                {csvContent}
              </pre>
            </div>
          ) : (
            <div className="flex-1 flex gap-5 overflow-hidden min-h-0">
              {/* Left Sidebar Table List */}
              <div className="w-64 flex flex-col border-r border-border pr-4 min-h-0">
                <input
                  type="text"
                  placeholder={isId ? "Cari tabel / kolom..." : "Search table / column..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-1.5 mb-3 rounded-lg bg-surface-2 border border-border text-xs text-text focus:outline-none focus:border-accent"
                />

                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                  {filteredTables.map((t) => {
                    const isSelected = activeTable?.id === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTableId(t.id)}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                          isSelected
                            ? "bg-accent/15 border-accent text-accent font-semibold shadow-sm"
                            : "bg-surface-2/60 border-border text-text hover:bg-surface-2 hover:border-border-hover"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-mono font-bold">{t.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-3 text-text-muted">
                            {t.fields.length} kolom
                          </span>
                        </div>
                        <div className="text-[11px] text-text-muted truncate">{t.comment}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Data Dictionary Table */}
              <div className="flex-1 overflow-y-auto pr-1">
                {activeTable && (
                  <div className="space-y-4">
                    {/* Table Summary Card */}
                    <div className="p-4 rounded-xl bg-surface-2/80 border border-border flex items-start justify-between">
                      <div>
                        <div className="text-[11px] font-mono font-bold text-accent mb-0.5">
                          ENTITY TABLE
                        </div>
                        <h3 className="text-base font-bold text-text font-mono">
                          {activeTable.name}
                        </h3>
                        <p className="text-xs text-text-muted mt-0.5">
                          {activeTable.comment}
                        </p>
                      </div>
                      <span className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                        {activeTable.fields.length} Atribut
                      </span>
                    </div>

                    {/* Columns Data Table */}
                    <div className="rounded-xl border border-border overflow-hidden text-xs">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-surface-3/80 border-b border-border text-text-muted text-[11px] uppercase tracking-wider">
                            <th className="p-2.5 text-center w-10">No</th>
                            <th className="p-2.5">Nama Kolom</th>
                            <th className="p-2.5">Tipe Data</th>
                            <th className="p-2.5 text-center">Kunci</th>
                            <th className="p-2.5 text-center">Nullable</th>
                            <th className="p-2.5">Keterangan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {activeTable.fields.map((f, idx) => (
                            <tr key={idx} className="hover:bg-surface-2/50 transition-colors">
                              <td className="p-2.5 text-center text-text-muted font-mono">{idx + 1}</td>
                              <td className="p-2.5 font-mono font-bold text-text">{f.name}</td>
                              <td className="p-2.5 font-mono text-accent">{f.type}</td>
                              <td className="p-2.5 text-center">
                                {f.isPrimaryKey && (
                                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                    PK
                                  </span>
                                )}
                                {f.isForeignKey && (
                                  <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                                    FK {f.references ? `(${f.references})` : ""}
                                  </span>
                                )}
                                {!f.isPrimaryKey && !f.isForeignKey && (
                                  <span className="text-text-muted">-</span>
                                )}
                              </td>
                              <td className="p-2.5 text-center font-mono text-[11px]">
                                {f.isNullable ? (
                                  <span className="text-text-muted">NULL</span>
                                ) : (
                                  <span className="text-emerald-400 font-semibold">NOT NULL</span>
                                )}
                              </td>
                              <td className="p-2.5 text-text-muted leading-relaxed">
                                {f.description}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-surface-2/60">
          <div className="text-xs text-text-muted">
            {isId ? "Format standar perancangan basis data siap cetak" : "Standard database design ready for export"}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleCopy(markdownContent, "Kamus Data Markdown")}
              className="px-4 py-2 rounded-xl bg-surface-3 hover:bg-surface-3/80 border border-border text-text font-semibold text-xs transition-colors flex items-center gap-2"
            >
              📋 {isId ? "Salin Markdown" : "Copy Markdown"}
            </button>
            <button
              type="button"
              onClick={() =>
                handleDownloadFile(csvContent, `${diagram.name || "erd"}-data-dictionary.csv`, "text/csv")
              }
              className="px-4 py-2 rounded-xl bg-surface-3 hover:bg-surface-3/80 border border-border text-text font-semibold text-xs transition-colors flex items-center gap-2"
            >
              📊 {isId ? "Unduh CSV (Excel)" : "Download CSV"}
            </button>
            <button
              type="button"
              onClick={() =>
                handleDownloadFile(markdownContent, `${diagram.name || "erd"}-data-dictionary.md`, "text/markdown")
              }
              className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold text-xs shadow-md transition-colors flex items-center gap-2"
            >
              📥 {isId ? "Unduh Markdown (.md)" : "Download (.md)"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
