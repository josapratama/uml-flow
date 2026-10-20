import React from "react";
import type { StateNode } from "@uml-editor/shared";
import { resolveStyle, getStroke, getStrokeWidth, isDarkCanvas } from "./useNodeStyle";

interface Props {
  node: StateNode;
  isSelected: boolean;
  onDragStart: (e: React.MouseEvent) => void;
}

export function StateNodeRenderer({ node, isSelected, onDragStart }: Props) {
  const { position, size, name, type } = node;
  const s = resolveStyle((node as any).style);
  const stroke = getStroke(s, isSelected);
  const sw = getStrokeWidth(s, isSelected);
  const isDark = isDarkCanvas();
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
            fill={s.borderColor}
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
              stroke={s.borderColor}
              strokeWidth="2"
            />
            <circle cx={cx} cy={cy} r={8} fill={s.borderColor} />
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
      case "choice":
        return (
          <g>
            <polygon
              points={`${cx},0 ${size.width},${cy} ${cx},${size.height} 0,${cy}`}
              fill={(node as any).style ? s.backgroundColor : "#FFF9C4"}
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
            >
              {name}
            </text>
          </g>
        );
      case "composite": {
        const subNodes: StateNode[] = (node as any).substates || [];
        // Layout substates inside the composite box
        const headerH = 30;
        const pad = 12;
        const subW = Math.max(
          80,
          (size.width - pad * 2 - (subNodes.length - 1) * 12) /
            Math.max(1, subNodes.length),
        );
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
              height="12"
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
              y="20"
              textAnchor="middle"
              fontSize={s.fontSize}
              fontFamily={s.fontFamily}
              fontWeight="600"
              fill={s.fontColor}
            >
              {name}
            </text>
            {/* Substates rendered inside */}
            {subNodes.map((sub, i) => {
              const subX = pad + i * (subW + 10);
              const subY = headerH + 14;
              const subH = 36;
              if (sub.type === "initial") {
                return (
                  <g key={sub.id}>
                    <circle cx={subX + 10} cy={subY + 10} r={8} fill="#333" />
                  </g>
                );
              }
              if (sub.type === "final") {
                return (
                  <g key={sub.id}>
                    <circle
                      cx={subX + 10}
                      cy={subY + 10}
                      r={10}
                      fill="none"
                      stroke="#333"
                      strokeWidth="2"
                    />
                    <circle cx={subX + 10} cy={subY + 10} r={6} fill="#333" />
                  </g>
                );
              }
              return (
                <g key={sub.id}>
                  <rect
                    x={subX}
                    y={subY}
                    width={subW}
                    height={subH}
                    rx="8"
                    fill={isDark ? "#1f1f33" : "white"}
                    stroke={stroke}
                    strokeWidth="1"
                    opacity="0.9"
                  />
                  <text
                    x={subX + subW / 2}
                    y={subY + subH / 2 + 4}
                    textAnchor="middle"
                    fontSize="10"
                    fontFamily={s.fontFamily}
                    fill={s.fontColor}
                  >
                    {sub.name}
                  </text>
                </g>
              );
            })}
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
