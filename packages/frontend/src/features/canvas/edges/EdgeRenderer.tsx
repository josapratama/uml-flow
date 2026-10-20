import React from "react";
import type { Edge, DiagramNode, Position } from "@uml-editor/shared";
import { getVisualSize } from "../nodes/getVisualSize";
import {
  getConnectionPoint,
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

interface EdgeRendererProps {
  edge: Edge;
  nodes: DiagramNode[];
  isSelected: boolean;
  edgeRouting?: "straight" | "orthogonal";
  labelOffset?: number;
  laneOffset?: number;
  labelRatio?: number;
  labelShift?: number;
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
  edgeRouting = "straight",
  labelOffset = 0,
  laneOffset,
  labelRatio = 0.5,
  labelShift,
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

  // Resolve anchor points
  const resolveAnchor = (
    node: DiagramNode,
    side?: string,
    fallback?: Position,
  ): Position => {
    const { position } = node;
    const size = getVisualSize(node);
    switch (side) {
      case "top":
        return { x: position.x + size.width / 2, y: position.y };
      case "bottom":
        return { x: position.x + size.width / 2, y: position.y + size.height };
      case "left":
        return { x: position.x, y: position.y + size.height / 2 };
      case "right":
        return { x: position.x + size.width, y: position.y + size.height / 2 };
      default:
        return fallback ? getConnectionPoint(node, fallback) : sourceCenter;
    }
  };

  // --- Build path points ---
  let allPoints: Position[];
  const hasWaypoints = edge.points && edge.points.length > 0;

  if (hasWaypoints) {
    const sp = resolveAnchor(sourceNode, edge.sourceAnchor, edge.points![0]);
    const tp = resolveAnchor(
      targetNode,
      edge.targetAnchor,
      edge.points![edge.points!.length - 1],
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
  } else {
    const isOrthogonal = edgeRouting === "orthogonal";
    const effectiveLaneOffset = laneOffset !== undefined ? laneOffset : labelOffset;
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

    const sp = resolveAnchor(sourceNode, effectiveSourceAnchor, targetCenter);
    const tp = resolveAnchor(targetNode, effectiveTargetAnchor, sourceCenter);

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

  // --- Build SVG path ---
  const d = allPoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
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
  const strokeColor = isSelected ? "#6366f1" : es.strokeColor;

  return (
    <g
      className={`uml-edge ${isSelected ? "selected" : ""}`}
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
        strokeWidth={isSelected ? 2 : es.strokeWidth}
        strokeDasharray={isDashedEdge(edge.type) ? "6,4" : undefined}
        markerEnd={getMarkerEnd(edge.type)}
        markerStart={getMarkerStart(edge.type)}
        style={{ cursor: "pointer" }}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
      />

      {/* Waypoint handles */}
      {isSelected &&
        edge.points?.map((pt, i) => (
          <circle
            key={`wp_${i}`}
            cx={pt.x}
            cy={pt.y}
            r={7}
            fill="#6366f1"
            stroke="white"
            strokeWidth="2.5"
            style={{ cursor: "move" }}
            onMouseDown={(e) => {
              e.stopPropagation();
              onWaypointDragStart(i, pt, e);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onWaypointDelete?.(i);
            }}
          />
        ))}

      {/* Segment midpoints for adding waypoints */}
      {isSelected && allPoints.length >= 2 && (
        <>
          {allPoints.slice(0, -1).map((pt, i) => {
            const next = allPoints[i + 1];
            const mx = (pt.x + next.x) / 2,
              my = (pt.y + next.y) / 2;
            const tooClose = edge.points?.some(
              (wp) => Math.hypot(wp.x - mx, wp.y - my) < 20,
            );
            const insideNode = nodes.some((n) => {
              const pad = 15;
              return (
                mx >= n.position.x + pad &&
                mx <= n.position.x + n.size.width - pad &&
                my >= n.position.y + pad &&
                my <= n.position.y + n.size.height - pad
              );
            });
            if (tooClose || insideNode) return null;
            return (
              <g key={`add_${i}`}>
                <circle
                  cx={mx}
                  cy={my}
                  r={12}
                  fill="transparent"
                  style={{ cursor: "crosshair" }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    onWaypointDragStart(
                      edge.points ? Math.min(i, edge.points.length) : 0,
                      { x: mx, y: my },
                      e,
                    );
                  }}
                />
                <circle
                  cx={mx}
                  cy={my}
                  r={5}
                  fill="white"
                  stroke="#6366f1"
                  strokeWidth="2"
                  style={{ cursor: "crosshair", pointerEvents: "none" }}
                />
                <text
                  x={mx}
                  y={my + 3.5}
                  textAnchor="middle"
                  fontSize="8"
                  fill="#6366f1"
                  fontWeight="bold"
                  style={{ pointerEvents: "none" }}
                >
                  +
                </text>
              </g>
            );
          })}
        </>
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
      />
    </g>
  );
}

// --- Sub-components ---

function EndpointHandle({
  point,
  color,
  onMouseDown,
}: {
  point: Position;
  color: string;
  onMouseDown: (e: React.MouseEvent) => void;
}) {
  return (
    <g>
      <circle
        cx={point.x}
        cy={point.y}
        r={12}
        fill="transparent"
        style={{ cursor: "grab" }}
        onMouseDown={onMouseDown}
      />
      <rect
        x={point.x - 5}
        y={point.y - 5}
        width={10}
        height={10}
        rx={2}
        fill={color}
        stroke="white"
        strokeWidth="2"
        style={{ cursor: "grab", pointerEvents: "none" }}
      />
    </g>
  );
}

function EdgeLabels({
  edge,
  allPoints,
  style,
  labelRatio = 0.5,
  labelShift,
  labelOffset = 0,
  nodes = [],
}: {
  edge: Edge;
  allPoints: Position[];
  style: any;
  labelRatio?: number;
  labelShift?: number;
  labelOffset?: number;
  nodes?: DiagramNode[];
}) {
  const mid = getMidpoint(allPoints);
  // Compute point and normal vector along path at designated ratio (avoiding corners/siku)
  const { point, normal } = getPathPointAndNormal(allPoints, labelRatio);
  const shiftDist =
    labelShift !== undefined
      ? labelShift
      : labelOffset !== 0
        ? labelOffset > 0
          ? 14
          : -14
        : -10;

  let labelX = point.x + normal.x * shiftDist + (edge.label?.offsetX || 0);
  let labelY = point.y + normal.y * shiftDist + (edge.label?.offsetY || 0);

  // Auto-offset if label overlaps an unrelated node (except source/target or parent container)
  if (edge.label && nodes.length > 0) {
    const sNode = nodes.find((n) => n.id === edge.source);
    const tNode = nodes.find((n) => n.id === edge.target);

    for (const n of nodes) {
      if (n.id === edge.source || n.id === edge.target) continue;
      // Do NOT treat parent container or subnodes as obstacle!
      if (isContainerOf(n, sNode) || isContainerOf(n, tNode)) continue;
      if (isContainerOf(sNode, n) || isContainerOf(tNode, n)) continue;

      const pad = 6;
      if (
        labelX >= n.position.x - pad &&
        labelX <= n.position.x + n.size.width + pad &&
        labelY >= n.position.y - pad &&
        labelY <= n.position.y + n.size.height + pad
      ) {
        // Shift label clear to the right of the obstacle
        labelX = n.position.x + n.size.width + 16;
        break;
      }
    }
  }

  const boxW = Math.max(28, (edge.label?.text?.length || 4) * 6.8 + 14);
  const boxH = 18;

  return (
    <>
      {edge.label && (
        <g style={{ cursor: "move" }}>
          <rect
            x={labelX - boxW / 2}
            y={labelY - boxH / 2}
            width={boxW}
            height={boxH}
            fill="#ffffff"
            stroke="#cbd5e1"
            strokeWidth="1"
            rx="4"
            opacity="0.95"
            style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.08))" }}
          />
          <text
            x={labelX}
            y={labelY + 4}
            textAnchor="middle"
            fontSize={style.fontSize || 11}
            fontFamily={style.fontFamily}
            fontWeight="500"
            fill="#334155"
          >
            {edge.label.text}
          </text>
        </g>
      )}
      {edge.condition && (
        <text
          x={mid.x + 10}
          y={mid.y - 5}
          fontSize="10"
          fill="#666"
          fontStyle="italic"
        >
          [{edge.condition}]
        </text>
      )}
      {edge.type === "include" && (
        <text
          x={mid.x}
          y={mid.y - 10}
          textAnchor="middle"
          fontSize="9"
          fill="#888"
          fontStyle="italic"
        >
          «include»
        </text>
      )}
      {edge.type === "extend" && (
        <text
          x={mid.x}
          y={mid.y - 10}
          textAnchor="middle"
          fontSize="9"
          fill="#888"
          fontStyle="italic"
        >
          «extend»
        </text>
      )}
      {edge.sourceLabel && (
        <text
          x={allPoints[0].x + 8}
          y={allPoints[0].y - 8}
          fontSize="10"
          fill="#666"
        >
          {edge.sourceLabel}
        </text>
      )}
      {edge.targetLabel && (
        <text
          x={allPoints[allPoints.length - 1].x + 8}
          y={allPoints[allPoints.length - 1].y - 8}
          fontSize="10"
          fill="#666"
        >
          {edge.targetLabel}
        </text>
      )}
    </>
  );
}
