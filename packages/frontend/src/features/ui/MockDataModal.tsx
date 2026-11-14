import React, { useState, useMemo } from "react";
import type { Diagram } from "@uml-editor/shared";
import { generateMockData } from "../../services/mock-generator";
import { showToast } from "./Toast";
import { useI18n } from "../../i18n";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  diagram: Diagram | null;
}

export function MockDataModal({ isOpen, onClose, diagram }: Props) {
  const { locale } = useI18n();
  const isId = locale === "id";

  const [format, setFormat] = useState<"json" | "sql">("json");
  const [rowCount, setRowCount] = useState<number>(5);

  const mockContent = useMemo(() => {
    if (!diagram) return "";
    return generateMockData(diagram, {
      count: rowCount,
      format,
    });
  }, [diagram, rowCount, format]);

  if (!isOpen || !diagram) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(mockContent);
      showToast(
        isId
          ? `Data dummy (${format.toUpperCase()}) berhasil disalin!`
          : `Mock data (${format.toUpperCase()}) copied!`,
        "success"
      );
    } catch {
      showToast(isId ? "Gagal menyalin ke clipboard" : "Failed to copy", "error");
    }
  };

  const handleDownload = () => {
    const ext = format === "json" ? "json" : "sql";
    const mime = format === "json" ? "application/json" : "application/sql";
    const blob = new Blob([mockContent], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `seed_${diagram.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(isId ? `File ${a.download} berhasil diunduh!` : `${a.download} downloaded!`, "success");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface-1 border border-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-2/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-xl text-accent">
              🎲
            </div>
            <div>
              <h2 className="text-base font-bold text-text">
                {isId ? "Generator Data Dummy & Database Seed" : "Mock Data & Database Seed Generator"}
              </h2>
              <p className="text-xs text-text-muted">
                {isId
                  ? `Generate data tiruan realistis untuk testing API & inisialisasi basis data '${diagram.name}'`
                  : `Generate realistic mock data for API testing & database seeding from '${diagram.name}'`}
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
            <div className="flex items-center gap-1.5 bg-surface-3 p-1 rounded-lg border border-border">
              <button
                onClick={() => setFormat("json")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  format === "json"
                    ? "bg-accent text-white shadow-xs"
                    : "text-text-muted hover:text-text hover:bg-surface-4"
                }`}
              >
                JSON Payload
              </button>
              <button
                onClick={() => setFormat("sql")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  format === "sql"
                    ? "bg-accent text-white shadow-xs"
                    : "text-text-muted hover:text-text hover:bg-surface-4"
                }`}
              >
                SQL Seed (INSERT)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-text-muted font-medium">Jumlah Baris:</span>
              <select
                value={rowCount}
                onChange={(e) => setRowCount(Number(e.target.value))}
                className="px-2.5 py-1 rounded-lg bg-surface-3 border border-border text-text text-xs focus:outline-hidden focus:border-accent"
              >
                <option value={3}>3 baris</option>
                <option value={5}>5 baris</option>
                <option value={10}>10 baris</option>
                <option value={25}>25 baris</option>
                <option value={50}>50 baris</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 rounded-lg bg-surface-3 hover:bg-surface-4 text-text border border-border font-medium flex items-center gap-1.5 transition-colors"
            >
              <span>📋</span>
              <span>{isId ? "Salin Data" : "Copy Data"}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 rounded-lg bg-accent hover:bg-accent/90 text-white font-medium flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <span>💾</span>
              <span>{isId ? `Unduh .${format}` : `Download .${format}`}</span>
            </button>
          </div>
        </div>

        {/* Code Content Preview */}
        <div className="flex-1 p-6 overflow-y-auto font-mono text-xs text-text bg-surface-1 select-text">
          <pre className="whitespace-pre-wrap leading-relaxed bg-surface-2/40 p-4 rounded-xl border border-border/60">
            {mockContent}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-surface-2/40 flex items-center justify-between text-xs text-text-muted">
          <span>
            {isId
              ? "Data tiruan mengenali atribut email, nama, nomor telepon, harga, dan relasi foreign key secara otomatis."
              : "Mock data engine auto-generates realistic emails, names, phone numbers, prices & foreign keys."}
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
