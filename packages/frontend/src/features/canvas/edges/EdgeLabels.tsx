import React from "react";
import type { Edge, DiagramNode, Position } from "@uml-editor/shared";
import { getMidpoint, getPathPointAndNormal } from "./edge-geometry";
import { isContainerOf } from "../utils/anchor-utils";

interface EdgeLabelsProps {
  edge: Edge;
  allPoints: Position[];
  style: any;
  labelRatio?: number;
  labelShift?: number;
  labelOffset?: number;
  nodes?: DiagramNode[];
  isBezier?: boolean;
}

export function EdgeLabels({
  edge,
  allPoints,
  style,
  labelRatio = 0.5,
  labelShift,
  labelOffset = 0,
  nodes = [],
  isBezier = false,
}: EdgeLabelsProps) {
  const mid = getMidpoint(allPoints);
  // Compute point and normal vector along path at designated ratio (avoiding corners/siku, exact for Bezier)
  const { point, normal } = getPathPointAndNormal(allPoints, labelRatio, isBezier);
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
        // Shift label cleanly above or below the obstacle along its edge
        const nCenterY = n.position.y + n.size.height / 2;
        if (labelY < nCenterY) {
          labelY = n.position.y - 14;
        } else {
          labelY = n.position.y + n.size.height + 14;
        }
        break;
      }
    }
  }

  const boxW = Math.max(32, (edge.label?.text?.length || 4) * 7.2 + 16);
  const boxH = 20;

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
            stroke="#94a3b8"
            strokeWidth="1"
            rx="6"
            opacity="0.96"
            style={{ filter: "drop-shadow(0 1.5px 3px rgba(0,0,0,0.12))" }}
          />
          <text
            x={labelX}
            y={labelY + 4}
            textAnchor="middle"
            fontSize={style.fontSize || 11}
            fontFamily={style.fontFamily || "Inter, system-ui, sans-serif"}
            fontWeight="600"
            fill="#1e293b"
          >
            {edge.label.text}
          </text>
        </g>
      )}
      {edge.condition && (
        <g style={{ pointerEvents: "none" }}>
          <rect
            x={mid.x - Math.max(22, (edge.condition.length * 6.5 + 14) / 2)}
            y={mid.y - 20}
            width={Math.max(44, edge.condition.length * 6.5 + 14)}
            height={18}
            rx="5"
            fill="#f0fdf4"
            stroke="#16a34a"
            strokeWidth="1"
            opacity="0.95"
            style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.06))" }}
          />
          <text
            x={mid.x}
            y={mid.y - 7}
            textAnchor="middle"
            fontSize="10"
            fontWeight="bold"
            fontStyle="italic"
            fontFamily={style?.fontFamily || "Inter, system-ui, sans-serif"}
            fill="#15803d"
          >
            [{edge.condition}]
          </text>
        </g>
      )}
      {edge.type === "include" && (
        <g style={{ pointerEvents: "none" }}>
          <rect
            x={mid.x - 34}
            y={mid.y - 20}
            width={68}
            height={18}
            rx="9"
            fill="#e0e7ff"
            stroke="#6366f1"
            strokeWidth="1"
            opacity="0.96"
            style={{ filter: "drop-shadow(0 1.5px 3px rgba(99,102,241,0.18))" }}
          />
          <text
            x={mid.x}
            y={mid.y - 7}
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fontFamily={style?.fontFamily || "Inter, system-ui, sans-serif"}
            fill="#4338ca"
          >
            «include»
          </text>
        </g>
      )}
      {edge.type === "extend" && (
        <g style={{ pointerEvents: "none" }}>
          <rect
            x={mid.x - 34}
            y={mid.y - 20}
            width={68}
            height={18}
            rx="9"
            fill="#fef3c7"
            stroke="#d97706"
            strokeWidth="1"
            opacity="0.96"
            style={{ filter: "drop-shadow(0 1.5px 3px rgba(217,119,6,0.18))" }}
          />
          <text
            x={mid.x}
            y={mid.y - 7}
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fontFamily={style?.fontFamily || "Inter, system-ui, sans-serif"}
            fill="#b45309"
          >
            «extend»
          </text>
        </g>
      )}
      {edge.sourceLabel && (
        <g style={{ pointerEvents: "none" }}>
          <rect
            x={allPoints[0].x + 4}
            y={allPoints[0].y - 18}
            width={Math.max(20, edge.sourceLabel.length * 7 + 8)}
            height={16}
            rx="3"
            fill="#ffffff"
            stroke="#cbd5e1"
            strokeWidth="0.8"
            opacity="0.92"
          />
          <text
            x={allPoints[0].x + 4 + Math.max(20, edge.sourceLabel.length * 7 + 8) / 2}
            y={allPoints[0].y - 6}
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fontFamily={style?.fontFamily || "Inter, system-ui, sans-serif"}
            fill="#475569"
          >
            {edge.sourceLabel}
          </text>
        </g>
      )}
      {edge.targetLabel && (
        <g style={{ pointerEvents: "none" }}>
          <rect
            x={allPoints[allPoints.length - 1].x + 4}
            y={allPoints[allPoints.length - 1].y - 18}
            width={Math.max(20, edge.targetLabel.length * 7 + 8)}
            height={16}
            rx="3"
            fill="#ffffff"
            stroke="#cbd5e1"
            strokeWidth="0.8"
            opacity="0.92"
          />
          <text
            x={allPoints[allPoints.length - 1].x + 4 + Math.max(20, edge.targetLabel.length * 7 + 8) / 2}
            y={allPoints[allPoints.length - 1].y - 6}
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fontFamily={style?.fontFamily || "Inter, system-ui, sans-serif"}
            fill="#475569"
          >
            {edge.targetLabel}
          </text>
        </g>
      )}
    </>
  );
}
