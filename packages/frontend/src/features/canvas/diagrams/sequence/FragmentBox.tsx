import React from "react";
import type { SequenceParticipant, SequenceMessage, SequenceFragment } from "@uml-editor/shared";

export function FragmentBox({
  fragment,
  participants,
  messages,
  startY,
  msgSpacing,
}: {
  fragment: SequenceFragment;
  participants: SequenceParticipant[];
  messages: SequenceMessage[];
  startY: number;
  msgSpacing: number;
}) {
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
        fill="rgba(200,200,200,0.05)"
        stroke="#888"
        strokeWidth="1"
        rx="2"
      />
      <rect
        x={minX}
        y={y1}
        width="50"
        height="18"
        fill="#f0f0f0"
        stroke="#888"
        strokeWidth="1"
      />
      <text
        x={minX + 25}
        y={y1 + 13}
        textAnchor="middle"
        fontSize="10"
        fontWeight="bold"
        fill="#555"
      >
        {fragment.type}
      </text>
      {fragment.label && (
        <text x={minX + 56} y={y1 + 13} fontSize="10" fill="#666">
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
              stroke="#888"
              strokeWidth="0.5"
              strokeDasharray="3,3"
            />
            <text
              x={minX + 8}
              y={condY + 12}
              fontSize="9"
              fill="#666"
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
