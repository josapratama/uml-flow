import React, { useState, useMemo } from "react";
import type { Diagram } from "@uml-editor/shared";
import { generateTestCases, exportTestCasesMarkdown, type TestCase } from "../../services/test-case-generator";
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

  const [filterType, setFilterType] = useState<string>("all");

  const testCases: TestCase[] = useMemo(() => {
    if (!diagram) return [];
    return generateTestCases(diagram);
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
      showToast(isId ? "Matriks Test Cases berhasil disalin ke clipboard!" : "Test Case Matrix copied to clipboard!", "success");
    } catch {
      showToast(isId ? "Gagal menyalin ke clipboard" : "Failed to copy to clipboard", "error");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `matriks_pengujian_${diagram.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(isId ? "File matriks_pengujian.md berhasil diunduh!" : "matriks_pengujian.md downloaded!", "success");
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
                {isId ? "Matriks Pengujian Sistem (Test Case Specification)" : "Automated Test Case Matrix"}
              </h2>
              <p className="text-xs text-text-muted">
                {isId
                  ? `Hasil analisis ${testCases.length} skenario White-Box basis path dan fungsional dari diagram '${diagram.name}'`
                  : `Generated ${testCases.length} white-box and functional test cases from diagram '${diagram.name}'`}
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

        {/* Filter & Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3 bg-surface-2/30 border-b border-border text-xs">
          <div className="flex items-center gap-2">
            <span className="text-text-muted font-medium">Filter Tipe Uji:</span>
            <div className="flex items-center gap-1.5 bg-surface-3 p-1 rounded-lg border border-border">
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

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 rounded-lg bg-surface-3 hover:bg-surface-4 text-text border border-border font-medium flex items-center gap-1.5 transition-colors"
            >
              <span>📋</span>
              <span>{isId ? "Salin Tabel Markdown" : "Copy Markdown"}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 rounded-lg bg-accent hover:bg-accent/90 text-white font-medium flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <span>💾</span>
              <span>{isId ? "Unduh .md Pengujian" : "Download .md"}</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 p-6 overflow-y-auto">
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
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-surface-2/40 flex items-center justify-between text-xs text-text-muted">
          <span>
            {isId
              ? "Sesuai dengan standar Bab IV Skripsi Pengujian Sistem & White-Box Basis Path Testing."
              : "Conforms with White-box Basis Path Testing standards and thesis software quality rubrics."}
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
