import React, { useState, useMemo } from "react";
import type { Diagram } from "@uml-editor/shared";
import { generateThesisAppendixBundle } from "../../services/thesis-bundle";
import { showToast } from "./Toast";
import { useI18n } from "../../i18n";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  diagram: Diagram | null;
}

export function ThesisBundleModal({ isOpen, onClose, diagram }: Props) {
  const { locale } = useI18n();
  const isId = locale === "id";

  const [includeSql, setIncludeSql] = useState(true);
  const [includeBackendCode, setIncludeBackendCode] = useState(true);
  const [backendLanguage, setBackendLanguage] = useState<"rust" | "typescript">("rust");

  const markdownContent = useMemo(() => {
    if (!diagram) return "";
    return generateThesisAppendixBundle(diagram, {
      includeSql,
      includeBackendCode,
      backendLanguage,
    });
  }, [diagram, includeSql, includeBackendCode, backendLanguage]);

  if (!isOpen || !diagram) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdownContent);
      showToast(isId ? "Seluruh naskah lampiran berhasil disalin!" : "Full appendix copied to clipboard!", "success");
    } catch {
      showToast(isId ? "Gagal menyalin ke clipboard" : "Failed to copy to clipboard", "error");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lampiran_skripsi_${diagram.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(isId ? "File lampiran_skripsi.md berhasil diunduh!" : "lampiran_skripsi.md downloaded!", "success");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface-1 border border-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-2/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-xl text-accent">
              🎓
            </div>
            <div>
              <h2 className="text-base font-bold text-text">
                {isId ? "Paket Lampiran Skripsi & Dokumen Teknis" : "Academic Thesis Appendix Packager"}
              </h2>
              <p className="text-xs text-text-muted">
                {isId
                  ? "Kompilasi otomatis diagram, narasi, metrik cyclomatic, SQL, dan model domain"
                  : "Auto-compiled thesis appendix with narrative, cyclomatic audit, DDL & domain models"}
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

        {/* Configuration Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3 bg-surface-2/30 border-b border-border text-xs">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-text font-medium select-none">
              <input
                type="checkbox"
                checked={includeSql}
                onChange={(e) => setIncludeSql(e.target.checked)}
                className="rounded border-border accent-accent"
              />
              <span>Sertakan SQL DDL</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-text font-medium select-none">
              <input
                type="checkbox"
                checked={includeBackendCode}
                onChange={(e) => setIncludeBackendCode(e.target.checked)}
                className="rounded border-border accent-accent"
              />
              <span>Sertakan Kode Model</span>
            </label>

            {includeBackendCode && (
              <select
                value={backendLanguage}
                onChange={(e) => setBackendLanguage(e.target.value as any)}
                className="px-2.5 py-1 rounded-lg bg-surface-3 border border-border text-text text-xs focus:outline-hidden focus:border-accent"
              >
                <option value="rust">Rust (serde)</option>
                <option value="typescript">TypeScript</option>
              </select>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-surface-3 hover:bg-surface-4 text-text border border-border font-medium flex items-center gap-1.5 transition-colors"
            >
              <span>📋</span>
              <span>{isId ? "Salin Seluruh Naskah" : "Copy All Markdown"}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 rounded-lg bg-accent hover:bg-accent/90 text-white font-medium flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <span>💾</span>
              <span>{isId ? "Unduh .md Siap Cetak" : "Download .md"}</span>
            </button>
          </div>
        </div>

        {/* Markdown Preview Content */}
        <div className="flex-1 p-6 overflow-y-auto font-mono text-xs text-text bg-surface-1 select-text">
          <pre className="whitespace-pre-wrap leading-relaxed font-sans bg-surface-2/40 p-4 rounded-xl border border-border/60">
            {markdownContent}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-surface-2/40 flex items-center justify-between text-xs text-text-muted">
          <span>
            {isId
              ? "Tip: Salin langsung untuk di-paste ke Google Docs, Microsoft Word, atau LaTeX."
              : "Tip: Paste directly into Google Docs, Word, or LaTeX documents."}
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
