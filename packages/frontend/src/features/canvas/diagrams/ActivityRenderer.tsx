import type { Diagram } from "@uml-editor/shared";

interface Props {
  diagram: Diagram;
}

/**
 * Renders swimlane background columns for Activity Diagrams.
 * This is rendered BEHIND the generic nodes/edges so interactivity is preserved.
 * Only renders when diagram has swimlanes defined.
 */
export function ActivityRenderer({ diagram }: Props) {
  const swimlanes = diagram.swimlanes || [];
  if (swimlanes.length === 0) return null;

  const nodes = diagram.nodes;
  const padding = 30;

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
    maxX = 600;
    maxY = 400;
  }

  const headerHeight = 36;
  const totalHeight = maxY - minY + padding * 2 + headerHeight;
  const laneWidth = (maxX - minX + padding * 2) / swimlanes.length;
  const startX = minX - padding;
  const startY = minY - padding - headerHeight;

  return (
    <g className="swimlane-background" opacity="0.6">
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
                  : "rgba(99, 102, 241, 0.06)"
              }
              stroke="#cbd5e1"
              strokeWidth="0.5"
            />
            {/* Lane header */}
            <rect
              x={x}
              y={startY}
              width={laneWidth}
              height={headerHeight}
              fill="rgba(99, 102, 241, 0.08)"
              stroke="#cbd5e1"
              strokeWidth="0.5"
            />
            {/* Lane title */}
            <text
              x={x + laneWidth / 2}
              y={startY + headerHeight / 2 + 4}
              textAnchor="middle"
              fontSize="11"
              fontWeight="600"
              fill="#64748b"
            >
              {lane}
            </text>
          </g>
        );
      })}
    </g>
  );
}
