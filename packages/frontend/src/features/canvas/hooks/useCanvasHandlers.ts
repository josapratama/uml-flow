import React, { useCallback } from "react";
import type { Diagram, DiagramNode, Position } from "@uml-editor/shared";
import { snapToGrid } from "../../../hooks/useSnapToGrid";
import { getVisualSize } from "../nodes/getVisualSize";
import {
  getBestTargetAnchor,
  getAnchorSideFromDirection,
  isPointInsideNode,
} from "../utils/anchor-utils";
import type {
  ViewState,
  DragState,
  ConnectingState,
  ReconnectingState,
  MarqueeState,
} from "./useCanvasState";

interface HandlerDeps {
  svgRef: React.RefObject<SVGSVGElement | null>;
  view: ViewState;
  setView: React.Dispatch<React.SetStateAction<ViewState>>;
  drag: DragState | null;
  setDrag: React.Dispatch<React.SetStateAction<DragState | null>>;
  pan: { sx: number; sy: number; vx: number; vy: number } | null;
  setPan: React.Dispatch<
    React.SetStateAction<{
      sx: number;
      sy: number;
      vx: number;
      vy: number;
    } | null>
  >;
  connecting: ConnectingState | null;
  setConnecting: React.Dispatch<React.SetStateAction<ConnectingState | null>>;
  reconnecting: ReconnectingState | null;
  setReconnecting: React.Dispatch<
    React.SetStateAction<ReconnectingState | null>
  >;
  marquee: MarqueeState | null;
  setMarquee: React.Dispatch<React.SetStateAction<MarqueeState | null>>;
  multiSelected: Set<string>;
  setMultiSelected: React.Dispatch<React.SetStateAction<Set<string>>>;
  prevDx: React.MutableRefObject<number>;
  prevDy: React.MutableRefObject<number>;
  setEditingNodeId: React.Dispatch<React.SetStateAction<string | null>>;
  diagram: Diagram | null;
  snapEnabled?: boolean;
  onNodeMove: (nodeId: string, x: number, y: number) => void;
  onNodeSelect: (nodeId: string | null) => void;
  onEdgeSelect: (edgeId: string | null) => void;
  onEdgeWaypointMove: (
    edgeId: string,
    idx: number,
    x: number,
    y: number,
  ) => void;
  onMultiNodeMove?: (nodeIds: string[], dx: number, dy: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onAddEdge: (
    sourceId: string,
    targetId: string,
    type: string,
    sourceAnchor?: string,
    targetAnchor?: string,
  ) => void;
  onEdgeReconnect?: (
    edgeId: string,
    end: "source" | "target",
    newNodeId: string,
    anchorSide?: string,
  ) => void;
  activeEdgeTool?: string | null;
}

export function useCanvasHandlers(deps: HandlerDeps) {
  const {
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
    snapEnabled = true,
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
  } = deps;

  const screenToWorld = useCallback(
    (clientX: number, clientY: number): Position | null => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return null;
      return {
        x: (clientX - rect.left - view.offsetX) / view.scale,
        y: (clientY - rect.top - view.offsetY) / view.scale,
      };
    },
    [svgRef, view],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
        e.preventDefault();
        setPan({
          sx: e.clientX,
          sy: e.clientY,
          vx: view.offsetX,
          vy: view.offsetY,
        });
      } else if (e.button === 0 && !e.shiftKey) {
        const pt = screenToWorld(e.clientX, e.clientY);
        if (pt)
          setMarquee({ startX: pt.x, startY: pt.y, endX: pt.x, endY: pt.y });
      }
    },
    [view, screenToWorld, setPan, setMarquee],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (pan) {
        setView({
          ...view,
          offsetX: pan.vx + e.clientX - pan.sx,
          offsetY: pan.vy + e.clientY - pan.sy,
        });
      } else if (connecting) {
        const pt = screenToWorld(e.clientX, e.clientY);
        if (pt) setConnecting({ ...connecting, to: pt });
      } else if (reconnecting) {
        const pt = screenToWorld(e.clientX, e.clientY);
        if (pt) setReconnecting({ ...reconnecting, to: pt });
      } else if (marquee) {
        const pt = screenToWorld(e.clientX, e.clientY);
        if (pt) setMarquee({ ...marquee, endX: pt.x, endY: pt.y });
      } else if (drag) {
        const dx = (e.clientX - drag.sx) / view.scale;
        const dy = (e.clientY - drag.sy) / view.scale;
        if (drag.type === "node") {
          if (
            multiSelected.size > 1 &&
            multiSelected.has(drag.id) &&
            onMultiNodeMove
          ) {
            if (snapEnabled) {
              const targetX = snapToGrid(drag.px + dx);
              const targetY = snapToGrid(drag.py + dy);
              const effectiveDx = targetX - drag.px;
              const effectiveDy = targetY - drag.py;
              const incDx = effectiveDx - prevDx.current;
              const incDy = effectiveDy - prevDy.current;
              if (incDx !== 0 || incDy !== 0) {
                prevDx.current = effectiveDx;
                prevDy.current = effectiveDy;
                onMultiNodeMove([...multiSelected], incDx, incDy);
              }
            } else {
              const incDx = dx - prevDx.current;
              const incDy = dy - prevDy.current;
              prevDx.current = dx;
              prevDy.current = dy;
              onMultiNodeMove([...multiSelected], incDx, incDy);
            }
          } else {
            const targetX = snapEnabled ? snapToGrid(drag.px + dx) : drag.px + dx;
            const targetY = snapEnabled ? snapToGrid(drag.py + dy) : drag.py + dy;
            onNodeMove(drag.id, targetX, targetY);
          }
        } else if (drag.wpIdx !== undefined) {
          const targetX = snapEnabled ? snapToGrid(drag.px + dx) : drag.px + dx;
          const targetY = snapEnabled ? snapToGrid(drag.py + dy) : drag.py + dy;
          onEdgeWaypointMove(drag.id, drag.wpIdx, targetX, targetY);
        }
      }
    },
    [
      pan,
      drag,
      marquee,
      connecting,
      reconnecting,
      view,
      snapEnabled,
      screenToWorld,
      onNodeMove,
      onEdgeWaypointMove,
      multiSelected,
      onMultiNodeMove,
      setView,
      setConnecting,
      setReconnecting,
      setMarquee,
      prevDx,
      prevDy,
    ],
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      // Finalize connection
      if (connecting && diagram) {
        const pt = screenToWorld(e.clientX, e.clientY);
        if (pt) {
          const targetNode = diagram.nodes.find(
            (n) => isPointInsideNode(n, pt.x, pt.y),
          );
          if (targetNode) {
            // Edge type: palette tool > modifier keys > diagram default
            let edgeType: string;
            if (activeEdgeTool) {
              edgeType = activeEdgeTool;
            } else {
              const mods = connecting.modifiers;
              if (diagram.type === "class") {
                if (mods?.shift && mods?.ctrl) edgeType = "realization";
                else if (mods?.shift) edgeType = "inheritance";
                else if (mods?.alt) edgeType = "composition";
                else edgeType = "association";
              } else if (
                diagram.type === "activity" ||
                diagram.type === "flowchart"
              ) {
                edgeType = "flow";
              } else if (diagram.type === "state") {
                edgeType = "transition";
              } else {
                edgeType = "association";
              }
            }
            const sourceNodeObj = diagram.nodes.find(
              (n) => n.id === connecting.sourceId,
            );
            const isSelf = connecting.sourceId === targetNode.id;
            const targetAnchor = isSelf
              ? (connecting.sourceAnchorSide === "top" ? "right" : "top")
              : (sourceNodeObj ? getBestTargetAnchor(targetNode, sourceNodeObj) : "top");
            onAddEdge(
              connecting.sourceId,
              targetNode.id,
              edgeType,
              connecting.sourceAnchorSide,
              targetAnchor,
            );
          }
        }
        setConnecting(null);
      }

      // Finalize reconnection
      if (reconnecting && diagram && onEdgeReconnect) {
        const pt = screenToWorld(e.clientX, e.clientY);
        if (pt) {
          const edge = diagram.edges.find(
            (ed) => ed.id === reconnecting.edgeId,
          );
          const excludeNodeId = edge
            ? reconnecting.end === "source"
              ? edge.target
              : edge.source
            : undefined;
          const targetNode = diagram.nodes.find(
            (n) => n.id !== excludeNodeId && isPointInsideNode(n, pt.x, pt.y),
          );
          if (targetNode) {
            const otherNodeId = edge
              ? reconnecting.end === "source"
                ? edge.target
                : edge.source
              : undefined;
            const otherNode = otherNodeId
              ? diagram.nodes.find((n) => n.id === otherNodeId)
              : undefined;
            const anchorSide = otherNode
              ? getBestTargetAnchor(targetNode, otherNode)
              : "top";
            onEdgeReconnect(
              reconnecting.edgeId,
              reconnecting.end,
              targetNode.id,
              anchorSide,
            );
          } else {
            // Drop on empty — change anchor side on same node
            const currentNodeId = edge
              ? reconnecting.end === "source"
                ? edge.source
                : edge.target
              : undefined;
            const currentNode = currentNodeId
              ? diagram.nodes.find((n) => n.id === currentNodeId)
              : undefined;
            if (currentNode) {
              const anchorSide = getAnchorSideFromDirection(
                currentNode,
                pt.x,
                pt.y,
              );
              onEdgeReconnect(
                reconnecting.edgeId,
                reconnecting.end,
                currentNodeId!,
                anchorSide,
              );
            }
          }
        }
        setReconnecting(null);
        onDragEnd?.();
      }

      // Finalize marquee
      if (marquee && diagram) {
        const x1 = Math.min(marquee.startX, marquee.endX);
        const y1 = Math.min(marquee.startY, marquee.endY);
        const x2 = Math.max(marquee.startX, marquee.endX);
        const y2 = Math.max(marquee.startY, marquee.endY);
        if (Math.abs(x2 - x1) > 5 || Math.abs(y2 - y1) > 5) {
          const selected = new Set<string>();
          for (const node of diagram.nodes) {
            const vs = getVisualSize(node);
            const nx = node.position.x + vs.width / 2;
            const ny = node.position.y + vs.height / 2;
            if (nx >= x1 && nx <= x2 && ny >= y1 && ny <= y2)
              selected.add(node.id);
          }
          if (selected.size > 0) {
            setMultiSelected(selected);
            if (selected.size === 1) onNodeSelect([...selected][0]);
          }
        } else {
          onNodeSelect(null);
          onEdgeSelect(null);
          setEditingNodeId(null);
          setMultiSelected(new Set());
        }
      }

      setMarquee(null);
      setPan(null);
      if (drag) onDragEnd?.();
      setDrag(null);
      prevDx.current = 0;
      prevDy.current = 0;
    },
    [
      marquee,
      diagram,
      drag,
      connecting,
      reconnecting,
      screenToWorld,
      onNodeSelect,
      onEdgeSelect,
      onDragEnd,
      onAddEdge,
      onEdgeReconnect,
      activeEdgeTool,
      setConnecting,
      setReconnecting,
      setMarquee,
      setPan,
      setDrag,
      setMultiSelected,
      setEditingNodeId,
      prevDx,
      prevDy,
    ],
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent<SVGSVGElement>) => {
      e.preventDefault();
      const d = e.deltaY > 0 ? 0.9 : 1.1;
      const ns = Math.max(0.2, Math.min(3, view.scale * d));
      const rect = svgRef.current?.getBoundingClientRect();
      if (rect) {
        const mx = e.clientX - rect.left,
          my = e.clientY - rect.top;
        const sc = ns / view.scale;
        setView({
          scale: ns,
          offsetX: mx - (mx - view.offsetX) * sc,
          offsetY: my - (my - view.offsetY) * sc,
        });
      }
    },
    [view, svgRef, setView],
  );

  return { handleMouseDown, handleMouseMove, handleMouseUp, handleWheel };
}
