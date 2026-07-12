import { useRef, useState } from "react";
import type { Position } from "@uml-editor/shared";

export interface ViewState {
  offsetX: number;
  offsetY: number;
  scale: number;
}

export interface DragState {
  type: "node" | "waypoint";
  id: string;
  wpIdx?: number;
  sx: number;
  sy: number;
  px: number;
  py: number;
}

export interface ConnectingState {
  sourceId: string;
  sourceAnchorSide: string;
  from: Position;
  to: Position;
  modifiers?: { shift: boolean; alt: boolean; ctrl: boolean };
}

export interface ReconnectingState {
  edgeId: string;
  end: "source" | "target";
  from: Position;
  to: Position;
}

export interface MarqueeState {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

/**
 * All canvas interaction state in one hook.
 */
export function useCanvasState() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [view, setView] = useState<ViewState>({
    offsetX: 0,
    offsetY: 0,
    scale: 1,
  });
  const [drag, setDrag] = useState<DragState | null>(null);
  const [pan, setPan] = useState<{
    sx: number;
    sy: number;
    vx: number;
    vy: number;
  } | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<ConnectingState | null>(null);
  const [reconnecting, setReconnecting] = useState<ReconnectingState | null>(
    null,
  );
  const [multiSelected, setMultiSelected] = useState<Set<string>>(new Set());
  const prevDx = useRef(0);
  const prevDy = useRef(0);
  const [marquee, setMarquee] = useState<MarqueeState | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  return {
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
  };
}
