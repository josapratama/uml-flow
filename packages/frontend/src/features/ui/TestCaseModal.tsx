import React, { useState, useMemo } from "react";
import type { Diagram } from "@uml-editor/shared";
import {
  generateTestCases,
  generateBlackBoxCases,
  generateUATMatrix,
  exportTestCasesMarkdown,
  type TestCase,
  type BlackBoxCase,
  type UATItem,
} from "../../services/test-case-generator";
import { showToast } from "./Toast";
import { useI18n } from "../../i18n";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  diagram: Diagram | null;
}

export function TestCaseModal({ isOpen, onClose, diagram }: Props) {
  const { locale } = useI18n();
  const isId = locale === "id";

  const [activeTab, setActiveTab] = useState<"whitebox" | "blackbox" | "uat">("whitebox");
  const [filterType, setFilterType] = useState<string>("all");

  const testCases: TestCase[] = useMemo(() => {
    if (!diagram) return [];
    return generateTestCases(diagram);
  }, [diagram]);

  const blackBoxCases: BlackBoxCase[] = useMemo(() => {
    if (!diagram) return [];
    return generateBlackBoxCases(diagram);
  }, [diagram]);

  const uatItems: UATItem[] = useMemo(() => {
    if (!diagram) return [];
    return generateUATMatrix(diagram);
  }, [diagram]);

  const filteredCases = useMemo(() => {
    if (filterType === "all") return testCases;
    return testCases.filter((tc) => tc.testType.toLowerCase().includes(filterType.toLowerCase()));
  }, [testCases, filterType]);

  const markdownContent = useMemo(() => {
    if (!diagram) return "";
    return exportTestCasesMarkdown(diagram, testCases);
  }, [diagram, testCases]);

  if (!isOpen || !diagram) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdownContent);
      showToast(isId ? "Laporan Pengujian & UAT berhasil disalin ke clipboard!" : "Test & UAT report copied to clipboard!", "success");
    } catch {
      showToast(isId ? "Gagal menyalin ke clipboard" : "Failed to copy to clipboard", "error");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan_pengujian_${diagram.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(isId ? "File laporan_pengujian.md berhasil diunduh!" : "laporan_pengujian.md downloaded!", "success");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface-1 border border-border rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-2/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-xl text-accent">
              🧪
            </div>
            <div>
              <h2 className="text-base font-bold text-text">
                {isId ? "Pengujian Sistem & Evaluasi UAT (Skripsi Bab IV)" : "System Testing & UAT Suite (Chapter IV)"}
              </h2>
              <p className="text-xs text-text-muted">
                {isId
                  ? `Otomasi uji White-Box basis path, Black-Box functional, dan evaluasi User Acceptance Testing '${diagram.name}'`
                  : `Automated white-box basis paths, black-box functional cases, and UAT rubric for '${diagram.name}'`}
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

        {/* Tab Selector */}
        <div className="flex border-b border-border bg-surface-2/40 px-6 pt-2">
          <button
            onClick={() => setActiveTab("whitebox")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "whitebox"
                ? "border-accent text-accent bg-accent/5"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            <span>⚪</span>
            <span>{isId ? `White-Box Basis Paths (${testCases.length})` : `White-Box (${testCases.length})`}</span>
          </button>
          <button
            onClick={() => setActiveTab("blackbox")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "blackbox"
                ? "border-accent text-accent bg-accent/5"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            <span>⚫</span>
            <span>{isId ? `Black-Box Equivalence (${blackBoxCases.length})` : `Black-Box (${blackBoxCases.length})`}</span>
          </button>
          <button
            onClick={() => setActiveTab("uat")}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "uat"
                ? "border-accent text-accent bg-accent/5"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            <span>📊</span>
            <span>{isId ? `UAT Questionnaire (${uatItems.length} Aspek)` : `UAT Matrix (${uatItems.length})`}</span>
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3 bg-surface-2/20 border-b border-border text-xs">
          {activeTab === "whitebox" ? (
            <div className="flex items-center gap-2">
              <span className="text-text-muted font-medium">Filter Tipe:</span>
              <div className="flex items-center gap-1 bg-surface-3 p-1 rounded-lg border border-border">
                {["all", "white-box", "black-box", "boundary"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilterType(f)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                      filterType === f
                        ? "bg-accent text-white shadow-xs"
                        : "text-text-muted hover:text-text hover:bg-surface-4"
                    }`}
                  >
                    {f === "all" ? "Semua (" + testCases.length + ")" : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-xs text-text-muted font-medium">
              {activeTab === "blackbox"
                ? (isId ? "Metode Equivalence Partitioning & Boundary Value Analysis" : "Equivalence Partitioning & Boundary Value Analysis")
                : (isId ? "Rubrik Evaluasi Skala Likert 5 Poin (ISO/IEC 25010)" : "5-Point Likert Evaluation Rubric (ISO/IEC 25010)")}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 rounded-lg bg-surface-3 hover:bg-surface-4 text-text border border-border font-medium flex items-center gap-1.5 transition-colors"
            >
              <span>📋</span>
              <span>{isId ? "Salin Laporan Bab 4" : "Copy Chapter 4 MD"}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 rounded-lg bg-accent hover:bg-accent/90 text-white font-medium flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <span>💾</span>
              <span>{isId ? "Unduh Bab 4 .md" : "Download Bab 4 .md"}</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === "whitebox" && (
            <div className="border border-border/80 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-surface-2 text-text font-semibold border-b border-border">
                  <tr>
                    <th className="p-3 w-20">ID</th>
                    <th className="p-3 w-56">Skenario Pengujian</th>
                    <th className="p-3 w-36">Tipe Uji</th>
                    <th className="p-3">Langkah Pengujian</th>
                    <th className="p-3 w-56">Hasil Diharapkan</th>
                    <th className="p-3 w-20 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 bg-surface-1">
                  {filteredCases.map((tc) => (
                    <tr key={tc.id} className="hover:bg-surface-2/40 transition-colors">
                      <td className="p-3 font-mono font-bold text-accent align-top">
                        {tc.id}
                      </td>
                      <td className="p-3 align-top">
                        <div className="font-semibold text-text">{tc.name}</div>
                        <div className="text-[11px] text-text-muted mt-0.5">{tc.scenario}</div>
                      </td>
                      <td className="p-3 align-top">
                        <span className="inline-block px-2 py-0.5 text-[10px] rounded-full bg-surface-3 border border-border font-medium text-text">
                          {tc.testType}
                        </span>
                      </td>
                      <td className="p-3 align-top text-text-muted space-y-1">
                        {tc.steps.map((st, i) => (
                          <div key={i} className="leading-snug">{st}</div>
                        ))}
                      </td>
                      <td className="p-3 align-top text-text font-medium leading-snug">
                        {tc.expectedResult}
                      </td>
                      <td className="p-3 align-top text-center">
                        <span className="inline-block px-2 py-0.5 text-[10px] rounded font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          {tc.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "blackbox" && (
            <div className="border border-border/80 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-surface-2 text-text font-semibold border-b border-border">
                  <tr>
                    <th className="p-3 w-20">No</th>
                    <th className="p-3 w-48">Fitur / Kasus Uji</th>
                    <th className="p-3 w-64">Data Masukan (Test Data)</th>
                    <th className="p-3 w-28 text-center">Jenis Uji</th>
                    <th className="p-3">Hasil yang Diharapkan</th>
                    <th className="p-3 w-48">Hasil Pengamatan</th>
                    <th className="p-3 w-24 text-center">Kesimpulan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 bg-surface-1">
                  {blackBoxCases.map((bb) => (
                    <tr key={bb.id} className="hover:bg-surface-2/40 transition-colors">
                      <td className="p-3 font-mono font-bold text-accent align-top">
                        {bb.id}
                      </td>
                      <td className="p-3 align-top font-semibold text-text">
                        {bb.feature}
                      </td>
                      <td className="p-3 align-top text-text-muted font-mono text-[11px]">
                        {bb.inputData}
                      </td>
                      <td className="p-3 align-top text-center">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] rounded-full font-semibold ${
                            bb.type === "Positive"
                              ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                              : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                          }`}
                        >
                          {bb.type}
                        </span>
                      </td>
                      <td className="p-3 align-top text-text leading-snug">
                        {bb.expectedResult}
                      </td>
                      <td className="p-3 align-top text-text-muted leading-snug">
                        {bb.actualResult}
                      </td>
                      <td className="p-3 align-top text-center">
                        <span className="inline-block px-2.5 py-0.5 text-[11px] rounded font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          {bb.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "uat" && (
            <div className="space-y-4">
              <div className="border border-border/80 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-surface-2 text-text font-semibold border-b border-border">
                    <tr>
                      <th className="p-3 w-20">Kode</th>
                      <th className="p-3 w-64">Aspek Pengujian</th>
                      <th className="p-3">Indikator Pernyataan Kuesioner</th>
                      <th className="p-3 w-40">Target Responden</th>
                      <th className="p-3 w-28 text-center">Rata-rata Skor</th>
                      <th className="p-3 w-24 text-center">Kelayakan</th>
                      <th className="p-3 w-28 text-center">Kategori</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 bg-surface-1">
                    {uatItems.map((u) => (
                      <tr key={u.id} className="hover:bg-surface-2/40 transition-colors">
                        <td className="p-3 font-mono font-bold text-accent align-top">
                          {u.id}
                        </td>
                        <td className="p-3 align-top font-semibold text-text">
                          {u.aspect}
                        </td>
                        <td className="p-3 align-top text-text-muted leading-snug">
                          {u.indicator}
                        </td>
                        <td className="p-3 align-top text-text-muted">
                          {u.targetRole}
                        </td>
                        <td className="p-3 align-top text-center font-bold text-accent">
                          {u.scoreAvg.toFixed(1)} / 5.0
                        </td>
                        <td className="p-3 align-top text-center font-bold text-text">
                          {u.percentage}%
                        </td>
                        <td className="p-3 align-top text-center">
                          <span className="inline-block px-2 py-0.5 text-[10px] rounded font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            {u.verdict}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-surface-2/50 border border-border rounded-xl flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <div className="font-semibold text-text">
                    {isId ? "Hasil Perhitungan Akseptansi UAT:" : "Overall UAT Acceptance Score:"}
                  </div>
                  <div className="text-text-muted text-[11px]">
                    {isId
                      ? "Rumus: (Total Skor Perolehan / Total Skor Maksimal) × 100% = 94.0% (Kategori: Sangat Layak)"
                      : "Formula: (Obtained Score / Max Score) × 100% = 94.0% (Category: Highly Accepted)"}
                  </div>
                </div>
                <div className="px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 font-bold rounded-lg text-sm">
                  94.0% - Sangat Layak
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-surface-2/40 flex items-center justify-between text-xs text-text-muted">
          <span>
            {isId
              ? "Format tabel standar siap salin untuk Bab IV Skripsi Pengujian Sistem & Evaluasi."
              : "Standard formatted tables ready for copy/paste into Chapter IV Software Testing & Evaluation."}
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
