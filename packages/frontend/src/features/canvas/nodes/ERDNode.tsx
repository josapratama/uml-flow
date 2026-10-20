import React from "react";
import type { ERDEntity } from "@uml-editor/shared";
import { resolveStyle, getStroke, getStrokeWidth, isDarkCanvas } from "./useNodeStyle";
import { getVisualSize } from "./getVisualSize";

interface Props {
  node: ERDEntity;
  isSelected: boolean;
  hideText?: boolean;
  onDragStart: (e: React.MouseEvent) => void;
}

export function ERDNodeRenderer({
  node,
  isSelected,
  hideText,
  onDragStart,
}: Props) {
  const { position, name, attributes, type } = node;
  const size = getVisualSize(node);
  const s = resolveStyle((node as any).style);
  const stroke = getStroke(s, isSelected);
  const sw = getStrokeWidth(s, isSelected);
  const isWeak = type === "weak-entity";
  const headerH = 32;
  const rowH = Math.max(20, s.fontSize + 7);
  const isDark = isDarkCanvas();
  const defaultHeaderColor = isDark ? "#282a40" : "#E8EAF6";
  const headerColor = (node as any).style?.backgroundColor || defaultHeaderColor;

  return (
    <g
      className={`uml-node ${isSelected ? "selected" : ""}`}
      transform={`translate(${position.x}, ${position.y})`}
      onMouseDown={onDragStart}
      style={{ cursor: "move" }}
      opacity={s.opacity}
    >
      {/* Weak entity double border */}
      {isWeak && (
        <rect
          x={-3}
          y={-3}
          width={size.width + 6}
          height={size.height + 6}
          rx={s.borderRadius + 1}
          fill="none"
          stroke={stroke}
          strokeWidth={sw * 0.7}
          opacity="0.5"
        />
      )}
      {/* Shadow */}
      <rect
        x="2"
        y="2"
        width={size.width}
        height={size.height}
        rx={s.borderRadius}
        fill="rgba(0,0,0,0.06)"
      />
      {/* Main body */}
      <rect
        x="0"
        y="0"
        width={size.width}
        height={size.height}
        rx={s.borderRadius}
        fill={s.backgroundColor}
        stroke={stroke}
        strokeWidth={sw}
        strokeDasharray={
          s.borderStyle === "dashed"
            ? "6,4"
            : s.borderStyle === "dotted"
              ? "2,2"
              : undefined
        }
      />
      {/* Header background */}
      <rect
        x={sw / 2}
        y={sw / 2}
        width={size.width - sw}
        height={headerH - sw / 2}
        rx={s.borderRadius}
        fill={headerColor}
      />
      <rect
        x={sw / 2}
        y={headerH - 6}
        width={size.width - sw}
        height="6"
        fill={headerColor}
      />
      {/* Table icon */}
      <text x="8" y="20" fontSize="12" opacity="0.7">
        📋
      </text>
      {/* Entity name */}
      {!hideText && (
        <text
          x={size.width / 2}
          y="21"
          textAnchor="middle"
          fontSize={s.fontSize}
          fontWeight="600"
          fontFamily={s.fontFamily}
          fill={s.fontColor}
          fontStyle={s.fontStyle}
        >
          {name}
        </text>
      )}
      {/* Header separator */}
      <line
        x1="0"
        y1={headerH}
        x2={size.width}
        y2={headerH}
        stroke={stroke}
        strokeWidth="0.5"
        opacity="0.4"
      />
      {/* Attributes */}
      {attributes.map((attr, i) => {
        const y = headerH + s.fontSize + 4 + i * rowH;
        const icon = attr.isPrimaryKey ? "🔑" : attr.isForeignKey ? "🔗" : "";
        const textColor = attr.isPrimaryKey
          ? "#1565C0"
          : attr.isForeignKey
            ? "#6A1B9A"
            : s.fontColor;
        return (
          <g key={i}>
            {/* Row separator */}
            {i > 0 && (
              <line
                x1="4"
                y1={y - rowH + s.fontSize + 2}
                x2={size.width - 4}
                y2={y - rowH + s.fontSize + 2}
                stroke={stroke}
                strokeWidth="0.3"
                opacity="0.15"
              />
            )}
            {/* PK/FK icon */}
            {icon && (
              <text x="6" y={y} fontSize={s.fontSize - 3}>
                {icon}
              </text>
            )}
            {/* Attribute name */}
            <text
              x={icon ? 24 : 10}
              y={y}
              fontSize={s.fontSize - 1}
              fontFamily={s.fontFamily}
              fill={textColor}
              fontWeight={attr.isPrimaryKey ? "bold" : s.fontWeight}
              fontStyle={s.fontStyle}
              textDecoration={attr.isPrimaryKey ? "underline" : "none"}
            >
              {attr.name}
            </text>
            {/* Type + constraints */}
            <text
              x={size.width - 8}
              y={y}
              textAnchor="end"
              fontSize={s.fontSize - 2}
              fontFamily={s.fontFamily}
              fill={s.fontColor}
              opacity="0.55"
            >
              {attr.type}
              {attr.isNullable ? " ?" : ""}
              {attr.isUnique ? " UQ" : ""}
            </text>
          </g>
        );
      })}
    </g>
  );
}
