import React, { useState, useMemo } from "react";
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

type ShareTab = "link" | "iframe" | "markdown";

export function ShareModal({
  isOpen,
  onClose,
  shareUrl,
  diagram,
}: ShareModalProps) {
  const { t, locale } = useI18n();
  const isId = locale === "id";
  const [activeTab, setActiveTab] = useState<ShareTab>("link");
  const [copied, setCopied] = useState(false);
  const [embedHeight, setEmbedHeight] = useState("500");

  const diagramName = diagram?.name || (isId ? "Diagram Alur" : "Flow Diagram");

  // Generate IFrame Snippet
  const iframeSnippet = useMemo(() => {
    return `<iframe src="${shareUrl}" width="100%" height="${embedHeight}" style="border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.25);" frameborder="0" allowfullscreen loading="lazy"></iframe>`;
  }, [shareUrl, embedHeight]);

  // Generate Markdown Badge Snippet for GitHub / Notion
  const markdownSnippet = useMemo(() => {
    const safeTitle = encodeURIComponent(diagramName.replace(/-/g, "--"));
    const safeType = encodeURIComponent((diagram?.type || "UML").toUpperCase());
    return `[![${diagramName}](https://img.shields.io/badge/UML%20Flow-${safeTitle}--${safeType}-6366f1?style=for-the-badge&logo=diagramsdotnet)](${shareUrl})\n\n[🔍 Buka & Edit Diagram di UML Flow](${shareUrl})`;
  }, [diagramName, diagram?.type, shareUrl]);

  if (!isOpen) return null;

  const handleCopyCurrent = async (text: string) => {
    const success = await copyTextToClipboard(text);
    if (success) {
      setCopied(true);
      showToast(
        isId ? "Snippet berhasil disalin ke clipboard!" : "Snippet copied to clipboard!",
        "success"
      );
      setTimeout(() => setCopied(false), 2000);
    } else {
      showToast(isId ? "Gagal menyalin otomatis" : "Failed to copy", "error");
    }
  };

  const handleOpenInNewTab = () => {
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface-2 border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[88vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-surface-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent text-sm">
              🔗
            </div>
            <div>
              <h2 className="text-sm font-bold text-text">
                {isId ? "Bagikan & Sematkan Diagram" : "Share & Embed Diagram"}
              </h2>
              <p className="text-[10px] text-text-muted">
                {isId ? "Tautan mandiri terenkripsi dalam URL hash" : "Self-contained hash encrypted link"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-surface-3 transition-colors text-base"
            title={t("common.close")}
          >
            ✕
          </button>
        </div>

        {/* Tab Segmented Buttons */}
        <div className="px-5 pt-3 pb-2 border-b border-border bg-surface-3/30 flex items-center gap-1.5">
          {[
            { id: "link", label: isId ? "Tautan Langsung" : "Direct Link", icon: "🌐" },
            { id: "iframe", label: "IFrame Embed", icon: "💻" },
            { id: "markdown", label: "Markdown Badge", icon: "📋" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as ShareTab);
                setCopied(false);
              }}
              className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === tab.id
                  ? "bg-accent text-white shadow-xs font-semibold"
                  : "bg-surface-3 hover:bg-surface-4 text-text-muted hover:text-text"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Diagram Info Pill */}
          {diagram && (
            <div className="p-3 rounded-xl bg-surface-3/70 border border-border/80 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-text">{diagramName}</div>
                <div className="text-[10px] text-text-muted mt-0.5">
                  <span className="uppercase font-mono text-accent font-semibold">{diagram.type}</span>
                  {" · "}
                  {diagram.nodes ? diagram.nodes.length : 0} nodes · {diagram.edges ? diagram.edges.length : 0} edges
                </div>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium">
                ✓ Ready
              </span>
            </div>
          )}

          {/* Tab 1: Direct Link */}
          {activeTab === "link" && (
            <div className="space-y-3 animate-in fade-in duration-100">
              <p className="text-xs text-text-muted leading-relaxed">
                {isId
                  ? "Tautan ini memuat seluruh data diagram di dalam hash URL. Siapapun yang membuka tautan ini akan langsung dapat melihat dan mengedit diagram di editor."
                  : "This link encapsulates the entire diagram state in the URL hash. Anyone with this link can view and edit the diagram."}
              </p>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-text block">
                  {isId ? "URL Lengkap:" : "Full URL:"}
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
                    onClick={() => handleCopyCurrent(shareUrl)}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-accent hover:bg-accent-hover text-white transition-all shadow-xs flex items-center gap-1.5 shrink-0 active:scale-95"
                  >
                    <span>{copied ? "✓" : "📋"}</span>
                    <span>{copied ? (isId ? "Tersalin!" : "Copied!") : (isId ? "Salin" : "Copy")}</span>
                  </button>
                </div>
              </div>

              <div className="pt-1 flex items-center gap-2">
                <button
                  onClick={handleOpenInNewTab}
                  className="flex-1 py-2 px-3 text-xs font-medium bg-surface-3 hover:bg-surface-4 text-text border border-border rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>↗</span>
                  <span>{isId ? "Uji Buka di Tab Baru" : "Test in New Tab"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: IFrame Embed */}
          {activeTab === "iframe" && (
            <div className="space-y-3 animate-in fade-in duration-100">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">
                  {isId ? "Sematkan interaktif di website, blog, atau Notion:" : "Embed interactively on your site or blog:"}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <span>Tinggi:</span>
                  <select
                    value={embedHeight}
                    onChange={(e) => setEmbedHeight(e.target.value)}
                    className="bg-surface border border-border rounded px-2 py-0.5 text-xs text-text"
                  >
                    <option value="400">400px</option>
                    <option value="500">500px</option>
                    <option value="650">650px</option>
                    <option value="800">800px</option>
                  </select>
                </div>
              </div>

              <textarea
                readOnly
                rows={4}
                value={iframeSnippet}
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                className="w-full p-3 text-xs bg-surface border border-border rounded-lg text-text font-mono outline-none focus:border-accent selection:bg-accent/30 resize-none leading-relaxed"
              />

              <button
                onClick={() => handleCopyCurrent(iframeSnippet)}
                className="w-full py-2 px-3 text-xs font-semibold bg-accent hover:bg-accent-hover text-white rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-xs active:scale-95"
              >
                <span>{copied ? "✓" : "📋"}</span>
                <span>{copied ? (isId ? "Snippet IFrame Tersalin!" : "IFrame Copied!") : (isId ? "Salin Kode IFrame" : "Copy IFrame Code")}</span>
              </button>
            </div>
          )}

          {/* Tab 3: Markdown Badge */}
          {activeTab === "markdown" && (
            <div className="space-y-3 animate-in fade-in duration-100">
              <p className="text-xs text-text-muted leading-relaxed">
                {isId
                  ? "Tempel snippet ini di README.md GitHub repository atau dokumentasi Markdown untuk menyertakan badge interaktif:"
                  : "Paste this snippet in your GitHub README.md or markdown docs for an interactive badge:"}
              </p>

              <textarea
                readOnly
                rows={4}
                value={markdownSnippet}
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                className="w-full p-3 text-xs bg-surface border border-border rounded-lg text-text font-mono outline-none focus:border-accent selection:bg-accent/30 resize-none leading-relaxed"
              />

              <button
                onClick={() => handleCopyCurrent(markdownSnippet)}
                className="w-full py-2 px-3 text-xs font-semibold bg-accent hover:bg-accent-hover text-white rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-xs active:scale-95"
              >
                <span>{copied ? "✓" : "📋"}</span>
                <span>{copied ? (isId ? "Markdown Tersalin!" : "Markdown Copied!") : (isId ? "Salin Kode Markdown" : "Copy Markdown Code")}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border bg-surface-1 flex items-center justify-between text-[11px] text-text-muted">
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
