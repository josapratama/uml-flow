import type { DiagramNode, Position } from "@uml-editor/shared";
import { getVisualSize } from "../nodes/getVisualSize";

export interface Bounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/** Get the bounding box of a node with padding. */
export function getNodeBounds(node: DiagramNode, pad: number): Bounds {
  const size = getVisualSize(node);
  return {
    left: node.position.x - pad,
    right: node.position.x + size.width + pad,
    top: node.position.y - pad,
    bottom: node.position.y + size.height + pad,
  };
}

/** Check if a point is inside a bounding box. */
export function pointInsideBounds(pt: Position, bounds: Bounds): boolean {
  return (
    pt.x > bounds.left &&
    pt.x < bounds.right &&
    pt.y > bounds.top &&
    pt.y < bounds.bottom
  );
}

/** Check if a line segment between p1 and p2 intersects a bounding box. */
export function lineIntersectsBox(
  p1: Position,
  p2: Position,
  box: Bounds,
): boolean {
  if (Math.max(p1.x, p2.x) < box.left) return false;
  if (Math.min(p1.x, p2.x) > box.right) return false;
  if (Math.max(p1.y, p2.y) < box.top) return false;
  if (Math.min(p1.y, p2.y) > box.bottom) return false;

  if (pointInsideBounds(p1, box) || pointInsideBounds(p2, box)) return true;

  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;

  let t0 = 0;
  let t1 = 1;

  const checks: Array<[number, number]> = [
    [-dx, p1.x - box.left],
    [dx, box.right - p1.x],
    [-dy, p1.y - box.top],
    [dy, box.bottom - p1.y],
  ];

  for (const [p, q] of checks) {
    if (p === 0) {
      if (q < 0) return false;
    } else {
      const r = q / p;
      if (p < 0) {
        if (r > t1) return false;
        if (r > t0) t0 = r;
      } else {
        if (r < t0) return false;
        if (r < t1) t1 = r;
      }
    }
  }

  return t0 <= t1;
}

/** Get the exit/entry point just outside the node boundary in the anchor direction. */
export function getExitPoint(
  anchor: Position,
  side: string | undefined,
  bounds: Bounds,
): Position {
  switch (side) {
    case "top":
      return { x: anchor.x, y: bounds.top };
    case "bottom":
      return { x: anchor.x, y: bounds.bottom };
    case "left":
      return { x: bounds.left, y: anchor.y };
    case "right":
      return { x: bounds.right, y: anchor.y };
    default:
      return anchor;
  }
}

/** Get a stub point at fixed distance from anchor in the perpendicular direction. */
export function getStubPoint(
  point: Position,
  anchor: string | undefined,
  length: number,
): Position {
  switch (anchor) {
    case "top":
      return { x: point.x, y: point.y - length };
    case "bottom":
      return { x: point.x, y: point.y + length };
    case "left":
      return { x: point.x - length, y: point.y };
    case "right":
      return { x: point.x + length, y: point.y };
    default:
      return point;
  }
}

/**
 * Calculate the midpoint of a path (for label positioning).
 * Guarantees that the label is placed on the middle of a straight segment,
 * and NEVER directly on a corner/siku (vertex).
 */
export function getMidpoint(points: Position[]): Position {
  if (!points || points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return points[0];
  if (points.length === 2) {
    return {
      x: (points[0].x + points[1].x) / 2,
      y: (points[0].y + points[1].y) / 2,
    };
  }

  // Multi-segment path (e.g. orthogonal lines with corners/siku).
  // Find the best straight segment (favoring long and inner segments over tiny stubs).
  let bestMidpoint: Position = {
    x: (points[0].x + points[1].x) / 2,
    y: (points[0].y + points[1].y) / 2,
  };
  let bestScore = -1;

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const len = Math.hypot(p2.x - p1.x, p2.y - p1.y);

    // Give higher priority to inner/middle segments (not entrance/exit stubs)
    const isInner = points.length > 3 && i > 0 && i < points.length - 2;
    const score = len * (isInner ? 1.4 : 1.0);

    if (score > bestScore) {
      bestScore = score;
      bestMidpoint = {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2,
      };
    }
  }

  return bestMidpoint;
}

export interface PathPointResult {
  point: Position;
  normal: Position;
  tangent: Position;
}

/**
 * Calculate the point, normal, and tangent on a path at a given ratio (0.0 to 1.0).
 * Protects against placing labels directly on siku/corners (within 16px of vertices).
 */
export function getPathPointAndNormal(
  points: Position[],
  ratio: number = 0.5,
): PathPointResult {
  if (!points || points.length === 0) {
    return {
      point: { x: 0, y: 0 },
      normal: { x: 0, y: -1 },
      tangent: { x: 1, y: 0 },
    };
  }
  if (points.length === 1) {
    return {
      point: points[0],
      normal: { x: 0, y: -1 },
      tangent: { x: 1, y: 0 },
    };
  }

  const segLengths: number[] = [];
  let totalLength = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const len = Math.hypot(
      points[i + 1].x - points[i].x,
      points[i + 1].y - points[i].y,
    );
    segLengths.push(len);
    totalLength += len;
  }

  if (totalLength <= 0) {
    return {
      point: points[0],
      normal: { x: 0, y: -1 },
      tangent: { x: 1, y: 0 },
    };
  }

  const targetDist = Math.max(0, Math.min(1, ratio)) * totalLength;

  let accumulated = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const len = segLengths[i];
    if (len <= 0) continue;

    if (accumulated + len >= targetDist || i === points.length - 2) {
      const segRemaining = Math.max(0, Math.min(len, targetDist - accumulated));
      let segRatio = segRemaining / len;

      // Siku / Corner Guard: avoid placing label right at corners (within 16px of vertices)
      if (len > 32) {
        const minRatio = 16 / len;
        const maxRatio = (len - 16) / len;
        segRatio = Math.max(minRatio, Math.min(maxRatio, segRatio));
      }

      const p1 = points[i];
      const p2 = points[i + 1];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;

      const pt: Position = {
        x: p1.x + segRatio * dx,
        y: p1.y + segRatio * dy,
      };

      const tangent = { x: dx / len, y: dy / len };
      // Normal: 90 degrees CCW
      const normal = { x: -tangent.y, y: tangent.x };

      return { point: pt, normal, tangent };
    }
    accumulated += len;
  }

  const p0 = points[0];
  const pEnd = points[points.length - 1];
  return {
    point: { x: (p0.x + pEnd.x) / 2, y: (p0.y + pEnd.y) / 2 },
    normal: { x: 0, y: -1 },
    tangent: { x: 1, y: 0 },
  };
}

/**
 * Calculate the connection point on a node's border facing toward a target position.
 * Uses ray-box intersection to find where a line from center to target crosses the border.
 */
export function getConnectionPoint(
  node: DiagramNode,
  target: Position,
  offset: number = 0,
): Position {
  const size = getVisualSize(node);
  const cx = node.position.x + size.width / 2;
  const cy = node.position.y + size.height / 2;
  const w = size.width / 2;
  const h = size.height / 2;
  const dx = target.x - cx;
  const dy = target.y - cy;

  if (dx === 0 && dy === 0) return { x: cx, y: cy };

  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  // Guard against near-zero values that could cause extreme coordinates
  if (absDx < 0.01 && absDy < 0.01) return { x: cx, y: cy };
  let x: number, y: number;

  if (absDx * h > absDy * w) {
    x = dx > 0 ? cx + w : cx - w;
    y = cy + (dy / absDx) * w;
  } else {
    y = dy > 0 ? cy + h : cy - h;
    x = cx + (dx / absDy) * h;
  }

  if (offset !== 0) {
    const dist = Math.sqrt((target.x - x) ** 2 + (target.y - y) ** 2);
    if (dist > 0) {
      x += ((target.x - x) / dist) * offset;
      y += ((target.y - y) / dist) * offset;
    }
  }

  return { x, y };
}

/** Get the anchor point on a specific side of a node. */
export function getAnchorPointOnNode(
  node: DiagramNode,
  side: string,
): Position {
  const { position } = node;
  const size = getVisualSize(node);
  switch (side) {
    case "top":
      return { x: position.x + size.width / 2, y: position.y };
    case "bottom":
      return { x: position.x + size.width / 2, y: position.y + size.height };
    case "left":
      return { x: position.x, y: position.y + size.height / 2 };
    case "right":
      return { x: position.x + size.width, y: position.y + size.height / 2 };
    default:
      return {
        x: position.x + size.width / 2,
        y: position.y + size.height / 2,
      };
  }
}
