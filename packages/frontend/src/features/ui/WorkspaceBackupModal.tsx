import React, { useState, useRef } from "react";
import { exportWorkspaceBackup, restoreWorkspaceBackup } from "../../services/workspace-backup";
import { showToast } from "./Toast";
import { useI18n } from "../../i18n";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRefreshTabs?: () => void;
  onRestoreSuccess?: () => void;
}

export function WorkspaceBackupModal({ isOpen, onClose, onRefreshTabs, onRestoreSuccess }: Props) {
  const { locale } = useI18n();
  const isId = locale === "id";

  const [restoreMode, setRestoreMode] = useState<"merge" | "replace">("merge");
  const [fileContent, setFileContent] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadBackup = () => {
    const jsonStr = exportWorkspaceBackup();
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `umlflow_workspace_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(isId ? "Cadangan ruang kerja berhasil diunduh!" : "Workspace backup downloaded!", "success");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setFileContent(text || "");
    };
    reader.readAsText(file);
  };

  const handleRestore = () => {
    if (!fileContent.trim()) {
      showToast(isId ? "Pilih file cadangan JSON terlebih dahulu" : "Please select a backup JSON file first", "error");
      return;
    }

    try {
      const res = restoreWorkspaceBackup(fileContent, restoreMode);
      showToast(res.message, "success");
      onRefreshTabs?.();
      onRestoreSuccess?.();
      onClose();
    } catch (err: any) {
      showToast(err.message || "Gagal memulihkan cadangan", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface-1 border border-border rounded-2xl shadow-2xl w-full max-w-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-2/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-xl text-accent">
              💾
            </div>
            <div>
              <h2 className="text-base font-bold text-text">
                {isId ? "Cadangkan & Pulihkan Ruang Kerja" : "Workspace Backup & Restore"}
              </h2>
              <p className="text-xs text-text-muted">
                {isId
                  ? "Pencadangan seluruh diagram, tab aktif, dan pengaturan ke file JSON"
                  : "Backup all library diagrams, open tabs & settings to a portable JSON file"}
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

        {/* Content */}
        <div className="p-6 space-y-6 text-xs">
          {/* Section 1: Export Backup */}
          <div className="p-4 rounded-xl bg-surface-2 border border-border space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-text text-sm">
                  {isId ? "Ekspor Cadangan Penuh" : "Export Full Backup"}
                </h3>
                <p className="text-text-muted text-[11px] mt-0.5">
                  {isId
                    ? "Simpan seluruh diagram di pustaka & pengaturan ke satu file .json"
                    : "Save entire diagram library & settings into a single .json archive"}
                </p>
              </div>
              <button
                onClick={handleDownloadBackup}
                className="px-4 py-2 rounded-xl bg-accent hover:bg-accent/90 text-white font-medium flex items-center gap-2 shadow-xs transition-all active:scale-95 shrink-0"
              >
                <span>💾</span>
                <span>{isId ? "Unduh Cadangan" : "Download Backup"}</span>
              </button>
            </div>
          </div>

          {/* Section 2: Restore Backup */}
          <div className="p-4 rounded-xl bg-surface-2 border border-border space-y-4">
            <div>
              <h3 className="font-bold text-text text-sm">
                {isId ? "Pulihkan dari File Cadangan" : "Restore from Backup File"}
              </h3>
              <p className="text-text-muted text-[11px] mt-0.5">
                {isId
                  ? "Pilih file .json cadangan UML Flow yang pernah diekspor sebelumnya"
                  : "Select a previously exported UML Flow .json backup file"}
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-accent/60 rounded-xl p-5 text-center cursor-pointer bg-surface-1 transition-colors"
            >
              {fileName ? (
                <div className="space-y-1">
                  <div className="text-accent font-bold text-sm">✓ {fileName}</div>
                  <div className="text-[11px] text-text-muted">Klik untuk ganti file lain</div>
                </div>
              ) : (
                <div className="space-y-1">
                  <span className="text-2xl">📂</span>
                  <div className="font-medium text-text">
                    {isId ? "Pilih file .json cadangan" : "Click to select .json backup file"}
                  </div>
                  <div className="text-[11px] text-text-muted">umlflow_workspace_backup_*.json</div>
                </div>
              )}
            </div>

            {/* Mode Selector */}
            <div className="space-y-2 pt-1">
              <label className="text-text font-semibold block">
                {isId ? "Metode Pemulihan:" : "Restore Method:"}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label
                  className={`p-3 rounded-xl border cursor-pointer flex flex-col gap-1 transition-all ${
                    restoreMode === "merge"
                      ? "border-accent bg-accent/5 text-text"
                      : "border-border bg-surface-1 text-text-muted hover:border-border/80"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="restoreMode"
                      checked={restoreMode === "merge"}
                      onChange={() => setRestoreMode("merge")}
                      className="accent-accent"
                    />
                    <span className="font-bold text-text text-xs">
                      {isId ? "Gabungkan (Merge)" : "Merge (Safe)"}
                    </span>
                  </div>
                  <span className="text-[10px] text-text-muted pl-5">
                    {isId
                      ? "Tambahkan diagram tanpa menghapus yang sudah ada"
                      : "Keep existing diagrams and add imported ones"}
                  </span>
                </label>

                <label
                  className={`p-3 rounded-xl border cursor-pointer flex flex-col gap-1 transition-all ${
                    restoreMode === "replace"
                      ? "border-rose-500 bg-rose-500/5 text-text"
                      : "border-border bg-surface-1 text-text-muted hover:border-border/80"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="restoreMode"
                      checked={restoreMode === "replace"}
                      onChange={() => setRestoreMode("replace")}
                      className="accent-rose-500"
                    />
                    <span className="font-bold text-rose-500 text-xs">
                      {isId ? "Timpa Penuh (Replace)" : "Replace (Clean)"}
                    </span>
                  </div>
                  <span className="text-[10px] text-text-muted pl-5">
                    {isId
                      ? "Gantikan seluruh pustaka dengan isi file cadangan"
                      : "Overwrite all library items with backup contents"}
                  </span>
                </label>
              </div>
            </div>

            <button
              onClick={handleRestore}
              disabled={!fileContent}
              className="w-full py-2.5 rounded-xl bg-accent hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span>📥</span>
              <span>{isId ? "Mulai Pemulihan Data" : "Start Restore"}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-surface-2/40 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-surface-3 hover:bg-surface-4 text-text border border-border transition-colors font-medium text-xs"
          >
            {isId ? "Batal" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}
