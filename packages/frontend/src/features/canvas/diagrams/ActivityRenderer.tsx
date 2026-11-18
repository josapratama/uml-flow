import type { Diagram } from "@uml-editor/shared";

interface Props {
  diagram: Diagram;
}

/**
 * Renders swimlane background columns for Activity Diagrams.
 * This is rendered BEHIND the generic nodes/edges so interactivity is preserved.
 * Supports dark & light mode styling and clear actor partition boundaries.
 */
export function ActivityRenderer({ diagram }: Props) {
  const swimlanes = diagram.swimlanes || [];
  if (swimlanes.length === 0) return null;

  const nodes = diagram.nodes;
  const padding = 36;

  // Calculate bounds from actual node positions
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const n of nodes) {
    minX = Math.min(minX, n.position.x);
    minY = Math.min(minY, n.position.y);
    maxX = Math.max(maxX, n.position.x + n.size.width);
    maxY = Math.max(maxY, n.position.y + n.size.height);
  }
  if (!isFinite(minX)) {
    minX = 0;
    minY = 0;
    maxX = 700;
    maxY = 500;
  }

  const headerHeight = 40;
  const totalHeight = Math.max(maxY - minY + padding * 2 + headerHeight, 400);
  const laneWidth = Math.max((maxX - minX + padding * 2) / swimlanes.length, 220);
  const startX = minX - padding;
  const startY = minY - padding - headerHeight;

  return (
    <g className="swimlane-background pointer-events-none select-none">
      {swimlanes.map((lane, i) => {
        const x = startX + i * laneWidth;
        return (
          <g key={`lane_${i}`}>
            {/* Lane background */}
            <rect
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
            {/* Lane header */}
            <rect
              x={x}
              y={startY}
              width={laneWidth}
              height={headerHeight}
              fill="rgba(99, 102, 241, 0.15)"
              stroke="rgba(148, 163, 184, 0.6)"
              strokeWidth="1"
            />
            {/* Top decorative accent bar */}
            <rect
              x={x}
              y={startY}
              width={laneWidth}
              height={3}
              fill="#6366f1"
            />
            {/* Lane title */}
            <text
              x={x + laneWidth / 2}
              y={startY + headerHeight / 2 + 5}
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              fill="#818cf8"
              letterSpacing="0.3"
            >
              {lane}
            </text>
          </g>
        );
      })}
    </g>
  );
}
