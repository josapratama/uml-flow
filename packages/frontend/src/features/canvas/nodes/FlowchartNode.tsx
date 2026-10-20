import React from "react";
import type { FlowchartNode } from "@uml-editor/shared";
import { resolveStyle, getStroke, getStrokeWidth } from "./useNodeStyle";
import { SvgMultilineText } from "./SvgMultilineText";

interface Props {
  node: FlowchartNode;
  isSelected: boolean;
  onDragStart: (e: React.MouseEvent) => void;
}

export function FlowchartNodeRenderer({
  node,
  isSelected,
  onDragStart,
}: Props) {
  const { position, size, name, type } = node;
  const s = resolveStyle((node as any).style);
  const stroke = getStroke(s, isSelected);
  const sw = getStrokeWidth(s, isSelected);
  const cx = size.width / 2,
    cy = size.height / 2;

  const renderShape = () => {
    switch (type) {
      case "start":
      case "end":
        return (
          <g>
            <ellipse
              cx={cx}
              cy={cy}
              rx={cx - 2}
              ry={cy - 2}
              fill={
                type === "start"
                  ? s.backgroundColor === "#ffffff"
                    ? "#C8E6C9"
                    : s.backgroundColor
                  : s.backgroundColor === "#ffffff"
                    ? "#FFCDD2"
                    : s.backgroundColor
              }
              stroke={stroke}
              strokeWidth={sw}
            />
            <SvgMultilineText
              text={name}
              cx={cx}
              cy={cy}
              fontSize={s.fontSize}
              fontFamily={s.fontFamily}
              fill={s.fontColor}
              fontWeight={s.fontWeight}
              fontStyle={s.fontStyle}
              maxWidth={size.width - 8}
            />
          </g>
        );
      case "process":
        return (
          <g>
            <rect
              x="0"
              y="0"
              width={size.width}
              height={size.height}
              rx={s.borderRadius}
              fill={
                (node as any).style ? s.backgroundColor : "#E3F2FD"
              }
              stroke={stroke}
              strokeWidth={sw}
            />
            <SvgMultilineText
              text={name}
              cx={cx}
              cy={cy}
              fontSize={s.fontSize}
              fontFamily={s.fontFamily}
              fill={s.fontColor}
              fontWeight={s.fontWeight}
              fontStyle={s.fontStyle}
              maxWidth={size.width - 16}
            />
          </g>
        );
      case "decision":
        return (
          <g>
            <polygon
              points={`${cx},2 ${size.width - 2},${cy} ${cx},${size.height - 2} 2,${cy}`}
              fill={
                (node as any).style ? s.backgroundColor : "#FFF9C4"
              }
              stroke={stroke}
              strokeWidth={sw}
            />
            <SvgMultilineText
              text={name}
              cx={cx}
              cy={cy}
              fontSize={s.fontSize}
              fontFamily={s.fontFamily}
              fill={s.fontColor}
              fontWeight={s.fontWeight}
              maxWidth={size.width * 0.72}
            />
          </g>
        );
      case "io": {
        const skew = 15;
        return (
          <g>
            <polygon
              points={`${skew},0 ${size.width},0 ${size.width - skew},${size.height} 0,${size.height}`}
              fill={
                (node as any).style ? s.backgroundColor : "#F3E5F5"
              }
              stroke={stroke}
              strokeWidth={sw}
            />
            <SvgMultilineText
              text={name}
              cx={cx}
              cy={cy}
              fontSize={s.fontSize}
              fontFamily={s.fontFamily}
              fill={s.fontColor}
              fontWeight={s.fontWeight}
              fontStyle={s.fontStyle}
              maxWidth={size.width - 32}
            />
          </g>
        );
      }
      case "document":
        return (
          <g>
            <path
              d={`M 0 0 H ${size.width} V ${size.height - 10} Q ${size.width * 0.75} ${size.height - 20} ${size.width / 2} ${size.height - 10} Q ${size.width * 0.25} ${size.height} 0 ${size.height - 10} Z`}
              fill={
                (node as any).style ? s.backgroundColor : "#FFF3E0"
              }
              stroke={stroke}
              strokeWidth={sw}
            />
            <SvgMultilineText
              text={name}
              cx={cx}
              cy={cy - 4}
              fontSize={s.fontSize}
              fontFamily={s.fontFamily}
              fill={s.fontColor}
              fontWeight={s.fontWeight}
              fontStyle={s.fontStyle}
              maxWidth={size.width - 16}
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
              fill={
                (node as any).style ? s.backgroundColor : "#E8F5E9"
              }
              stroke={stroke}
              strokeWidth={sw}
            />
            <rect
              x="2"
              y="10"
              width={size.width - 4}
              height={size.height - 20}
              fill={
                (node as any).style ? s.backgroundColor : "#E8F5E9"
              }
              stroke={stroke}
              strokeWidth={sw}
            />
            <ellipse
              cx={cx}
              cy={size.height - 10}
              rx={cx - 2}
              ry={10}
              fill={
                (node as any).style ? s.backgroundColor : "#E8F5E9"
              }
              stroke={stroke}
              strokeWidth={sw}
            />
            <SvgMultilineText
              text={name}
              cx={cx}
              cy={cy + 4}
              fontSize={s.fontSize}
              fontFamily={s.fontFamily}
              fill={s.fontColor}
              fontWeight={s.fontWeight}
              fontStyle={s.fontStyle}
              maxWidth={size.width - 16}
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
              fill={
                (node as any).style ? s.backgroundColor : "#E0F7FA"
              }
              stroke={stroke}
              strokeWidth={sw}
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
              fill={s.fontColor}
              fontWeight={s.fontWeight}
              fontStyle={s.fontStyle}
              maxWidth={size.width - 28}
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
              fill={s.backgroundColor}
              stroke={stroke}
              strokeWidth={sw}
            />
            <SvgMultilineText
              text={name}
              cx={cx}
              cy={cy}
              fontSize={s.fontSize}
              fontFamily={s.fontFamily}
              fill={s.fontColor}
              fontWeight={s.fontWeight}
              maxWidth={size.width - 4}
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
              fill={s.backgroundColor}
              stroke={stroke}
              strokeWidth={sw}
            />
            <SvgMultilineText
              text={name}
              cx={cx}
              cy={cy}
              fontSize={s.fontSize}
              fontFamily={s.fontFamily}
              fill={s.fontColor}
              fontWeight={s.fontWeight}
              fontStyle={s.fontStyle}
              maxWidth={size.width - 16}
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
