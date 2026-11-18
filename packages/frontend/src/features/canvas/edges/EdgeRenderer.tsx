import React from "react";
import type { Edge, DiagramNode, Position } from "@uml-editor/shared";
import { getVisualSize } from "../nodes/getVisualSize";
import {
  getConnectionPoint,
  getDistributedSidePoint,
  getMidpoint,
  getPathPointAndNormal,
} from "./edge-geometry";
import { getBestTargetAnchor, isContainerOf } from "../utils/anchor-utils";
import {
  getMarkerLength,
  isDashedEdge,
  getMarkerEnd,
  getMarkerStart,
  hasStartMarker,
} from "./edge-markers";
import {
  buildStraightPath,
  buildAnchorAwarePath,
  routeWithObstacleAvoidance,
} from "./edge-routing";
import { EdgeLabels } from "./EdgeLabels";
import { EndpointHandle, EdgeWaypointHandles } from "./EdgeHandles";

interface EdgeRendererProps {
  edge: Edge;
  nodes: DiagramNode[];
  isSelected: boolean;
  isDimmed?: boolean;
  isFocused?: boolean;
  edgeRouting?: "straight" | "orthogonal" | "curved";
  labelOffset?: number;
  laneOffset?: number;
  labelRatio?: number;
  labelShift?: number;
  sourcePortFraction?: number;
  targetPortFraction?: number;
  channelOffset?: number;
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onWaypointDragStart: (
    index: number,
    point: Position,
    e: React.MouseEvent,
  ) => void;
  onWaypointDelete?: (index: number) => void;
  onEndpointDrag?: (end: "source" | "target", anchor: string) => void;
  onEndpointDragStart?: (
    end: "source" | "target",
    point: Position,
    e: React.MouseEvent,
  ) => void;
}

export function EdgeRenderer({
  edge,
  nodes,
  isSelected,
  isDimmed = false,
  isFocused = false,
  edgeRouting = "straight",
  labelOffset = 0,
  laneOffset,
  labelRatio = 0.5,
  labelShift,
  sourcePortFraction = 0.5,
  targetPortFraction = 0.5,
  channelOffset = 0,
  onClick,
  onDoubleClick,
  onWaypointDragStart,
  onWaypointDelete,
  onEndpointDrag,
  onEndpointDragStart,
  onContextMenu,
}: EdgeRendererProps) {
  const sourceNode = nodes.find((n) => n.id === edge.source);
  const targetNode = nodes.find((n) => n.id === edge.target);
  if (!sourceNode || !targetNode) return null;

  const sourceSize = getVisualSize(sourceNode);
  const targetSize = getVisualSize(targetNode);
  const sourceCenter: Position = {
    x: sourceNode.position.x + sourceSize.width / 2,
    y: sourceNode.position.y + sourceSize.height / 2,
  };
  const targetCenter: Position = {
    x: targetNode.position.x + targetSize.width / 2,
    y: targetNode.position.y + targetSize.height / 2,
  };

  // Resolve anchor points with distributed ports projected onto actual shape perimeter
  const resolveAnchor = (
    node: DiagramNode,
    side?: string,
    fallback?: Position,
    portFraction: number = 0.5,
  ): Position => {
    if (side === "top" || side === "bottom" || side === "left" || side === "right") {
      return getDistributedSidePoint(node, side, portFraction);
    }
    return fallback ? getConnectionPoint(node, fallback) : sourceCenter;
  };

  // --- Build path points ---
  let allPoints: Position[];
  let isBezierCurve = false;
  const hasWaypoints = edge.points && edge.points.length > 0;

  if (hasWaypoints) {
    const sp = resolveAnchor(
      sourceNode,
      edge.sourceAnchor,
      edge.points![0],
      sourcePortFraction,
    );
    const tp = resolveAnchor(
      targetNode,
      edge.targetAnchor,
      edge.points![edge.points!.length - 1],
      targetPortFraction,
    );
    allPoints = [sp, ...edge.points!, tp];
  } else if (sourceNode.id === targetNode.id) {
    const p = sourceNode.position;
    const sz = sourceSize;
    const offset = 32;
    const sp = { x: p.x + sz.width * 0.7, y: p.y };
    const tp = { x: p.x + sz.width, y: p.y + sz.height * 0.35 };
    allPoints = [
      sp,
      { x: sp.x, y: p.y - offset },
      { x: p.x + sz.width + offset, y: p.y - offset },
      { x: p.x + sz.width + offset, y: tp.y },
      tp,
    ];
  } else if (edgeRouting === "curved") {
    isBezierCurve = true;
    const effectiveLaneOffset =
      laneOffset !== undefined ? laneOffset : labelOffset;
    const dx = targetCenter.x - sourceCenter.x;
    const dy = targetCenter.y - sourceCenter.y;
    let c1: Position;
    let c2: Position;
    if (Math.abs(dx) >= Math.abs(dy)) {
      c1 = { x: sourceCenter.x + dx * 0.48, y: sourceCenter.y + effectiveLaneOffset };
      c2 = { x: targetCenter.x - dx * 0.48, y: targetCenter.y + effectiveLaneOffset };
    } else {
      c1 = { x: sourceCenter.x + effectiveLaneOffset, y: sourceCenter.y + dy * 0.48 };
      c2 = { x: targetCenter.x + effectiveLaneOffset, y: targetCenter.y - dy * 0.48 };
    }
    const sp = resolveAnchor(
      sourceNode,
      edge.sourceAnchor,
      c1,
      sourcePortFraction,
    );
    const tp = resolveAnchor(
      targetNode,
      edge.targetAnchor,
      c2,
      targetPortFraction,
    );
    allPoints = [sp, c1, c2, tp];
  } else {
    const isOrthogonal = edgeRouting === "orthogonal";
    const effectiveLaneOffset =
      laneOffset !== undefined ? laneOffset : labelOffset;
    const effectiveSourceAnchor =
      edge.sourceAnchor ||
      (isOrthogonal
        ? getBestTargetAnchor(sourceNode, targetNode, nodes)
        : undefined);
    const effectiveTargetAnchor =
      edge.targetAnchor ||
      (isOrthogonal
        ? getBestTargetAnchor(targetNode, sourceNode, nodes)
        : undefined);

    const sp = resolveAnchor(
      sourceNode,
      effectiveSourceAnchor,
      targetCenter,
      sourcePortFraction,
    );
    const tp = resolveAnchor(
      targetNode,
      effectiveTargetAnchor,
      sourceCenter,
      targetPortFraction,
    );

    if (isOrthogonal) {
      allPoints = buildAnchorAwarePath(
        sp,
        tp,
        effectiveSourceAnchor,
        effectiveTargetAnchor,
        sourceNode,
        targetNode,
        effectiveLaneOffset,
        nodes,
        channelOffset,
      );
    } else {
      allPoints = routeWithObstacleAvoidance(
        sp,
        tp,
        sourceNode,
        targetNode,
        nodes,
      );
      if (effectiveLaneOffset !== 0 && allPoints.length === 2) {
        const p1 = allPoints[0];
        const p2 = allPoints[1];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = Math.hypot(dx, dy);
        if (len > 0) {
          const nx = -dy / len;
          const ny = dx / len;
          allPoints = [
            { x: p1.x + nx * effectiveLaneOffset, y: p1.y + ny * effectiveLaneOffset },
            { x: p2.x + nx * effectiveLaneOffset, y: p2.y + ny * effectiveLaneOffset },
          ];
        }
      }
    }
  }

  // --- Offset endpoints for arrow markers ---
  const markerLength = getMarkerLength(edge.type);
  if (allPoints.length >= 2 && markerLength > 0) {
    if (!hasStartMarker(edge.type)) {
      // Offset target end
      const last = allPoints[allPoints.length - 1];
      const prev = allPoints[allPoints.length - 2];
      const dx = last.x - prev.x,
        dy = last.y - prev.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > markerLength) {
        allPoints[allPoints.length - 1] = {
          x: last.x - (dx / dist) * markerLength,
          y: last.y - (dy / dist) * markerLength,
        };
      }
    } else {
      // Offset source end
      const first = allPoints[0];
      const next = allPoints[1];
      const dx = first.x - next.x,
        dy = first.y - next.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > markerLength) {
        allPoints[0] = {
          x: first.x - (dx / dist) * markerLength,
          y: first.y - (dy / dist) * markerLength,
        };
      }
    }
  }

  // --- Build SVG path (Bezier curve or rounded-corner polyline) ---
  const buildPathD = (): string => {
    if (isBezierCurve && allPoints.length === 4) {
      const [p0, c1, c2, p1] = allPoints;
      return `M ${p0.x} ${p0.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p1.x} ${p1.y}`;
    }
    if (allPoints.length <= 2) {
      return allPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    }
    const radius = 8;
    const parts: string[] = [`M ${allPoints[0].x} ${allPoints[0].y}`];
    for (let i = 1; i < allPoints.length - 1; i++) {
      const prev = allPoints[i - 1];
      const curr = allPoints[i];
      const next = allPoints[i + 1];
      const v1x = curr.x - prev.x;
      const v1y = curr.y - prev.y;
      const len1 = Math.hypot(v1x, v1y);
      const v2x = next.x - curr.x;
      const v2y = next.y - curr.y;
      const len2 = Math.hypot(v2x, v2y);
      const r = Math.min(radius, len1 * 0.35, len2 * 0.35);
      if (r > 1.5) {
        const pStart = { x: curr.x - (v1x / len1) * r, y: curr.y - (v1y / len1) * r };
        const pEnd = { x: curr.x + (v2x / len2) * r, y: curr.y + (v2y / len2) * r };
        parts.push(`L ${pStart.x} ${pStart.y} Q ${curr.x} ${curr.y} ${pEnd.x} ${pEnd.y}`);
      } else {
        parts.push(`L ${curr.x} ${curr.y}`);
      }
    }
    const last = allPoints[allPoints.length - 1];
    parts.push(`L ${last.x} ${last.y}`);
    return parts.join(" ");
  };

  const d = buildPathD();
  const mid = getMidpoint(allPoints);

  // --- Styles ---
  const es = {
    strokeColor: "#555555",
    strokeWidth: 1.5,
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: 11,
    fontColor: "#444444",
    ...(edge.style || {}),
  };
  const strokeColor = isSelected
    ? "#6366f1"
    : isFocused
      ? "#4f46e5"
      : es.strokeColor;
  const strokeWidth = isSelected
    ? Math.max(2, es.strokeWidth)
    : isFocused
      ? Math.max(2.2, (es.strokeWidth || 1.5) + 0.75)
      : es.strokeWidth;
  const edgeOpacity = isDimmed ? 0.22 : 1;

  return (
    <g
      className={`uml-edge ${isSelected ? "selected" : ""} ${isFocused ? "focused" : ""}`}
      style={{ opacity: edgeOpacity, transition: "opacity 0.18s ease" }}
      onContextMenu={onContextMenu}
    >
      {/* Hit area */}
      <path
        d={d}
        fill="none"
        stroke="transparent"
        strokeWidth="12"
        style={{ cursor: "pointer" }}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
      />

      {/* Visible path */}
      <path
        d={d}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={isDashedEdge(edge.type) ? "6,4" : undefined}
        markerEnd={getMarkerEnd(edge.type)}
        markerStart={getMarkerStart(edge.type)}
        style={{ cursor: "pointer" }}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
      />

      {/* Waypoint handles & Midpoints */}
      {isSelected && (
        <EdgeWaypointHandles
          edge={edge}
          allPoints={isBezierCurve && !hasWaypoints ? [allPoints[0], allPoints[allPoints.length - 1]] : allPoints}
          nodes={nodes}
          onWaypointDragStart={onWaypointDragStart}
          onWaypointDelete={onWaypointDelete}
        />
      )}

      {/* Endpoint reconnection handles */}
      {isSelected && onEndpointDragStart && (
        <>
          <EndpointHandle
            point={allPoints[0]}
            color="#10b981"
            onMouseDown={(e) => {
              e.stopPropagation();
              onEndpointDragStart("source", allPoints[0], e);
            }}
          />
          <EndpointHandle
            point={allPoints[allPoints.length - 1]}
            color="#ef4444"
            onMouseDown={(e) => {
              e.stopPropagation();
              onEndpointDragStart("target", allPoints[allPoints.length - 1], e);
            }}
          />
        </>
      )}

      {/* Labels */}
      <EdgeLabels
        edge={edge}
        allPoints={allPoints}
        style={es}
        labelRatio={labelRatio}
        labelShift={labelShift}
        labelOffset={labelOffset}
        nodes={nodes}
        isBezier={isBezierCurve && allPoints.length === 4}
      />
    </g>
  );
}
