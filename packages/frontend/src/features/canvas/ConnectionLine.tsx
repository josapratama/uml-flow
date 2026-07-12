import React from "react";
import type { Position } from "@uml-editor/shared";

interface Props {
  from: Position;
  to: Position;
}

/**
 * Temporary line shown while user is dragging from an anchor to create a new edge.
 * Animated dashed line with arrow indicator.
 */
export function ConnectionLine({ from, to }: Props) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  return (
    <g className="connection-line" style={{ pointerEvents: "none" }}>
      {/* Main dashed line */}
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke="#6366f1"
        strokeWidth="2"
        strokeDasharray="6,4"
        opacity="0.8"
        markerEnd="url(#arrow-flow)"
      />
      {/* Source anchor highlight */}
      <circle cx={from.x} cy={from.y} r={6} fill="#6366f1" opacity="0.4" />
      {/* Target cursor dot */}
      {dist > 10 && (
        <circle
          cx={to.x}
          cy={to.y}
          r={4}
          fill="#6366f1"
          stroke="white"
          strokeWidth="1.5"
          opacity="0.7"
        />
      )}
    </g>
  );
}
