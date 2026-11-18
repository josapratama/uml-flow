import React from "react";
import type { Diagram, DiagramNode, Position } from "@uml-editor/shared";
import type { CanvasTheme } from "../../hooks/useTheme";
import type { ResizeHandle } from "./nodes/ResizeHandles";
import { EdgeRenderer } from "./edges/EdgeRenderer";
import { SequenceRenderer } from "./diagrams/SequenceRenderer";
import { ActivityRenderer } from "./diagrams/ActivityRenderer";
import { InlineEditor } from "./InlineEditor";
import { ConnectionLine } from "./ConnectionLine";
import { ValidationOverlay } from "./ValidationOverlay";
import { CanvasNodeItem } from "./CanvasNodeItem";
import { getVisualSize } from "./nodes/getVisualSize";
import type { ComputedEdgeLayout } from "./utils/edgeRoutingLayout";

interface CanvasLayersProps {
  diagram: Diagram;
  canvasTheme: CanvasTheme;
  view: { scale: number; offsetX: number; offsetY: number };
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  selectedEdgeIds?: Set<string>;
  multiSelected: Set<string>;
  hoveredNodeId: string | null;
  setHoveredNodeId: (id: string | null) => void;
  connecting: { from: Position; to: Position; sourceId: string } | null;
  reconnecting: {
    edgeId: string;
    end: "source" | "target";
    from: Position;
    to: Position;
  } | null;
  setReconnecting: React.Dispatch<
    React.SetStateAction<{
      edgeId: string;
      end: "source" | "target";
      from: Position;
      to: Position;
    } | null>
  >;
  editingNodeId: string | null;
  setEditingNodeId: (id: string | null) => void;
  editingEdgeId: string | null;
  setEditingEdgeId: (id: string | null) => void;
  editingEdgePos?: Position | null;
  setEditingEdgePos?: (pos: Position | null) => void;
  edgeRouting?: "straight" | "orthogonal" | "curved";
  edgeLayout: ComputedEdgeLayout;
  startNodeDrag: (nodeId: string, e: React.MouseEvent) => void;
  handleAnchorMouseDown: (
    nodeId: string,
    anchor: Position,
    side: string,
    e: React.MouseEvent
  ) => void;
  handleResizeStart: (
    nodeId: string,
    handle: ResizeHandle,
    e: React.MouseEvent
  ) => void;
  startWpDrag: (
    edgeId: string,
    idx: number,
    pt: Position,
    e: React.MouseEvent
  ) => void;
  screenToWorld: (cx: number, cy: number) => Position;
  onNodeSelect: (id: string | null) => void;
  onEdgeSelect: (id: string | null) => void;
  onEdgeShiftSelect?: (id: string) => void;
  onEdgeWaypointDelete?: (edgeId: string, idx: number) => void;
  onEdgeEndpointDrag?: (
    edgeId: string,
    end: "source" | "target",
    anchor: string
  ) => void;
  onEdgeLabelEdit?: (edgeId: string, label: string) => void;
  onNodeRename: (nodeId: string, newName: string) => void;
  onNodeLiveRename?: (nodeId: string, newName: string) => void;
  onParticipantMove?: (id: string, x: number) => void;
  onParticipantRename?: (id: string, name: string) => void;
  onMessageEdit?: (id: string, label: string) => void;
  onMessageDelete?: (id: string) => void;
  onMessageReorder?: (id: string, newOrder: number) => void;
  onAddMessage?: (
    from: string,
    to: string,
    label: string,
    type: string
  ) => void;
  onQuickAddNode?: (
    sourceNodeId: string,
    direction?: "right" | "bottom" | "left" | "top"
  ) => void;
  onContextMenu?: (
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
  onAutoRepair?: () => void;
  setMultiSelected: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export function CanvasLayers(props: CanvasLayersProps) {
  const {
    diagram,
    canvasTheme,
    view,
    selectedNodeId,
    selectedEdgeId,
    selectedEdgeIds,
    multiSelected,
    hoveredNodeId,
    setHoveredNodeId,
    connecting,
    reconnecting,
    setReconnecting,
    editingNodeId,
    setEditingNodeId,
    editingEdgeId,
    setEditingEdgeId,
    editingEdgePos,
    setEditingEdgePos,
    edgeRouting,
    edgeLayout,
    startNodeDrag,
    handleAnchorMouseDown,
    handleResizeStart,
    startWpDrag,
    screenToWorld,
    onNodeSelect,
    onEdgeSelect,
    onEdgeShiftSelect,
    onEdgeWaypointDelete,
    onEdgeEndpointDrag,
    onEdgeLabelEdit,
    onNodeRename,
    onNodeLiveRename,
    onParticipantMove,
    onParticipantRename,
    onMessageEdit,
    onMessageDelete,
    onMessageReorder,
    onAddMessage,
    onQuickAddNode,
    onContextMenu,
    onDragStart,
    onDragEnd,
    onAutoRepair,
    setMultiSelected,
  } = props;

  const selectedNodeIds = new Set<string>();
  if (selectedNodeId) selectedNodeIds.add(selectedNodeId);
  if (multiSelected && multiSelected.size > 0) {
    multiSelected.forEach((id) => selectedNodeIds.add(id));
  }
  const hasNodeSelection = selectedNodeIds.size > 0;

  // Set of connected 1-hop neighbor nodes
  const connectedNodeIds = new Set<string>(selectedNodeIds);
  if (hasNodeSelection) {
    for (const edge of diagram.edges || []) {
      if (selectedNodeIds.has(edge.source)) connectedNodeIds.add(edge.target);
      if (selectedNodeIds.has(edge.target)) connectedNodeIds.add(edge.source);
    }
  }

  const renderNode = (node: DiagramNode) => {
    const isDimmed = hasNodeSelection && !connectedNodeIds.has(node.id) && !isContainerNode(node);
    return (
      <CanvasNodeItem
        key={node.id}
        node={node}
        diagramType={diagram.type}
        isSelected={node.id === selectedNodeId}
        isHovered={hoveredNodeId === node.id}
        isMultiSelected={multiSelected.has(node.id)}
        isConnecting={Boolean(connecting)}
        isReconnecting={Boolean(reconnecting)}
        connectingSourceId={connecting?.sourceId}
        isEditing={editingNodeId === node.id}
        hasMultiSelection={multiSelected.size > 0}
        isDimmed={isDimmed}
        canvasTheme={canvasTheme}
      onSetHovered={(hovered) =>
        setHoveredNodeId(hovered ? node.id : null)
      }
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        let currentMulti: string[] = [];
        if (!multiSelected.has(node.id)) {
          onNodeSelect(node.id);
          onEdgeSelect(null);
          setMultiSelected(new Set());
          currentMulti = [node.id];
        } else {
          currentMulti = [...multiSelected];
        }
        const pt = screenToWorld(e.clientX, e.clientY);
        onContextMenu?.(e, {
          type: "node",
          id: node.id,
          worldPos: pt || node.position,
          multiNodeIds: currentMulti,
        });
      }}
      onDragStart={(e) => startNodeDrag(node.id, e)}
      onDoubleClick={() => setEditingNodeId(node.id)}
      onAnchorMouseDown={(anchor, side, e) =>
        handleAnchorMouseDown(node.id, anchor, side, e)
      }
      onResizeStart={(handle, e) =>
        handleResizeStart(node.id, handle, e)
      }
      onQuickAddNode={onQuickAddNode}
      onRenameSubmit={(val) => {
        onNodeRename(node.id, val);
        setEditingNodeId(null);
      }}
      onRenameChange={(val) => {
        onNodeLiveRename?.(node.id, val);
      }}
      onRenameCancel={() => setEditingNodeId(null)}
    />
  );
};

  const isContainerNode = (n: DiagramNode) =>
    n.type === "composite" ||
    n.type === "system" ||
    (n.type as string) === "boundary";

  const containerNodes = diagram.nodes.filter(isContainerNode);
  const leafNodes = diagram.nodes.filter((n) => !isContainerNode(n));

  if (diagram.type === "sequence") {
    return (
      <SequenceRenderer
        diagram={diagram}
        theme={canvasTheme}
        selectedParticipantId={selectedNodeId}
        selectedMessageId={selectedEdgeId}
        onParticipantSelect={onNodeSelect}
        onMessageSelect={onEdgeSelect}
        onParticipantRename={onParticipantRename}
        onMessageEdit={onMessageEdit}
        onMessageDelete={onMessageDelete}
        onMessageReorder={onMessageReorder}
        onAddMessage={onAddMessage}
        onParticipantDragStart={(id, e) => {
          e.stopPropagation();
          const participant = diagram.participants?.find((p) => p.id === id);
          if (!participant) return;
          onDragStart?.();
          onNodeSelect(id);
          const startX = e.clientX;
          const origX = participant.position.x;
          const onMove = (ev: MouseEvent) => {
            const dx = (ev.clientX - startX) / view.scale;
            onParticipantMove?.(id, origX + dx);
          };
          const onUp = () => {
            onDragEnd?.();
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
          };
          window.addEventListener("mousemove", onMove);
          window.addEventListener("mouseup", onUp);
        }}
      />
    );
  }

  return (
    <>
      {/* Swimlane background for activity diagrams */}
      {diagram.type === "activity" && diagram.swimlanes?.length && (
        <ActivityRenderer diagram={diagram} />
      )}

      {/* Automatic UML 2.5 System Boundary Frame for Use Case Diagrams */}
      {diagram.type === "usecase" && containerNodes.length === 0 && (() => {
        const useCaseOvals = diagram.nodes.filter((n) => (n.type as string) === "usecase");
        if (useCaseOvals.length === 0) return null;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const uc of useCaseOvals) {
          const vs = getVisualSize(uc);
          minX = Math.min(minX, uc.position.x);
          minY = Math.min(minY, uc.position.y);
          maxX = Math.max(maxX, uc.position.x + vs.width);
          maxY = Math.max(maxY, uc.position.y + vs.height);
        }
        const padX = 36;
        const padTop = 52;
        const padBottom = 32;
        const bx = minX - padX;
        const by = minY - padTop;
        const bw = Math.max(240, maxX - minX + padX * 2);
        const bh = Math.max(160, maxY - minY + padTop + padBottom);
        const isDark = canvasTheme === "dark";
        const rawTitle = diagram.name && diagram.name !== "Untitled" ? diagram.name : "System Boundary";
        return (
          <g className="usecase-system-boundary pointer-events-none">
            <rect
              x={bx}
              y={by}
              width={bw}
              height={bh}
              rx={10}
              fill={isDark ? "rgba(30, 41, 59, 0.28)" : "rgba(241, 245, 249, 0.55)"}
              stroke={isDark ? "#475569" : "#94a3b8"}
              strokeWidth={1.75}
              strokeDasharray="6,4"
            />
            <rect
              x={bx}
              y={by}
              width={bw}
              height={32}
              rx={10}
              fill={isDark ? "rgba(51, 65, 85, 0.45)" : "rgba(226, 232, 240, 0.7)"}
            />
            <line
              x1={bx}
              y1={by + 32}
              x2={bx + bw}
              y2={by + 32}
              stroke={isDark ? "#475569" : "#cbd5e1"}
              strokeWidth={1}
            />
            <text
              x={bx + bw / 2}
              y={by + 20}
              textAnchor="middle"
              fontSize={12.5}
              fontWeight="bold"
              fontFamily="Inter, system-ui, sans-serif"
              fill={isDark ? "#e2e8f0" : "#1e293b"}
            >
              {rawTitle}
            </text>
          </g>
        );
      })()}

      {/* Layer 1: Containers */}
      {containerNodes.map(renderNode)}

      {/* Layer 2: Edges with Connected Subgraph Focus */}
      {(() => {
        const selectedNodeIds = new Set<string>();
        if (selectedNodeId) selectedNodeIds.add(selectedNodeId);
        if (multiSelected && multiSelected.size > 0) {
          multiSelected.forEach((id) => selectedNodeIds.add(id));
        }
        const hasNodeSelection = selectedNodeIds.size > 0;

        return diagram.edges.map((edge) => {
          const cfg = edgeLayout.edgeConfigs.get(edge.id) || {
            laneOffset: 0,
            labelRatio: 0.5,
            labelShift: -10,
          };
          const sFrac =
            edgeLayout.portFractionMap.get(`${edge.id}:source`) ?? 0.5;
          const tFrac =
            edgeLayout.portFractionMap.get(`${edge.id}:target`) ?? 0.5;
          const chOffset = edgeLayout.channelOffsetMap.get(edge.id) ?? 0;

          const isConnectedToSelected =
            hasNodeSelection &&
            (selectedNodeIds.has(edge.source) || selectedNodeIds.has(edge.target));
          const isEdgeSelected =
            edge.id === selectedEdgeId ||
            (selectedEdgeIds?.has(edge.id) ?? false);
          const isDimmed =
            hasNodeSelection && !isConnectedToSelected && !isEdgeSelected;

          return (
            <EdgeRenderer
              key={edge.id}
              edge={edge}
              nodes={diagram.nodes}
              isSelected={isEdgeSelected}
              isFocused={isConnectedToSelected && !isEdgeSelected}
              isDimmed={isDimmed}
              edgeRouting={edgeRouting || "straight"}
              laneOffset={cfg.laneOffset}
              labelOffset={cfg.laneOffset}
              labelRatio={cfg.labelRatio}
              labelShift={cfg.labelShift}
              sourcePortFraction={sFrac}
              targetPortFraction={tFrac}
              channelOffset={chOffset}
              onClick={(e) => {
                e.stopPropagation();
                if (e.shiftKey && onEdgeShiftSelect) {
                  onEdgeShiftSelect(edge.id);
                } else {
                  onEdgeSelect(edge.id);
                  onNodeSelect(null);
                }
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdgeSelect(edge.id);
                onNodeSelect(null);
                const pt = screenToWorld(e.clientX, e.clientY);
                onContextMenu?.(e, {
                  type: "edge",
                  id: edge.id,
                  worldPos: pt,
                });
              }}
              onWaypointDragStart={(idx, pt, e) =>
                startWpDrag(edge.id, idx, pt, e)
              }
              onWaypointDelete={
                onEdgeWaypointDelete
                  ? (idx) => onEdgeWaypointDelete(edge.id, idx)
                  : undefined
              }
              onEndpointDrag={
                onEdgeEndpointDrag
                  ? (end, anchor) => onEdgeEndpointDrag(edge.id, end, anchor)
                  : undefined
              }
              onEndpointDragStart={(end, point, e) => {
                e.stopPropagation();
                onDragStart?.();
                setReconnecting({
                  edgeId: edge.id,
                  end,
                  from: point,
                  to: point,
                });
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                const pt = screenToWorld(e.clientX, e.clientY);
                setEditingEdgeId(edge.id);
                setEditingEdgePos?.(pt);
              }}
            />
          );
        });
      })()}

      {/* Inline edge label editor */}
      {editingEdgeId &&
        (() => {
          const edge = diagram.edges.find((e) => e.id === editingEdgeId);
          if (!edge) return null;
          const sn = diagram.nodes.find((n) => n.id === edge.source);
          const tn = diagram.nodes.find((n) => n.id === edge.target);
          if (!sn || !tn) return null;

          const edX = editingEdgePos
            ? editingEdgePos.x
            : (sn.position.x + sn.size.width / 2 + tn.position.x + tn.size.width / 2) / 2;
          const edY = editingEdgePos
            ? editingEdgePos.y
            : (sn.position.y + sn.size.height / 2 + tn.position.y + tn.size.height / 2) / 2;

          return (
            <InlineEditor
              x={edX - 60}
              y={edY}
              width={120}
              initialValue={edge.label?.text || ""}
              scale={view.scale}
              fontColor={canvasTheme === "dark" ? "#f1f5f9" : "#1e293b"}
              onChange={() => {}}
              onSubmit={(val) => {
                onEdgeLabelEdit?.(editingEdgeId, val);
                setEditingEdgeId(null);
                setEditingEdgePos?.(null);
              }}
              onCancel={() => {
                setEditingEdgeId(null);
                setEditingEdgePos?.(null);
              }}
            />
          );
        })()}

      {/* Layer 3: Leaf nodes */}
      {leafNodes.map(renderNode)}

      {/* Connection lines */}
      {connecting && (
        <ConnectionLine from={connecting.from} to={connecting.to} />
      )}
      {reconnecting && (
        <ConnectionLine from={reconnecting.from} to={reconnecting.to} />
      )}

      {/* Validation warning icons */}
      <ValidationOverlay diagram={diagram} onAutoRepair={onAutoRepair} />
    </>
  );
}
