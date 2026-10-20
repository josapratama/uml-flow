import React, { useState } from "react";
import { useI18n } from "../../../i18n";

interface DocCodeBlockProps {
  code: string;
  diagramType?: string;
  title?: string;
  onOpenEditor?: (code: string) => void;
}

export function DocCodeBlock({
  code,
  diagramType = "dsl",
  title,
  onOpenEditor,
}: DocCodeBlockProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-5 rounded-xl border border-border/80 bg-surface-2/90 overflow-hidden shadow-lg group">
      {/* Code Header Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface-3/60 border-b border-border/60 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
          </span>
          <span className="font-mono text-[11px] text-text-muted font-medium ml-2">
            {title || `${diagramType.toUpperCase()} Syntax`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              copied
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-surface-2 hover:bg-surface-4 text-text-muted hover:text-text border border-border"
            }`}
            title="Salin kode ke papan klip"
          >
            <span>{copied ? "✓" : "📋"}</span>
            <span>{copied ? t("docs.copiedCode") : t("docs.copyCode")}</span>
          </button>

          {onOpenEditor && (
            <button
              onClick={() => onOpenEditor(code)}
              className="px-2.5 py-1 rounded-md text-xs font-semibold bg-accent hover:bg-accent-hover text-white transition-all shadow-xs flex items-center gap-1 active:scale-95"
              title="Buka kode ini langsung di kanvas editor"
            >
              <span>{t("docs.tryInEditor")}</span>
              <span className="text-[10px]">↗</span>
            </button>
          )}
        </div>
      </div>

      {/* Code Content */}
      <div className="p-4 overflow-x-auto bg-surface-1/80 font-mono text-xs sm:text-sm text-text leading-relaxed">
        <pre className="text-text/90 selection:bg-accent/30">{code}</pre>
      </div>
    </div>
  );
}
