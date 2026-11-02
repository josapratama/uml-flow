import React from "react";
import {
  getInnerTextMaxWidth,
  type FlowchartNode,
} from "@uml-editor/shared";
import {
  resolveStyle,
  getStrokeWidth,
  isDarkCanvas,
  getFlowchartColors,
} from "./useNodeStyle";
import { SvgMultilineText } from "./SvgMultilineText";
import { getVisualSize } from "./getVisualSize";

interface Props {
  node: FlowchartNode;
  isSelected: boolean;
  onDragStart: (e: React.MouseEvent) => void;
  canvasTheme?: string;
  hideText?: boolean;
}

export function FlowchartNodeRenderer({
  node,
  isSelected,
  onDragStart,
  canvasTheme,
  hideText,
}: Props) {
  const { position, name: rawName, type } = node;
  const name = hideText ? "" : rawName;
  const size = getVisualSize(node);
  const isDark = isDarkCanvas(canvasTheme);
  const colors = getFlowchartColors(type, isDark, (node as any).style);
  const s = resolveStyle((node as any).style, canvasTheme);
  const stroke = isSelected ? "#818cf8" : colors.border;
  const sw = s.borderStyle === "none" && !isSelected ? 0 : getStrokeWidth(s, isSelected);
  const dash = s.borderStyle === "dashed" ? "6 4" : s.borderStyle === "dotted" ? "2 3" : undefined;
  const fill = colors.bg;
  const fontFill = colors.font;
  const cx = size.width / 2,
    cy = size.height / 2;
  const textMaxW = getInnerTextMaxWidth(type, size.width);

  const renderShape = () => {
    switch (type) {
      case "start":
      case "end": {
        const pillRx = Math.min((size.width - 4) / 2, (size.height - 4) / 2, (node as any).style?.borderRadius !== undefined ? (node as any).style.borderRadius : 28);
        return (
          <g>
            <rect
              x="2"
              y="2"
              width={size.width - 4}
              height={size.height - 4}
              rx={pillRx}
              ry={pillRx}
              fill={fill}
              stroke={stroke}
              strokeWidth={sw}
              strokeDasharray={dash}
            />
            <SvgMultilineText
              text={name}
              cx={cx}
              cy={cy}
              fontSize={s.fontSize}
              fontFamily={s.fontFamily}
              fill={fontFill}
              fontWeight={s.fontWeight === "normal" ? 600 : s.fontWeight}
              fontStyle={s.fontStyle}
              maxWidth={textMaxW}
            />
          </g>
        );
      }
      case "process":
        return (
          <g>
            <rect
              x="0"
              y="0"
              width={size.width}
              height={size.height}
              rx={s.borderRadius}
              fill={fill}
              stroke={stroke}
              strokeWidth={sw}
              strokeDasharray={dash}
            />
            <SvgMultilineText
              text={name}
              cx={cx}
              cy={cy}
              fontSize={s.fontSize}
              fontFamily={s.fontFamily}
              fill={fontFill}
              fontWeight={s.fontWeight}
              fontStyle={s.fontStyle}
              maxWidth={textMaxW}
            />
          </g>
        );
      case "decision":
        return (
          <g>
            <polygon
              points={`${cx},2 ${size.width - 2},${cy} ${cx},${size.height - 2} 2,${cy}`}
              fill={fill}
              stroke={stroke}
              strokeWidth={sw}
              strokeDasharray={dash}
            />
            <SvgMultilineText
              text={name}
              cx={cx}
              cy={cy}
              fontSize={s.fontSize}
              fontFamily={s.fontFamily}
              fill={fontFill}
              fontWeight={s.fontWeight}
              maxWidth={textMaxW}
            />
          </g>
        );
      case "io": {
        const skew = 15;
        return (
          <g>
            <polygon
              points={`${skew},0 ${size.width},0 ${size.width - skew},${size.height} 0,${size.height}`}
              fill={fill}
              stroke={stroke}
              strokeWidth={sw}
              strokeDasharray={dash}
            />
            <SvgMultilineText
              text={name}
              cx={cx}
              cy={cy}
              fontSize={s.fontSize}
              fontFamily={s.fontFamily}
              fill={fontFill}
              fontWeight={s.fontWeight}
              fontStyle={s.fontStyle}
              maxWidth={textMaxW}
            />
          </g>
        );
      }
      case "document":
        return (
          <g>
            <path
              d={`M 0 0 H ${size.width} V ${size.height - 10} Q ${size.width * 0.75} ${size.height - 20} ${size.width / 2} ${size.height - 10} Q ${size.width * 0.25} ${size.height} 0 ${size.height - 10} Z`}
              fill={fill}
              stroke={stroke}
              strokeWidth={sw}
              strokeDasharray={dash}
            />
            <SvgMultilineText
              text={name}
              cx={cx}
              cy={cy - 4}
              fontSize={s.fontSize}
              fontFamily={s.fontFamily}
              fill={fontFill}
              fontWeight={s.fontWeight}
              fontStyle={s.fontStyle}
              maxWidth={textMaxW}
            />
          </g>
        );
      case "database":
        return (
          <g>
            <ellipse
              cx={cx}
              cy={10}
              rx={cx - 2}
              ry={10}
              fill={fill}
              stroke={stroke}
              strokeWidth={sw}
              strokeDasharray={dash}
            />
            <rect
              x="2"
              y="10"
              width={size.width - 4}
              height={size.height - 20}
              fill={fill}
              stroke={stroke}
              strokeWidth={sw}
              strokeDasharray={dash}
            />
            <ellipse
              cx={cx}
              cy={size.height - 10}
              rx={cx - 2}
              ry={10}
              fill={fill}
              stroke={stroke}
              strokeWidth={sw}
              strokeDasharray={dash}
            />
            <SvgMultilineText
              text={name}
              cx={cx}
              cy={cy + 4}
              fontSize={s.fontSize}
              fontFamily={s.fontFamily}
              fill={fontFill}
              fontWeight={s.fontWeight}
              fontStyle={s.fontStyle}
              maxWidth={textMaxW}
            />
          </g>
        );
      case "subroutine":
        return (
          <g>
            <rect
              x="0"
              y="0"
              width={size.width}
              height={size.height}
              rx={s.borderRadius}
              fill={fill}
              stroke={stroke}
              strokeWidth={sw}
              strokeDasharray={dash}
            />
            <line
              x1="10"
              y1="0"
              x2="10"
              y2={size.height}
              stroke={stroke}
              strokeWidth="1"
            />
            <line
              x1={size.width - 10}
              y1="0"
              x2={size.width - 10}
              y2={size.height}
              stroke={stroke}
              strokeWidth="1"
            />
            <SvgMultilineText
              text={name}
              cx={cx}
              cy={cy}
              fontSize={s.fontSize}
              fontFamily={s.fontFamily}
              fill={fontFill}
              fontWeight={s.fontWeight}
              fontStyle={s.fontStyle}
              maxWidth={textMaxW}
            />
          </g>
        );
      case "connector":
        return (
          <g>
            <circle
              cx={cx}
              cy={cy}
              r={Math.min(cx, cy) - 2}
              fill={fill}
              stroke={stroke}
              strokeWidth={sw}
              strokeDasharray={dash}
            />
            <SvgMultilineText
              text={name}
              cx={cx}
              cy={cy}
              fontSize={s.fontSize}
              fontFamily={s.fontFamily}
              fill={fontFill}
              fontWeight={s.fontWeight}
              maxWidth={textMaxW}
            />
          </g>
        );
      default:
        return (
          <g>
            <rect
              x="0"
              y="0"
              width={size.width}
              height={size.height}
              rx={s.borderRadius}
              fill={fill}
              stroke={stroke}
              strokeWidth={sw}
              strokeDasharray={dash}
            />
            <SvgMultilineText
              text={name}
              cx={cx}
              cy={cy}
              fontSize={s.fontSize}
              fontFamily={s.fontFamily}
              fill={fontFill}
              fontWeight={s.fontWeight}
              fontStyle={s.fontStyle}
              maxWidth={textMaxW}
            />
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
