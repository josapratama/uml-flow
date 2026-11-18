import React, { useState, useMemo, useEffect } from "react";
import type { Diagram } from "@uml-editor/shared";
import {
  generateTestCases,
  generateBlackBoxCases,
  generateUATMatrix,
  calculateUATVerdict,
  exportTestCasesMarkdown,
  exportTestCasesExcel,
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
  const [respondents, setRespondents] = useState<number>(10);

  const testCases: TestCase[] = useMemo(() => {
    if (!diagram) return [];
    return generateTestCases(diagram);
  }, [diagram]);

  const [blackBoxCases, setBlackBoxCases] = useState<BlackBoxCase[]>([]);
  const [uatItems, setUatItems] = useState<UATItem[]>([]);

  useEffect(() => {
    if (diagram) {
      setBlackBoxCases(generateBlackBoxCases(diagram));
      setUatItems(generateUATMatrix(diagram, respondents));
    }
  }, [diagram, respondents]);

  const filteredCases = useMemo(() => {
    if (filterType === "all") return testCases;
    return testCases.filter((tc) => tc.testType.toLowerCase().includes(filterType.toLowerCase()));
  }, [testCases, filterType]);

  const { avgUatPercentage, overallVerdict } = useMemo(() => {
    if (uatItems.length === 0) return { avgUatPercentage: 0, overallVerdict: "Cukup" };
    let total = 0;
    for (const u of uatItems) total += u.percentage;
    const avg = Number((total / uatItems.length).toFixed(1));
    return {
      avgUatPercentage: avg,
      overallVerdict: calculateUATVerdict(avg),
    };
  }, [uatItems]);

  const markdownContent = useMemo(() => {
    if (!diagram) return "";
    return exportTestCasesMarkdown(diagram, testCases, blackBoxCases, uatItems);
  }, [diagram, testCases, blackBoxCases, uatItems]);

  if (!isOpen || !diagram) return null;

  const handleScoreChange = (id: string, newScore: number) => {
    const clamped = Math.max(1, Math.min(5, Number(newScore) || 1));
    const percent = Math.round((clamped / 5) * 100);
    setUatItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              scoreAvg: clamped,
              percentage: percent,
              verdict: calculateUATVerdict(percent),
            }
          : item
      )
    );
  };

  const handleToggleStatus = (id: string) => {
    setBlackBoxCases((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, status: b.status === "Valid" ? "Invalid" : "Valid" } : b
      )
    );
  };

  const handleActualResultChange = (id: string, text: string) => {
    setBlackBoxCases((prev) =>
      prev.map((b) => (b.id === id ? { ...b, actualResult: text } : b))
    );
  };

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

  const handleDownloadExcel = () => {
    const xls = exportTestCasesExcel(diagram, testCases, blackBoxCases, uatItems);
    const blob = new Blob([xls], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan_pengujian_${diagram.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(isId ? "File laporan_pengujian.xls berhasil diunduh!" : "laporan_pengujian.xls downloaded!", "success");
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
          ) : activeTab === "blackbox" ? (
            <div className="text-xs text-text-muted font-medium">
              💡 {isId ? "Klik status untuk beralih Valid/Invalid. Hasil pengamatan dapat diedit langsung." : "Click status to toggle Valid/Invalid. Observed result is editable."}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-text-muted font-medium">{isId ? "Jumlah Responden (N):" : "Respondents (N):"}</span>
              <input
                type="number"
                min={1}
                max={500}
                value={respondents}
                onChange={(e) => setRespondents(Math.max(1, Number(e.target.value) || 1))}
                className="w-16 px-2 py-1 rounded bg-surface-3 border border-border text-xs text-text font-bold text-center"
              />
              <span className="text-[11px] text-text-muted">
                {isId ? `Skor Max per aspek = ${respondents * 5}` : `Max score per item = ${respondents * 5}`}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-surface-3 hover:bg-surface-4 text-text border border-border font-medium flex items-center gap-1.5 transition-colors"
            >
              <span>📋</span>
              <span>{isId ? "Salin Laporan" : "Copy MD"}</span>
            </button>
            <button
              onClick={handleDownloadExcel}
              className="px-3 py-1.5 rounded-lg bg-surface-3 hover:bg-surface-4 text-text border border-border font-medium flex items-center gap-1.5 transition-colors"
            >
              <span>📊</span>
              <span>{isId ? "Unduh Excel (.xls)" : "Excel (.xls)"}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-accent hover:bg-accent/90 text-white font-medium flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <span>💾</span>
              <span>{isId ? "Unduh .md" : "Download .md"}</span>
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
                    <th className="p-3 w-56">Hasil Pengamatan</th>
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
                      <td className="p-3 align-top">
                        <input
                          type="text"
                          value={bb.actualResult}
                          onChange={(e) => handleActualResultChange(bb.id, e.target.value)}
                          className="w-full px-2 py-1 rounded bg-surface-3/80 border border-border text-xs text-text outline-none focus:border-accent"
                        />
                      </td>
                      <td className="p-3 align-top text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(bb.id)}
                          className={`inline-block px-2.5 py-0.5 text-[11px] rounded font-bold transition-all cursor-pointer ${
                            bb.status === "Valid"
                              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/20"
                              : "bg-rose-500/10 text-rose-500 border border-rose-500/30 hover:bg-rose-500/20"
                          }`}
                          title={isId ? "Klik untuk ganti status" : "Click to toggle"}
                        >
                          {bb.status}
                        </button>
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
                      <th className="p-3 w-32 text-center">Rata-rata Skor (1-5)</th>
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
                        <td className="p-3 align-top text-center">
                          <input
                            type="number"
                            step="0.1"
                            min="1.0"
                            max="5.0"
                            value={u.scoreAvg}
                            onChange={(e) => handleScoreChange(u.id, parseFloat(e.target.value))}
                            className="w-16 px-2 py-1 rounded bg-surface-3 border border-border text-xs text-center font-bold text-accent outline-none focus:border-accent"
                          />
                        </td>
                        <td className="p-3 align-top text-center font-bold text-text">
                          {u.percentage}%
                        </td>
                        <td className="p-3 align-top text-center">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] rounded font-bold ${
                              u.verdict === "Sangat Layak"
                                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                : u.verdict === "Layak"
                                ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                                : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            }`}
                          >
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
                    {isId ? "Hasil Perhitungan Akseptansi UAT (Real-Time):" : "Real-Time UAT Acceptance Formula:"}
                  </div>
                  <div className="text-text-muted text-[11px]">
                    {isId
                      ? `Rumus: (Total Skor Rata-rata / Total Skor Maksimal) × 100% = ${avgUatPercentage}% (${overallVerdict})`
                      : `Formula: (Total Average Score / Total Max Score) × 100% = ${avgUatPercentage}% (${overallVerdict})`}
                  </div>
                </div>
                <div
                  className={`px-3 py-1.5 border font-bold rounded-lg text-sm ${
                    overallVerdict === "Sangat Layak"
                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-500"
                      : overallVerdict === "Layak"
                      ? "bg-blue-500/15 border-blue-500/30 text-blue-500"
                      : "bg-amber-500/15 border-amber-500/30 text-amber-500"
                  }`}
                >
                  {avgUatPercentage}% - {overallVerdict}
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
