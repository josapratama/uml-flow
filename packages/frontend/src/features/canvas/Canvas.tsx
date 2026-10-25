import React, { useCallback, useState, useEffect, useRef } from "react";
import type { Diagram, DiagramNode, Position, DiagramType } from "@uml-editor/shared";
import type { CanvasTheme } from "../../hooks/useTheme";
import { type ResizeHandle, calculateResize } from "./nodes/ResizeHandles";
import { ArrowDefs } from "./edges/ArrowDefs";
import { Minimap } from "./Minimap";
import { AlignToolbar } from "./AlignToolbar";
import { CanvasSearchBar } from "./CanvasSearchBar";
import { CanvasControls } from "./CanvasControls";
import { CanvasEmptyState } from "./CanvasEmptyState";
import { CanvasLayers } from "./CanvasLayers";
import { getVisualSize } from "./nodes/getVisualSize";
import { computeEdgeRoutingLayout } from "./utils/edgeRoutingLayout";
import { DIAGRAM_TYPES } from "../../data/starter-diagrams";
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
    height: number
  ) => void;
  onNodeSelect: (nodeId: string | null) => void;
  onEdgeSelect: (edgeId: string | null) => void;
  onEdgeShiftSelect?: (edgeId: string) => void;
  onEdgeWaypointMove: (
    edgeId: string,
    idx: number,
    x: number,
    y: number
  ) => void;
  onEdgeWaypointAdd: (edgeId: string, afterIdx: number, pt: Position) => void;
  onEdgeWaypointDelete?: (edgeId: string, waypointIndex: number) => void;
  onEdgeEndpointDrag?: (
    edgeId: string,
    end: "source" | "target",
    anchor: string
  ) => void;
  onEdgeReconnect?: (
    edgeId: string,
    end: "source" | "target",
    newNodeId: string,
    anchorSide?: string
  ) => void;
  onAddEdge: (
    sourceId: string,
    targetId: string,
    type: string,
    sourceAnchor?: string,
    targetAnchor?: string
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
    type: string
  ) => void;
  onEdgeLabelEdit?: (edgeId: string, label: string) => void;
  onAlignNodes?: (
    nodeIds: string[],
    alignment: "left" | "center" | "right" | "top" | "middle" | "bottom"
  ) => void;
  onDistributeNodes?: (
    nodeIds: string[],
    direction: "horizontal" | "vertical"
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
  onCreateNewDiagram?: (type: DiagramType) => void;
  onCopyPNG?: () => void;
  onContextMenu?: (
    e: React.MouseEvent,
    target: {
      type: "canvas" | "node" | "edge";
      id?: string;
      worldPos: Position;
      multiNodeIds?: string[];
    }
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
  onEdgeWaypointAdd: _onEdgeWaypointAdd,
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
  onCreateNewDiagram,
  onCopyPNG,
  onContextMenu,
}: CanvasProps) {
  // --- Watermark State ---
  const [showWatermark, setShowWatermark] = useState<boolean>(() => {
    try {
      return localStorage.getItem("uml_canvas_watermark") === "true";
    } catch {
      return false;
    }
  });

  const handleToggleWatermark = useCallback(() => {
    setShowWatermark((v) => {
      const next = !v;
      try {
        localStorage.setItem("uml_canvas_watermark", String(next));
      } catch {}
      return next;
    });
  }, []);

  // --- State ---
  const state = useCanvasState();
  const {
    svgRef,
    view,
    setView,
    drag: _drag,
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
    [svgRef, view]
  );

  // --- Handlers ---
  const { handleMouseDown, handleMouseMove, handleMouseUp, handleWheel } =
    useCanvasHandlers({
      svgRef,
      view,
      setView,
      drag: _drag,
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
      snapEnabled,
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
    diagram
  );

  // --- Search state & Ctrl+F shortcut ---
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
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
  const prevDiagramKey = useRef<string>("");
  useEffect(() => {
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
      if (multiSelected.size > 0 && !multiSelected.has(nodeId)) {
        setMultiSelected(new Set());
      }
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
    [diagram, onNodeSelect, onEdgeSelect, multiSelected, onDragStart, setDrag, setMultiSelected]
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
    [setConnecting]
  );

  // --- Resize ---
  const resizeRef = useRef<{
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
      const onMove = (ev: MouseEvent) => {
        if (!resizeRef.current || !onNodeResize) return;
        const dx = (ev.clientX - resizeRef.current.startX) / view.scale;
        const dy = (ev.clientY - resizeRef.current.startY) / view.scale;
        const result = calculateResize(
          resizeRef.current.handle,
          resizeRef.current.origPos,
          resizeRef.current.origSize,
          dx,
          dy
        );
        onNodeResize(
          resizeRef.current.nodeId,
          result.position.x,
          result.position.y,
          result.size.width,
          result.size.height
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
    [diagram, view.scale, onNodeResize, onDragStart, onDragEnd]
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
    [onDragStart, setDrag]
  );

  // --- Empty state ---
  if (!diagram) {
    return (
      <CanvasEmptyState
        canvasTheme={canvasTheme}
        onCreateNewDiagram={onCreateNewDiagram}
      />
    );
  }

  const isOrthogonal = (edgeRouting || "straight") === "orthogonal";
  const edgeLayout = computeEdgeRoutingLayout(
    diagram.edges,
    diagram.nodes,
    isOrthogonal
  );


  return (
    <div className="w-full h-full relative">
      {/* Zoom, Copy, Search & Watermark controls */}
      <CanvasControls
        canvasTheme={canvasTheme}
        scale={view.scale}
        showSearch={showSearch}
        onToggleSearch={() => setShowSearch((v) => !v)}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onZoomReset={zoomReset}
        onZoomToFit={zoomToFit}
        edgeRouting={edgeRouting}
        onEdgeRoutingToggle={onEdgeRoutingToggle}
        onCopyPNG={onCopyPNG}
        showWatermark={showWatermark}
        onToggleWatermark={handleToggleWatermark}
      />

      {/* Canvas Info / Watermark Badge */}
      {showWatermark && (
        <div
          className={`absolute bottom-3 left-3 flex items-center gap-2 rounded-xl px-3 py-1.5 shadow-lg backdrop-blur-md z-10 border transition-all ${
            canvasTheme === "dark"
              ? "bg-surface-2/90 border-border/80 text-text"
              : "bg-white/90 border-slate-200 text-slate-800"
          }`}
        >
          <span className="text-base">
            {DIAGRAM_TYPES.find((d) => d.id === diagram.type)?.icon || "📐"}
          </span>
          <div className="flex flex-col min-w-0">
            <div className="text-xs font-bold truncate max-w-[200px]">
              {diagram.name || "Diagram"}
            </div>
            <div className="text-[10px] text-text-muted flex items-center gap-1">
              <span>{DIAGRAM_TYPES.find((d) => d.id === diagram.type)?.label || diagram.type}</span>
              <span>·</span>
              <span className="font-semibold text-accent">UML Flow</span>
            </div>
          </div>
        </div>
      )}

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
            id="canvas-grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke={
                canvasTheme === "dark"
                  ? snapEnabled
                    ? "#282846"
                    : "#1c1c2e"
                  : snapEnabled
                    ? "#cbd5e1"
                    : "#e9edf3"
              }
              strokeWidth={snapEnabled ? "0.6" : "0.35"}
            />
            {snapEnabled && (
              <circle
                cx="0"
                cy="0"
                r="1"
                fill={canvasTheme === "dark" ? "#6366f1" : "#94a3b8"}
                opacity="0.6"
              />
            )}
          </pattern>
          <ArrowDefs theme={canvasTheme} />
        </defs>

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
          {/* World Grid Layer - Aligned 100% pixel-perfect to world coordinates */}
          <rect
            x={-100000}
            y={-100000}
            width={200000}
            height={200000}
            fill="url(#canvas-grid)"
            pointerEvents="none"
          />

          {/* Magnetic Snap Guidelines during Node Drag */}
          {snapEnabled && _drag && _drag.type === "node" && (() => {
            const draggedNode = diagram?.nodes.find((n) => n.id === _drag.id);
            if (!draggedNode) return null;
            const vs = getVisualSize(draggedNode);
            const nx = draggedNode.position.x;
            const ny = draggedNode.position.y;
            return (
              <g className="pointer-events-none" opacity="0.85">
                {/* Horizontal Guide across snapped Y */}
                <line
                  x1={nx - 2000}
                  y1={ny}
                  x2={nx + vs.width + 2000}
                  y2={ny}
                  stroke="#6366f1"
                  strokeWidth={1 / view.scale}
                  strokeDasharray={`${4 / view.scale},${3 / view.scale}`}
                />
                {/* Vertical Guide across snapped X */}
                <line
                  x1={nx}
                  y1={ny - 2000}
                  x2={nx}
                  y2={ny + vs.height + 2000}
                  stroke="#6366f1"
                  strokeWidth={1 / view.scale}
                  strokeDasharray={`${4 / view.scale},${3 / view.scale}`}
                />
                {/* Snapped Coordinate Badge */}
                <g transform={`translate(${nx}, ${ny - 18 / view.scale}) scale(${1 / view.scale})`}>
                  <rect
                    x={0}
                    y={-12}
                    width={112}
                    height={16}
                    rx={4}
                    fill={canvasTheme === "dark" ? "#1e1e38" : "#ffffff"}
                    stroke="#6366f1"
                    strokeWidth={1}
                  />
                  <text
                    x={6}
                    y={-1}
                    fill={canvasTheme === "dark" ? "#a5b4fc" : "#4338ca"}
                    fontSize={9}
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    X:{nx} Y:{ny} ⊞ 20
                  </text>
                </g>
              </g>
            );
          })()}
          <CanvasLayers
            diagram={diagram}
            canvasTheme={canvasTheme}
            view={view}
            selectedNodeId={selectedNodeId}
            selectedEdgeId={selectedEdgeId}
            selectedEdgeIds={selectedEdgeIds}
            multiSelected={multiSelected}
            hoveredNodeId={hoveredNodeId}
            setHoveredNodeId={setHoveredNodeId}
            connecting={connecting}
            reconnecting={reconnecting}
            setReconnecting={setReconnecting}
            editingNodeId={editingNodeId}
            setEditingNodeId={setEditingNodeId}
            editingEdgeId={editingEdgeId}
            setEditingEdgeId={setEditingEdgeId}
            edgeRouting={edgeRouting}
            edgeLayout={edgeLayout}
            startNodeDrag={startNodeDrag}
            handleAnchorMouseDown={handleAnchorMouseDown}
            handleResizeStart={handleResizeStart}
            startWpDrag={startWpDrag}
            screenToWorld={screenToWorld}
            onNodeSelect={onNodeSelect}
            onEdgeSelect={onEdgeSelect}
            onEdgeShiftSelect={onEdgeShiftSelect}
            onEdgeWaypointDelete={onEdgeWaypointDelete}
            onEdgeEndpointDrag={onEdgeEndpointDrag}
            onEdgeLabelEdit={onEdgeLabelEdit}
            onNodeRename={onNodeRename}
            onParticipantMove={onParticipantMove}
            onParticipantRename={onParticipantRename}
            onMessageEdit={onMessageEdit}
            onMessageDelete={onMessageDelete}
            onMessageReorder={onMessageReorder}
            onAddMessage={onAddMessage}
            onQuickAddNode={onQuickAddNode}
            onContextMenu={onContextMenu}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            setMultiSelected={setMultiSelected}
          />
        </g>
      </svg>
    </div>
  );
}
