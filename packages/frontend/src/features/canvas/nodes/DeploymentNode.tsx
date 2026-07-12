import React from "react";
import { resolveStyle, getStroke, getStrokeWidth } from "./useNodeStyle";

interface Props {
  node: any;
  isSelected: boolean;
  onDragStart: (e: React.MouseEvent) => void;
  hideText?: boolean;
}

export function DeploymentNodeRenderer({
  node,
  isSelected,
  onDragStart,
  hideText,
}: Props) {
  const { position, size, name, type } = node;
  const s = resolveStyle(node.style);
  const stroke = getStroke(s, isSelected);
  const sw = getStrokeWidth(s, isSelected);

  const d3 = 10; // 3D offset

  const renderShape = () => {
    if (type === "artifact") {
      // Document-like shape
      const dogear = 12;
      return (
        <g>
          <path
            d={`M 0 0 L ${size.width - dogear} 0 L ${size.width} ${dogear} L ${size.width} ${size.height} L 0 ${size.height} Z`}
            fill={s.backgroundColor || "white"}
            stroke={stroke}
            strokeWidth={sw}
          />
          <path
            d={`M ${size.width - dogear} 0 L ${size.width - dogear} ${dogear} L ${size.width} ${dogear}`}
            fill="none"
            stroke={stroke}
            strokeWidth={sw}
          />
          <text
            x={size.width / 2}
            y={14}
            textAnchor="middle"
            fontSize="9"
            fontFamily={s.fontFamily}
            fill={s.fontColor}
            fontStyle="italic"
            opacity="0.7"
          >
            «artifact»
          </text>
          {!hideText && (
            <text
              x={size.width / 2}
              y={size.height / 2 + 8}
              textAnchor="middle"
              fontSize={s.fontSize}
              fontFamily={s.fontFamily}
              fill={s.fontColor}
              fontWeight={s.fontWeight}
            >
              {name}
            </text>
          )}
        </g>
      );
    }

    if (type === "component") {
      // Simple component box
      return (
        <g>
          <rect
            x={0}
            y={0}
            width={size.width}
            height={size.height}
            rx="3"
            fill={s.backgroundColor || "#E8F4FD"}
            stroke={stroke}
            strokeWidth={sw}
          />
          {!hideText && (
            <text
              x={size.width / 2}
              y={size.height / 2 + 4}
              textAnchor="middle"
              fontSize={s.fontSize}
              fontFamily={s.fontFamily}
              fill={s.fontColor}
              fontWeight={s.fontWeight}
            >
              {name}
            </text>
          )}
        </g>
      );
    }

    // node / device — 3D box
    const bgColor =
      type === "device"
        ? s.backgroundColor || "#F3E5F5"
        : s.backgroundColor || "#FFF8E1";
    const topColor = type === "device" ? "#E1BEE7" : "#FFECB3";
    const sideColor = type === "device" ? "#CE93D8" : "#FFE082";

    return (
      <g>
        {/* Front face */}
        <rect
          x={0}
          y={d3}
          width={size.width - d3}
          height={size.height - d3}
          fill={bgColor}
          stroke={stroke}
          strokeWidth={sw}
        />
        {/* Top face */}
        <polygon
          points={`0,${d3} ${d3},0 ${size.width},0 ${size.width - d3},${d3}`}
          fill={topColor}
          stroke={stroke}
          strokeWidth={sw}
        />
        {/* Right side face */}
        <polygon
          points={`${size.width - d3},${d3} ${size.width},0 ${size.width},${size.height - d3} ${size.width - d3},${size.height}`}
          fill={sideColor}
          stroke={stroke}
          strokeWidth={sw}
        />
        {/* Type label */}
        <text
          x={(size.width - d3) / 2}
          y={d3 + 14}
          textAnchor="middle"
          fontSize="9"
          fontFamily={s.fontFamily}
          fill={s.fontColor}
          fontStyle="italic"
          opacity="0.7"
        >
          «{type}»
        </text>
        {/* Name */}
        {!hideText && (
          <text
            x={(size.width - d3) / 2}
            y={(size.height + d3) / 2 + 6}
            textAnchor="middle"
            fontSize={s.fontSize}
            fontFamily={s.fontFamily}
            fill={s.fontColor}
            fontWeight={s.fontWeight}
          >
            {name}
          </text>
        )}
        {node.stereotype && (
          <text
            x={(size.width - d3) / 2}
            y={d3 + 26}
            textAnchor="middle"
            fontSize="9"
            fontFamily={s.fontFamily}
            fill={s.fontColor}
            opacity="0.6"
          >
            «{node.stereotype}»
          </text>
        )}
      </g>
    );
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
