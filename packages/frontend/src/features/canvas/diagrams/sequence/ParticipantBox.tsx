import React from "react";
import type { SequenceParticipant } from "@uml-editor/shared";
import { SvgInlineInput } from "./SvgInlineInput";

export function ParticipantBox({
  participant,
  theme = "dark",
  isSelected,
  isEditing,
  editValue,
  onEditChange,
  onEditCommit,
  onEditCancel,
  onMouseDown,
  onDoubleClick,
}: {
  participant: SequenceParticipant;
  theme?: "light" | "dark";
  isSelected?: boolean;
  isEditing: boolean;
  editValue: string;
  onEditChange: (v: string) => void;
  onEditCommit: () => void;
  onEditCancel: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  onDoubleClick?: () => void;
}) {
  const { position, name, type } = participant;
  const isDark = theme === "dark";
  const boxW = Math.max(80, name.length * 8 + 20);
  const stroke = isSelected
    ? "#6366f1"
    : isDark
    ? "#c7d2fe"
    : "#475569";
  const sw = isSelected ? 2.5 : 1.5;
  const textColor = isDark ? "#f1f5f9" : "#0f172a";
  const shapeBg = isSelected
    ? isDark
      ? "#312e81"
      : "#EDE9FE"
    : isDark
    ? "#1e293b"
    : "white";
  const boxBg = isSelected
    ? isDark
      ? "#312e81"
      : "#EDE9FE"
    : isDark
    ? "#1e293b"
    : "#E3F2FD";
  const boxStroke = isSelected
    ? "#6366f1"
    : isDark
    ? "#4f46e5"
    : stroke;

  if (type === "actor") {
    return (
      <g
        style={{ cursor: onMouseDown ? "move" : "default" }}
        onMouseDown={onMouseDown}
        onDoubleClick={onDoubleClick}
      >
        {isSelected && (
          <rect
            x={position.x - 25}
            y={position.y - 30}
            width={50}
            height={75}
            rx={4}
            fill="none"
            stroke="#6366f1"
            strokeWidth="2"
            strokeDasharray="4,2"
            opacity="0.6"
          />
        )}
        <circle
          cx={position.x}
          cy={position.y - 20}
          r={10}
          fill={isDark ? "#1e1e38" : "white"}
          stroke={stroke}
          strokeWidth={sw}
        />
        <line
          x1={position.x}
          y1={position.y - 10}
          x2={position.x}
          y2={position.y + 10}
          stroke={stroke}
          strokeWidth={sw}
        />
        <line
          x1={position.x - 12}
          y1={position.y - 2}
          x2={position.x + 12}
          y2={position.y - 2}
          stroke={stroke}
          strokeWidth={sw}
        />
        <line
          x1={position.x}
          y1={position.y + 10}
          x2={position.x - 8}
          y2={position.y + 22}
          stroke={stroke}
          strokeWidth={sw}
        />
        <line
          x1={position.x}
          y1={position.y + 10}
          x2={position.x + 8}
          y2={position.y + 22}
          stroke={stroke}
          strokeWidth={sw}
        />
        {isEditing ? (
          <SvgInlineInput
            x={position.x - 40}
            y={position.y + 36}
            width={80}
            value={editValue}
            onChange={onEditChange}
            onCommit={onEditCommit}
            onCancel={onEditCancel}
          />
        ) : (
          <text
            x={position.x}
            y={position.y + 36}
            textAnchor="middle"
            fontSize="11"
            fill={textColor}
            fontWeight="500"
          >
            {name}
          </text>
        )}
      </g>
    );
  }

  return (
    <g
      style={{ cursor: onMouseDown ? "move" : "default" }}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
    >
      {type === "boundary" ? (
        <>
          <circle
            cx={position.x}
            cy={position.y}
            r={14}
            fill={shapeBg}
            stroke={stroke}
            strokeWidth={sw}
          />
          <line
            x1={position.x - 22}
            y1={position.y - 14}
            x2={position.x - 22}
            y2={position.y + 14}
            stroke={stroke}
            strokeWidth={sw}
          />
          <line
            x1={position.x - 22}
            y1={position.y}
            x2={position.x - 14}
            y2={position.y}
            stroke={stroke}
            strokeWidth={sw}
          />
          {isEditing ? (
            <SvgInlineInput
              x={position.x - 40}
              y={position.y + 22}
              width={80}
              value={editValue}
              onChange={onEditChange}
              onCommit={onEditCommit}
              onCancel={onEditCancel}
            />
          ) : (
            <text
              x={position.x}
              y={position.y + 28}
              textAnchor="middle"
              fontSize="11"
              fill={textColor}
              fontWeight="500"
            >
              {name}
            </text>
          )}
        </>
      ) : type === "entity" ? (
        <>
          <circle
            cx={position.x}
            cy={position.y}
            r={14}
            fill={shapeBg}
            stroke={stroke}
            strokeWidth={sw}
          />
          <line
            x1={position.x - 14}
            y1={position.y + 15}
            x2={position.x + 14}
            y2={position.y + 15}
            stroke={stroke}
            strokeWidth={sw + 0.5}
          />
          {isEditing ? (
            <SvgInlineInput
              x={position.x - 40}
              y={position.y + 24}
              width={80}
              value={editValue}
              onChange={onEditChange}
              onCommit={onEditCommit}
              onCancel={onEditCancel}
            />
          ) : (
            <text
              x={position.x}
              y={position.y + 32}
              textAnchor="middle"
              fontSize="11"
              fill={textColor}
              fontWeight="500"
            >
              {name}
            </text>
          )}
        </>
      ) : type === "control" ? (
        <>
          <circle
            cx={position.x}
            cy={position.y}
            r={14}
            fill={shapeBg}
            stroke={stroke}
            strokeWidth={sw}
          />
          <path
            d={`M ${position.x + 10} ${position.y - 8} L ${position.x + 14} ${position.y - 14} L ${position.x + 8} ${position.y - 14}`}
            fill="none"
            stroke={stroke}
            strokeWidth={sw}
          />
          {isEditing ? (
            <SvgInlineInput
              x={position.x - 40}
              y={position.y + 22}
              width={80}
              value={editValue}
              onChange={onEditChange}
              onCommit={onEditCommit}
              onCancel={onEditCancel}
            />
          ) : (
            <text
              x={position.x}
              y={position.y + 28}
              textAnchor="middle"
              fontSize="11"
              fill={textColor}
              fontWeight="500"
            >
              {name}
            </text>
          )}
        </>
      ) : (type as string) === "database" ? (
        <>
          <ellipse
            cx={position.x}
            cy={position.y - 6}
            rx={16}
            ry={6}
            fill={shapeBg}
            stroke={stroke}
            strokeWidth={sw}
          />
          <path
            d={`M ${position.x - 16} ${position.y - 6} v 14 a 16 6 0 0 0 32 0 v -14`}
            fill={shapeBg}
            stroke={stroke}
            strokeWidth={sw}
          />
          {isEditing ? (
            <SvgInlineInput
              x={position.x - 40}
              y={position.y + 18}
              width={80}
              value={editValue}
              onChange={onEditChange}
              onCommit={onEditCommit}
              onCancel={onEditCancel}
            />
          ) : (
            <text
              x={position.x}
              y={position.y + 24}
              textAnchor="middle"
              fontSize="11"
              fill={textColor}
              fontWeight="500"
            >
              {name}
            </text>
          )}
        </>
      ) : (
        <>
          <rect
            x={position.x - boxW / 2}
            y={position.y - 16}
            width={boxW}
            height={32}
            fill={boxBg}
            stroke={boxStroke}
            strokeWidth={sw}
            rx={4}
          />
          {isEditing ? (
            <SvgInlineInput
              x={position.x - boxW / 2}
              y={position.y}
              width={boxW}
              value={editValue}
              onChange={onEditChange}
              onCommit={onEditCommit}
              onCancel={onEditCancel}
            />
          ) : (
            <text
              x={position.x}
              y={position.y + 4}
              textAnchor="middle"
              fontSize="12"
              fill={textColor}
              fontWeight={isSelected ? "600" : "500"}
            >
              {name}
            </text>
          )}
        </>
      )}
    </g>
  );
}
