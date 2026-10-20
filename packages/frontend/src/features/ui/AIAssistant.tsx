import React, { useState, useRef } from "react";
import { generateDiagramFromDescription } from "../../services/ai-assistant";

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

const EXAMPLES = [
  "A user management system with login, registration, and roles",
  "Online shopping cart with products, orders, and payments",
  "Authentication flow: user enters credentials, server validates, returns token",
  "Blog system with users, posts, categories, and comments",
];

export function AIAssistant({ isOpen, onClose, onGenerate }: Props) {
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
      );
      setPreview(dsl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
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
    setShowSettings(false);
  };

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
              AI Diagram Generator
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-[11px] text-text-muted hover:text-text px-2 py-0.5 rounded hover:bg-surface-3"
              title="API Settings"
            >
              ⚙ Settings
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
              OpenAI API Settings
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
            <div className="text-[10px] text-text-muted/70">
              Without an API key, uses template-based generation (keyword
              extraction).
            </div>
            <button
              onClick={saveSettings}
              className="px-3 py-1 text-xs bg-accent text-white rounded hover:bg-accent-hover"
            >
              Save Settings
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
              {DIAGRAM_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-text-muted self-center">
              diagram type
            </span>
          </div>

          {/* Description input */}
          <div>
            <label className="text-[10px] text-text-muted block mb-1">
              Describe your diagram
            </label>
            <textarea
              ref={textareaRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.ctrlKey && e.key === "Enter") handleGenerate();
              }}
              placeholder="Describe what diagram you want to generate…"
              rows={4}
              className="w-full px-3 py-2 text-xs bg-surface-3 border border-border rounded text-text outline-none focus:border-accent resize-none"
              autoFocus
            />
            <div className="text-[10px] text-text-muted/60 mt-1">
              Ctrl+Enter to generate
            </div>
          </div>

          {/* Examples */}
          <div>
            <div className="text-[10px] text-text-muted mb-1.5">Examples:</div>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLES.map((ex) => (
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
                  Generated DSL Preview
                </div>
                <button
                  onClick={() => setPreview(null)}
                  className="text-[10px] text-text-muted hover:text-text"
                >
                  Clear
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
            {isGenerating ? <>⏳ Generating…</> : <>✨ Generate</>}
          </button>
          {preview && (
            <button
              onClick={handleApply}
              className="flex-1 py-2 text-xs font-medium bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
            >
              ▶ Apply & Compile
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-text-muted bg-surface-3 border border-border rounded hover:text-text"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
