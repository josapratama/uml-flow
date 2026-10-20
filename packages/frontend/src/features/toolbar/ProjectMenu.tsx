import React, { useState, useRef, useEffect } from "react";

interface Props {
  onShowLibrary?: () => void;
  onShowTemplates?: () => void;
  onUniversalImport?: () => void;
  onImport: () => void;
  onSaveCurrent?: () => void;
  onShareLink?: () => void;
  onShowDiff?: () => void;
  onNewDiagram?: () => void;
  hasDiagram: boolean;
}

export function ProjectMenu({
  onShowLibrary,
  onShowTemplates,
  onUniversalImport,
  onImport,
  onSaveCurrent,
  onShareLink,
  onShowDiff,
  onNewDiagram,
  hasDiagram,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`h-8 px-2.5 text-xs font-medium rounded-lg border transition-all flex items-center gap-1.5 ${
          open
            ? "bg-surface-4 text-text border-accent shadow-xs"
            : "bg-surface-3 text-text-muted hover:text-text hover:bg-surface-4 border-border"
        }`}
        title="Project & Diagram files"
      >
        <span className="text-sm">📁</span>
        <span>Project</span>
        <svg
          width="8"
          height="8"
          viewBox="0 0 10 10"
          className={`transition-transform opacity-60 ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M2 3.5 L5 6.5 L8 3.5"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 w-64 bg-surface-2/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-text-muted font-semibold border-b border-border/50">
            Diagram & File Actions
          </div>

          {onSaveCurrent && (
            <button
              onClick={() => {
                onSaveCurrent();
                setOpen(false);
              }}
              disabled={!hasDiagram}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-text hover:bg-surface-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed group text-left"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">💾</span>
                <div>
                  <div className="font-medium">Save to Library</div>
                  <div className="text-[10px] text-text-muted">Save diagram to local store</div>
                </div>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-3 text-text-muted border border-border/50">
                Ctrl+S
              </span>
            </button>
          )}

          {onShareLink && (
            <button
              onClick={() => {
                onShareLink();
                setOpen(false);
              }}
              disabled={!hasDiagram}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-text hover:bg-surface-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed group text-left"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">🔗</span>
                <div>
                  <div className="font-medium">Share Diagram Link</div>
                  <div className="text-[10px] text-text-muted">Copy compressed link to clipboard</div>
                </div>
              </div>
            </button>
          )}

          {onNewDiagram && (
            <button
              onClick={() => {
                onNewDiagram();
                setOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-text hover:bg-surface-3 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">📄</span>
                <div>
                  <div className="font-medium">New Diagram</div>
                  <div className="text-[10px] text-text-muted">Create clean canvas tab</div>
                </div>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-3 text-text-muted border border-border/50">
                Ctrl+N
              </span>
            </button>
          )}

          <div className="h-px bg-border/50 my-1" />

          {onShowLibrary && (
            <button
              onClick={() => {
                onShowLibrary();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-text hover:bg-surface-3 transition-colors text-left"
            >
              <span className="text-base">🗂</span>
              <div>
                <div className="font-medium">Diagram Library</div>
                <div className="text-[10px] text-text-muted">Browse & manage all saved diagrams</div>
              </div>
            </button>
          )}

          {onShowTemplates && (
            <button
              onClick={() => {
                onShowTemplates();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-text hover:bg-surface-3 transition-colors text-left"
            >
              <span className="text-base">📋</span>
              <div>
                <div className="font-medium">Templates Gallery</div>
                <div className="text-[10px] text-text-muted">Pre-built architecture patterns</div>
              </div>
            </button>
          )}

          {onUniversalImport && (
            <button
              onClick={() => {
                onUniversalImport();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-text hover:bg-surface-3 transition-colors text-left"
            >
              <span className="text-base">⚡</span>
              <div>
                <div className="font-medium text-accent">Import SQL / Mermaid / PlantUML</div>
                <div className="text-[10px] text-text-muted">Auto-convert code directly into UML Flow</div>
              </div>
            </button>
          )}

          <button
            onClick={() => {
              onImport();
              setOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-text hover:bg-surface-3 transition-colors text-left"
          >
            <span className="text-base">📂</span>
            <div>
              <div className="font-medium">Import File...</div>
              <div className="text-[10px] text-text-muted">Load .dsl, .json, .ts, .java, or .mmd</div>
            </div>
          </button>

          {onShowDiff && (
            <button
              onClick={() => {
                onShowDiff();
                setOpen(false);
              }}
              disabled={!hasDiagram}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-text hover:bg-surface-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-left"
            >
              <span className="text-base">⊕</span>
              <div>
                <div className="font-medium">Version Diff & History</div>
                <div className="text-[10px] text-text-muted">Compare changes with previous version</div>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
