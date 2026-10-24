import React from "react";
import type { StateNode } from "@uml-editor/shared";
import { resolveStyle, getStroke, getStrokeWidth, isDarkCanvas, getContrastTextColor } from "./useNodeStyle";
import { SvgMultilineText } from "./SvgMultilineText";

interface Props {
  node: StateNode;
  isSelected: boolean;
  onDragStart: (e: React.MouseEvent) => void;
  canvasTheme?: string;
}

export function StateNodeRenderer({ node, isSelected, onDragStart, canvasTheme }: Props) {
  const { position, size, name, type } = node;
  const isDark = isDarkCanvas(canvasTheme);
  const s = resolveStyle((node as any).style, canvasTheme);
  const stroke = getStroke(s, isSelected);
  const sw = getStrokeWidth(s, isSelected);
  const cx = size.width / 2,
    cy = size.height / 2;

  const renderShape = () => {
    switch (type) {
      case "initial":
        return (
          <circle
            cx={cx}
            cy={cy}
            r={10}
            fill={isDark ? "#818cf8" : s.borderColor}
            stroke={stroke}
            strokeWidth={sw}
          />
        );
      case "final":
        return (
          <g>
            <circle
              cx={cx}
              cy={cy}
              r={12}
              fill="none"
              stroke={isDark ? "#818cf8" : s.borderColor}
              strokeWidth="2"
            />
            <circle cx={cx} cy={cy} r={8} fill={isDark ? "#818cf8" : s.borderColor} />
          </g>
        );
      case "state":
        return (
          <g>
            <rect
              x="0"
              y="0"
              width={size.width}
              height={size.height}
              rx="16"
              fill={s.backgroundColor}
              stroke={stroke}
              strokeWidth={sw}
            />
            <SvgMultilineText
              text={name}
              cx={cx}
              cy={cy}
              fontSize={s.fontSize}
              fontFamily={s.fontFamily}
              fill={s.fontColor}
              fontWeight={s.fontWeight}
              fontStyle={s.fontStyle}
              maxWidth={size.width - 16}
            />
          </g>
        );
      case "choice": {
        const choiceBg = (node as any).style?.backgroundColor || (isDark ? "#262014" : "#FFF9C4");
        const choiceBorder = isSelected ? "#818cf8" : (node as any).style?.borderColor || (isDark ? "#eab308" : "#facc15");
        const choiceFont = (node as any).style?.fontColor || (isDark ? "#fef08a" : getContrastTextColor(choiceBg));
        return (
          <g>
            <polygon
              points={`${cx},0 ${size.width},${cy} ${cx},${size.height} 0,${cy}`}
              fill={choiceBg}
              stroke={choiceBorder}
              strokeWidth={sw}
            />
            <SvgMultilineText
              text={name}
              cx={cx}
              cy={cy}
              fontSize={s.fontSize}
              fontFamily={s.fontFamily}
              fill={choiceFont}
              maxWidth={size.width * 0.72}
            />
          </g>
        );
      }
      case "composite": {
        const headerH = 32;
        return (
          <g>
            {/* Outer rounded rect */}
            <rect
              x="0"
              y="0"
              width={size.width}
              height={size.height}
              rx="12"
              fill={
                (node as any).style?.backgroundColor ||
                (isDark ? "#161628" : "#F8F9FF")
              }
              stroke={stroke}
              strokeWidth={sw}
            />
            {/* Header */}
            <rect
              x="0"
              y="0"
              width={size.width}
              height={headerH}
              rx="12"
              fill={
                (node as any).style?.backgroundColor ||
                (isDark ? "#23233a" : "#E8EAF6")
              }
              stroke="none"
            />
            {/* Square off bottom of header */}
            <rect
              x="0"
              y="18"
              width={size.width}
              height={headerH - 18}
              fill={
                (node as any).style?.backgroundColor ||
                (isDark ? "#23233a" : "#E8EAF6")
              }
            />
            <line
              x1="0"
              y1={headerH}
              x2={size.width}
              y2={headerH}
              stroke={stroke}
              strokeWidth="0.8"
              opacity="0.4"
            />
            <text
              x={cx}
              y={21}
              textAnchor="middle"
              fontSize={s.fontSize}
              fontFamily={s.fontFamily}
              fontWeight="600"
              fill={s.fontColor}
            >
              {name}
            </text>
          </g>
        );
      }
      default:
        return (
          <g>
            <rect
              x="0"
              y="0"
              width={size.width}
              height={size.height}
              rx="12"
              fill={s.backgroundColor}
              stroke={stroke}
              strokeWidth={sw}
            />
            <text
              x={cx}
              y={cy + 4}
              textAnchor="middle"
              fontSize={s.fontSize}
              fontFamily={s.fontFamily}
              fill={s.fontColor}
              fontWeight={s.fontWeight}
              fontStyle={s.fontStyle}
            >
              {name}
            </text>
          </g>
        );
    }
  };

  return (
    <g
      className={`uml-node ${isSelected ? "selected" : ""}`}
      transform={`translate(${position.x}, ${position.y})`}
      onMouseDown={onDragStart}
      style={{ cursor: "move" }}
      opacity={s.opacity}
    >
      {renderShape()}
    </g>
  );
}
