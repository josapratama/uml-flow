import React, { useState } from "react";
import type { Diagram } from "@uml-editor/shared";
import { showToast } from "./Toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  diagram: Diagram | null;
}

export function AcademicCaptionModal({ isOpen, onClose, diagram }: Props) {
  const currentYear = new Date().getFullYear();
  const [figNumber, setFigNumber] = useState("3.1");
  const [figTitle, setFigTitle] = useState(() => diagram?.name || "Kerangka Berpikir Penelitian");
  const [source, setSource] = useState(`Peneliti (${currentYear})`);
  const [activeTab, setActiveTab] = useState<"word" | "latex" | "markdown">("word");

  if (!isOpen || !diagram) return null;

  // Extract node names to generate a smart description paragraph
  const nodeNames = diagram.nodes.map((n) => n.name.split("\n")[0]).slice(0, 5);
  const nodeSummary =
    nodeNames.length > 0
      ? `mencakup komponen ${nodeNames.join(", ")}`
      : "mencakup alur komponen sistem yang saling terhubung";

  // Formats
  const wordCaption = `Gambar ${figNumber} ${figTitle}
(Sumber: ${source})

Berdasarkan Gambar ${figNumber} di atas, alur diagram ${nodeSummary}. Setiap tahapan terintegrasi untuk mendukung proses analisis, perancangan, dan evaluasi hasil penelitian.`;

  const latexCode = `% --- Format Gambar Naskah Skripsi LaTeX ---
\\begin{figure}[htbp]
  \\centering
  \\includegraphics[width=0.85\\textwidth]{images/${diagram.name.toLowerCase().replace(/\\s+/g, "_")}.png}
  \\caption{${figTitle}}
  \\label{fig:${diagram.name.toLowerCase().replace(/\\s+/g, "_")}}
\\end{figure}
% Sumber: ${source}

Berdasarkan Gambar~\\ref{fig:${diagram.name.toLowerCase().replace(/\\s+/g, "_")}} di atas, alur penelitian ${nodeSummary}.`;

  const markdownCode = `![Gambar ${figNumber} ${figTitle}](./images/${diagram.name.toLowerCase().replace(/\\s+/g, "_")}.png)
*Gambar ${figNumber} ${figTitle} (Sumber: ${source})*

Berdasarkan Gambar ${figNumber} di atas, alur diagram ${nodeSummary}.`;

  const currentContent =
    activeTab === "word"
      ? wordCaption
      : activeTab === "latex"
      ? latexCode
      : markdownCode;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentContent);
      showToast(
        activeTab === "word"
          ? "Format naskah Word berhasil disalin ke clipboard!"
          : activeTab === "latex"
          ? "Kode LaTeX berhasil disalin!"
          : "Format Markdown berhasil disalin!",
        "success",
      );
    } catch {
      showToast("Gagal menyalin teks ke clipboard", "error");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-surface-2 border border-border rounded-2xl shadow-2xl w-[580px] max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-surface-2/80">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎓</span>
            <div>
              <h2 className="text-sm font-semibold text-text tracking-tight">
                Format Naskah Skripsi & Caption Gambar
              </h2>
              <div className="text-[10px] text-text-muted">
                Keterangan gambar, sumber, dan teks narasi paragraf siap pakai
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-surface-3 transition-colors text-base"
          >
            ×
          </button>
        </div>

        {/* Form Inputs */}
        <div className="p-5 border-b border-border bg-surface-3/30 grid grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-text-muted mb-1">
              Nomor Gambar
            </label>
            <input
              type="text"
              value={figNumber}
              onChange={(e) => setFigNumber(e.target.value)}
              placeholder="3.1"
              className="w-full px-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-text outline-none focus:border-accent"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-[11px] font-medium text-text-muted mb-1">
              Judul Gambar
            </label>
            <input
              type="text"
              value={figTitle}
              onChange={(e) => setFigTitle(e.target.value)}
              placeholder="Judul diagram skripsi..."
              className="w-full px-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-text outline-none focus:border-accent"
            />
          </div>

          <div className="col-span-3">
            <label className="block text-[11px] font-medium text-text-muted mb-1">
              Sumber Data (*Source Attribution*)
            </label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Peneliti (2026) / Olahan Data Penelitian"
              className="w-full px-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-text outline-none focus:border-accent"
            />
          </div>
        </div>

        {/* Tab Selection */}
        <div className="px-5 pt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-surface-3 p-1 rounded-lg border border-border/60">
            <button
              onClick={() => setActiveTab("word")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === "word"
                  ? "bg-accent text-white shadow-xs"
                  : "text-text-muted hover:text-text"
              }`}
            >
              <span>📄</span>
              <span>Ms. Word / Teks Skripsi</span>
            </button>
            <button
              onClick={() => setActiveTab("latex")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === "latex"
                  ? "bg-accent text-white shadow-xs"
                  : "text-text-muted hover:text-text"
              }`}
            >
              <span>TeX</span>
              <span>LaTeX</span>
            </button>
            <button
              onClick={() => setActiveTab("markdown")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === "markdown"
                  ? "bg-accent text-white shadow-xs"
                  : "text-text-muted hover:text-text"
              }`}
            >
              <span>M↓</span>
              <span>Markdown</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="px-3.5 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
          >
            <span>📋</span>
            <span>Salin Format</span>
          </button>
        </div>

        {/* Preview Area */}
        <div className="p-5 flex-1 overflow-y-auto">
          <div className="text-[11px] font-medium text-text-muted mb-1.5 flex items-center justify-between">
            <span>Pratinjau Hasil:</span>
            <span className="text-[10px] text-accent">Siap langsung di-paste ke naskah</span>
          </div>
          <div className="p-4 rounded-xl bg-surface border border-border text-xs font-mono whitespace-pre-wrap leading-relaxed select-all text-text">
            {currentContent}
          </div>

          <div className="mt-3 p-3 rounded-lg bg-surface-3/40 border border-border/60 text-[11px] text-text-muted flex items-start gap-2">
            <span className="text-accent text-sm">💡</span>
            <span>
              <strong>Tips Skripsi:</strong> Anda bisa mengekspor diagram sebagai PNG dengan opsi{" "}
              <em>Copy as PNG</em> di toolbar, lalu tempelkan gambar tersebut ke dokumen Word tepat di atas teks keterangan ini.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
