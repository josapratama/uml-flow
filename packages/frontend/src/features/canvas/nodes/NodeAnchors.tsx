import React, { useState } from "react";
import type { DiagramNode, Position } from "@uml-editor/shared";
import { getVisualSize } from "./getVisualSize";

interface Props {
  node: DiagramNode;
  visible: boolean;
  onAnchorMouseDown?: (
    anchor: Position,
    side: string,
    e: React.MouseEvent,
  ) => void;
}

/**
 * Renders draw.io-style connection anchor points on the 4 sides of a node.
 * Visible when node is selected or hovered.
 * Users can drag from these to create new edges.
 * Uses getVisualSize() to match the actual rendered node dimensions.
 */
export function NodeAnchors({ node, visible, onAnchorMouseDown }: Props) {
  const [hoveredAnchor, setHoveredAnchor] = useState<string | null>(null);

  if (!visible) return null;

  const { position } = node;
  const size = getVisualSize(node);
  const anchors = [
    { x: position.x + size.width / 2, y: position.y, side: "top" },
    {
      x: position.x + size.width / 2,
      y: position.y + size.height,
      side: "bottom",
    },
    { x: position.x, y: position.y + size.height / 2, side: "left" },
    {
      x: position.x + size.width,
      y: position.y + size.height / 2,
      side: "right",
    },
  ];

  return (
    <g className="node-anchors">
      {anchors.map((a) => {
        const isHovered = hoveredAnchor === a.side;
        return (
          <g key={a.side}>
            {/* Larger invisible hit area for easier interaction */}
            <circle
              cx={a.x}
              cy={a.y}
              r={10}
              fill="transparent"
              style={{ cursor: "crosshair" }}
              onMouseEnter={() => setHoveredAnchor(a.side)}
              onMouseLeave={() => setHoveredAnchor(null)}
              onMouseDown={(e) => {
                e.stopPropagation();
                onAnchorMouseDown?.({ x: a.x, y: a.y }, a.side, e);
              }}
            />
            {/* Visible anchor dot */}
            <circle
              cx={a.x}
              cy={a.y}
              r={isHovered ? 5.5 : 4}
              fill={isHovered ? "#6366f1" : "white"}
              stroke="#6366f1"
              strokeWidth={isHovered ? 2 : 1.5}
              style={{ cursor: "crosshair", pointerEvents: "none" }}
              opacity={isHovered ? 1 : 0.75}
            />
            {/* Plus indicator on hover */}
            {isHovered && (
              <text
                x={a.x}
                y={a.y + 3}
                textAnchor="middle"
                fontSize="7"
                fill="white"
                fontWeight="bold"
                style={{ pointerEvents: "none" }}
              >
                +
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

/** Get anchor positions for a node using visual size (used by edge routing). */
export function getNodeAnchors(node: DiagramNode): Record<string, Position> {
  const size = getVisualSize(node);
  return {
    top: { x: node.position.x + size.width / 2, y: node.position.y },
    bottom: {
      x: node.position.x + size.width / 2,
      y: node.position.y + size.height,
    },
    left: { x: node.position.x, y: node.position.y + size.height / 2 },
    right: {
      x: node.position.x + size.width,
      y: node.position.y + size.height / 2,
    },
  };
}
