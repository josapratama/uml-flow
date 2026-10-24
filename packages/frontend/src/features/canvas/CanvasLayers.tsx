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
  edgeRouting?: "straight" | "orthogonal";
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
  onQuickAddNode?: (sourceNodeId: string) => void;
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
    setMultiSelected,
  } = props;

  const renderNode = (node: DiagramNode) => (
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
      onRenameCancel={() => setEditingNodeId(null)}
    />
  );

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

      {/* Layer 1: Containers */}
      {containerNodes.map(renderNode)}

      {/* Layer 2: Edges */}
      {diagram.edges.map((edge) => {
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

        return (
          <EdgeRenderer
            key={edge.id}
            edge={edge}
            nodes={diagram.nodes}
            isSelected={
              edge.id === selectedEdgeId ||
              (selectedEdgeIds?.has(edge.id) ?? false)
            }
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
              setEditingEdgeId(edge.id);
            }}
          />
        );
      })}

      {/* Inline edge label editor */}
      {editingEdgeId &&
        (() => {
          const edge = diagram.edges.find((e) => e.id === editingEdgeId);
          if (!edge) return null;
          const sn = diagram.nodes.find((n) => n.id === edge.source);
          const tn = diagram.nodes.find((n) => n.id === edge.target);
          if (!sn || !tn) return null;
          const midX =
            (sn.position.x +
              sn.size.width / 2 +
              tn.position.x +
              tn.size.width / 2) /
            2;
          const midY =
            (sn.position.y +
              sn.size.height / 2 +
              tn.position.y +
              tn.size.height / 2) /
            2;
          return (
            <InlineEditor
              x={midX - 60}
              y={midY - 10}
              width={120}
              initialValue={edge.label?.text || ""}
              scale={view.scale}
              onChange={() => {}}
              onSubmit={(val) => {
                onEdgeLabelEdit?.(editingEdgeId, val);
                setEditingEdgeId(null);
              }}
              onCancel={() => setEditingEdgeId(null)}
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
      <ValidationOverlay diagram={diagram} />
    </>
  );
}
