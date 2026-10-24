import React from "react";
import type { SequenceParticipant, SequenceMessage, SequenceFragment } from "@uml-editor/shared";

export function FragmentBox({
  fragment,
  theme = "dark",
  participants,
  messages,
  startY,
  msgSpacing,
}: {
  fragment: SequenceFragment;
  theme?: "light" | "dark";
  participants: SequenceParticipant[];
  messages: SequenceMessage[];
  startY: number;
  msgSpacing: number;
}) {
  const isDark = theme === "dark";
  const stroke = isDark ? "#4f46e5" : "#888";
  const bgFill = isDark ? "rgba(99,102,241,0.06)" : "rgba(200,200,200,0.05)";
  const headerFill = isDark ? "#1e1e38" : "#f0f0f0";
  const typeText = isDark ? "#a5b4fc" : "#555";
  const labelText = isDark ? "#cbd5e1" : "#666";

  const y1 = startY + fragment.startOrder * msgSpacing - 10;
  const y2 =
    startY +
    (fragment.endOrder >= 0 ? fragment.endOrder + 1 : messages.length) *
      msgSpacing +
    10;
  const minX = Math.min(...participants.map((p) => p.position.x)) - 30;
  const maxX = Math.max(...participants.map((p) => p.position.x)) + 30;
  return (
    <g>
      <rect
        x={minX}
        y={y1}
        width={maxX - minX}
        height={y2 - y1}
        fill={bgFill}
        stroke={stroke}
        strokeWidth="1"
        rx="4"
      />
      <rect
        x={minX}
        y={y1}
        width="50"
        height="18"
        fill={headerFill}
        stroke={stroke}
        strokeWidth="1"
        rx="2"
      />
      <text
        x={minX + 25}
        y={y1 + 13}
        textAnchor="middle"
        fontSize="10"
        fontWeight="bold"
        fill={typeText}
      >
        {fragment.type}
      </text>
      {fragment.label && (
        <text x={minX + 56} y={y1 + 13} fontSize="10" fill={labelText}>
          [{fragment.label}]
        </text>
      )}
      {fragment.conditions?.map((cond, i) => {
        const condY =
          y1 + ((y2 - y1) / (fragment.conditions!.length + 1)) * (i + 1);
        return (
          <g key={`cond_${i}`}>
            <line
              x1={minX}
              y1={condY}
              x2={maxX}
              y2={condY}
              stroke={stroke}
              strokeWidth="0.5"
              strokeDasharray="3,3"
            />
            <text
              x={minX + 8}
              y={condY + 12}
              fontSize="9"
              fill={labelText}
              fontStyle="italic"
            >
              [{cond}]
            </text>
          </g>
        );
      })}
    </g>
  );
}
