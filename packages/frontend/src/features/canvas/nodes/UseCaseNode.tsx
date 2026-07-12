import React from "react";
import type { UseCaseNode } from "@uml-editor/shared";
import { resolveStyle, getStroke, getStrokeWidth } from "./useNodeStyle";

interface Props {
  node: UseCaseNode;
  isSelected: boolean;
  onDragStart: (e: React.MouseEvent) => void;
}

export function UseCaseNodeRenderer({ node, isSelected, onDragStart }: Props) {
  const { position, size, name, type } = node;
  const s = resolveStyle((node as any).style);
  const stroke = getStroke(s, isSelected);
  const sw = getStrokeWidth(s, isSelected);
  const cx = size.width / 2,
    cy = size.height / 2;

  const renderShape = () => {
    switch (type) {
      case "actor":
        return (
          <g>
            <circle
              cx={cx}
              cy={20}
              r={12}
              fill="none"
              stroke={stroke}
              strokeWidth={sw}
            />
            <line
              x1={cx}
              y1={32}
              x2={cx}
              y2={60}
              stroke={stroke}
              strokeWidth={sw}
            />
            <line
              x1={cx - 18}
              y1={42}
              x2={cx + 18}
              y2={42}
              stroke={stroke}
              strokeWidth={sw}
            />
            <line
              x1={cx}
              y1={60}
              x2={cx - 15}
              y2={82}
              stroke={stroke}
              strokeWidth={sw}
            />
            <line
              x1={cx}
              y1={60}
              x2={cx + 15}
              y2={82}
              stroke={stroke}
              strokeWidth={sw}
            />
            <text
              x={cx}
              y={size.height - 2}
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
      case "usecase":
        return (
          <g>
            <ellipse
              cx={cx}
              cy={cy}
              rx={cx - 4}
              ry={cy - 4}
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
      case "system":
        return (
          <g>
            <rect
              x="0"
              y="0"
              width={size.width}
              height={size.height}
              rx={s.borderRadius}
              fill="none"
              stroke={s.borderStyle === "none" ? "none" : stroke}
              strokeWidth={s.borderStyle === "none" ? 0 : sw}
              strokeDasharray={
                s.borderStyle === "dotted"
                  ? "2,2"
                  : s.borderStyle === "solid"
                    ? undefined
                    : "6,3"
              }
            />
            <text
              x={cx}
              y="18"
              textAnchor="middle"
              fontSize={s.fontSize}
              fontFamily={s.fontFamily}
              fontWeight="bold"
              fill={s.fontColor}
            >
              {name}
            </text>
          </g>
        );
      default:
        return null;
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
