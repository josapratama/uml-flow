import React from "react";

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

  // Split by explicit newline
  const rawLines = text.split("\n");
  const lines: string[] = [];

  // Wrap lines if maxWidth is specified and text exceeds available width
  const approxCharWidth = fontSize * 0.58;
  const maxChars = maxWidth
    ? Math.max(12, Math.floor((maxWidth - 20) / approxCharWidth))
    : 999;

  for (const rawLine of rawLines) {
    if (rawLine.length <= maxChars) {
      lines.push(rawLine);
    } else {
      const words = rawLine.split(" ");
      let currentLine = "";
      for (const word of words) {
        if (!currentLine) {
          currentLine = word;
        } else if ((currentLine + " " + word).length <= maxChars) {
          currentLine += " " + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      if (currentLine) lines.push(currentLine);
    }
  }

  const totalHeight = lines.length * lineHeight;
  // Calculate startY so the multiline block is vertically centered around cy
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
        <tspan key={i} x={cx} dy={i === 0 ? 0 : lineHeight}>
          {line}
        </tspan>
      ))}
    </text>
  );
}
