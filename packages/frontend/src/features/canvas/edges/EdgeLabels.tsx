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
}

export function EdgeLabels({
  edge,
  allPoints,
  style,
  labelRatio = 0.5,
  labelShift,
  labelOffset = 0,
  nodes = [],
}: EdgeLabelsProps) {
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
