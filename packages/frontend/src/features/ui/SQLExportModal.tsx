import React, { useState, useMemo } from "react";
import type { Diagram } from "@uml-editor/shared";
import { generateSQL, type SqlDialect } from "../../services/generators/sql";
import { showToast } from "./Toast";
import { useI18n } from "../../i18n";
import { downloadFile } from "../app/useAppExport";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  diagram: Diagram | null;
}

export function SQLExportModal({ isOpen, onClose, diagram }: Props) {
  const { locale } = useI18n();
  const isId = locale === "id";
  const [dialect, setDialect] = useState<SqlDialect>("postgres");

  const sqlCode = useMemo(() => {
    if (!diagram) return "";
    return generateSQL(diagram, dialect);
  }, [diagram, dialect]);

  if (!isOpen || !diagram) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sqlCode);
      showToast(
        isId
          ? "Skrip SQL DDL berhasil disalin ke clipboard!"
          : "SQL DDL script copied to clipboard!",
        "success"
      );
    } catch {
      showToast(isId ? "Gagal menyalin ke clipboard" : "Failed to copy", "error");
    }
  };

  const handleDownload = () => {
    const filename = `${(diagram.name || "schema").toLowerCase().replace(/\s+/g, "_")}_${dialect}.sql`;
    downloadFile(sqlCode, filename, "application/sql");
    showToast(
      isId
        ? `File ${filename} berhasil diunduh`
        : `File ${filename} downloaded`,
      "success"
    );
  };

  const dialects: Array<{ id: SqlDialect; label: string; icon: string; desc: string }> = [
    { id: "postgres", label: "PostgreSQL", icon: "🐘", desc: "SERIAL, JSONB, UUID, TIMESTAMPTZ" },
    { id: "mysql", label: "MySQL / MariaDB", icon: "🐬", desc: "AUTO_INCREMENT, InnoDB, utf8mb4" },
    { id: "sqlite", label: "SQLite", icon: "📦", desc: "AUTOINCREMENT, PRAGMA foreign_keys" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-surface-2 border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border/80 flex items-center justify-between bg-surface-3/50">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl p-1.5 rounded-lg bg-surface-4 shadow-2xs">🗄️</span>
            <div>
              <h3 className="text-sm font-bold text-text flex items-center gap-2">
                <span>{isId ? "Ekspor Skema SQL DDL" : "Export SQL DDL Schema"}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent/15 text-accent font-semibold uppercase">
                  {diagram.name || "ERD"}
                </span>
              </h3>
              <p className="text-[11px] text-text-muted mt-0.5">
                {isId
                  ? "Generate DDL CREATE TABLE, primary key, unique, foreign key, dan tabel relasi"
                  : "Generate CREATE TABLE DDL with primary keys, unique, foreign keys and junction tables"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-surface-4 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Dialect Tabs */}
          <div>
            <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1.5">
              {isId ? "Pilih Dialek Database Target:" : "Target Database Dialect:"}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {dialects.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDialect(d.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    dialect === d.id
                      ? "bg-accent/15 border-accent text-text shadow-xs"
                      : "bg-surface-3/60 hover:bg-surface-3 border-border text-text-muted hover:text-text"
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-xs text-text">
                    <span className="text-base">{d.icon}</span>
                    <span>{d.label}</span>
                  </div>
                  <div className="text-[10px] text-text-muted mt-1 truncate">
                    {d.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Code Viewer */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                {isId ? "Kode SQL DDL:" : "Generated SQL DDL:"}
              </span>
              <span className="text-[10px] font-mono text-text-muted">
                {sqlCode.split("\n").length} {isId ? "baris" : "lines"}
              </span>
            </div>
            <div className="relative rounded-xl border border-border bg-[#0b0f19] p-3 overflow-hidden font-mono text-xs">
              <textarea
                readOnly
                value={sqlCode}
                rows={12}
                className="w-full bg-transparent text-emerald-400 outline-none resize-none font-mono text-[11px] leading-relaxed select-all"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border/80 bg-surface-3/50 flex items-center justify-between">
          <span className="text-[11px] text-text-muted">
            {isId ? "Siap dieksekusi di DBMS Anda" : "Ready to run on your DBMS"}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg border border-border hover:bg-surface-4 text-text text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <span>📋</span>
              <span>{isId ? "Salin SQL" : "Copy SQL"}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5"
            >
              <span>💾</span>
              <span>{isId ? "Unduh File .sql" : "Download .sql"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
