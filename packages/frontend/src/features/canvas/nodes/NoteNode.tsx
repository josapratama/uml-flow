import React from "react";
import type { DiagramNode } from "@uml-editor/shared";
import { isDarkCanvas } from "./useNodeStyle";

interface Props {
  node: DiagramNode;
  isSelected: boolean;
  hideText?: boolean;
  onDragStart: (e: React.MouseEvent) => void;
  canvasTheme?: string;
}

/**
 * Renders a sticky-note style comment node.
 * Automatically adapts to canvas dark/light mode.
 */
export function NoteNodeRenderer({
  node,
  isSelected,
  hideText,
  onDragStart,
  canvasTheme,
}: Props) {
  const { position, size, name } = node;
  const isDark = isDarkCanvas(canvasTheme);
  const fold = 14;
  const stroke = isSelected ? "#818cf8" : isDark ? "#ca8a04" : "#d4a017";
  const sw = isSelected ? 2 : 1;
  const bodyFill = (node as any).style?.backgroundColor || (isDark ? "#262215" : "#FFF9C4");
  const foldFill = isDark ? "#38311a" : "#F9E68C";
  const textFill = (node as any).style?.fontColor || (isDark ? "#fef08a" : "#5D4E37");

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
        fill={bodyFill}
        stroke={stroke}
        strokeWidth={sw}
      />
      {/* Fold triangle */}
      <path
        d={`M ${size.width - fold} 0 V ${fold} H ${size.width}`}
        fill={foldFill}
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
          fill={textFill}
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
