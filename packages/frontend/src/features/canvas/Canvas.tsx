import React, { useCallback } from "react";
import type { Diagram, DiagramNode, Position, Edge } from "@uml-editor/shared";
import type { CanvasTheme } from "../../hooks/useTheme";
import { NodeRenderer } from "./nodes/NodeRenderer";
import { NodeAnchors } from "./nodes/NodeAnchors";
import {
  ResizeHandles,
  calculateResize,
  type ResizeHandle,
} from "./nodes/ResizeHandles";
import { getVisualSize } from "./nodes/getVisualSize";
import { getBestTargetAnchor } from "./utils/anchor-utils";
import { EdgeRenderer } from "./edges/EdgeRenderer";
import { ArrowDefs } from "./edges/ArrowDefs";
import { SequenceRenderer } from "./diagrams/SequenceRenderer";
import { ActivityRenderer } from "./diagrams/ActivityRenderer";
import { Minimap } from "./Minimap";
import { InlineEditor } from "./InlineEditor";
import { ConnectionLine } from "./ConnectionLine";
import { AlignToolbar } from "./AlignToolbar";
import { ValidationOverlay } from "./ValidationOverlay";
import { CanvasSearchBar } from "./CanvasSearchBar";
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
  onEdgeRoutingToggle?: () => void;
  activeEdgeTool?: string | null;
  onQuickAddNode?: (sourceNodeId: string) => void;
  onContextMenu?: (
    e: React.MouseEvent,
    target: {
      type: "canvas" | "node" | "edge";
      id?: string;
      worldPos: Position;
      multiNodeIds?: string[];
    },
  ) => void;
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
  onEdgeRoutingToggle,
  activeEdgeTool,
  onQuickAddNode,
  onContextMenu,
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

  const screenToWorld = useCallback(
    (clientX: number, clientY: number): Position => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return {
        x: Math.round((clientX - rect.left - view.offsetX) / view.scale),
        y: Math.round((clientY - rect.top - view.offsetY) / view.scale),
      };
    },
    [svgRef, view],
  );

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
  const { zoomIn, zoomOut, zoomReset, zoomToFit, zoomToSelection } = useCanvasZoom(
    svgRef,
    view,
    setView,
    diagram,
  );

  // --- Search state & Ctrl+F shortcut ---
  const [showSearch, setShowSearch] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setShowSearch((v) => !v);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto-fit diagram to canvas viewport when a diagram is loaded or changes
  const prevDiagramKey = React.useRef<string>("");
  React.useEffect(() => {
    if (!diagram) return;
    const key = `${diagram.name}_${diagram.type}_${diagram.nodes.length}_${diagram.participants?.length || 0}`;
    if (prevDiagramKey.current !== key) {
      prevDiagramKey.current = key;
      const t = setTimeout(() => {
        zoomToFit();
      }, 80);
      return () => clearTimeout(t);
    }
  }, [diagram, zoomToFit]);

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
    const isDark = canvasTheme === "dark";
    return (
      <div
        className={`w-full h-full flex items-center justify-center transition-colors duration-200 ${
          isDark ? "bg-[#161625] text-slate-500" : "bg-slate-50/70 text-slate-400"
        }`}
      >
        <div className="text-center max-w-sm px-6">
          <div
            className={`w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center border shadow-sm ${
              isDark
                ? "bg-[#1f1f33] border-slate-700/60 text-indigo-400/90"
                : "bg-white border-slate-200 text-indigo-600/90"
            }`}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="8" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </div>
          <h3
            className={`text-sm font-semibold mb-1 ${
              isDark ? "text-slate-200" : "text-slate-700"
            }`}
          >
            No Diagram Loaded
          </h3>
          <p className="text-xs mb-3 opacity-80 leading-relaxed">
            Write your DSL code in the editor panel or press{" "}
            <kbd
              className={`px-1.5 py-0.5 rounded text-[11px] font-mono border shadow-sm ${
                isDark
                  ? "bg-[#25253e] border-slate-700 text-slate-200"
                  : "bg-white border-slate-300 text-slate-800"
              }`}
            >
              Ctrl+Enter
            </kbd>{" "}
            to compile.
          </p>
        </div>
      </div>
    );
  }

  const renderNode = (node: DiagramNode) => (
    <React.Fragment key={node.id}>
      <g
        onMouseEnter={() => setHoveredNodeId(node.id)}
        onMouseLeave={() =>
          setHoveredNodeId((prev) => (prev === node.id ? null : prev))
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
        {/* Quick-Add Node Connector button */}
        {node.id === selectedNodeId &&
          multiSelected.size === 0 &&
          onQuickAddNode &&
          (() => {
            const vs = getVisualSize(node);
            return (
              <g
                className="cursor-pointer group"
                transform={`translate(${node.position.x + vs.width + 16}, ${node.position.y + vs.height / 2})`}
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickAddNode(node.id);
                }}
              >
                <line
                  x1={-16}
                  y1={0}
                  x2={-4}
                  y2={0}
                  stroke="#6366f1"
                  strokeWidth="1.5"
                  strokeDasharray="2,2"
                />
                <circle
                  r={10}
                  fill="#6366f1"
                  className="hover:fill-indigo-500 transition-colors shadow-sm"
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#ffffff"
                  fontSize="13"
                  fontWeight="bold"
                  className="select-none pointer-events-none"
                >
                  +
                </text>
              </g>
            );
          })()}
      </g>
      {/* Inline editor for node rename */}
      {editingNodeId === node.id &&
        (() => {
          const vs = getVisualSize(node);
          const editorW = Math.max(vs.width, 140);
          const editorX = node.position.x + vs.width / 2 - editorW / 2;
          let editorY: number;
          if ("attributes" in node) {
            const hasStereotype = (node as any).type !== "class";
            editorY = node.position.y + (hasStereotype ? 28 : 14);
          } else {
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
  );

  return (
    <div className="w-full h-full relative">
      {/* Zoom & Search controls */}
      <div className={`absolute top-3 right-3 flex items-center gap-1 rounded-xl px-2 py-1 shadow-lg backdrop-blur-md z-10 border transition-all ${
        canvasTheme === "dark"
          ? "bg-surface-2/90 border-border/80 text-text"
          : "bg-white/90 border-slate-200 text-slate-700"
      }`}>
        <button
          onClick={() => setShowSearch((v) => !v)}
          className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs transition-colors ${
            showSearch
              ? "bg-accent text-white shadow-xs"
              : canvasTheme === "dark"
              ? "hover:bg-surface-3 text-text"
              : "hover:bg-slate-100 text-slate-700"
          }`}
          title="Cari Node (Ctrl+F)"
        >
          🔍
        </button>
        <div className="w-px h-4 bg-border/60 mx-0.5" />
        <button
          onClick={zoomIn}
          className={`w-7 h-7 flex items-center justify-center rounded-lg font-medium transition-colors ${
            canvasTheme === "dark" ? "hover:bg-surface-3 text-text" : "hover:bg-slate-100 text-slate-700"
          }`}
          title="Zoom in (+)"
        >
          +
        </button>
        <span className="text-[11px] font-mono min-w-[36px] text-center opacity-80">
          {Math.round(view.scale * 100)}%
        </span>
        <button
          onClick={zoomOut}
          className={`w-7 h-7 flex items-center justify-center rounded-lg font-medium transition-colors ${
            canvasTheme === "dark" ? "hover:bg-surface-3 text-text" : "hover:bg-slate-100 text-slate-700"
          }`}
          title="Zoom out (-)"
        >
          −
        </button>
        <button
          onClick={zoomReset}
          className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs transition-colors ${
            canvasTheme === "dark" ? "hover:bg-surface-3 text-text" : "hover:bg-slate-100 text-slate-700"
          }`}
          title="Reset zoom (100%)"
        >
          ⟲
        </button>
        <button
          onClick={zoomToFit}
          className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs transition-colors ${
            canvasTheme === "dark" ? "hover:bg-surface-3 text-text" : "hover:bg-slate-100 text-slate-700"
          }`}
          title="Zoom to fit diagram"
        >
          ⊡
        </button>
        {onEdgeRoutingToggle && (
          <>
            <div className="w-px h-4 bg-border/60 mx-0.5" />
            <button
              onClick={onEdgeRoutingToggle}
              className={`h-7 px-2 flex items-center justify-center gap-1 rounded-lg text-xs font-medium transition-all ${
                edgeRouting === "orthogonal"
                  ? "bg-accent text-white shadow-xs font-semibold"
                  : canvasTheme === "dark"
                    ? "hover:bg-surface-3 text-text opacity-70 hover:opacity-100"
                    : "hover:bg-slate-100 text-slate-700 opacity-70 hover:opacity-100"
              }`}
              title={
                edgeRouting === "orthogonal"
                  ? "Mode Garis Siku (Orthogonal) Aktif - Klik untuk ubah ke Garis Lurus"
                  : "Mode Garis Lurus (Straight) Aktif - Klik untuk ubah ke Garis Siku"
              }
            >
              <span>{edgeRouting === "orthogonal" ? "⌐" : "↗"}</span>
              <span className="text-[10px]">
                {edgeRouting === "orthogonal" ? "Siku" : "Lurus"}
              </span>
            </button>
          </>
        )}
      </div>

      {/* Floating Canvas Search Bar */}
      <CanvasSearchBar
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        diagram={diagram}
        onSelectNode={onNodeSelect}
        onFocusNode={(id) => zoomToSelection([id])}
      />

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
          backgroundColor: canvasTheme === "dark" ? "#12121f" : "#f8fafc",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={(e) => {
          e.preventDefault();
          const pt = screenToWorld(e.clientX, e.clientY);
          onContextMenu?.(e, {
            type: "canvas",
            worldPos: pt,
          });
        }}
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
              stroke={canvasTheme === "dark" ? "#222238" : "#e2e8f0"}
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
              {/* Layer 1: Containers (Composite nodes, System boundaries) */}
              {(() => {
                const isContainerNode = (n: DiagramNode) =>
                  n.type === "composite" ||
                  n.type === "system" ||
                  (n.type as string) === "boundary";
                const containerNodes = diagram.nodes.filter(isContainerNode);
                return containerNodes.map(renderNode);
              })()}

              {/* Layer 2: Edges */}
              {(() => {
                const nodeMap = new Map<string, DiagramNode>(
                  diagram.nodes.map((n) => [n.id, n]),
                );
                const isOrthogonal =
                  (edgeRouting || "straight") === "orthogonal";

                // 1. Calculate distributed anchor ports for each face of each node
                interface FaceConn {
                  edgeId: string;
                  isSource: boolean;
                  otherCoord: number;
                }
                const faceMap = new Map<string, FaceConn[]>();

                for (const edge of diagram.edges) {
                  const sNode = nodeMap.get(edge.source);
                  const tNode = nodeMap.get(edge.target);
                  if (!sNode || !tNode) continue;

                  const sSize = getVisualSize(sNode);
                  const tSize = getVisualSize(tNode);
                  const sCenter = {
                    x: sNode.position.x + sSize.width / 2,
                    y: sNode.position.y + sSize.height / 2,
                  };
                  const tCenter = {
                    x: tNode.position.x + tSize.width / 2,
                    y: tNode.position.y + tSize.height / 2,
                  };

                  const sAnchor =
                    edge.sourceAnchor ||
                    (isOrthogonal
                      ? getBestTargetAnchor(sNode, tNode, diagram.nodes)
                      : undefined);
                  const tAnchor =
                    edge.targetAnchor ||
                    (isOrthogonal
                      ? getBestTargetAnchor(tNode, sNode, diagram.nodes)
                      : undefined);

                  if (sAnchor) {
                    const key = `${edge.source}:${sAnchor}`;
                    const list = faceMap.get(key) || [];
                    const coord =
                      sAnchor === "top" || sAnchor === "bottom"
                        ? tCenter.x
                        : tCenter.y;
                    list.push({
                      edgeId: edge.id,
                      isSource: true,
                      otherCoord: coord,
                    });
                    faceMap.set(key, list);
                  }

                  if (tAnchor) {
                    const key = `${edge.target}:${tAnchor}`;
                    const list = faceMap.get(key) || [];
                    const coord =
                      tAnchor === "top" || tAnchor === "bottom"
                        ? sCenter.x
                        : sCenter.y;
                    list.push({
                      edgeId: edge.id,
                      isSource: false,
                      otherCoord: coord,
                    });
                    faceMap.set(key, list);
                  }
                }

                const portFractionMap = new Map<string, number>();
                for (const [, conns] of faceMap) {
                  conns.sort((a, b) => a.otherCoord - b.otherCoord);
                  const n = conns.length;
                  for (let i = 0; i < n; i++) {
                    const c = conns[i];
                    let frac = 0.5;
                    if (n === 2) {
                      frac = i === 0 ? 0.35 : 0.65;
                    } else if (n === 3) {
                      frac = i === 0 ? 0.25 : i === 1 ? 0.5 : 0.75;
                    } else if (n > 3) {
                      frac = 0.15 + (0.7 * i) / (n - 1);
                    }
                    const role = c.isSource ? "source" : "target";
                    portFractionMap.set(`${c.edgeId}:${role}`, frac);
                  }
                }

                // 2. Calculate two-way lane offsets and anti-clash label placement
                const pairMap = new Map<string, Edge[]>();
                for (const edge of diagram.edges) {
                  const key = [edge.source, edge.target].sort().join("<->");
                  const list = pairMap.get(key) || [];
                  list.push(edge);
                  pairMap.set(key, list);
                }

                const edgeConfigs = new Map<
                  string,
                  {
                    laneOffset: number;
                    labelRatio: number;
                    labelShift: number;
                  }
                >();

                for (const [, pairEdges] of pairMap) {
                  if (pairEdges.length === 1) {
                    edgeConfigs.set(pairEdges[0].id, {
                      laneOffset: 0,
                      labelRatio: 0.5,
                      labelShift: -10,
                    });
                  } else if (
                    pairEdges.length === 2 &&
                    pairEdges[0].source === pairEdges[1].target
                  ) {
                    // Two-way street between opposite nodes:
                    // Both take their forward right lane (+10px) and place label near source (38%)
                    for (const e of pairEdges) {
                      edgeConfigs.set(e.id, {
                        laneOffset: 10,
                        labelRatio: 0.38,
                        labelShift: 12,
                      });
                    }
                  } else {
                    const n = pairEdges.length;
                    for (let i = 0; i < n; i++) {
                      const norm = i - (n - 1) / 2;
                      edgeConfigs.set(pairEdges[i].id, {
                        laneOffset: norm * 14,
                        labelRatio: 0.28 + (0.44 * i) / Math.max(1, n - 1),
                        labelShift: norm >= 0 ? 12 : -12,
                      });
                    }
                  }
                }

                // 3. Calculate corridor channel offsets for orthogonal routing to prevent shared spines
                const channelOffsetMap = new Map<string, number>();

                if (isOrthogonal) {
                  interface CorridorConn {
                    edgeId: string;
                    partnerCoord: number;
                    dir: number;
                  }
                  const hCorridors = new Map<string, CorridorConn[]>();
                  const vCorridors = new Map<string, CorridorConn[]>();

                  for (const edge of diagram.edges) {
                    const sNode = nodeMap.get(edge.source);
                    const tNode = nodeMap.get(edge.target);
                    if (!sNode || !tNode || sNode.id === tNode.id) continue;

                    const sSize = getVisualSize(sNode);
                    const tSize = getVisualSize(tNode);
                    const sCenter = {
                      x: sNode.position.x + sSize.width / 2,
                      y: sNode.position.y + sSize.height / 2,
                    };
                    const tCenter = {
                      x: tNode.position.x + tSize.width / 2,
                      y: tNode.position.y + tSize.height / 2,
                    };

                    const sAnchor =
                      edge.sourceAnchor ||
                      getBestTargetAnchor(sNode, tNode, diagram.nodes);
                    const tAnchor =
                      edge.targetAnchor ||
                      getBestTargetAnchor(tNode, sNode, diagram.nodes);

                    const sIsHoriz = sAnchor === "left" || sAnchor === "right";
                    const tIsHoriz = tAnchor === "left" || tAnchor === "right";

                    if (sIsHoriz && tIsHoriz) {
                      const leftBound = Math.min(
                        sNode.position.x + sSize.width,
                        tNode.position.x + tSize.width,
                      );
                      const rightBound = Math.max(
                        sNode.position.x,
                        tNode.position.x,
                      );
                      const gap = rightBound - leftBound;
                      if (gap > 20) {
                        const key = `${Math.round(leftBound / 50) * 50}-${Math.round(rightBound / 50) * 50}`;
                        const list = hCorridors.get(key) || [];
                        const partnerCoord =
                          sNode.position.x > tNode.position.x
                            ? sCenter.y
                            : tCenter.y;
                        const dir =
                          sNode.position.x < tNode.position.x ? 1 : -1;
                        list.push({ edgeId: edge.id, partnerCoord, dir });
                        hCorridors.set(key, list);
                      }
                    } else if (!sIsHoriz && !tIsHoriz) {
                      const topBound = Math.min(
                        sNode.position.y + sSize.height,
                        tNode.position.y + tSize.height,
                      );
                      const bottomBound = Math.max(
                        sNode.position.y,
                        tNode.position.y,
                      );
                      const gap = bottomBound - topBound;
                      if (gap > 20) {
                        const key = `${Math.round(topBound / 50) * 50}-${Math.round(bottomBound / 50) * 50}`;
                        const list = vCorridors.get(key) || [];
                        const partnerCoord =
                          sNode.position.y > tNode.position.y
                            ? sCenter.x
                            : tCenter.x;
                        const dir =
                          sNode.position.y < tNode.position.y ? 1 : -1;
                        list.push({ edgeId: edge.id, partnerCoord, dir });
                        vCorridors.set(key, list);
                      }
                    }
                  }

                  // Allocate channel tracks across horizontal corridors
                  for (const [, conns] of hCorridors) {
                    if (conns.length <= 1) continue;
                    conns.sort((a, b) => {
                      if (Math.abs(a.partnerCoord - b.partnerCoord) > 2) {
                        return a.partnerCoord - b.partnerCoord;
                      }
                      if (a.dir !== b.dir) return a.dir - b.dir;
                      return a.edgeId.localeCompare(b.edgeId);
                    });
                    const n = conns.length;
                    const spacing = Math.min(26, Math.max(16, 120 / (n + 1)));
                    const totalSpan = (n - 1) * spacing;
                    const start = -totalSpan / 2;
                    for (let i = 0; i < n; i++) {
                      channelOffsetMap.set(
                        conns[i].edgeId,
                        Math.round(start + i * spacing),
                      );
                    }
                  }

                  // Allocate channel tracks across vertical corridors
                  for (const [, conns] of vCorridors) {
                    if (conns.length <= 1) continue;
                    conns.sort((a, b) => {
                      if (Math.abs(a.partnerCoord - b.partnerCoord) > 2) {
                        return a.partnerCoord - b.partnerCoord;
                      }
                      if (a.dir !== b.dir) return a.dir - b.dir;
                      return a.edgeId.localeCompare(b.edgeId);
                    });
                    const n = conns.length;
                    const spacing = Math.min(24, Math.max(14, 100 / (n + 1)));
                    const totalSpan = (n - 1) * spacing;
                    const start = -totalSpan / 2;
                    for (let i = 0; i < n; i++) {
                      channelOffsetMap.set(
                        conns[i].edgeId,
                        Math.round(start + i * spacing),
                      );
                    }
                  }
                }

                return diagram.edges.map((edge) => {
                  const cfg = edgeConfigs.get(edge.id) || {
                    laneOffset: 0,
                    labelRatio: 0.5,
                    labelShift: -10,
                  };
                  const sFrac =
                    portFractionMap.get(`${edge.id}:source`) ?? 0.5;
                  const tFrac =
                    portFractionMap.get(`${edge.id}:target`) ?? 0.5;
                  const chOffset = channelOffsetMap.get(edge.id) ?? 0;

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
                  );
                });
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

              {/* Layer 3: Leaf / Regular nodes */}
              {(() => {
                const isContainerNode = (n: DiagramNode) =>
                  n.type === "composite" ||
                  n.type === "system" ||
                  (n.type as string) === "boundary";
                const leafNodes = diagram.nodes.filter(
                  (n) => !isContainerNode(n),
                );
                return leafNodes.map(renderNode);
              })()}

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
