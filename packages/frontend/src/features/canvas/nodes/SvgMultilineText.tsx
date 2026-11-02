import React from "react";
import { wrapMultilineText } from "@uml-editor/shared";

interface Props {
  text: string;
  cx: number;
  cy: number;
  fontSize: number;
  fontFamily: string;
  fill: string;
  fontWeight?: string | number;
  fontStyle?: string;
  maxWidth?: number;
  lineHeight?: number;
}

export function SvgMultilineText({
  text,
  cx,
  cy,
  fontSize,
  fontFamily,
  fill,
  fontWeight,
  fontStyle,
  maxWidth,
  lineHeight = fontSize + 4,
}: Props) {
  if (!text) return null;

  const approxCharWidth = fontSize * 0.58;
  const maxChars = maxWidth
    ? Math.max(12, Math.floor((maxWidth - 16) / approxCharWidth))
    : 999;

  const { lines, isHeaderLine } = wrapMultilineText(text, maxChars);
  if (lines.length === 0) return null;

  const totalHeight = lines.length * lineHeight;
  const startY = cy - totalHeight / 2 + lineHeight * 0.72;

  return (
    <text
      x={cx}
      y={startY}
      textAnchor="middle"
      fontSize={fontSize}
      fontFamily={fontFamily}
      fill={fill}
      fontWeight={fontWeight}
      fontStyle={fontStyle}
    >
      {lines.map((line, i) => (
        <tspan
          key={i}
          x={cx}
          dy={i === 0 ? 0 : lineHeight}
          fontWeight={
            isHeaderLine[i] && (!fontWeight || fontWeight === "normal")
              ? 600
              : undefined
          }
        >
          {line}
        </tspan>
      ))}
    </text>
  );
}
