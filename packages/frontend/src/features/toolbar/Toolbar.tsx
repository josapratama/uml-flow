import React from "react";
import type { CanvasTheme } from "../../hooks/useTheme";
import { ExportDropdown } from "./ExportDropdown";
import { LayoutDropdown } from "./LayoutDropdown";

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
  diagramType?: string;
  onSampleChange: (sample: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  autoCompile: boolean;
  onAutoCompileToggle: () => void;
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
  } = props;

  return (
    <header className="flex items-center justify-between px-2 h-10 bg-surface-2 border-b border-border shrink-0 gap-1 z-50 relative">
      {/* Left */}
      <div className="flex items-center gap-2">
        <h1 className="flex items-center gap-1.5 text-accent font-semibold text-xs">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="8" y="14" width="7" height="7" rx="1.5" />
          </svg>
          UML
        </h1>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.location.hash = "";
          }}
          className="text-[10px] text-text-muted hover:text-accent transition-colors"
          title="Back to home"
        >
          🏠
        </a>
        <select
          className="px-2 py-1 bg-surface-3 text-text text-[11px] border border-border rounded cursor-pointer outline-none hover:border-accent transition-colors"
          onChange={(e) => onSampleChange(e.target.value)}
          defaultValue=""
        >
          <option value="" disabled>
            Templates
          </option>
          <option value="class">Class</option>
          <option value="sequence">Sequence</option>
          <option value="activity">Activity</option>
          <option value="flowchart">Flowchart</option>
          <option value="erd">ERD</option>
          <option value="state">State</option>
          <option value="usecase">Use Case</option>
          <option value="component">Component</option>
          <option value="deployment">Deployment</option>
        </select>
        <Btn onClick={onImport} title="Import file (JSON/DSL)">
          📂
        </Btn>
        {onShowLibrary && (
          <Btn onClick={onShowLibrary} title="Diagram Library (saved diagrams)">
            🗂
          </Btn>
        )}
        {onShowTemplates && (
          <Btn onClick={onShowTemplates} title="Diagram Templates">
            📋
          </Btn>
        )}
        {onShowAI && (
          <Btn onClick={onShowAI} title="AI Diagram Generator">
            ✨
          </Btn>
        )}
      </div>

      {/* Center */}
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5">
          <Btn onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
            ↩
          </Btn>
          <Btn onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)">
            ↪
          </Btn>
        </div>
        <Sep />
        <div className="flex bg-surface-3 rounded-md p-0.5">
          <ModeBtn
            active={mode === "code"}
            onClick={() => onModeChange("code")}
          >
            Code
          </ModeBtn>
          <ModeBtn
            active={mode === "split"}
            onClick={() => onModeChange("split")}
          >
            Split
          </ModeBtn>
          <ModeBtn
            active={mode === "visual"}
            onClick={() => onModeChange("visual")}
          >
            Visual
          </ModeBtn>
        </div>
        <Sep />
        <Toggle
          label="Auto"
          active={autoCompile}
          onClick={onAutoCompileToggle}
          title="Auto-compile on type"
        />
        <Toggle
          label="Snap"
          active={snapEnabled}
          onClick={onSnapToggle}
          title="Snap to grid"
        />
        <Toggle
          label={edgeRouting === "orthogonal" ? "Ortho" : "Line"}
          active={edgeRouting === "orthogonal"}
          onClick={onEdgeRoutingToggle}
          title="Edge routing: straight line or orthogonal"
        />
        <Btn onClick={onThemeToggle} title="Toggle canvas theme">
          {canvasTheme === "light" ? "☀️" : "🌙"}
        </Btn>
        {onMonochromeToggle && (
          <Btn
            onClick={onMonochromeToggle}
            title={
              isMonochrome
                ? "Switch to colored nodes"
                : "Switch to monochrome nodes"
            }
          >
            {isMonochrome ? "⬜" : "🎨"}
          </Btn>
        )}
        <Btn onClick={onSyncToCode} title="Sync diagram → code">
          ⟳
        </Btn>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        <button
          className="px-2 py-1 bg-accent hover:bg-accent-hover text-white text-[10px] font-medium rounded transition-colors disabled:opacity-40"
          onClick={onCompile}
          disabled={isCompiling}
        >
          {isCompiling ? "⏳" : "▶"} Compile
        </button>
        <LayoutDropdown onLayout={onLayout} disabled={!hasDiagram} />
        <Btn
          onClick={onValidate}
          disabled={!hasDiagram}
          title="Validate diagram"
        >
          ✓
        </Btn>
        <ExportDropdown
          onExport={onExport}
          disabled={!hasDiagram}
          diagramType={diagramType}
        />
        <Sep />
        {onShowHistory && (
          <Btn onClick={onShowHistory} title="Undo History">
            🕐
          </Btn>
        )}
        {onShowDiff && hasDiagram && (
          <Btn onClick={onShowDiff} title="Compare with saved version (Diff)">
            ⊕
          </Btn>
        )}
        {onPresentationMode && hasDiagram && (
          <Btn
            onClick={onPresentationMode}
            title="Presentation Mode (fullscreen)"
          >
            ⛶
          </Btn>
        )}
        <Btn onClick={onShowShortcuts} title="Keyboard shortcuts (?)">
          ⌨
        </Btn>
      </div>
    </header>
  );
}

function Btn({
  children,
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      className="px-1.5 py-0.5 bg-surface-3 text-text-muted text-[10px] border border-border rounded hover:bg-surface-4 hover:text-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
}

function ModeBtn({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`px-2.5 py-0.5 text-[11px] font-medium rounded transition-all ${active ? "bg-accent text-white shadow-sm" : "text-text-muted hover:text-text"}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Toggle({
  label,
  active,
  onClick,
  title,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      className={`px-2 py-0.5 text-[10px] font-medium rounded border transition-all ${active ? "bg-accent/20 border-accent text-accent" : "bg-surface-3 border-border text-text-muted hover:text-text"}`}
      onClick={onClick}
      title={title}
    >
      {label}
    </button>
  );
}

function Sep() {
  return <div className="w-px h-5 bg-border" />;
}
