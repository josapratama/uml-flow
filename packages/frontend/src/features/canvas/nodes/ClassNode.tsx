import React from "react";
import type { DiagramNode, ClassNode } from "@uml-editor/shared";
import { resolveStyle, getStroke, getStrokeWidth, isDarkCanvas } from "./useNodeStyle";

interface Props {
  node: DiagramNode;
  isSelected: boolean;
  hideText?: boolean;
  onDragStart: (e: React.MouseEvent) => void;
}

export function ClassNodeRenderer({
  node,
  isSelected,
  hideText,
  onDragStart,
}: Props) {
  if (!("attributes" in node)) return null;
  const cn = node as ClassNode;
  const { position, name, attributes, methods, type } = cn;
  const s = resolveStyle((cn as any).style);
  const stroke = getStroke(s, isSelected);
  const sw = getStrokeWidth(s, isSelected);

  const stereotype =
    type === "interface"
      ? "«interface»"
      : type === "abstract"
        ? "«abstract»"
        : type === "enum"
          ? "«enumeration»"
          : null;

  // Header height depends on whether there's a stereotype
  const headerH = stereotype ? 42 : 30;
  const memberFs = Math.max(10, s.fontSize - 1);
  const lineH = memberFs + 7;
  const attrH = attributes.length * lineH;
  const methodH = methods.length * lineH;
  const totalH = headerH + attrH + (methodH > 0 ? methodH + 8 : 0) + 10;

  // Width from content
  const memberCharW = memberFs * 0.62;
  const titleCharW = s.fontSize * 0.65;
  const stereoCharW = (s.fontSize - 4) * 0.58;

  const formatParams = (params: any): string => {
    if (!params) return "";
    if (typeof params === "string") return params;
    if (Array.isArray(params)) {
      return params
        .map((p) => {
          if (!p) return "";
          if (typeof p === "string") return p;
          return `${p.name || ""}${p.type ? ": " + p.type : ""}`;
        })
        .filter(Boolean)
        .join(", ");
    }
    return "";
  };

  let maxMemberLen = 0;
  for (const a of attributes)
    maxMemberLen = Math.max(
      maxMemberLen,
      `${a.visibility || ""}${a.name || ""}: ${a.type || ""}`.length,
    );
  for (const m of methods) {
    const p = formatParams(m.params);
    maxMemberLen = Math.max(
      maxMemberLen,
      `${m.visibility || ""}${m.name || ""}(${p}): ${m.returnType || "void"}`.length,
    );
  }

  const titleW = name.length * titleCharW + 30;
  const memberW = maxMemberLen * memberCharW + 24;
  const stereoW = stereotype ? stereotype.length * stereoCharW + 28 : 0;
  const totalW = Math.max(100, titleW, memberW, stereoW);

  const isDark = isDarkCanvas();
  const defaultHdrColor = isDark
    ? type === "interface"
      ? "#1e293b"
      : type === "abstract"
        ? "#2b2318"
        : type === "enum"
          ? "#192820"
          : "#25253e"
    : type === "interface"
      ? "#E3F2FD"
      : type === "abstract"
        ? "#FFF3E0"
        : type === "enum"
          ? "#E8F5E9"
          : "#F5F5F5";
  // If user has explicitly set a style (any style object exists), use their backgroundColor for header
  // Otherwise use the type-based default colors
  const hasCustomStyle =
    !!(cn as any).style && Object.keys((cn as any).style).length > 0;
  const hdrColor = hasCustomStyle ? s.backgroundColor : defaultHdrColor;

  // Text positions
  const stereoY = 15;
  const nameY = stereotype ? 34 : 20;

  return (
    <g
      className={`uml-node ${isSelected ? "selected" : ""}`}
      transform={`translate(${position.x}, ${position.y})`}
      onMouseDown={onDragStart}
      style={{ cursor: "move" }}
      opacity={s.opacity}
    >
      {/* Main box */}
      <rect
        x="0"
        y="0"
        width={totalW}
        height={totalH}
        rx={s.borderRadius}
        fill={s.backgroundColor}
        stroke={s.borderStyle === "none" ? "none" : stroke}
        strokeWidth={s.borderStyle === "none" ? 0 : sw}
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
        width={totalW - sw}
        height={headerH - sw / 2}
        rx={s.borderRadius}
        fill={hdrColor}
      />
      {/* Cover bottom corners of header */}
      <rect
        x={sw / 2}
        y={headerH - 8}
        width={totalW - sw}
        height="8"
        fill={hdrColor}
      />
      {/* Stereotype */}
      {stereotype && (
        <text
          x={totalW / 2}
          y={stereoY}
          textAnchor="middle"
          fontSize={Math.max(8, s.fontSize - 4)}
          fill={s.fontColor}
          fontFamily={s.fontFamily}
          fontStyle="italic"
          opacity="0.6"
        >
          {stereotype}
        </text>
      )}
      {/* Name */}
      {!hideText && (
        <text
          x={totalW / 2}
          y={nameY}
          textAnchor="middle"
          fontSize={s.fontSize}
          fontWeight="600"
          fill={s.fontColor}
          fontFamily={s.fontFamily}
          fontStyle={
            type === "abstract" || s.fontStyle === "italic"
              ? "italic"
              : "normal"
          }
        >
          {name}
        </text>
      )}
      {/* Header separator */}
      <line
        x1="0"
        y1={headerH}
        x2={totalW}
        y2={headerH}
        stroke={stroke}
        strokeWidth="0.5"
        opacity="0.3"
      />
      {/* Attributes */}
      {attributes.map((attr, i) => (
        <text
          key={`a${i}`}
          x="8"
          y={headerH + memberFs + 2 + i * lineH}
          fontSize={memberFs}
          fontFamily={s.fontFamily}
          fill={s.fontColor}
          opacity="0.85"
          fontStyle={s.fontStyle}
          fontWeight={s.fontWeight}
        >
          {attr.visibility}
          {attr.name}
          {attr.type ? `: ${attr.type}` : ""}
        </text>
      ))}
      {/* Method separator */}
      {methods.length > 0 && (
        <line
          x1="0"
          y1={headerH + attrH + 3}
          x2={totalW}
          y2={headerH + attrH + 3}
          stroke={stroke}
          strokeWidth="0.5"
          opacity="0.3"
        />
      )}
      {/* Methods */}
      {methods.map((m, i) => {
        const params = formatParams(m.params);
        return (
          <text
            key={`m${i}`}
            x="8"
            y={headerH + attrH + memberFs + 7 + i * lineH}
            fontSize={memberFs}
            fontFamily={s.fontFamily}
            fill={s.fontColor}
            opacity="0.85"
            fontStyle={
              m.isAbstract || s.fontStyle === "italic" ? "italic" : "normal"
            }
            fontWeight={s.fontWeight}
            textDecoration={m.isStatic ? "underline" : "none"}
          >
            {m.visibility}
            {m.name}({params}): {m.returnType}
          </text>
        );
      })}
    </g>
  );
}
