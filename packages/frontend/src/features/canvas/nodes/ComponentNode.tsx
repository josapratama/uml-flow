import React from "react";
import { resolveStyle, getStroke, getStrokeWidth } from "./useNodeStyle";
import { SvgMultilineText } from "./SvgMultilineText";

interface Props {
  node: any;
  isSelected: boolean;
  onDragStart: (e: React.MouseEvent) => void;
  hideText?: boolean;
}

export function ComponentNodeRenderer({
  node,
  isSelected,
  onDragStart,
  hideText,
}: Props) {
  const { position, size, name, type } = node;
  const s = resolveStyle(node.style);
  const stroke = getStroke(s, isSelected);
  const sw = getStrokeWidth(s, isSelected);

  const renderShape = () => {
    if (type === "interface-provided") {
      // Filled circle (lollipop)
      const r = Math.min(size.width, size.height) / 2 - 2;
      return (
        <g>
          <circle
            cx={size.width / 2}
            cy={size.height / 2}
            r={r}
            fill={s.backgroundColor}
            stroke={stroke}
            strokeWidth={sw}
          />
          {!hideText && (
            <text
              x={size.width / 2}
              y={size.height + 14}
              textAnchor="middle"
              fontSize={s.fontSize}
              fontFamily={s.fontFamily}
              fill={s.fontColor}
            >
              {name}
            </text>
          )}
        </g>
      );
    }

    if (type === "interface-required") {
      // Half circle (socket)
      const r = Math.min(size.width, size.height) / 2 - 2;
      const cx = size.width / 2,
        cy = size.height / 2;
      return (
        <g>
          <path
            d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r}`}
            fill="none"
            stroke={stroke}
            strokeWidth={sw}
          />
          <line
            x1={cx}
            y1={cy - r}
            x2={cx}
            y2={cy + r}
            stroke={stroke}
            strokeWidth={sw}
          />
          {!hideText && (
            <text
              x={size.width / 2}
              y={size.height + 14}
              textAnchor="middle"
              fontSize={s.fontSize}
              fontFamily={s.fontFamily}
              fill={s.fontColor}
            >
              {name}
            </text>
          )}
        </g>
      );
    }

    // Default: component box with UML component icon
    return (
      <g>
        <rect
          x={0}
          y={0}
          width={size.width}
          height={size.height}
          rx={s.borderRadius || 6}
          fill={s.backgroundColor}
          stroke={stroke}
          strokeWidth={sw}
        />
        {/* UML component icon (top-right) */}
        <rect
          x={size.width - 22}
          y={8}
          width={15}
          height={11}
          fill={s.backgroundColor}
          stroke={stroke}
          strokeWidth="1"
          rx="1"
        />
        <rect
          x={size.width - 24}
          y={10}
          width={5}
          height={3}
          fill={s.backgroundColor}
          stroke={stroke}
          strokeWidth="1"
          rx="0.5"
        />
        <rect
          x={size.width - 24}
          y={15}
          width={5}
          height={3}
          fill={s.backgroundColor}
          stroke={stroke}
          strokeWidth="1"
          rx="0.5"
        />

        {/* Stereotype label */}
        <text
          x={size.width / 2 - 10}
          y={14}
          textAnchor="middle"
          fontSize="9"
          fontFamily={s.fontFamily}
          fill={s.fontColor}
          fontStyle="italic"
          opacity="0.7"
        >
          «component»
        </text>
        {!hideText && (
          <SvgMultilineText
            text={node.stereotype ? `«${node.stereotype}»\n${name}` : name}
            cx={size.width / 2 - 8}
            cy={size.height / 2 + 6}
            fontSize={s.fontSize}
            fontFamily={s.fontFamily}
            fill={s.fontColor}
            fontWeight={s.fontWeight}
            maxWidth={size.width - 32}
          />
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
