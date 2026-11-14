import React from "react";
import type { Diagram } from "@uml-editor/shared";
import type { SavedDiagram } from "../../services/storage";
import type { DiagramTemplate } from "../../services/templates";
import { ShortcutsPanel } from "../toolbar/ShortcutsPanel";
import { ContextMenu, type ContextMenuItem } from "../canvas/ContextMenu";
import { DiagramLibrary } from "../ui/DiagramLibrary";
import { TemplatesPanel } from "../ui/TemplatesPanel";
import { AIAssistant } from "../ui/AIAssistant";
import { PresentationMode } from "../ui/PresentationMode";
import { DiagramDiffPanel } from "../ui/DiagramDiffPanel";
import { AcademicCaptionModal } from "../ui/AcademicCaptionModal";
import { SQLExportModal } from "../ui/SQLExportModal";
import { ImportModal } from "../ui/ImportModal";
import { ShareModal } from "../ui/ShareModal";
import { DiagramMetricsModal } from "../ui/DiagramMetricsModal";
import { CommandPaletteModal } from "../ui/CommandPaletteModal";

interface AppModalsProps {
  showShortcuts: boolean;
  onCloseShortcuts: () => void;
  contextMenu: { x: number; y: number; items: ContextMenuItem[] } | null;
  onCloseContextMenu: () => void;
  showLibrary: boolean;
  onCloseLibrary: () => void;
  tabs?: SavedDiagram[];
  libraryDiagrams?: SavedDiagram[];
  activeTabId: string | null;
  onOpenTab: (d: SavedDiagram) => void;
  onDeleteSavedDiagram: (id: string) => void;
  onSaveCurrent: () => void;
  showTemplates: boolean;
  onCloseTemplates: () => void;
  templates: DiagramTemplate[];
  onLoadTemplate: (id: string) => void;
  onDeleteTemplate: (id: string) => void;
  onSaveTemplate: (name: string, desc: string) => void;
  showAI: boolean;
  onCloseAI: () => void;
  onAIGenerate: (dsl: string) => void;
  showPresentation: boolean;
  onExitPresentation: () => void;
  showDiff: boolean;
  onCloseDiff: () => void;
  diagram: Diagram | null;
  onLoadDiffVersion: (d: Diagram) => void;
  showAcademicCaption: boolean;
  onCloseAcademicCaption: () => void;
  showSQLExport?: boolean;
  onCloseSQLExport?: () => void;
  showImportModal: boolean;
  onCloseImportModal: () => void;
  onImportDSL: (dsl: string) => void;
  showShareModal?: boolean;
  onCloseShareModal?: () => void;
  shareUrl?: string;
  showMetrics?: boolean;
  onCloseMetrics?: () => void;
  showCommandPalette?: boolean;
  onCloseCommandPalette?: () => void;
  onSelectNode?: (nodeId: string) => void;
  onFocusNode?: (nodeId: string) => void;
  onLayout?: (preset: string) => void;
  onExport?: (format: string) => void;
  onOpenMetrics?: () => void;
  onOpenAI?: () => void;
  onOpenTemplates?: () => void;
  onOpenLibrary?: () => void;
  onOpenAcademicCaption?: () => void;
  onOpenDiff?: () => void;
  onOpenShortcuts?: () => void;
  onOpenImport?: () => void;
  onToggleTheme?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onNewDiagram?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export function AppModals({
  showShortcuts,
  onCloseShortcuts,
  contextMenu,
  onCloseContextMenu,
  showLibrary,
  onCloseLibrary,
  tabs,
  libraryDiagrams,
  activeTabId,
  onOpenTab,
  onDeleteSavedDiagram,
  onSaveCurrent,
  showTemplates,
  onCloseTemplates,
  templates,
  onLoadTemplate,
  onDeleteTemplate,
  onSaveTemplate,
  showAI,
  onCloseAI,
  onAIGenerate,
  showPresentation,
  onExitPresentation,
  showDiff,
  onCloseDiff,
  diagram,
  onLoadDiffVersion,
  showAcademicCaption,
  onCloseAcademicCaption,
  showSQLExport = false,
  onCloseSQLExport,
  showImportModal,
  onCloseImportModal,
  onImportDSL,
  showShareModal = false,
  onCloseShareModal,
  shareUrl = "",
  showMetrics = false,
  onCloseMetrics,
  showCommandPalette = false,
  onCloseCommandPalette,
  onSelectNode = () => {},
  onFocusNode = () => {},
  onLayout = () => {},
  onExport = () => {},
  onOpenMetrics = () => {},
  onOpenAI = () => {},
  onOpenTemplates = () => {},
  onOpenLibrary = () => {},
  onOpenAcademicCaption = () => {},
  onOpenDiff = () => {},
  onOpenShortcuts = () => {},
  onOpenImport = () => {},
  onToggleTheme = () => {},
  onUndo = () => {},
  onRedo = () => {},
  onNewDiagram = () => {},
  canUndo = false,
  canRedo = false,
}: AppModalsProps) {
  return (
    <>
      <ShortcutsPanel isOpen={showShortcuts} onClose={onCloseShortcuts} />

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.items}
          onClose={onCloseContextMenu}
        />
      )}

      <DiagramLibrary
        isOpen={showLibrary}
        onClose={onCloseLibrary}
        diagrams={libraryDiagrams || tabs || []}
        activeId={activeTabId}
        onOpen={onOpenTab}
        onDelete={onDeleteSavedDiagram}
        onSaveCurrent={onSaveCurrent}
      />

      <TemplatesPanel
        isOpen={showTemplates}
        onClose={onCloseTemplates}
        templates={templates}
        onLoad={onLoadTemplate}
        onDelete={onDeleteTemplate}
        onSave={onSaveTemplate}
      />

      <AIAssistant
        isOpen={showAI}
        onClose={onCloseAI}
        onGenerate={onAIGenerate}
      />

      {showPresentation && <PresentationMode onExit={onExitPresentation} />}

      <DiagramDiffPanel
        isOpen={showDiff}
        onClose={onCloseDiff}
        currentDiagram={diagram}
        savedDiagrams={libraryDiagrams || tabs || []}
        onLoadVersion={onLoadDiffVersion}
      />

      <AcademicCaptionModal
        isOpen={showAcademicCaption}
        onClose={onCloseAcademicCaption}
        diagram={diagram}
      />

      <SQLExportModal
        isOpen={showSQLExport}
        onClose={onCloseSQLExport || (() => {})}
        diagram={diagram}
      />

      <ImportModal
        isOpen={showImportModal}
        onClose={onCloseImportModal}
        onImportDSL={onImportDSL}
      />

      <ShareModal
        isOpen={showShareModal}
        onClose={onCloseShareModal || (() => {})}
        shareUrl={shareUrl}
        diagram={diagram}
      />

      <DiagramMetricsModal
        isOpen={showMetrics}
        onClose={onCloseMetrics || (() => {})}
        diagram={diagram}
      />

      <CommandPaletteModal
        isOpen={showCommandPalette}
        onClose={onCloseCommandPalette || (() => {})}
        diagram={diagram}
        onSelectNode={onSelectNode}
        onFocusNode={onFocusNode}
        onLayout={onLayout}
        onExport={onExport}
        onOpenMetrics={onOpenMetrics}
        onOpenAI={onOpenAI}
        onOpenTemplates={onOpenTemplates}
        onOpenLibrary={onOpenLibrary}
        onOpenAcademicCaption={onOpenAcademicCaption}
        onOpenDiff={onOpenDiff}
        onOpenShortcuts={onOpenShortcuts}
        onOpenImport={onOpenImport}
        onToggleTheme={onToggleTheme}
        onUndo={onUndo}
        onRedo={onRedo}
        onNewDiagram={onNewDiagram}
        canUndo={canUndo}
        canRedo={canRedo}
      />
    </>
  );
}
