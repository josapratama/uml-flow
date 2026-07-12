import React, { useCallback } from "react";
import type { Diagram, Position } from "@uml-editor/shared";
import type { CanvasTheme } from "../../hooks/useTheme";
import { NodeRenderer } from "./nodes/NodeRenderer";
import { NodeAnchors } from "./nodes/NodeAnchors";
import {
  ResizeHandles,
  calculateResize,
  type ResizeHandle,
} from "./nodes/ResizeHandles";
import { getVisualSize } from "./nodes/getVisualSize";
import { EdgeRenderer } from "./edges/EdgeRenderer";
import { ArrowDefs } from "./edges/ArrowDefs";
import { SequenceRenderer } from "./diagrams/SequenceRenderer";
import { ActivityRenderer } from "./diagrams/ActivityRenderer";
import { Minimap } from "./Minimap";
import { InlineEditor } from "./InlineEditor";
import { ConnectionLine } from "./ConnectionLine";
import { AlignToolbar } from "./AlignToolbar";
import { ValidationOverlay } from "./ValidationOverlay";
import { useCanvasState } from "./hooks/useCanvasState";
import { useCanvasHandlers } from "./hooks/useCanvasHandlers";
import { useCanvasZoom } from "./hooks/useCanvasZoom";

interface CanvasProps {
  diagram: Diagram | null;
  onNodeMove: (nodeId: string, x: number, y: number) => void;
  onNodeResize?: (
    nodeId: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ) => void;
  onNodeSelect: (nodeId: string | null) => void;
  onEdgeSelect: (edgeId: string | null) => void;
  onEdgeShiftSelect?: (edgeId: string) => void;
  onEdgeWaypointMove: (
    edgeId: string,
    idx: number,
    x: number,
    y: number,
  ) => void;
  onEdgeWaypointAdd: (edgeId: string, afterIdx: number, pt: Position) => void;
  onEdgeWaypointDelete?: (edgeId: string, waypointIndex: number) => void;
  onEdgeEndpointDrag?: (
    edgeId: string,
    end: "source" | "target",
    anchor: string,
  ) => void;
  onEdgeReconnect?: (
    edgeId: string,
    end: "source" | "target",
    newNodeId: string,
    anchorSide?: string,
  ) => void;
  onAddEdge: (
    sourceId: string,
    targetId: string,
    type: string,
    sourceAnchor?: string,
    targetAnchor?: string,
  ) => void;
  onMultiNodeMove?: (nodeIds: string[], dx: number, dy: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
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
    type: string,
  ) => void;
  onEdgeLabelEdit?: (edgeId: string, label: string) => void;
  onAlignNodes?: (
    nodeIds: string[],
    alignment: "left" | "center" | "right" | "top" | "middle" | "bottom",
  ) => void;
  onDistributeNodes?: (
    nodeIds: string[],
    direction: "horizontal" | "vertical",
  ) => void;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  selectedEdgeIds?: Set<string>;
  canvasTheme: CanvasTheme;
  snapEnabled: boolean;
  edgeRouting?: "straight" | "orthogonal";
  activeEdgeTool?: string | null;
}

export function Canvas({
  diagram,
  onNodeMove,
  onNodeResize,
  onNodeSelect,
  onEdgeSelect,
  onEdgeShiftSelect,
  onEdgeWaypointMove,
  onEdgeWaypointAdd,
  onEdgeWaypointDelete,
  onEdgeEndpointDrag,
  onEdgeReconnect,
  onMultiNodeMove,
  onDragStart,
  onDragEnd,
  onNodeRename,
  onParticipantMove,
  onParticipantRename,
  onMessageEdit,
  onMessageDelete,
  onMessageReorder,
  onAddMessage,
  onAddEdge,
  onEdgeLabelEdit,
  onAlignNodes,
  onDistributeNodes,
  selectedNodeId,
  selectedEdgeId,
  selectedEdgeIds,
  canvasTheme,
  snapEnabled,
  edgeRouting,
  activeEdgeTool,
}: CanvasProps) {
  // --- State ---
  const state = useCanvasState();
  const {
    svgRef,
    view,
    setView,
    drag,
    setDrag,
    pan,
    setPan,
    editingNodeId,
    setEditingNodeId,
    editingEdgeId,
    setEditingEdgeId,
    connecting,
    setConnecting,
    reconnecting,
    setReconnecting,
    multiSelected,
    setMultiSelected,
    prevDx,
    prevDy,
    marquee,
    setMarquee,
    hoveredNodeId,
    setHoveredNodeId,
  } = state;

  // --- Handlers ---
  const { handleMouseDown, handleMouseMove, handleMouseUp, handleWheel } =
    useCanvasHandlers({
      svgRef,
      view,
      setView,
      drag,
      setDrag,
      pan,
      setPan,
      connecting,
      setConnecting,
      reconnecting,
      setReconnecting,
      marquee,
      setMarquee,
      multiSelected,
      setMultiSelected,
      prevDx,
      prevDy,
      setEditingNodeId,
      diagram,
      onNodeMove,
      onNodeSelect,
      onEdgeSelect,
      onEdgeWaypointMove,
      onMultiNodeMove,
      onDragStart,
      onDragEnd,
      onAddEdge,
      onEdgeReconnect,
      activeEdgeTool,
    });

  // --- Zoom ---
  const { zoomIn, zoomOut, zoomReset, zoomToFit } = useCanvasZoom(
    svgRef,
    view,
    setView,
    diagram,
  );

  // --- Node interactions ---
  const startNodeDrag = useCallback(
    (nodeId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const node = diagram?.nodes.find((n) => n.id === nodeId);
      if (!node) return;
      if (e.shiftKey) {
        setMultiSelected((prev) => {
          const next = new Set(prev);
          if (next.has(nodeId)) next.delete(nodeId);
          else next.add(nodeId);
          return next;
        });
        return;
      }
      if (multiSelected.size > 0 && !multiSelected.has(nodeId))
        setMultiSelected(new Set());
      setDrag({
        type: "node",
        id: nodeId,
        sx: e.clientX,
        sy: e.clientY,
        px: node.position.x,
        py: node.position.y,
      });
      onDragStart?.();
      onNodeSelect(nodeId);
      onEdgeSelect(null);
    },
    [
      diagram,
      onNodeSelect,
      onEdgeSelect,
      multiSelected,
      onDragStart,
      setDrag,
      setMultiSelected,
    ],
  );

  const handleAnchorMouseDown = useCallback(
    (nodeId: string, anchor: Position, side: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setConnecting({
        sourceId: nodeId,
        sourceAnchorSide: side,
        from: anchor,
        to: anchor,
        modifiers: { shift: e.shiftKey, alt: e.altKey, ctrl: e.ctrlKey },
      });
    },
    [setConnecting],
  );

  // --- Resize ---
  const resizeRef = React.useRef<{
    nodeId: string;
    handle: ResizeHandle;
    startX: number;
    startY: number;
    origPos: Position;
    origSize: { width: number; height: number };
  } | null>(null);

  const handleResizeStart = useCallback(
    (nodeId: string, handle: ResizeHandle, e: React.MouseEvent) => {
      e.stopPropagation();
      const node = diagram?.nodes.find((n) => n.id === nodeId);
      if (!node) return;
      onDragStart?.();
      resizeRef.current = {
        nodeId,
        handle,
        startX: e.clientX,
        startY: e.clientY,
        origPos: { ...node.position },
        origSize: { ...node.size },
      };
      // Use a temporary mousemove/mouseup on window for resize
      const onMove = (ev: MouseEvent) => {
        if (!resizeRef.current || !onNodeResize) return;
        const dx = (ev.clientX - resizeRef.current.startX) / view.scale;
        const dy = (ev.clientY - resizeRef.current.startY) / view.scale;
        const result = calculateResize(
          resizeRef.current.handle,
          resizeRef.current.origPos,
          resizeRef.current.origSize,
          dx,
          dy,
        );
        onNodeResize(
          resizeRef.current.nodeId,
          result.position.x,
          result.position.y,
          result.size.width,
          result.size.height,
        );
      };
      const onUp = () => {
        resizeRef.current = null;
        onDragEnd?.();
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [diagram, view.scale, onNodeResize, onDragStart, onDragEnd],
  );

  const startWpDrag = useCallback(
    (edgeId: string, idx: number, pt: Position, e: React.MouseEvent) => {
      e.stopPropagation();
      onDragStart?.();
      setDrag({
        type: "waypoint",
        id: edgeId,
        wpIdx: idx,
        sx: e.clientX,
        sy: e.clientY,
        px: pt.x,
        py: pt.y,
      });
    },
    [onDragStart, setDrag],
  );

  // --- Empty state ---
  if (!diagram) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-50">
        <div className="text-center text-slate-400">
          <svg
            className="mx-auto mb-4"
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="8" y="14" width="7" height="7" rx="1.5" />
          </svg>
          <p className="text-sm">
            Press{" "}
            <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-xs font-mono">
              Ctrl+Enter
            </kbd>{" "}
            to compile
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* Zoom controls */}
      <div className="absolute top-3 right-3 flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-sm z-10">
        <button
          onClick={zoomIn}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600"
        >
          +
        </button>
        <span className="text-[10px] text-slate-500 min-w-[36px] text-center">
          {Math.round(view.scale * 100)}%
        </span>
        <button
          onClick={zoomOut}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600"
        >
          −
        </button>
        <button
          onClick={zoomReset}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 text-xs"
        >
          ⟲
        </button>
        <button
          onClick={zoomToFit}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 text-[9px]"
          title="Zoom to fit"
        >
          ⊡
        </button>
      </div>

      {/* Minimap */}
      {(diagram.nodes.length > 3 ||
        (diagram.participants?.length ?? 0) > 2) && (
        <Minimap
          diagram={diagram}
          viewOffsetX={view.offsetX}
          viewOffsetY={view.offsetY}
          viewScale={view.scale}
          containerWidth={svgRef.current?.clientWidth || 800}
          containerHeight={svgRef.current?.clientHeight || 600}
          theme={canvasTheme}
        />
      )}

      {/* Align toolbar for multi-select */}
      {multiSelected.size >= 2 && onAlignNodes && onDistributeNodes && (
        <AlignToolbar
          nodeCount={multiSelected.size}
          onAlign={(a) => onAlignNodes([...multiSelected], a)}
          onDistribute={(d) => onDistributeNodes([...multiSelected], d)}
        />
      )}

      <svg
        ref={svgRef}
        className="w-full h-full canvas-svg-element"
        style={{
          backgroundColor: canvasTheme === "dark" ? "#1a1a2e" : "#fafafa",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <defs>
          <pattern
            id="grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${view.offsetX % 20},${view.offsetY % 20}) scale(${view.scale})`}
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke={canvasTheme === "dark" ? "#2a2a4a" : "#e2e8f0"}
              strokeWidth="0.5"
            />
          </pattern>
          <ArrowDefs />
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Marquee */}
        {marquee && Math.abs(marquee.endX - marquee.startX) > 2 && (
          <rect
            x={
              Math.min(marquee.startX, marquee.endX) * view.scale + view.offsetX
            }
            y={
              Math.min(marquee.startY, marquee.endY) * view.scale + view.offsetY
            }
            width={Math.abs(marquee.endX - marquee.startX) * view.scale}
            height={Math.abs(marquee.endY - marquee.startY) * view.scale}
            fill="rgba(99, 102, 241, 0.08)"
            stroke="#6366f1"
            strokeWidth="1"
            strokeDasharray="4,3"
            rx="2"
            pointerEvents="none"
          />
        )}

        <g
          transform={`translate(${view.offsetX},${view.offsetY}) scale(${view.scale})`}
          style={
            canvasTheme === "dark"
              ? { filter: "invert(0.78) hue-rotate(180deg) saturate(1.2)" }
              : undefined
          }
        >
          {diagram.type === "sequence" ? (
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
                const participant = diagram.participants?.find(
                  (p) => p.id === id,
                );
                if (!participant) return;
                onDragStart?.();
                onNodeSelect(id);
                // Use window-level drag for participant
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
          ) : (
            <>
              {/* Swimlane background for activity diagrams */}
              {diagram.type === "activity" && diagram.swimlanes?.length && (
                <ActivityRenderer diagram={diagram} />
              )}
              {/* Edges */}
              {(() => {
                // Calculate parallel edge offsets
                const pairCount = new Map<string, number>();
                const pairIndex = new Map<string, number>();
                for (const edge of diagram.edges) {
                  const key = [edge.source, edge.target].sort().join("_");
                  pairCount.set(key, (pairCount.get(key) || 0) + 1);
                }
                const pairCurrent = new Map<string, number>();
                for (const edge of diagram.edges) {
                  const key = [edge.source, edge.target].sort().join("_");
                  const count = pairCount.get(key) || 1;
                  const idx = pairCurrent.get(key) || 0;
                  pairCurrent.set(key, idx + 1);
                  // Offset: center around 0, spread by 24px perpendicular
                  pairIndex.set(
                    edge.id,
                    count > 1 ? (idx - (count - 1) / 2) * 24 : 0,
                  );
                }
                return diagram.edges.map((edge) => (
                  <EdgeRenderer
                    key={edge.id}
                    edge={edge}
                    nodes={diagram.nodes}
                    isSelected={
                      edge.id === selectedEdgeId ||
                      (selectedEdgeIds?.has(edge.id) ?? false)
                    }
                    edgeRouting={edgeRouting || "straight"}
                    labelOffset={pairIndex.get(edge.id) || 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (e.shiftKey && onEdgeShiftSelect) {
                        onEdgeShiftSelect(edge.id);
                      } else {
                        onEdgeSelect(edge.id);
                        onNodeSelect(null);
                      }
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
                        ? (end, anchor) =>
                            onEdgeEndpointDrag(edge.id, end, anchor)
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
                ));
              })()}

              {/* Inline edge label editor */}
              {editingEdgeId &&
                (() => {
                  const edge = diagram.edges.find(
                    (e) => e.id === editingEdgeId,
                  );
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

              {/* Nodes */}
              {diagram.nodes.map((node) => (
                <React.Fragment key={node.id}>
                  <g
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() =>
                      setHoveredNodeId((prev) =>
                        prev === node.id ? null : prev,
                      )
                    }
                  >
                    <NodeRenderer
                      node={node}
                      diagramType={diagram.type}
                      isSelected={
                        node.id === selectedNodeId || multiSelected.has(node.id)
                      }
                      hideText={editingNodeId === node.id}
                      onDragStart={(e) => startNodeDrag(node.id, e)}
                      onDoubleClick={() => setEditingNodeId(node.id)}
                    />
                    {/* Drop target highlights */}
                    {connecting &&
                      connecting.sourceId !== node.id &&
                      hoveredNodeId === node.id && (
                        <rect
                          x={node.position.x - 3}
                          y={node.position.y - 3}
                          width={getVisualSize(node).width + 6}
                          height={getVisualSize(node).height + 6}
                          rx={6}
                          fill="none"
                          stroke="#6366f1"
                          strokeWidth="2.5"
                          strokeDasharray="5,3"
                          opacity="0.7"
                          style={{ pointerEvents: "none" }}
                        />
                      )}
                    {reconnecting && hoveredNodeId === node.id && (
                      <rect
                        x={node.position.x - 3}
                        y={node.position.y - 3}
                        width={getVisualSize(node).width + 6}
                        height={getVisualSize(node).height + 6}
                        rx={6}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2.5"
                        strokeDasharray="5,3"
                        opacity="0.7"
                        style={{ pointerEvents: "none" }}
                      />
                    )}
                    <NodeAnchors
                      node={node}
                      visible={
                        node.id === selectedNodeId ||
                        node.id === hoveredNodeId ||
                        multiSelected.has(node.id)
                      }
                      onAnchorMouseDown={(anchor, side, e) =>
                        handleAnchorMouseDown(node.id, anchor, side, e)
                      }
                    />
                    <ResizeHandles
                      node={node}
                      visible={
                        node.id === selectedNodeId && multiSelected.size === 0
                      }
                      onResizeStart={(handle, e) =>
                        handleResizeStart(node.id, handle, e)
                      }
                    />
                  </g>
                  {/* Inline editor for node rename */}
                  {editingNodeId === node.id &&
                    (() => {
                      const vs = getVisualSize(node);
                      const editorW = Math.max(vs.width, 140);
                      const editorX =
                        node.position.x + vs.width / 2 - editorW / 2;
                      // Position Y: ClassNode has name in header, others in center
                      let editorY: number;
                      if ("attributes" in node) {
                        // ClassNode: name in header area (SVG text y is baseline, adjust up)
                        const hasStereotype = (node as any).type !== "class";
                        editorY = node.position.y + (hasStereotype ? 28 : 14);
                      } else {
                        // Other nodes: name in center
                        editorY = node.position.y + vs.height / 2;
                      }
                      return (
                        <InlineEditor
                          x={editorX}
                          y={editorY}
                          width={editorW}
                          initialValue={node.name}
                          onSubmit={(val) => {
                            onNodeRename(node.id, val);
                            setEditingNodeId(null);
                          }}
                          onCancel={() => setEditingNodeId(null)}
                        />
                      );
                    })()}
                </React.Fragment>
              ))}

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
          )}
        </g>
      </svg>
    </div>
  );
}
