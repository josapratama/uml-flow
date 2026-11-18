import React from "react";
import type { SequenceMessage } from "@uml-editor/shared";
import { SvgInlineInput } from "./SvgInlineInput";

export function MessageArrow({
  message,
  index,
  theme = "dark",
  fromX,
  toX,
  y,
  isSelected,
  isHovered,
  isEditing,
  editValue,
  onEditChange,
  onEditCommit,
  onEditCancel,
  onClick,
  onDoubleClick,
  onMouseEnter,
  onMouseLeave,
  onContextMenu,
}: {
  message: SequenceMessage;
  index?: number;
  theme?: "light" | "dark";
  fromX: number;
  toX: number;
  y: number;
  isSelected: boolean;
  isHovered: boolean;
  isEditing: boolean;
  editValue: string;
  onEditChange: (v: string) => void;
  onEditCommit: () => void;
  onEditCancel: () => void;
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}) {
  const isDark = theme === "dark";
  const isSelf = message.type === "self" || fromX === toX;
  const isReturn = message.type === "return";
  const isAsync = message.type === "async";
  const isDashed = isReturn || isAsync;
  const markerId = isReturn ? "url(#arrow-sequence-return)" : isAsync ? "url(#arrow-sequence-return)" : "url(#arrow-flow)";
  const defaultColor = isDark ? "#cbd5e1" : "#555";
  const hoverColor = isDark ? "#a5b4fc" : "#818cf8";
  const selectColor = isDark ? "#818cf8" : "#6366f1";
  const color = isSelected ? selectColor : isHovered ? hoverColor : defaultColor;
  const sw = isSelected ? 2 : 1.5;
  const midX = (fromX + toX) / 2;
  const rawLabel = message.label || "";
  const displayLabel = index && !/^\d+[\.:\s]/.test(rawLabel)
    ? `${index}. ${rawLabel}`
    : rawLabel;

  if (isSelf) {
    const loopW = 30;
    return (
      <g
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{ cursor: "pointer" }}
      >
        <rect
          x={fromX - 5}
          y={y - 5}
          width={loopW + 15}
          height={30}
          fill="transparent"
          onClick={onClick}
          onDoubleClick={onDoubleClick}
          onContextMenu={onContextMenu}
        />
        <path
          d={`M ${fromX + 6} ${y} H ${fromX + loopW} V ${y + 20} H ${fromX + 14}`}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeDasharray={isDashed ? "5,3" : undefined}
          markerEnd={markerId}
        />
        {isEditing ? (
          <SvgInlineInput
            x={fromX + loopW + 2}
            y={y + 10}
            width={100}
            value={editValue}
            onChange={onEditChange}
            onCommit={onEditCommit}
            onCancel={onEditCancel}
          />
        ) : (
          <text
            x={fromX + loopW + 5}
            y={y + 10}
            fontSize="11"
            fill={color}
            fontWeight={isSelected ? "600" : "normal"}
            style={{ cursor: "pointer" }}
            onClick={onClick}
            onDoubleClick={onDoubleClick}
          >
            {displayLabel}
          </text>
        )}
      </g>
    );
  }

  const dir = toX > fromX ? 1 : -1;
  const dashArray = isDashed ? "5,3" : undefined;
  // Offset start and end points to land precisely on the outer border of activation boxes (width 12px, half-width 6px)
  const lineStartX = fromX + dir * 6;
  const lineEndX = toX - dir * 14;

  return (
    <g
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ cursor: "pointer" }}
    >
      <line
        x1={lineStartX}
        y1={y}
        x2={toX}
        y2={y}
        stroke="transparent"
        strokeWidth="14"
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onContextMenu={onContextMenu}
      />
      <line
        x1={lineStartX}
        y1={y}
        x2={lineEndX}
        y2={y}
        stroke={color}
        strokeWidth={sw}
        strokeDasharray={dashArray}
        markerEnd={markerId}
      />
      {isEditing ? (
        <SvgInlineInput
          x={midX - 60}
          y={y - 8}
          width={120}
          value={editValue}
          onChange={onEditChange}
          onCommit={onEditCommit}
          onCancel={onEditCancel}
        />
      ) : (
        <text
          x={midX}
          y={y - 8}
          textAnchor="middle"
          fontSize="11"
          fill={color}
          fontWeight={isSelected ? "600" : "500"}
          style={{ cursor: "pointer" }}
          onClick={onClick}
          onDoubleClick={onDoubleClick}
        >
          {displayLabel}
        </text>
      )}
      {isSelected && (
        <>
          <circle
            cx={lineStartX}
            cy={y}
            r={4}
            fill="#6366f1"
            stroke="white"
            strokeWidth="1.5"
          />
          <circle
            cx={lineEndX}
            cy={y}
            r={4}
            fill="#6366f1"
            stroke="white"
            strokeWidth="1.5"
          />
        </>
      )}
    </g>
  );
}
