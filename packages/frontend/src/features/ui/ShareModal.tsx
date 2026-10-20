import React, { useState } from "react";
import type { Diagram } from "@uml-editor/shared";
import { copyTextToClipboard } from "../../services/share-link";
import { useI18n } from "../../i18n";
import { showToast } from "./Toast";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  diagram: Diagram | null;
}

export function ShareModal({
  isOpen,
  onClose,
  shareUrl,
  diagram,
}: ShareModalProps) {
  const { t, locale } = useI18n();
  const isId = locale === "id";
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    const success = await copyTextToClipboard(shareUrl);
    if (success) {
      setCopied(true);
      showToast(
        isId
          ? "Tautan diagram berhasil disalin ke clipboard!"
          : "Diagram link copied to clipboard!",
        "success"
      );
      setTimeout(() => setCopied(false), 2500);
    } else {
      showToast(
        isId ? "Gagal menyalin tautan secara otomatis" : "Failed to copy link",
        "error"
      );
    }
  };

  const handleOpenInNewTab = () => {
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-surface-2 border border-border rounded-2xl shadow-2xl w-[520px] max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-surface-2/80">
          <div className="flex items-center gap-2">
            <span className="text-base">🔗</span>
            <h2 className="text-sm font-semibold text-text tracking-tight">
              {isId ? "Bagikan Tautan Diagram" : "Share Diagram Link"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-surface-3 transition-colors text-base"
            title={t("common.close")}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Diagram Info Card */}
          {diagram && (
            <div className="p-3 rounded-xl bg-surface-3/60 border border-border/70 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-text">
                  {diagram.name || (isId ? "Diagram Tanpa Judul" : "Untitled Diagram")}
                </div>
                <div className="text-[10px] text-text-muted mt-0.5">
                  <span className="uppercase font-mono text-accent font-medium">
                    {diagram.type}
                  </span>{" "}
                  ·{" "}
                  {diagram.type === "sequence" ? (
                    <>
                      {diagram.participants?.length || 0} {t("statusBar.participants")} ·{" "}
                      {diagram.messages?.length || 0} {t("statusBar.messages")}
                    </>
                  ) : (
                    <>
                      {diagram.nodes.length} {t("statusBar.nodes")} ·{" "}
                      {diagram.edges.length} {t("statusBar.edges")}
                    </>
                  )}
                </div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                {isId ? "Siap Dibagikan" : "Ready to Share"}
              </span>
            </div>
          )}

          {/* Description */}
          <p className="text-xs text-text-muted leading-relaxed">
            {isId
              ? "Tautan ini telah mengompresi kode diagram secara aman langsung di dalam URL. Siapapun yang membuka tautan ini akan langsung diarahkan ke editor dengan seluruh elemen dan struktur diagram lengkap."
              : "This link securely compresses the entire diagram inside the URL hash. Anyone with this link can directly open and edit the diagram with full structure preserved."}
          </p>

          {/* Share URL input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-text block">
              {isId ? "Tautan Langsung (Direct Link):" : "Direct Link:"}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="flex-1 px-3 py-2 text-xs bg-surface border border-border rounded-lg text-text font-mono outline-none focus:border-accent selection:bg-accent/30"
              />
              <button
                onClick={handleCopy}
                className={`px-4 py-2 text-xs font-medium rounded-lg transition-all shadow-xs flex items-center gap-1.5 shrink-0 ${
                  copied
                    ? "bg-emerald-600 text-white"
                    : "bg-accent hover:bg-accent-hover text-white active:scale-95"
                }`}
              >
                <span>{copied ? "✓" : "📋"}</span>
                <span>{copied ? (isId ? "Tersalin!" : "Copied!") : (isId ? "Salin" : "Copy")}</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
            <button
              onClick={handleOpenInNewTab}
              className="w-full sm:w-auto flex-1 py-2 px-3 text-xs font-medium bg-surface-3 hover:bg-surface-4 text-text border border-border rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <span>↗</span>
              <span>{isId ? "Uji Buka di Tab Baru" : "Test in New Tab"}</span>
            </button>
            <button
              onClick={handleCopy}
              className="w-full sm:w-auto flex-1 py-2 px-3 text-xs font-semibold bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>🔗</span>
              <span>{isId ? "Salin Tautan Lengkap" : "Copy Full Link"}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border bg-surface-3/30 flex items-center justify-between text-[11px] text-text-muted">
          <span>🔒 {isId ? "Tanpa database — 100% Client-Side" : "No database — 100% Client-Side"}</span>
          <button
            onClick={onClose}
            className="text-text hover:text-accent transition-colors font-medium"
          >
            {t("common.close")}
          </button>
        </div>
      </div>
    </div>
  );
}
