import React from "react";
import type { CanvasTheme } from "../../hooks/useTheme";
import { ExportDropdown } from "./ExportDropdown";
import { LayoutDropdown } from "./LayoutDropdown";
import { ProjectMenu } from "./ProjectMenu";
import { CanvasOptionsMenu } from "./CanvasOptionsMenu";
import { SamplesMenu } from "./SamplesMenu";

type EditorMode = "visual" | "code" | "split";

interface ToolbarProps {
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  onCompile: () => void;
  onExport: (format: string) => void;
  onLayout: (preset: string) => void;
  onValidate: () => void;
  isCompiling: boolean;
  hasDiagram: boolean;
  diagramName?: string;
  diagramType?: string;
  onSampleChange: (sample: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  autoCompile: boolean;
  onAutoCompileToggle: () => void;
  autoSyncCanvas?: boolean;
  onAutoSyncCanvasToggle?: () => void;
  snapEnabled: boolean;
  onSnapToggle: () => void;
  edgeRouting: "straight" | "orthogonal";
  onEdgeRoutingToggle: () => void;
  canvasTheme: CanvasTheme;
  onThemeToggle: () => void;
  onMonochromeToggle?: () => void;
  isMonochrome?: boolean;
  onImport: () => void;
  onSyncToCode: () => void;
  onShowShortcuts: () => void;
  onShowLibrary?: () => void;
  onShowTemplates?: () => void;
  onShowAI?: () => void;
  onShowHistory?: () => void;
  onPresentationMode?: () => void;
  onShowDiff?: () => void;
  onSaveCurrent?: () => void;
  onShareLink?: () => void;
  onNewDiagram?: () => void;
  onNavigateHome?: () => void;
}

export function Toolbar(props: ToolbarProps) {
  const {
    mode,
    onModeChange,
    onCompile,
    onExport,
    onLayout,
    onValidate,
    isCompiling,
    hasDiagram,
    diagramType,
    onSampleChange,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
    autoCompile,
    onAutoCompileToggle,
    autoSyncCanvas,
    onAutoSyncCanvasToggle,
    snapEnabled,
    onSnapToggle,
    edgeRouting,
    onEdgeRoutingToggle,
    canvasTheme,
    onThemeToggle,
    onMonochromeToggle,
    isMonochrome,
    onImport,
    onSyncToCode,
    onShowShortcuts,
    onShowLibrary,
    onShowTemplates,
    onShowAI,
    onShowHistory,
    onPresentationMode,
    onShowDiff,
    onSaveCurrent,
    onShareLink,
    onNewDiagram,
    onNavigateHome,
  } = props;

  const handleGoHome = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateHome) onNavigateHome();
    else window.location.hash = "";
  };

  return (
    <header className="flex items-center justify-between px-3 h-12 bg-surface-2 border-b border-border shrink-0 gap-2 z-50 relative select-none">
      {/* --- Left Zone: Brand & Document Management --- */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Brand / Logo */}
        <button
          onClick={handleGoHome}
          className="flex items-center gap-2 group text-left transition-transform active:scale-95 shrink-0 pr-1"
          title="Return to Landing Page"
        >
          <div className="w-7 h-7 rounded-lg bg-linear-to-tr from-accent via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-xs group-hover:shadow-accent/40 transition-shadow">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="8" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </div>
          <span className="font-bold text-xs tracking-tight text-text group-hover:text-accent transition-colors hidden sm:inline">
            UML Flow
          </span>
        </button>

        <div className="w-px h-5 bg-border/60 mx-0.5 hidden sm:block" />

        {/* Project File Menu */}
        <ProjectMenu
          onShowLibrary={onShowLibrary}
          onShowTemplates={onShowTemplates}
          onImport={onImport}
          onSaveCurrent={onSaveCurrent}
          onShareLink={onShareLink}
          onShowDiff={onShowDiff}
          onNewDiagram={onNewDiagram}
          hasDiagram={hasDiagram}
        />

        {/* Samples Custom Dropdown */}
        <SamplesMenu onSampleChange={onSampleChange} />

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 bg-surface-3 border border-border rounded-lg p-0.5 shadow-2xs">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="w-7 h-7 flex items-center justify-center rounded text-text-muted hover:text-text hover:bg-surface-4 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Undo (Ctrl+Z)"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 14L4 9l5-5" />
              <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
            </svg>
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="w-7 h-7 flex items-center justify-center rounded text-text-muted hover:text-text hover:bg-surface-4 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Redo (Ctrl+Y)"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 14l5-5-5-5" />
              <path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13" />
            </svg>
          </button>
        </div>
      </div>

      {/* --- Center Zone: View Mode Segmented Pill --- */}
      <div className="flex items-center justify-center shrink-0">
        <div className="flex items-center h-8 bg-surface-3 border border-border rounded-lg p-0.5 shadow-2xs">
          <button
            className={`h-7 px-3 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              mode === "code"
                ? "bg-accent text-white shadow-xs"
                : "text-text-muted hover:text-text"
            }`}
            onClick={() => onModeChange("code")}
            title="Code editor view only"
          >
            <span>📝</span>
            <span>Code</span>
          </button>
          <button
            className={`h-7 px-3 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              mode === "split"
                ? "bg-accent text-white shadow-xs"
                : "text-text-muted hover:text-text"
            }`}
            onClick={() => onModeChange("split")}
            title="Split Code & Visual canvas view"
          >
            <span>◫</span>
            <span>Split</span>
          </button>
          <button
            className={`h-7 px-3 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              mode === "visual"
                ? "bg-accent text-white shadow-xs"
                : "text-text-muted hover:text-text"
            }`}
            onClick={() => onModeChange("visual")}
            title="Visual canvas view only"
          >
            <span>🎨</span>
            <span>Visual</span>
          </button>
        </div>
      </div>

      {/* --- Right Zone: Tools, Export, Options & Compile CTA --- */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Sync from Canvas in Visual mode */}
        {mode === "visual" && onSyncToCode && (
          <button
            onClick={onSyncToCode}
            disabled={!hasDiagram}
            title="Sync visual canvas modifications back into DSL code"
            className="h-8 px-2.5 text-xs font-medium rounded-lg border border-border bg-surface-3 hover:bg-surface-4 text-text-muted hover:text-text transition-all flex items-center gap-1.5 whitespace-nowrap shadow-xs active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed"
          >
            <span>⟳</span>
            <span className="hidden md:inline">Sync to Code</span>
          </button>
        )}

        {/* Validate Diagram CTA */}
        {onValidate && (
          <button
            onClick={onValidate}
            disabled={!hasDiagram}
            title="Validate diagram rules & syntax"
            className="h-8 px-2.5 text-xs font-medium rounded-lg border border-border bg-surface-3 hover:bg-surface-4 text-text-muted hover:text-text transition-all flex items-center gap-1.5 whitespace-nowrap shadow-xs active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed"
          >
            <span className="text-emerald-400 font-bold">✓</span>
            <span className="hidden 2xl:inline">Validate</span>
          </button>
        )}

        {/* AI Assistant Button */}
        {onShowAI && (
          <button
            onClick={onShowAI}
            title="Generate UML diagrams with AI prompts"
            className="h-8 px-2.5 text-xs font-medium rounded-lg border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 transition-all flex items-center gap-1.5 whitespace-nowrap shadow-xs active:scale-95"
          >
            <span>✨</span>
            <span className="hidden xl:inline 2xl:hidden">AI</span>
            <span className="hidden 2xl:inline">AI Assistant</span>
          </button>
        )}

        {/* Auto Layout Dropdown */}
        <LayoutDropdown onLayout={onLayout} disabled={!hasDiagram} />

        {/* Export Dropdown */}
        <ExportDropdown
          onExport={onExport}
          disabled={!hasDiagram}
          diagramType={diagramType}
        />

        {/* Share Link Button */}
        {onShareLink && (
          <button
            onClick={onShareLink}
            disabled={!hasDiagram}
            title="Share diagram via compressed link"
            className="h-8 px-2.5 text-xs font-medium rounded-lg border border-border bg-surface-3 hover:bg-surface-4 text-text-muted hover:text-text transition-all flex items-center gap-1.5 whitespace-nowrap shadow-xs active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed"
          >
            <span>🔗</span>
            <span className="hidden 2xl:inline">Share</span>
          </button>
        )}

        {/* Canvas & Workspace Options Menu */}
        <CanvasOptionsMenu
          autoCompile={autoCompile}
          onAutoCompileToggle={onAutoCompileToggle}
          autoSyncCanvas={autoSyncCanvas}
          onAutoSyncCanvasToggle={onAutoSyncCanvasToggle}
          snapEnabled={snapEnabled}
          onSnapToggle={onSnapToggle}
          edgeRouting={edgeRouting}
          onEdgeRoutingToggle={onEdgeRoutingToggle}
          canvasTheme={canvasTheme}
          onThemeToggle={onThemeToggle}
          isMonochrome={isMonochrome}
          onMonochromeToggle={onMonochromeToggle}
          onPresentationMode={onPresentationMode}
          onShowHistory={onShowHistory}
          onShowShortcuts={onShowShortcuts}
          onValidate={onValidate}
          hasDiagram={hasDiagram}
        />

        <div className="w-px h-5 bg-border/60 mx-0.5 hidden sm:block" />

        {/* Primary Compile CTA */}
        <button
          className="h-8 px-3.5 bg-linear-to-r from-accent to-indigo-500 hover:from-accent-hover hover:to-indigo-400 text-white text-xs font-semibold rounded-lg transition-all shadow-xs hover:shadow-accent/25 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
          onClick={onCompile}
          disabled={isCompiling}
          title="Compile DSL code to diagram (Ctrl+Enter)"
        >
          {isCompiling ? (
            <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <span>▶</span>
          )}
          <span>Compile</span>
        </button>
      </div>
    </header>
  );
}
