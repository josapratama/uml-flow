export interface SwimlaneMetrics {
  startX: number;
  startY: number;
  colWidth: number;
  totalHeight: number;
  headerHeight: number;
  totalWidth: number;
}

/**
 * Standardized swimlane column calculation across Layout Engine, Canvas Renderer,
 * Drag-Drop detection, and SVG Exporter.
 */
export function computeSwimlaneMetrics(
  nodes: Array<{ position: { x: number; y: number }; size: { width: number; height: number } }>,
  swimlanes: string[],
): SwimlaneMetrics {
  const laneCount = Math.max(1, swimlanes.length);

  let minNodeX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  let maxNodeW = 140;

  for (const n of nodes) {
    minNodeX = Math.min(minNodeX, n.position.x);
    minY = Math.min(minY, n.position.y);
    maxX = Math.max(maxX, n.position.x + (n.size?.width || 120));
    maxY = Math.max(maxY, n.position.y + (n.size?.height || 50));
    if (n.size?.width && n.size.width > maxNodeW) maxNodeW = n.size.width;
  }

  if (!isFinite(minNodeX)) {
    minNodeX = 60;
    minY = 80;
    maxX = 700;
    maxY = 500;
  }

  const minColWidth = 260;
  const colWidth = Math.max(minColWidth, maxNodeW + 60);
  const startX = minNodeX < 70 ? Math.max(20, minNodeX - 30) : 60;
  const headerHeight = 40;
  const padding = 36;
  const startY = Math.min(minY - 50, 40);
  const totalHeight = Math.max(maxY - startY + padding, 400);

  return {
    startX,
    startY,
    colWidth,
    totalHeight,
    headerHeight,
    totalWidth: colWidth * laneCount,
  };
}
