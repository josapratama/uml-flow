import type { DiagramNode, Position } from "@uml-editor/shared";
import {
  getNodeBounds,
  getExitPoint,
  getStubPoint,
  pointInsideBounds,
} from "./edge-geometry";

/**
 * Builds a straight-line path between two points.
 * Used for edges without explicit anchors.
 */
export function buildStraightPath(
  source: Position,
  target: Position,
): Position[] {
  return [source, target];
}

/**
 * Builds an orthogonal path that respects anchor directions and avoids overlapping nodes.
 * Uses the bounding boxes of source and target nodes to route around them.
 *
 * Routing strategy:
 * 1. Exit perpendicular to the anchor face (just outside node boundary)
 * 2. Route with L-shape if possible (no node overlap at corner)
 * 3. Otherwise route with U-shape around both nodes
 */
export function buildAnchorAwarePath(
  source: Position,
  target: Position,
  sourceAnchor?: string,
  targetAnchor?: string,
  sourceNode?: DiagramNode,
  targetNode?: DiagramNode,
): Position[] {
  const PAD = 20;

  const sBounds = sourceNode ? getNodeBounds(sourceNode, PAD) : null;
  const tBounds = targetNode ? getNodeBounds(targetNode, PAD) : null;

  // Exit/entry points just outside node boundaries
  const sExit = sBounds
    ? getExitPoint(source, sourceAnchor, sBounds)
    : getStubPoint(source, sourceAnchor, 30);
  const tEntry = tBounds
    ? getExitPoint(target, targetAnchor, tBounds)
    : getStubPoint(target, targetAnchor, 30);

  const points: Position[] = [source, sExit];

  const sourceIsHoriz = sourceAnchor === "left" || sourceAnchor === "right";
  const targetIsHoriz = targetAnchor === "left" || targetAnchor === "right";

  if (sourceIsHoriz && targetIsHoriz) {
    routeBothHorizontal(points, sExit, tEntry);
  } else if (!sourceIsHoriz && !targetIsHoriz) {
    routeBothVertical(points, sExit, tEntry);
  } else if (!sourceIsHoriz && targetIsHoriz) {
    routeVerticalToHorizontal(
      points,
      sExit,
      tEntry,
      sourceAnchor,
      sBounds,
      tBounds,
      PAD,
    );
  } else {
    routeHorizontalToVertical(
      points,
      sExit,
      tEntry,
      sourceAnchor,
      sBounds,
      tBounds,
      PAD,
    );
  }

  points.push(tEntry, target);
  return deduplicatePoints(points);
}

// --- Internal routing strategies ---

function routeBothHorizontal(
  points: Position[],
  sExit: Position,
  tEntry: Position,
) {
  if (Math.abs(sExit.y - tEntry.y) < 2) return; // Same Y — straight
  const midX = (sExit.x + tEntry.x) / 2;
  points.push({ x: midX, y: sExit.y });
  points.push({ x: midX, y: tEntry.y });
}

function routeBothVertical(
  points: Position[],
  sExit: Position,
  tEntry: Position,
) {
  if (Math.abs(sExit.x - tEntry.x) < 2) return; // Same X — straight
  const midY = (sExit.y + tEntry.y) / 2;
  points.push({ x: sExit.x, y: midY });
  points.push({ x: tEntry.x, y: midY });
}

function routeVerticalToHorizontal(
  points: Position[],
  sExit: Position,
  tEntry: Position,
  sourceAnchor: string | undefined,
  sBounds: ReturnType<typeof getNodeBounds> | null,
  tBounds: ReturnType<typeof getNodeBounds> | null,
  pad: number,
) {
  const goingDown = sourceAnchor === "bottom";
  const cornerL: Position = { x: sExit.x, y: tEntry.y };
  const canL = goingDown ? tEntry.y >= sExit.y : tEntry.y <= sExit.y;
  const cornerClear =
    (!sBounds || !pointInsideBounds(cornerL, sBounds)) &&
    (!tBounds || !pointInsideBounds(cornerL, tBounds));

  if (canL && cornerClear) {
    points.push(cornerL);
  } else {
    const extendY = goingDown
      ? Math.max(sBounds?.bottom ?? sExit.y, tBounds?.bottom ?? tEntry.y) + pad
      : Math.min(sBounds?.top ?? sExit.y, tBounds?.top ?? tEntry.y) - pad;
    points.push({ x: sExit.x, y: extendY });
    points.push({ x: tEntry.x, y: extendY });
  }
}

function routeHorizontalToVertical(
  points: Position[],
  sExit: Position,
  tEntry: Position,
  sourceAnchor: string | undefined,
  sBounds: ReturnType<typeof getNodeBounds> | null,
  tBounds: ReturnType<typeof getNodeBounds> | null,
  pad: number,
) {
  const goingRight = sourceAnchor === "right";
  const cornerL: Position = { x: tEntry.x, y: sExit.y };
  const canL = goingRight ? tEntry.x >= sExit.x : tEntry.x <= sExit.x;
  const cornerClear =
    (!sBounds || !pointInsideBounds(cornerL, sBounds)) &&
    (!tBounds || !pointInsideBounds(cornerL, tBounds));

  if (canL && cornerClear) {
    points.push(cornerL);
  } else {
    const extendX = goingRight
      ? Math.max(sBounds?.right ?? sExit.x, tBounds?.right ?? tEntry.x) + pad
      : Math.min(sBounds?.left ?? sExit.x, tBounds?.left ?? tEntry.x) - pad;
    points.push({ x: extendX, y: sExit.y });
    points.push({ x: extendX, y: tEntry.y });
  }
}

/** Remove consecutive near-duplicate points from a path. */
function deduplicatePoints(points: Position[]): Position[] {
  if (points.length < 2) return points;
  const cleaned: Position[] = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const prev = cleaned[cleaned.length - 1];
    if (
      Math.abs(points[i].x - prev.x) > 1 ||
      Math.abs(points[i].y - prev.y) > 1
    ) {
      cleaned.push(points[i]);
    }
  }
  return cleaned.length >= 2 ? cleaned : [points[0], points[points.length - 1]];
}
