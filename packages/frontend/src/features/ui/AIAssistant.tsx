import React, { useState, useRef } from "react";
import { generateDiagramFromDescription } from "../../services/ai-assistant";
import { useI18n } from "../../i18n";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (dsl: string) => void;
}

const DIAGRAM_TYPES = [
  { value: "", label: "Auto-detect" },
  { value: "class", label: "Class Diagram" },
  { value: "sequence", label: "Sequence Diagram" },
  { value: "activity", label: "Activity Diagram" },
  { value: "flowchart", label: "Flowchart" },
  { value: "erd", label: "ERD" },
  { value: "state", label: "State Diagram" },
  { value: "usecase", label: "Use Case" },
  { value: "component", label: "Component Diagram" },
  { value: "deployment", label: "Deployment Diagram" },
];

const EXAMPLES_EN = [
  "A user management system with login, registration, and roles",
  "Online shopping cart with products, orders, and payments",
  "Authentication flow: user enters credentials, server validates, returns token",
  "Blog system with users, posts, categories, and comments",
];

const EXAMPLES_ID = [
  "Sistem autentikasi user dengan login, register, dan role permissions",
  "Toko online dengan keranjang belanja, checkout order, dan pembayaran",
  "Alur verifikasi: user input kredensial, gateway validasi, server kembalikan JWT",
  "Basis data perpustakaan dengan tabel anggota, peminjaman, buku, dan denda",
];

export function AIAssistant({ isOpen, onClose, onGenerate }: Props) {
  const { t, locale } = useI18n();
  const isId = locale === "id";
  const [description, setDescription] = useState("");
  const [diagramType, setDiagramType] = useState("");
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem("ai-api-key") || "",
  );
  const [endpoint, setEndpoint] = useState(
    () =>
      localStorage.getItem("ai-endpoint") ||
      "https://api.openai.com/v1/chat/completions",
  );
  const [model, setModel] = useState(
    () => localStorage.getItem("ai-model") || "gpt-4o-mini",
  );
  const [showSettings, setShowSettings] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setIsGenerating(true);
    setError(null);
    setPreview(null);
    try {
      const dsl = await generateDiagramFromDescription(
        description,
        diagramType || undefined,
        apiKey || undefined,
        apiKey && endpoint ? endpoint : undefined,
        model || undefined,
      );
      setPreview(dsl);
    } catch (e) {
      setError(e instanceof Error ? e.message : isId ? "Gagal menghasilkan diagram" : "Generation failed");
    }
    setIsGenerating(false);
  };

  const handleApply = () => {
    if (preview) {
      onGenerate(preview);
      onClose();
    }
  };

  const saveSettings = () => {
    localStorage.setItem("ai-api-key", apiKey);
    localStorage.setItem("ai-endpoint", endpoint);
    localStorage.setItem("ai-model", model);
    setShowSettings(false);
  };

  const examples = isId ? EXAMPLES_ID : EXAMPLES_EN;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-surface-2 border border-border rounded-xl shadow-2xl w-[520px] max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-base">✨</span>
            <h2 className="text-sm font-semibold text-text">
              {t("modals.aiTitle")}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-[11px] text-text-muted hover:text-text px-2 py-0.5 rounded hover:bg-surface-3"
              title={t("nav.settings")}
            >
              ⚙ {t("nav.settings")}
            </button>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="px-4 py-3 border-b border-border bg-surface-3 space-y-2">
            <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">
              {isId ? "Pengaturan OpenAI API" : "OpenAI API Settings"}
            </div>
            <div>
              <label className="text-[10px] text-text-muted block mb-1">
                API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-1.5 text-xs bg-surface border border-border rounded text-text outline-none focus:border-accent font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-text-muted block mb-1">
                Endpoint URL
              </label>
              <input
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-surface border border-border rounded text-text outline-none focus:border-accent font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-text-muted block mb-1">
                {isId ? "Model LLM (mis. gpt-4o-mini, gpt-4o, claude-3-5-sonnet, gemini-1.5-flash)" : "LLM Model (e.g. gpt-4o-mini, gpt-4o, gemini-1.5-flash)"}
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="gpt-4o-mini"
                className="w-full px-3 py-1.5 text-xs bg-surface border border-border rounded text-text outline-none focus:border-accent font-mono"
              />
            </div>
            <div className="text-[10px] text-text-muted/70">
              {isId
                ? "Tanpa API key, generator menggunakan pemetaan templat berbasis kata kunci cerdas."
                : "Without an API key, uses keyword-based intelligent template mapping."}
            </div>
            <button
              onClick={saveSettings}
              className="px-3 py-1 text-xs bg-accent text-white rounded hover:bg-accent-hover"
            >
              {isId ? "Simpan Pengaturan" : "Save Settings"}
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Diagram type selector */}
          <div className="flex gap-2">
            <select
              value={diagramType}
              onChange={(e) => setDiagramType(e.target.value)}
              className="px-2 py-1.5 text-xs bg-surface-3 border border-border rounded text-text outline-none focus:border-accent"
            >
              {DIAGRAM_TYPES.map((dType) => (
                <option key={dType.value} value={dType.value}>
                  {dType.label}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-text-muted self-center">
              {isId ? "tipe diagram" : "diagram type"}
            </span>
          </div>

          {/* Description input */}
          <div>
            <label className="text-[10px] text-text-muted block mb-1">
              {isId ? "Deskripsikan diagram yang ingin dibuat" : "Describe your diagram"}
            </label>
            <textarea
              ref={textareaRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.ctrlKey && e.key === "Enter") handleGenerate();
              }}
              placeholder={
                isId
                  ? "Deskripsikan alur sistem atau struktur database yang ingin Anda rancang..."
                  : "Describe what diagram you want to generate…"
              }
              rows={4}
              className="w-full px-3 py-2 text-xs bg-surface-3 border border-border rounded text-text outline-none focus:border-accent resize-none"
              autoFocus
            />
            <div className="text-[10px] text-text-muted/60 mt-1">
              {isId ? "Tekan Ctrl+Enter untuk men-generate" : "Ctrl+Enter to generate"}
            </div>
          </div>

          {/* Examples */}
          <div>
            <div className="text-[10px] text-text-muted mb-1.5">{isId ? "Contoh Prompt:" : "Examples:"}</div>
            <div className="flex flex-wrap gap-1.5">
              {examples.map((ex) => (
                <button
                  key={ex}
                  onClick={() => {
                    setDescription(ex);
                    textareaRef.current?.focus();
                  }}
                  className="px-2 py-1 text-[10px] bg-surface-3 border border-border rounded text-text-muted hover:text-text hover:border-accent transition-colors text-left"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="px-3 py-2 bg-error/10 border border-error/30 rounded text-xs text-error">
              {error}
            </div>
          )}

          {/* Preview */}
          {preview && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="text-[10px] text-text-muted uppercase tracking-wider">
                  {isId ? "Pratinjau Kode DSL Hasil Generate" : "Generated DSL Preview"}
                </div>
                <button
                  onClick={() => setPreview(null)}
                  className="text-[10px] text-text-muted hover:text-text"
                >
                  {isId ? "Bersihkan" : "Clear"}
                </button>
              </div>
              <pre className="px-3 py-2 bg-surface text-[11px] font-mono text-text rounded border border-border overflow-auto max-h-40 whitespace-pre-wrap">
                {preview}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-border">
          <button
            onClick={handleGenerate}
            disabled={!description.trim() || isGenerating}
            className="flex-1 py-2 text-xs font-medium bg-accent hover:bg-accent-hover text-white rounded transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
          >
            {isGenerating ? (
              <>{isId ? "⏳ Menyusun Diagram…" : "⏳ Generating…"}</>
            ) : (
              <>{isId ? "✨ Generate Diagram" : "✨ Generate Diagram"}</>
            )}
          </button>
          {preview && (
            <button
              onClick={handleApply}
              className="flex-1 py-2 text-xs font-medium bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
            >
              {isId ? "▶ Terapkan & Kompilasi" : "▶ Apply & Compile"}
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-text-muted bg-surface-3 border border-border rounded hover:text-text"
          >
            {t("common.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
