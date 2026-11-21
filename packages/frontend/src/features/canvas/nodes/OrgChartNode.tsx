import React from "react";
import type { OrgChartNode } from "@uml-editor/shared";
import {
  resolveStyle,
  getStrokeWidth,
  isDarkCanvas,
} from "./useNodeStyle";

interface Props {
  node: OrgChartNode;
  isSelected: boolean;
  onDragStart: (e: React.MouseEvent) => void;
  canvasTheme?: string;
  hideText?: boolean;
}

export function OrgChartNodeRenderer({
  node,
  isSelected,
  onDragStart,
  canvasTheme,
  hideText,
}: Props) {
  const { position, size, name, type, person, department, role } = node;
  const isDark = isDarkCanvas(canvasTheme);
  const s = resolveStyle((node as any).style, canvasTheme);

  const roleConfigs: Record<
    string,
    {
      badge: string;
      accentLight: string;
      accentDark: string;
      bgLight: string;
      bgDark: string;
      borderLight: string;
      borderDark: string;
      textLight: string;
      textDark: string;
    }
  > = {
    leader: {
      badge: "PIMPINAN",
      accentLight: "#3b82f6",
      accentDark: "#60a5fa",
      bgLight: "#eff6ff",
      bgDark: "#172554",
      borderLight: "#93c5fd",
      borderDark: "#1e40af",
      textLight: "#1e3a8a",
      textDark: "#dbeafe",
    },
    manager: {
      badge: "MANAJER / KABAG",
      accentLight: "#10b981",
      accentDark: "#34d399",
      bgLight: "#ecfdf5",
      bgDark: "#064e3b",
      borderLight: "#a7f3d0",
      borderDark: "#065f46",
      textLight: "#064e3b",
      textDark: "#d1fae5",
    },
    staff: {
      badge: "STAF PELAKSANA",
      accentLight: "#0284c7",
      accentDark: "#38bdf8",
      bgLight: "#f8fafc",
      bgDark: "#0f172a",
      borderLight: "#cbd5e1",
      borderDark: "#334155",
      textLight: "#0f172a",
      textDark: "#f1f5f9",
    },
    assistant: {
      badge: "STAF AHLI / ASISTEN",
      accentLight: "#f59e0b",
      accentDark: "#fbbf24",
      bgLight: "#fffbeb",
      bgDark: "#451a03",
      borderLight: "#fde68a",
      borderDark: "#92400e",
      textLight: "#78350f",
      textDark: "#fef3c7",
    },
    unit: {
      badge: "DIVISI / UNIT",
      accentLight: "#8b5cf6",
      accentDark: "#a78bfa",
      bgLight: "#f5f3ff",
      bgDark: "#2e1065",
      borderLight: "#ddd6fe",
      borderDark: "#5b21b6",
      textLight: "#4c1d95",
      textDark: "#ede9fe",
    },
  };

  const config = roleConfigs[type] || roleConfigs.staff;
  const accent = isDark ? config.accentDark : config.accentLight;
  const cardBg = s.backgroundColor !== "transparent" && s.backgroundColor
    ? s.backgroundColor
    : isDark
      ? config.bgDark
      : config.bgLight;

  const cardBorder = isSelected
    ? "#818cf8"
    : s.borderColor || (isDark ? config.borderDark : config.borderLight);

  const sw = isSelected ? 2.5 : getStrokeWidth(s, isSelected) || 1.5;
  const isAssistant = type === "assistant";
  const dashArray = isAssistant ? "5 3" : undefined;

  const titleColor = isDark ? config.textDark : config.textLight;
  const subColor = isDark ? "#94a3b8" : "#475569";
  const deptColor = isDark ? "#64748b" : "#64748b";

  const w = size.width;
  const h = size.height;

  return (
    <g
      transform={`translate(${position.x}, ${position.y})`}
      onMouseDown={onDragStart}
      className="cursor-move select-none"
    >
      {/* Selection Glow / Shadow */}
      {isSelected && (
        <rect
          x="-3"
          y="-3"
          width={w + 6}
          height={h + 6}
          rx="10"
          ry="10"
          fill="none"
          stroke="#818cf8"
          strokeWidth="3"
          strokeOpacity="0.4"
        />
      )}

      {/* Main Card Background */}
      <rect
        x="0"
        y="0"
        width={w}
        height={h}
        rx="8"
        ry="8"
        fill={cardBg}
        stroke={cardBorder}
        strokeWidth={sw}
        strokeDasharray={dashArray}
        className="transition-colors"
      />

      {/* Top Accent Bar */}
      <path
        d={`M 1 8 A 7 7 0 0 1 8 1 L ${w - 8} 1 A 7 7 0 0 1 ${w - 1} 8 L ${w - 1} 7 L 1 7 Z`}
        fill={accent}
      />

      {!hideText && (
        <g>
          {/* Role Badge (Top Right) */}
          <rect
            x={w - 95}
            y="7"
            width="87"
            height="14"
            rx="4"
            fill={accent}
            fillOpacity={isDark ? "0.3" : "0.15"}
          />
          <text
            x={w - 51.5}
            y="17.5"
            textAnchor="middle"
            fontSize="8"
            fontWeight="bold"
            letterSpacing="0.05em"
            fill={accent}
          >
            {config.badge}
          </text>

          {/* Jabatan / Position Title */}
          <text
            x="12"
            y="26"
            fontSize="12"
            fontWeight="bold"
            fontFamily={s.fontFamily || "system-ui, sans-serif"}
            fill={titleColor}
            className="truncate"
          >
            {name.length > 24 ? name.substring(0, 22) + "..." : name}
          </text>

          {/* Thin separator line */}
          <line
            x1="12"
            y1="34"
            x2={w - 12}
            y2="34"
            stroke={cardBorder}
            strokeOpacity="0.4"
            strokeWidth="0.8"
          />

          {/* Person Name with Avatar Dot */}
          <circle cx="17" cy="48" r="4.5" fill={accent} fillOpacity="0.8" />
          <text
            x="26"
            y="52"
            fontSize="11"
            fontWeight="600"
            fontFamily={s.fontFamily || "system-ui, sans-serif"}
            fill={subColor}
          >
            {(person || role || "Nama Pejabat").length > 22
              ? (person || role || "Nama Pejabat").substring(0, 20) + "..."
              : person || role || "Nama Pejabat"}
          </text>

          {/* Department / Unit subtitle */}
          <text
            x="26"
            y="67"
            fontSize="9.5"
            fontWeight="normal"
            fontFamily={s.fontFamily || "system-ui, sans-serif"}
            fill={deptColor}
          >
            {(department || "Unit Organisasi").length > 26
              ? (department || "Unit Organisasi").substring(0, 24) + "..."
              : department || "Unit Organisasi"}
          </text>
        </g>
      )}
    </g>
  );
}
