import React, { useState } from "react";
import type { Diagram } from "@uml-editor/shared";
import { showToast } from "./Toast";
import { useI18n } from "../../i18n";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  diagram: Diagram | null;
}

export function AcademicCaptionModal({ isOpen, onClose, diagram }: Props) {
  const { t, locale } = useI18n();
  const isId = locale === "id";
  const currentYear = new Date().getFullYear();

  const [figNumber, setFigNumber] = useState("3.1");
  const [figTitle, setFigTitle] = useState(() => diagram?.name || (isId ? "Kerangka Berpikir Penelitian" : "System Architecture Framework"));
  const [source, setSource] = useState(isId ? `Peneliti (${currentYear})` : `Researcher (${currentYear})`);
  const [activeTab, setActiveTab] = useState<"word" | "latex" | "markdown">("word");

  if (!isOpen || !diagram) return null;

  // Extract node names to generate a smart description paragraph
  const nodeNames = diagram.nodes.map((n) => n.name.split("\n")[0]).slice(0, 5);
  const nodeSummary =
    nodeNames.length > 0
      ? isId
        ? `mencakup komponen ${nodeNames.join(", ")}`
        : `encompasses components ${nodeNames.join(", ")}`
      : isId
      ? "mencakup alur komponen sistem yang saling terhubung"
      : "comprises interconnected system components";

  // Formats
  const wordCaption = isId
    ? `Gambar ${figNumber} ${figTitle}
(Sumber: ${source})

Berdasarkan Gambar ${figNumber} di atas, alur diagram ${nodeSummary}. Setiap tahapan terintegrasi untuk mendukung proses analisis, perancangan, dan evaluasi hasil penelitian.`
    : `Figure ${figNumber}: ${figTitle}
(Source: ${source})

Based on Figure ${figNumber} above, the system diagram ${nodeSummary}. Each stage is integrated to support systematic analysis, architectural design, and evaluation.`;

  const latexCode = isId
    ? `% --- Format Gambar Naskah Skripsi LaTeX ---
\\begin{figure}[htbp]
  \\centering
  \\includegraphics[width=0.85\\textwidth]{images/${diagram.name.toLowerCase().replace(/\\s+/g, "_")}.png}
  \\caption{${figTitle}}
  \\label{fig:${diagram.name.toLowerCase().replace(/\\s+/g, "_")}}
\\end{figure}
% Sumber: ${source}

Berdasarkan Gambar~\\ref{fig:${diagram.name.toLowerCase().replace(/\\s+/g, "_")}} di atas, alur penelitian ${nodeSummary}.`
    : `% --- Academic Thesis LaTeX Figure Format ---
\\begin{figure}[htbp]
  \\centering
  \\includegraphics[width=0.85\\textwidth]{images/${diagram.name.toLowerCase().replace(/\\s+/g, "_")}.png}
  \\caption{${figTitle}}
  \\label{fig:${diagram.name.toLowerCase().replace(/\\s+/g, "_")}}
\\end{figure}
% Source: ${source}

Based on Figure~\\ref{fig:${diagram.name.toLowerCase().replace(/\\s+/g, "_")}} above, the system design ${nodeSummary}.`;

  const markdownCode = isId
    ? `![Gambar ${figNumber} ${figTitle}](./images/${diagram.name.toLowerCase().replace(/\\s+/g, "_")}.png)
*Gambar ${figNumber} ${figTitle} (Sumber: ${source})*

Berdasarkan Gambar ${figNumber} di atas, alur diagram ${nodeSummary}.`
    : `![Figure ${figNumber}: ${figTitle}](./images/${diagram.name.toLowerCase().replace(/\\s+/g, "_")}.png)
*Figure ${figNumber}: ${figTitle} (Source: ${source})*

Based on Figure ${figNumber} above, the diagram workflow ${nodeSummary}.`;

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
          ? isId
            ? "Format naskah Word berhasil disalin ke clipboard!"
            : "Word thesis format copied to clipboard!"
          : activeTab === "latex"
          ? isId
            ? "Kode LaTeX berhasil disalin!"
            : "LaTeX figure snippet copied!"
          : isId
          ? "Format Markdown berhasil disalin!"
          : "Markdown format copied!",
        "success",
      );
    } catch {
      showToast(isId ? "Gagal menyalin teks ke clipboard" : "Failed to copy text", "error");
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
                {t("modals.academicTitle")}
              </h2>
              <div className="text-[10px] text-text-muted">
                {isId
                  ? "Keterangan gambar, sumber, dan teks narasi paragraf siap pakai"
                  : "Figure captions, citations, and ready-to-use thesis narrative paragraphs"}
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
              {isId ? "Nomor Gambar" : "Figure Number"}
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
              {isId ? "Judul Gambar" : "Figure Title"}
            </label>
            <input
              type="text"
              value={figTitle}
              onChange={(e) => setFigTitle(e.target.value)}
              placeholder={isId ? "Judul diagram skripsi..." : "Thesis diagram title..."}
              className="w-full px-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-text outline-none focus:border-accent"
            />
          </div>

          <div className="col-span-3">
            <label className="block text-[11px] font-medium text-text-muted mb-1">
              {isId ? "Sumber Data (*Source Attribution*)" : "Source Attribution"}
            </label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder={isId ? "Peneliti (2026) / Olahan Data Penelitian" : "Researcher (2026)"}
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
              <span>{isId ? "Ms. Word / Teks Skripsi" : "Ms. Word / Narrative"}</span>
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
            <span>{isId ? "Salin Format" : "Copy Format"}</span>
          </button>
        </div>

        {/* Preview Area */}
        <div className="p-5 flex-1 overflow-y-auto">
          <div className="text-[11px] font-medium text-text-muted mb-1.5 flex items-center justify-between">
            <span>{isId ? "Pratinjau Hasil:" : "Result Preview:"}</span>
            <span className="text-[10px] text-accent">
              {isId ? "Siap langsung di-paste ke naskah" : "Ready to paste into manuscript"}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-surface border border-border text-xs font-mono whitespace-pre-wrap leading-relaxed select-all text-text">
            {currentContent}
          </div>

          <div className="mt-3 p-3 rounded-lg bg-surface-3/40 border border-border/60 text-[11px] text-text-muted flex items-start gap-2">
            <span className="text-accent text-sm">💡</span>
            <span>
              <strong>{isId ? "Tips Skripsi:" : "Thesis Tip:"}</strong>{" "}
              {isId
                ? "Anda bisa mengekspor diagram sebagai PNG dengan opsi Copy as PNG di toolbar, lalu tempelkan gambar tersebut ke dokumen Word tepat di atas teks keterangan ini."
                : "You can export the diagram as PNG using the Copy PNG option in the toolbar, then paste the image into your document right above this caption."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
