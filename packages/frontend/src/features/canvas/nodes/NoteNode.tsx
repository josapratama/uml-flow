import React from "react";
import type { DiagramNode } from "@uml-editor/shared";

interface Props {
  node: DiagramNode;
  isSelected: boolean;
  hideText?: boolean;
  onDragStart: (e: React.MouseEvent) => void;
}

/**
 * Renders a sticky-note style comment node.
 * Yellow background with folded corner.
 */
export function NoteNodeRenderer({
  node,
  isSelected,
  hideText,
  onDragStart,
}: Props) {
  const { position, size, name } = node;
  const fold = 14;
  const stroke = isSelected ? "#6366f1" : "#d4a017";
  const sw = isSelected ? 2 : 1;

  return (
    <g
      className={`uml-node ${isSelected ? "selected" : ""}`}
      transform={`translate(${position.x}, ${position.y})`}
      onMouseDown={onDragStart}
      style={{ cursor: "move" }}
    >
      {/* Note body with folded corner */}
      <path
        d={`M 0 0 H ${size.width - fold} L ${size.width} ${fold} V ${size.height} H 0 Z`}
        fill="#FFF9C4"
        stroke={stroke}
        strokeWidth={sw}
      />
      {/* Fold triangle */}
      <path
        d={`M ${size.width - fold} 0 V ${fold} H ${size.width}`}
        fill="#F9E68C"
        stroke={stroke}
        strokeWidth={sw * 0.7}
      />
      {/* Text content */}
      {!hideText && (
        <text
          x={8}
          y={fold + 14}
          fontSize="12"
          fontFamily="Inter, system-ui, sans-serif"
          fill="#5D4E37"
          style={{ whiteSpace: "pre-wrap" }}
        >
          {name.split("\n").map((line, i) => (
            <tspan key={i} x={8} dy={i === 0 ? 0 : 16}>
              {line}
            </tspan>
          ))}
        </text>
      )}
    </g>
  );
}
