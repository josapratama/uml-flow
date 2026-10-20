import type { DiagramNode, Position } from "@uml-editor/shared";
import {
  getNodeBounds,
  getExitPoint,
  getStubPoint,
  pointInsideBounds,
  lineIntersectsBox,
} from "./edge-geometry";
import { isContainerOf } from "../utils/anchor-utils";

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
 * Builds a path with obstacle avoidance.
 * If the direct line between source and target intersects any intermediate node,
 * it routes around the obstacle(s) cleanly to prevent overlapping lines and obscured nodes.
 */
export function routeWithObstacleAvoidance(
  source: Position,
  target: Position,
  sourceNode: DiagramNode,
  targetNode: DiagramNode,
  allNodes: DiagramNode[],
): Position[] {
  const obstacles = allNodes.filter((n) => {
    if (n.id === sourceNode.id || n.id === targetNode.id) return false;
    // Don't treat parent container as obstacle for internal transitions
    if (isContainerOf(n, sourceNode) || isContainerOf(n, targetNode)) return false;
    // Don't treat child subnodes of source/target as obstacles
    if (isContainerOf(sourceNode, n) || isContainerOf(targetNode, n)) return false;
    const b = getNodeBounds(n, 12);
    return lineIntersectsBox(source, target, b);
  });

  if (obstacles.length === 0) {
    return [source, target];
  }

  // Obstacle detected! Route around it cleanly.
  const isVertical =
    Math.abs(target.y - source.y) >= Math.abs(target.x - source.x);

  if (isVertical) {
    const maxRight = Math.max(
      ...obstacles.map((o) => getNodeBounds(o, 20).right),
      getNodeBounds(sourceNode, 20).right,
      getNodeBounds(targetNode, 20).right,
    );
    const bypassX = maxRight + 24;

    const startPt: Position = {
      x: getNodeBounds(sourceNode, 0).right,
      y: source.y,
    };
    const endPt: Position = {
      x: getNodeBounds(targetNode, 0).right,
      y: target.y,
    };

    return [
      startPt,
      { x: bypassX, y: startPt.y },
      { x: bypassX, y: endPt.y },
      endPt,
    ];
  } else {
    const maxBottom = Math.max(
      ...obstacles.map((o) => getNodeBounds(o, 20).bottom),
      getNodeBounds(sourceNode, 20).bottom,
      getNodeBounds(targetNode, 20).bottom,
    );
    const bypassY = maxBottom + 24;

    const startPt: Position = {
      x: source.x,
      y: getNodeBounds(sourceNode, 0).bottom,
    };
    const endPt: Position = {
      x: target.x,
      y: getNodeBounds(targetNode, 0).bottom,
    };

    return [
      startPt,
      { x: startPt.x, y: bypassY },
      { x: endPt.x, y: bypassY },
      endPt,
    ];
  }
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
  parallelOffset: number = 0,
  allNodes?: DiagramNode[],
  channelOffset: number = 0,
): Position[] {
  const PAD = 20;

  // Apply parallel offset on anchor face so reverse/parallel edges have separated endpoints
  let srcPt = { ...source };
  let tgtPt = { ...target };
  if (parallelOffset !== 0) {
    if (sourceAnchor === "top" || sourceAnchor === "bottom") {
      srcPt.x += parallelOffset;
    } else if (sourceAnchor === "left" || sourceAnchor === "right") {
      srcPt.y += parallelOffset;
    }
    if (targetAnchor === "top" || targetAnchor === "bottom") {
      tgtPt.x += parallelOffset;
    } else if (targetAnchor === "left" || targetAnchor === "right") {
      tgtPt.y += parallelOffset;
    }
  }

  const sBounds = sourceNode ? getNodeBounds(sourceNode, PAD) : null;
  const tBounds = targetNode ? getNodeBounds(targetNode, PAD) : null;

  // Exit/entry points just outside node boundaries
  const sExit = sBounds
    ? getExitPoint(srcPt, sourceAnchor, sBounds)
    : getStubPoint(srcPt, sourceAnchor, 30);
  const tEntry = tBounds
    ? getExitPoint(tgtPt, targetAnchor, tBounds)
    : getStubPoint(tgtPt, targetAnchor, 30);

  const points: Position[] = [srcPt, sExit];

  const sourceIsHoriz = sourceAnchor === "left" || sourceAnchor === "right";
  const targetIsHoriz = targetAnchor === "left" || targetAnchor === "right";

  const excludeIds = new Set<string>();
  if (sourceNode) excludeIds.add(sourceNode.id);
  if (targetNode) excludeIds.add(targetNode.id);
  if (allNodes) {
    for (const n of allNodes) {
      if (sourceNode && (isContainerOf(n, sourceNode) || isContainerOf(sourceNode, n))) {
        excludeIds.add(n.id);
      }
      if (targetNode && (isContainerOf(n, targetNode) || isContainerOf(targetNode, n))) {
        excludeIds.add(n.id);
      }
    }
  }

  if (sourceIsHoriz && targetIsHoriz) {
    routeBothHorizontal(
      points,
      sExit,
      tEntry,
      parallelOffset,
      allNodes,
      excludeIds,
      channelOffset,
    );
  } else if (!sourceIsHoriz && !targetIsHoriz) {
    routeBothVertical(
      points,
      sExit,
      tEntry,
      parallelOffset,
      allNodes,
      excludeIds,
      channelOffset,
    );
  } else if (!sourceIsHoriz && targetIsHoriz) {
    routeVerticalToHorizontal(
      points,
      sExit,
      tEntry,
      sourceAnchor,
      sBounds,
      tBounds,
      PAD,
      allNodes,
      excludeIds,
      channelOffset,
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
      allNodes,
      excludeIds,
      channelOffset,
    );
  }

  points.push(tEntry, tgtPt);
  return deduplicatePoints(points);
}

// --- Internal routing strategies ---

function routeBothHorizontal(
  points: Position[],
  sExit: Position,
  tEntry: Position,
  parallelOffset: number = 0,
  allNodes?: DiagramNode[],
  excludeIds?: Set<string>,
  channelOffset: number = 0,
) {
  if (Math.abs(sExit.y - tEntry.y) < 2) return; // Same Y — straight
  const effectiveOffset =
    channelOffset !== 0 ? channelOffset : parallelOffset * 0.7;
  let midX = (sExit.x + tEntry.x) / 2 + effectiveOffset;

  // Check obstacle collision on vertical segment
  if (allNodes && allNodes.length > 0) {
    const minY = Math.min(sExit.y, tEntry.y) - 4;
    const maxY = Math.max(sExit.y, tEntry.y) + 4;
    const obstacles = allNodes.filter((n) => {
      if (excludeIds && excludeIds.has(n.id)) return false;
      const b = getNodeBounds(n, 8);
      return b.top < maxY && b.bottom > minY && b.left <= midX && b.right >= midX;
    });

    if (obstacles.length > 0) {
      const obsLeft = Math.min(
        ...obstacles.map((o) => getNodeBounds(o, 16).left),
      );
      const obsRight = Math.max(
        ...obstacles.map((o) => getNodeBounds(o, 16).right),
      );
      const candLeft = obsLeft - 16;
      const candRight = obsRight + 16;
      const distLeft = Math.abs(candLeft - midX);
      const distRight = Math.abs(candRight - midX);
      midX = distLeft <= distRight ? candLeft : candRight;
    }
  }

  points.push({ x: midX, y: sExit.y });
  points.push({ x: midX, y: tEntry.y });
}

function routeBothVertical(
  points: Position[],
  sExit: Position,
  tEntry: Position,
  parallelOffset: number = 0,
  allNodes?: DiagramNode[],
  excludeIds?: Set<string>,
  channelOffset: number = 0,
) {
  if (Math.abs(sExit.x - tEntry.x) < 2) return; // Same X — straight
  const effectiveOffset =
    channelOffset !== 0 ? channelOffset : parallelOffset * 0.7;
  let midY = (sExit.y + tEntry.y) / 2 + effectiveOffset;

  // Check obstacle collision on horizontal segment
  if (allNodes && allNodes.length > 0) {
    const minX = Math.min(sExit.x, tEntry.x) - 4;
    const maxX = Math.max(sExit.x, tEntry.x) + 4;
    const obstacles = allNodes.filter((n) => {
      if (excludeIds && excludeIds.has(n.id)) return false;
      const b = getNodeBounds(n, 8);
      return b.left < maxX && b.right > minX && b.top <= midY && b.bottom >= midY;
    });

    if (obstacles.length > 0) {
      const obsTop = Math.min(
        ...obstacles.map((o) => getNodeBounds(o, 16).top),
      );
      const obsBottom = Math.max(
        ...obstacles.map((o) => getNodeBounds(o, 16).bottom),
      );
      const candTop = obsTop - 16;
      const candBottom = obsBottom + 16;
      const distTop = Math.abs(candTop - midY);
      const distBottom = Math.abs(candBottom - midY);
      midY = distTop <= distBottom ? candTop : candBottom;
    }
  }

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
  allNodes?: DiagramNode[],
  excludeIds?: Set<string>,
  channelOffset: number = 0,
) {
  const goingDown = sourceAnchor === "bottom";
  const cornerL: Position = { x: sExit.x, y: tEntry.y };
  const canL = goingDown ? tEntry.y >= sExit.y : tEntry.y <= sExit.y;
  let cornerClear =
    (!sBounds || !pointInsideBounds(cornerL, sBounds)) &&
    (!tBounds || !pointInsideBounds(cornerL, tBounds));

  if (cornerClear && allNodes && allNodes.length > 0) {
    for (const n of allNodes) {
      if (excludeIds && excludeIds.has(n.id)) continue;
      const b = getNodeBounds(n, 8);
      if (lineIntersectsBox(sExit, cornerL, b) || lineIntersectsBox(cornerL, tEntry, b)) {
        cornerClear = false;
        break;
      }
    }
  }

  if (canL && cornerClear) {
    points.push(cornerL);
  } else {
    const extendY =
      (goingDown
        ? Math.max(sBounds?.bottom ?? sExit.y, tBounds?.bottom ?? tEntry.y) + pad
        : Math.min(sBounds?.top ?? sExit.y, tBounds?.top ?? tEntry.y) - pad) +
      channelOffset;
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
  allNodes?: DiagramNode[],
  excludeIds?: Set<string>,
  channelOffset: number = 0,
) {
  const goingRight = sourceAnchor === "right";
  const cornerL: Position = { x: tEntry.x, y: sExit.y };
  const canL = goingRight ? tEntry.x >= sExit.x : tEntry.x <= sExit.x;
  let cornerClear =
    (!sBounds || !pointInsideBounds(cornerL, sBounds)) &&
    (!tBounds || !pointInsideBounds(cornerL, tBounds));

  if (cornerClear && allNodes && allNodes.length > 0) {
    for (const n of allNodes) {
      if (excludeIds && excludeIds.has(n.id)) continue;
      const b = getNodeBounds(n, 8);
      if (lineIntersectsBox(sExit, cornerL, b) || lineIntersectsBox(cornerL, tEntry, b)) {
        cornerClear = false;
        break;
      }
    }
  }

  if (canL && cornerClear) {
    points.push(cornerL);
  } else {
    const extendX =
      (goingRight
        ? Math.max(sBounds?.right ?? sExit.x, tBounds?.right ?? tEntry.x) + pad
        : Math.min(sBounds?.left ?? sExit.x, tBounds?.left ?? tEntry.x) - pad) +
      channelOffset;
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
