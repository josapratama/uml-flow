import React from "react";
import type { ActivityNode } from "@uml-editor/shared";
import { resolveStyle, getStroke, getStrokeWidth } from "./useNodeStyle";
import { SvgMultilineText } from "./SvgMultilineText";

interface Props {
  node: ActivityNode;
  isSelected: boolean;
  onDragStart: (e: React.MouseEvent) => void;
}

export function ActivityNodeRenderer({ node, isSelected, onDragStart }: Props) {
  const { position, size, name, type } = node;
  const s = resolveStyle((node as any).style);
  const stroke = getStroke(s, isSelected);
  const sw = getStrokeWidth(s, isSelected);

  const renderShape = () => {
    switch (type) {
      case "start":
        return (
          <circle
            cx={size.width / 2}
            cy={size.height / 2}
            r={12}
            fill={s.borderColor}
            stroke={stroke}
            strokeWidth={sw}
          />
        );
      case "end":
        return (
          <g>
            <circle
              cx={size.width / 2}
              cy={size.height / 2}
              r={14}
              fill="none"
              stroke={s.borderColor}
              strokeWidth="2"
            />
            <circle
              cx={size.width / 2}
              cy={size.height / 2}
              r={9}
              fill={s.borderColor}
            />
          </g>
        );
      case "action":
        return (
          <g>
            <rect
              x="0"
              y="0"
              width={size.width}
              height={size.height}
              rx="10"
              fill={s.backgroundColor}
              stroke={stroke}
              strokeWidth={sw}
            />
            <SvgMultilineText
              text={name}
              cx={size.width / 2}
              cy={size.height / 2}
              fontSize={s.fontSize}
              fontFamily={s.fontFamily}
              fill={s.fontColor}
              fontWeight={s.fontWeight}
              fontStyle={s.fontStyle}
              maxWidth={size.width - 20}
            />
          </g>
        );
      case "decision": {
        const cx = size.width / 2,
          cy = size.height / 2;
        return (
          <g>
            <polygon
              points={`${cx},0 ${size.width},${cy} ${cx},${size.height} 0,${cy}`}
              fill={(node as any).style ? s.backgroundColor : "#FFF9C4"}
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
      }
      case "fork":
      case "join":
        return (
          <rect
            x="0"
            y={size.height / 2 - 3}
            width={size.width}
            height="6"
            rx="3"
            fill={s.borderColor}
          />
        );
      case "merge": {
        const mx = size.width / 2,
          my = size.height / 2;
        return (
          <polygon
            points={`${mx},0 ${size.width},${my} ${mx},${size.height} 0,${my}`}
            fill={(node as any).style ? s.backgroundColor : "#E8F5E9"}
            stroke={stroke}
            strokeWidth={sw}
          />
        );
      }
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
            <text
              x={size.width / 2}
              y={size.height / 2 + 4}
              textAnchor="middle"
              fontSize={s.fontSize}
              fontFamily={s.fontFamily}
              fill={s.fontColor}
            >
              {name}
            </text>
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
