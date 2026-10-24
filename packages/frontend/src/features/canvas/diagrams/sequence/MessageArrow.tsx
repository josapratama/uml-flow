import React from "react";
import type { SequenceMessage } from "@uml-editor/shared";
import { SvgInlineInput } from "./SvgInlineInput";

export function MessageArrow({
  message,
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
  const isReturn = message.type === "return" || message.type === "async";
  const defaultColor = isDark ? "#cbd5e1" : "#555";
  const hoverColor = isDark ? "#a5b4fc" : "#818cf8";
  const selectColor = isDark ? "#818cf8" : "#6366f1";
  const color = isSelected ? selectColor : isHovered ? hoverColor : defaultColor;
  const sw = isSelected ? 2 : 1.5;
  const midX = (fromX + toX) / 2;

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
          d={`M ${fromX} ${y} H ${fromX + loopW} V ${y + 20} H ${fromX}`}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          markerEnd="url(#arrow-flow)"
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
            {message.label}
          </text>
        )}
      </g>
    );
  }

  const dir = toX > fromX ? 1 : -1;
  const dashArray = isReturn ? "5,3" : undefined;

  return (
    <g
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ cursor: "pointer" }}
    >
      <line
        x1={fromX}
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
        x1={fromX}
        y1={y}
        x2={toX - dir * 8}
        y2={y}
        stroke={color}
        strokeWidth={sw}
        strokeDasharray={dashArray}
        markerEnd="url(#arrow-flow)"
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
          fontWeight={isSelected ? "600" : "normal"}
          style={{ cursor: "pointer" }}
          onClick={onClick}
          onDoubleClick={onDoubleClick}
        >
          {message.label}
        </text>
      )}
      {isSelected && (
        <>
          <circle
            cx={fromX}
            cy={y}
            r={4}
            fill="#6366f1"
            stroke="white"
            strokeWidth="1.5"
          />
          <circle
            cx={toX - dir * 8}
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
