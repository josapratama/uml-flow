import React, { useState } from "react";
import { computeSwimlaneMetrics, type Diagram } from "@uml-editor/shared";
import { SvgInlineInput } from "./sequence/SvgInlineInput";

interface Props {
  diagram: Diagram;
  onSwimlaneRename?: (index: number, newName: string) => void;
  onSwimlaneAdd?: (name?: string) => void;
  onSwimlaneDelete?: (index: number) => void;
}

/**
 * Renders swimlane background columns for Activity Diagrams with interactive header management.
 * Background columns are pointer-events-none so nodes/edges can be manipulated freely,
 * while headers allow double-click renaming, adding (+), and deleting (x) swimlanes.
 */
export function ActivityRenderer({
  diagram,
  onSwimlaneRename,
  onSwimlaneAdd,
  onSwimlaneDelete,
}: Props) {
  const swimlanes = diagram.swimlanes || [];
  if (swimlanes.length === 0) return null;

  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editVal, setEditVal] = useState("");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const nodes = diagram.nodes;
  const { startX, startY, colWidth: laneWidth, totalHeight, headerHeight } = computeSwimlaneMetrics(
    nodes,
    swimlanes,
  );

  const startRename = (i: number, name: string) => {
    setEditingIdx(i);
    setEditVal(name);
  };

  const commitRename = () => {
    if (editingIdx !== null && editVal.trim()) {
      onSwimlaneRename?.(editingIdx, editVal.trim());
    }
    setEditingIdx(null);
  };

  const cancelRename = () => {
    setEditingIdx(null);
  };

  return (
    <g className="swimlane-system select-none">
      {/* Background columns - pointer-events-none so node/edge drag works smoothly */}
      <g className="swimlane-background pointer-events-none">
        {swimlanes.map((lane, i) => {
          const x = startX + i * laneWidth;
          return (
            <rect
              key={`lane_bg_${i}`}
              x={x}
              y={startY}
              width={laneWidth}
              height={totalHeight}
              fill={
                i % 2 === 0
                  ? "rgba(99, 102, 241, 0.03)"
                  : "rgba(99, 102, 241, 0.07)"
              }
              stroke="rgba(148, 163, 184, 0.4)"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          );
        })}
      </g>

      {/* Interactive headers */}
      <g className="swimlane-headers pointer-events-auto">
        {swimlanes.map((lane, i) => {
          const x = startX + i * laneWidth;
          const isEditing = editingIdx === i;
          const isHovered = hoveredIdx === i;
          const isOnlyLane = swimlanes.length <= 1;

          return (
            <g
              key={`lane_hdr_${i}`}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer"
            >
              {/* Lane header background */}
              <rect
                x={x}
                y={startY}
                width={laneWidth}
                height={headerHeight}
                fill={isHovered ? "rgba(99, 102, 241, 0.22)" : "rgba(99, 102, 241, 0.15)"}
                stroke="rgba(148, 163, 184, 0.6)"
                strokeWidth="1"
                onDoubleClick={() => startRename(i, lane)}
              />
              {/* Top decorative accent bar */}
              <rect
                x={x}
                y={startY}
                width={laneWidth}
                height={3}
                fill="#6366f1"
              />

              {/* Lane title or inline input */}
              {isEditing ? (
                <SvgInlineInput
                  x={x + 16}
                  y={startY + headerHeight / 2 + 3}
                  width={laneWidth - 32}
                  value={editVal}
                  onChange={setEditVal}
                  onCommit={commitRename}
                  onCancel={cancelRename}
                />
              ) : (
                <text
                  x={x + laneWidth / 2}
                  y={startY + headerHeight / 2 + 5}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="700"
                  fill="#818cf8"
                  letterSpacing="0.3"
                  onDoubleClick={() => startRename(i, lane)}
                >
                  {lane}
                </text>
              )}

              {/* Delete button (x) on hover */}
              {isHovered && !isEditing && !isOnlyLane && (
                <g
                  onClick={(e) => {
                    e.stopPropagation();
                    onSwimlaneDelete?.(i);
                  }}
                  className="cursor-pointer"
                  opacity="0.8"
                >
                  <circle
                    cx={x + laneWidth - 14}
                    cy={startY + 15}
                    r="8"
                    fill="rgba(239, 68, 68, 0.2)"
                    stroke="#ef4444"
                    strokeWidth="1"
                  />
                  <line
                    x1={x + laneWidth - 17}
                    y1={startY + 12}
                    x2={x + laneWidth - 11}
                    y2={startY + 18}
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <line
                    x1={x + laneWidth - 11}
                    y1={startY + 12}
                    x2={x + laneWidth - 17}
                    y2={startY + 18}
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </g>
              )}
            </g>
          );
        })}

        {/* Add Swimlane (+) button at the end of header row */}
        {onSwimlaneAdd && (
          <g
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onSwimlaneAdd();
            }}
          >
            <rect
              x={startX + swimlanes.length * laneWidth + 8}
              y={startY + 4}
              width={26}
              height={26}
              rx={6}
              fill="rgba(99, 102, 241, 0.15)"
              stroke="#6366f1"
              strokeWidth="1.5"
            />
            <line
              x1={startX + swimlanes.length * laneWidth + 21}
              y1={startY + 11}
              x2={startX + swimlanes.length * laneWidth + 21}
              y2={startY + 23}
              stroke="#6366f1"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1={startX + swimlanes.length * laneWidth + 15}
              y1={startY + 17}
              x2={startX + swimlanes.length * laneWidth + 27}
              y2={startY + 17}
              stroke="#6366f1"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        )}
      </g>
    </g>
  );
}
