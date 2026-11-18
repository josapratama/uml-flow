import React, { lazy, Suspense } from "react";
import type { Diagram } from "@uml-editor/shared";
import type { SavedDiagram } from "../../services/storage";
import type { DiagramTemplate } from "../../services/templates";
import { ContextMenu, type ContextMenuItem } from "../canvas/ContextMenu";

const ShortcutsPanel = lazy(() => import("../toolbar/ShortcutsPanel").then(m => ({ default: m.ShortcutsPanel })));
const DiagramLibrary = lazy(() => import("../ui/DiagramLibrary").then(m => ({ default: m.DiagramLibrary })));
const TemplatesPanel = lazy(() => import("../ui/TemplatesPanel").then(m => ({ default: m.TemplatesPanel })));
const AIAssistant = lazy(() => import("../ui/AIAssistant").then(m => ({ default: m.AIAssistant })));
const PresentationMode = lazy(() => import("../ui/PresentationMode").then(m => ({ default: m.PresentationMode })));
const DiagramDiffPanel = lazy(() => import("../ui/DiagramDiffPanel").then(m => ({ default: m.DiagramDiffPanel })));
const AcademicCaptionModal = lazy(() => import("../ui/AcademicCaptionModal").then(m => ({ default: m.AcademicCaptionModal })));
const SQLExportModal = lazy(() => import("../ui/SQLExportModal").then(m => ({ default: m.SQLExportModal })));
const ImportModal = lazy(() => import("../ui/ImportModal").then(m => ({ default: m.ImportModal })));
const ShareModal = lazy(() => import("../ui/ShareModal").then(m => ({ default: m.ShareModal })));
const DiagramMetricsModal = lazy(() => import("../ui/DiagramMetricsModal").then(m => ({ default: m.DiagramMetricsModal })));
const CommandPaletteModal = lazy(() => import("../ui/CommandPaletteModal").then(m => ({ default: m.CommandPaletteModal })));
const FlowSimulatorModal = lazy(() => import("../ui/FlowSimulatorModal").then(m => ({ default: m.FlowSimulatorModal })));
const AcademicMetadataModal = lazy(() => import("../ui/AcademicMetadataModal").then(m => ({ default: m.AcademicMetadataModal })));
const ThesisBundleModal = lazy(() => import("../ui/ThesisBundleModal").then(m => ({ default: m.ThesisBundleModal })));
const TestCaseModal = lazy(() => import("../ui/TestCaseModal").then(m => ({ default: m.TestCaseModal })));
const MockDataModal = lazy(() => import("../ui/MockDataModal").then(m => ({ default: m.MockDataModal })));
const DependencyMatrixModal = lazy(() => import("../ui/DependencyMatrixModal").then(m => ({ default: m.DependencyMatrixModal })));
const WorkspaceBackupModal = lazy(() => import("../ui/WorkspaceBackupModal").then(m => ({ default: m.WorkspaceBackupModal })));
const NodeHierarchyModal = lazy(() => import("../ui/NodeHierarchyModal").then(m => ({ default: m.NodeHierarchyModal })));

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
  showSimulator?: boolean;
  onCloseSimulator?: () => void;
  showAcademicMetadata?: boolean;
  onCloseAcademicMetadata?: () => void;
  showThesisBundle?: boolean;
  onCloseThesisBundle?: () => void;
  showTestCases?: boolean;
  onCloseTestCases?: () => void;
  showMockData?: boolean;
  onCloseMockData?: () => void;
  showDependencyMatrix?: boolean;
  onCloseDependencyMatrix?: () => void;
  onOpenDependencyMatrix?: () => void;
  showWorkspaceBackup?: boolean;
  onCloseWorkspaceBackup?: () => void;
  onOpenWorkspaceBackup?: () => void;
  onRestoreSuccess?: () => void;
  showNodeHierarchy?: boolean;
  onCloseNodeHierarchy?: () => void;
  onOpenNodeHierarchy?: () => void;
  showCommandPalette?: boolean;
  onCloseCommandPalette?: () => void;
  onSelectNode?: (nodeId: string) => void;
  onFocusNode?: (nodeId: string) => void;
  onLayout?: (preset: string) => void;
  onExport?: (format: string) => void;
  onOpenMetrics?: () => void;
  onOpenSimulator?: () => void;
  onOpenAcademicMetadata?: () => void;
  onOpenThesisBundle?: () => void;
  onOpenTestCases?: () => void;
  onOpenMockData?: () => void;
  onOpenAI?: () => void;
  onOpenTemplates?: () => void;
  onOpenLibrary?: () => void;
  onOpenAcademicCaption?: () => void;
  onRepairDiagram?: () => void;
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
  showSimulator = false,
  onCloseSimulator,
  showAcademicMetadata = false,
  onCloseAcademicMetadata,
  showThesisBundle = false,
  onCloseThesisBundle,
  showTestCases = false,
  onCloseTestCases,
  showMockData = false,
  onCloseMockData,
  showDependencyMatrix = false,
  onCloseDependencyMatrix,
  onOpenDependencyMatrix = () => { },
  showWorkspaceBackup = false,
  onCloseWorkspaceBackup,
  onOpenWorkspaceBackup = () => { },
  onRestoreSuccess = () => { },
  showNodeHierarchy = false,
  onCloseNodeHierarchy,
  onOpenNodeHierarchy = () => { },
  showCommandPalette = false,
  onCloseCommandPalette,
  onSelectNode = () => { },
  onFocusNode = () => { },
  onLayout = () => { },
  onExport = () => { },
  onOpenMetrics = () => { },
  onOpenSimulator = () => { },
  onOpenAcademicMetadata = () => { },
  onOpenThesisBundle = () => { },
  onOpenTestCases = () => { },
  onOpenMockData = () => { },
  onOpenAI = () => { },
  onOpenTemplates = () => { },
  onOpenLibrary = () => { },
  onOpenAcademicCaption = () => { },
  onRepairDiagram = () => { },
  onOpenDiff = () => { },
  onOpenShortcuts = () => { },
  onOpenImport = () => { },
  onToggleTheme = () => { },
  onUndo = () => { },
  onRedo = () => { },
  onNewDiagram = () => { },
  canUndo = false,
  canRedo = false,
}: AppModalsProps) {
  return (
    <>
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.items}
          onClose={onCloseContextMenu}
        />
      )}

      <Suspense fallback={null}>
        {showShortcuts && (
          <ShortcutsPanel isOpen={showShortcuts} onClose={onCloseShortcuts} />
        )}

        {showLibrary && (
          <DiagramLibrary
            isOpen={showLibrary}
            onClose={onCloseLibrary}
            diagrams={libraryDiagrams || tabs || []}
            activeId={activeTabId}
            onOpen={onOpenTab}
            onDelete={onDeleteSavedDiagram}
            onSaveCurrent={onSaveCurrent}
          />
        )}

        {showTemplates && (
          <TemplatesPanel
            isOpen={showTemplates}
            onClose={onCloseTemplates}
            templates={templates}
            onLoad={onLoadTemplate}
            onDelete={onDeleteTemplate}
            onSave={onSaveTemplate}
          />
        )}

        {showAI && (
          <AIAssistant
            isOpen={showAI}
            onClose={onCloseAI}
            onGenerate={onAIGenerate}
          />
        )}

        {showPresentation && (
          <PresentationMode onExit={onExitPresentation} diagram={diagram} />
        )}

        {showDiff && (
          <DiagramDiffPanel
            isOpen={showDiff}
            onClose={onCloseDiff}
            currentDiagram={diagram}
            savedDiagrams={libraryDiagrams || tabs || []}
            onLoadVersion={onLoadDiffVersion}
          />
        )}

        {showAcademicCaption && (
          <AcademicCaptionModal
            isOpen={showAcademicCaption}
            onClose={onCloseAcademicCaption}
            diagram={diagram}
          />
        )}

        {showSQLExport && (
          <SQLExportModal
            isOpen={showSQLExport}
            onClose={onCloseSQLExport || (() => { })}
            diagram={diagram}
          />
        )}

        {showImportModal && (
          <ImportModal
            isOpen={showImportModal}
            onClose={onCloseImportModal}
            onImportDSL={onImportDSL}
          />
        )}

        {showShareModal && (
          <ShareModal
            isOpen={showShareModal}
            onClose={onCloseShareModal || (() => { })}
            shareUrl={shareUrl}
            diagram={diagram}
          />
        )}

        {showMetrics && (
          <DiagramMetricsModal
            isOpen={showMetrics}
            onClose={onCloseMetrics || (() => { })}
            diagram={diagram}
          />
        )}

        {showSimulator && (
          <FlowSimulatorModal
            isOpen={showSimulator}
            onClose={onCloseSimulator || (() => { })}
            diagram={diagram}
            onSelectNode={onSelectNode}
            onFocusNode={onFocusNode}
          />
        )}

        {showAcademicMetadata && (
          <AcademicMetadataModal
            isOpen={showAcademicMetadata}
            onClose={onCloseAcademicMetadata || (() => { })}
          />
        )}

        {showThesisBundle && (
          <ThesisBundleModal
            isOpen={showThesisBundle}
            onClose={onCloseThesisBundle || (() => { })}
            diagram={diagram}
          />
        )}

        {showTestCases && (
          <TestCaseModal
            isOpen={showTestCases}
            onClose={onCloseTestCases || (() => { })}
            diagram={diagram}
          />
        )}

        {showMockData && (
          <MockDataModal
            isOpen={showMockData}
            onClose={onCloseMockData || (() => { })}
            diagram={diagram}
          />
        )}

        {showDependencyMatrix && (
          <DependencyMatrixModal
            isOpen={showDependencyMatrix}
            onClose={onCloseDependencyMatrix || (() => { })}
            diagram={diagram}
          />
        )}

        {showWorkspaceBackup && (
          <WorkspaceBackupModal
            isOpen={showWorkspaceBackup}
            onClose={onCloseWorkspaceBackup || (() => { })}
            onRestoreSuccess={onRestoreSuccess}
          />
        )}

        {showNodeHierarchy && (
          <NodeHierarchyModal
            isOpen={showNodeHierarchy}
            onClose={onCloseNodeHierarchy || (() => { })}
            diagram={diagram}
            onSelectNode={onSelectNode}
            onFocusNode={onFocusNode}
          />
        )}

        {showCommandPalette && (
          <CommandPaletteModal
            isOpen={showCommandPalette}
            onClose={onCloseCommandPalette || (() => { })}
            diagram={diagram}
            onSelectNode={onSelectNode}
            onFocusNode={onFocusNode}
            onLayout={onLayout}
            onExport={onExport}
            onOpenMetrics={onOpenMetrics}
            onOpenSimulator={onOpenSimulator}
            onOpenAcademicMetadata={onOpenAcademicMetadata}
            onOpenThesisBundle={onOpenThesisBundle}
            onOpenTestCases={onOpenTestCases}
            onOpenMockData={onOpenMockData}
            onOpenDependencyMatrix={onOpenDependencyMatrix}
            onOpenWorkspaceBackup={onOpenWorkspaceBackup}
            onOpenNodeHierarchy={onOpenNodeHierarchy}
            onOpenAI={onOpenAI}
            onOpenTemplates={onOpenTemplates}
            onOpenLibrary={onOpenLibrary}
            onOpenAcademicCaption={onOpenAcademicCaption}
            onRepairDiagram={onRepairDiagram}
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
        )}
      </Suspense>
    </>
  );
}
