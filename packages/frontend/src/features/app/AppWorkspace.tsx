import React from "react";
import type { Diagram, DiagramNode, Position, DiagramType } from "@uml-editor/shared";
import type { CanvasTheme } from "../../hooks/useTheme";
import { DSLEditor } from "../editor/DSLEditor";
import { Canvas } from "../canvas/Canvas";
import { PropertyPanel } from "../canvas/PropertyPanel";
import { StylePanel } from "../canvas/StylePanel";
import { EdgePropertyPanel } from "../canvas/EdgePropertyPanel";
import { NodeStyleControls } from "../canvas/style/NodeStyleControls";
import { getFlowchartColors, resolveStyle, isDarkCanvas } from "../canvas/nodes/useNodeStyle";
import { NodePalette } from "../palette/NodePalette";
import { UndoHistoryPanel } from "../ui/UndoHistoryPanel";
import { useI18n } from "../../i18n";

export type EditorMode = "visual" | "code" | "split";

export interface AppWorkspaceProps {
  mode: EditorMode;
  showHistory: boolean;
  onCloseHistory: () => void;
  undoCount: number;
  redoCount: number;
  onUndo: () => void;
  onRedo: () => void;
  code: string;
  onCodeChange: (code: string) => void;
  onCompile: (dslCode?: string) => void;
  errors: any[];
  onSyncToCode: () => void;
  diagram: Diagram | null;
  onAddNode: (type: string, name?: string) => void;
  activeEdgeTool: string | null;
  onEdgeToolSelect: (tool: string | null) => void;
  actions: any;
  selectedNodeId: string | null;
  onNodeSelect: (id: string | null) => void;
  selectedEdgeId: string | null;
  onEdgeSelect: (id: string | null) => void;
  selectedEdgeIds: Set<string>;
  onEdgeShiftSelect: (edgeId: string) => void;
  canvasTheme: CanvasTheme;
  snapEnabled: boolean;
  edgeRouting: "straight" | "orthogonal";
  onEdgeRoutingToggle: () => void;
  onQuickAddNode?: (sourceNodeId: string) => void;
  onCanvasContextMenu: (
    e: React.MouseEvent,
    target: {
      type: "canvas" | "node" | "edge";
      id?: string;
      worldPos: Position;
      multiNodeIds?: string[];
    }
  ) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  selectedNode?: DiagramNode | null;
  showStylePanel: "node" | "global" | "edge" | null;
  onOpenStylePanel: (panel: "node" | "global" | "edge" | null) => void;
  globalStyle: Record<string, any>;
  onGlobalStyleChange: (s: any) => void;
  onCreateNewDiagram?: (type: DiagramType) => void;
  onCopyPNG?: () => void;
}

export function AppWorkspace(props: AppWorkspaceProps) {
  const { t } = useI18n();
  const {
    mode,
    showHistory,
    onCloseHistory,
    undoCount,
    redoCount,
    onUndo,
    onRedo,
    code,
    onCodeChange,
    onCompile,
    errors,
    onSyncToCode,
    diagram,
    onAddNode,
    activeEdgeTool,
    onEdgeToolSelect,
    actions,
    selectedNodeId,
    onNodeSelect,
    selectedEdgeId,
    onEdgeSelect,
    selectedEdgeIds,
    onEdgeShiftSelect,
    canvasTheme,
    snapEnabled,
    edgeRouting,
    onEdgeRoutingToggle,
    onQuickAddNode,
    onCanvasContextMenu,
    onDragStart,
    onDragEnd,
    selectedNode,
    showStylePanel,
    onOpenStylePanel,
    globalStyle,
    onGlobalStyleChange,
    onCreateNewDiagram,
  } = props;

  /** What the node actually looks like without custom style, so the panel shows real values. */
  const getEffectiveDefaults = (node: DiagramNode) => {
    const dark = isDarkCanvas(canvasTheme);
    const base = resolveStyle(undefined, canvasTheme);
    if (diagram?.type === "flowchart") {
      const c = getFlowchartColors(node.type, dark);
      return { ...base, backgroundColor: c.bg, borderColor: c.border, fontColor: c.font };
    }
    return base;
  };

  return (
    <>
      <div className="flex flex-1 overflow-hidden relative">
        {/* Undo History side panel */}
        {showHistory && (
          <UndoHistoryPanel
            isOpen={showHistory}
            onClose={onCloseHistory}
            undoCount={undoCount}
            redoCount={redoCount}
            onUndo={onUndo}
            onRedo={onRedo}
          />
        )}

        {(mode === "code" || mode === "split") && (
          <div
            className={`${mode === "code" ? "flex-1" : "w-[420px] min-w-[300px]"} border-r border-border flex flex-col`}
          >
            <DSLEditor
              code={code}
              onChange={onCodeChange}
              onCompile={onCompile}
              errors={errors}
              onSyncToCode={onSyncToCode}
              selectedNodeName={selectedNode?.name}
            />
          </div>
        )}

        {mode === "visual" && (
          <NodePalette
            diagramType={diagram?.type || "class"}
            onAddNode={onAddNode}
            activeEdgeTool={activeEdgeTool}
            onEdgeToolSelect={onEdgeToolSelect}
            onCreateNewDiagram={onCreateNewDiagram}
          />
        )}

        {(mode === "visual" || mode === "split") && (
          <div className="flex-1 relative overflow-hidden">
            <Canvas
              diagram={diagram}
              onCreateNewDiagram={onCreateNewDiagram}
              onNodeMove={actions.nodeMove}
              onNodeResize={actions.nodeResize}
              onNodeSelect={onNodeSelect}
              onEdgeSelect={onEdgeSelect}
              onEdgeWaypointMove={actions.edgeWaypointMove}
              onEdgeWaypointAdd={actions.edgeWaypointAdd}
              onEdgeWaypointDelete={actions.edgeWaypointDelete}
              onEdgeEndpointDrag={actions.edgeEndpointDrag}
              onEdgeReconnect={actions.edgeReconnect}
              onMultiNodeMove={actions.multiNodeMove}
              onNodeRename={actions.nodeRename}
              onNodeLiveRename={actions.nodeLiveRename}
              onParticipantMove={actions.participantMove}
              onParticipantRename={actions.participantRename}
              onMessageEdit={actions.messageEdit}
              onMessageDelete={actions.messageDelete}
              onMessageReorder={actions.messageReorder}
              onAddMessage={actions.addMessage}
              onAddEdge={actions.addEdge}
              onEdgeLabelEdit={actions.edgeLabelEdit}
              onAlignNodes={actions.alignNodes}
              onDistributeNodes={actions.distributeNodes}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              selectedNodeId={selectedNodeId}
              selectedEdgeId={selectedEdgeId}
              selectedEdgeIds={selectedEdgeIds}
              onEdgeShiftSelect={onEdgeShiftSelect}
              canvasTheme={canvasTheme}
              snapEnabled={snapEnabled}
              edgeRouting={edgeRouting}
              onEdgeRoutingToggle={onEdgeRoutingToggle}
              activeEdgeTool={activeEdgeTool}
              onQuickAddNode={onQuickAddNode}
              onCopyPNG={props.onCopyPNG}
              onContextMenu={onCanvasContextMenu}
            />
          </div>
        )}

        {selectedNode && (
          <PropertyPanel
            node={selectedNode}
            onClose={() => onNodeSelect(null)}
            tab={showStylePanel === "node" ? "style" : "props"}
            onTabChange={(tab) => onOpenStylePanel(tab === "style" ? "node" : null)}
            onOpenStyle={() => onOpenStylePanel("node")}
            onOpenGlobalStyle={() => onOpenStylePanel("global")}
            onUpdateNode={actions.nodeUpdate}
            onLiveUpdate={(nodeId, patch) => {
              if (patch.name !== undefined) {
                actions.nodeLiveRename(nodeId, patch.name);
              }
            }}
            onAutoFit={actions.nodeAutoFit}
            onApplyStyleToType={actions.applyStyleToSameType}
            styleSlot={
              <NodeStyleControls
                style={(selectedNode as any).style || {}}
                defaults={getEffectiveDefaults(selectedNode) as any}
                onChange={(s) => actions.nodeStyleChange(selectedNode.id, s)}
              />
            }
            onAddAttribute={actions.addAttribute}
            onAddMethod={actions.addMethod}
            onDeleteAttribute={actions.deleteAttribute}
            onDeleteMethod={actions.deleteMethod}
            onAddERDColumn={actions.addERDColumn}
            onDeleteERDColumn={actions.deleteERDColumn}
          />
        )}

        {!selectedNode && selectedEdgeId && diagram && (
          <EdgePropertyPanel
            diagram={diagram}
            edgeId={selectedEdgeId}
            onClose={() => onEdgeSelect(null)}
            onLabelEdit={actions.edgeLabelEdit}
            onTypeChange={actions.edgeTypeChange}
            onReverse={actions.edgeReverse}
            onOpenStyle={() => onOpenStylePanel("edge")}
          />
        )}

        {showStylePanel === "global" && (
          <StylePanel
            type="node"
            style={globalStyle}
            onChange={onGlobalStyleChange}
            onClose={() => onOpenStylePanel(null)}
            title={t("style.globalStyleTitle")}
          />
        )}

        {showStylePanel === "edge" && selectedEdgeId && diagram && (
          <StylePanel
            type="edge"
            style={
              diagram.edges.find((e) => e.id === selectedEdgeId)?.style || {}
            }
            onChange={(s) => actions.edgeStyleChange(selectedEdgeId, s)}
            onClose={() => onOpenStylePanel(null)}
          />
        )}
      </div>

      {errors.length > 0 && (
        <div className="bg-surface-2 border-t border-border px-4 py-2 max-h-28 overflow-y-auto shrink-0">
          {errors.map((err, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 py-1 text-xs ${err.severity === "error" ? "text-error" : "text-warning"}`}
            >
              <span className="font-mono opacity-70 min-w-[70px]">
                Ln {err.line}:{err.column}
              </span>
              <span>{err.message}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
