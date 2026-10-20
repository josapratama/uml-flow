import React from "react";
import type { Edge, DiagramNode, Position } from "@uml-editor/shared";

interface EndpointHandleProps {
  point: Position;
  color: string;
  onMouseDown: (e: React.MouseEvent) => void;
}

export function EndpointHandle({
  point,
  color,
  onMouseDown,
}: EndpointHandleProps) {
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

interface EdgeWaypointHandlesProps {
  edge: Edge;
  allPoints: Position[];
  nodes: DiagramNode[];
  onWaypointDragStart: (
    index: number,
    point: Position,
    e: React.MouseEvent,
  ) => void;
  onWaypointDelete?: (index: number) => void;
}

export function EdgeWaypointHandles({
  edge,
  allPoints,
  nodes,
  onWaypointDragStart,
  onWaypointDelete,
}: EdgeWaypointHandlesProps) {
  return (
    <>
      {/* Waypoint drag handles */}
      {edge.points?.map((pt, i) => (
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
      {allPoints.length >= 2 &&
        allPoints.slice(0, -1).map((pt, i) => {
          const next = allPoints[i + 1];
          const mx = (pt.x + next.x) / 2;
          const my = (pt.y + next.y) / 2;
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
  );
}
