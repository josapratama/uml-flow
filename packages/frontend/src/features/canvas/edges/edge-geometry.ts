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
 * Computes the point and normal for a cubic Bezier curve defined by [p0, c1, c2, p3] at parameter t (0..1).
 * Uses analytical Bezier formula B(t) and derivative B'(t) to find exact curve point and perpendicular normal.
 */
export function getBezierPointAndNormal(
  p0: Position,
  c1: Position,
  c2: Position,
  p3: Position,
  t: number = 0.5,
): PathPointResult {
  const clampedT = Math.max(0, Math.min(1, t));
  const mt = 1 - clampedT;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = clampedT * clampedT;
  const t3 = t2 * clampedT;

  // B(t) = (1-t)^3*P0 + 3(1-t)^2*t*C1 + 3(1-t)*t^2*C2 + t^3*P3
  const x = mt3 * p0.x + 3 * mt2 * clampedT * c1.x + 3 * mt * t2 * c2.x + t3 * p3.x;
  const y = mt3 * p0.y + 3 * mt2 * clampedT * c1.y + 3 * mt * t2 * c2.y + t3 * p3.y;

  // Tangent B'(t) = 3(1-t)^2*(C1-P0) + 6(1-t)t*(C2-C1) + 3t^2*(P3-C2)
  const dx =
    3 * mt2 * (c1.x - p0.x) +
    6 * mt * clampedT * (c2.x - c1.x) +
    3 * t2 * (p3.x - c2.x);
  const dy =
    3 * mt2 * (c1.y - p0.y) +
    6 * mt * clampedT * (c2.y - c1.y) +
    3 * t2 * (p3.y - c2.y);

  const len = Math.hypot(dx, dy);
  if (len === 0) {
    return {
      point: { x, y },
      normal: { x: 0, y: -1 },
      tangent: { x: 1, y: 0 },
    };
  }

  const tangent = { x: dx / len, y: dy / len };
  // Normal 90 deg CCW
  const normal = { x: -tangent.y, y: tangent.x };
  return { point: { x, y }, normal, tangent };
}

/**
 * Calculate the point, normal, and tangent on a path at a given ratio (0.0 to 1.0).
 * Protects against placing labels directly on siku/corners (within 16px of vertices).
 * Supports both piecewise polyline and exact cubic Bezier curves.
 */
export function getPathPointAndNormal(
  points: Position[],
  ratio: number = 0.5,
  isBezier: boolean = false,
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

  // If designated as Bezier curve with 4 control points [p0, c1, c2, p3]
  if (isBezier && points.length === 4) {
    return getBezierPointAndNormal(points[0], points[1], points[2], points[3], ratio);
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
 * Uses ray-shape intersection based on the node's actual geometric geometry:
 * - Ellipse (usecase, database): exact ray-ellipse intersection
 * - Circle (initial, final, start, end): exact ray-circle intersection
 * - Diamond (decision): exact ray-rhombus intersection
 * - Box (all rectangular nodes): ray-box intersection
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

  let x: number;
  let y: number;

  const nodeType = (node.type as string) || "";

  // 1. Circle shapes (activity/state circles)
  if (
    nodeType === "initial" ||
    nodeType === "final" ||
    ((nodeType === "start" || nodeType === "end") && size.width <= 40)
  ) {
    const r = Math.min(w, h);
    const dist = Math.hypot(dx, dy);
    x = cx + (dx / dist) * r;
    y = cy + (dy / dist) * r;
  }
  // 2. Ellipse shapes (usecase, database)
  else if (nodeType === "usecase" || nodeType === "database") {
    // Ellipse equation: (x/w)^2 + (y/h)^2 = 1 -> ray: x = cx + t*dx, y = cy + t*dy
    // t = 1 / sqrt((dx/w)^2 + (dy/h)^2)
    const rx = Math.max(1, w);
    const ry = Math.max(1, h);
    const scaleX = dx / rx;
    const scaleY = dy / ry;
    const t = 1 / Math.sqrt(scaleX * scaleX + scaleY * scaleY);
    x = cx + t * dx;
    y = cy + t * dy;
  }
  // 3. Actor stick-figure shape (narrow torso + bottom label)
  else if (nodeType === "actor") {
    const actorCy = node.position.y + Math.min(45, size.height * 0.42);
    const actorDx = target.x - cx;
    const actorDy = target.y - actorCy;
    const absActorDx = Math.abs(actorDx);
    const absActorDy = Math.abs(actorDy);
    const rx = Math.min(w, 24);
    const ryTop = Math.max(16, actorCy - (node.position.y + 6));
    const ryBottom = Math.max(24, node.position.y + size.height - actorCy);

    if (absActorDx < 0.01 && absActorDy < 0.01) {
      x = cx;
      y = actorCy;
    } else if (actorDy > 0 && absActorDy > absActorDx * 1.35) {
      // Exiting downward below the actor text label
      y = node.position.y + size.height;
      x = cx + Math.max(-rx, Math.min(rx, (actorDx / absActorDy) * ryBottom));
    } else {
      const ry = actorDy < 0 ? ryTop : Math.min(42, ryBottom);
      const scaleX = actorDx / Math.max(1, rx);
      const scaleY = actorDy / Math.max(1, ry);
      const t = 1 / Math.sqrt(scaleX * scaleX + scaleY * scaleY);
      x = cx + t * actorDx;
      y = actorCy + t * actorDy;
    }
  }
  // 4. Diamond (rhombus) shapes (decision)
  else if (nodeType === "decision") {
    // Diamond equation: |x/w| + |y/h| = 1 -> t = 1 / (|dx/w| + |dy/h|)
    const t = 1 / (absDx / Math.max(1, w) + absDy / Math.max(1, h));
    x = cx + t * dx;
    y = cy + t * dy;
  }
  // 5. Standard Rectangular Box (classes, components, states, activities, etc.)
  else {
    if (absDx * h > absDy * w) {
      x = dx > 0 ? cx + w : cx - w;
      y = cy + (dy / absDx) * w;
    } else {
      y = dy > 0 ? cy + h : cy - h;
      x = cx + (dx / absDy) * h;
    }
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

/** Get the anchor point on a specific side of a node (with optional port distribution fraction 0..1). */
export function getDistributedSidePoint(
  node: DiagramNode,
  side: string,
  portFraction: number = 0.5,
): Position {
  const { position } = node;
  const size = getVisualSize(node);
  const cx = position.x + size.width / 2;
  const cy = position.y + size.height / 2;
  const w = size.width / 2;
  const h = size.height / 2;
  const f = Math.max(0.15, Math.min(0.85, portFraction));
  const nodeType = (node.type as string) || "";

  // 1. Ellipse (usecase, database) -> project onto exact ellipse perimeter
  if (nodeType === "usecase" || nodeType === "database") {
    const rx = Math.max(1, w);
    const ry = Math.max(1, h);
    if (side === "top" || side === "bottom") {
      const normX = (f - 0.5) * 1.4; // [-0.49 .. 0.49]
      const x = cx + normX * rx;
      const yOffset = ry * Math.sqrt(Math.max(0, 1 - normX * normX));
      return { x, y: side === "top" ? cy - yOffset : cy + yOffset };
    }
    if (side === "left" || side === "right") {
      const normY = (f - 0.5) * 1.4;
      const y = cy + normY * ry;
      const xOffset = rx * Math.sqrt(Math.max(0, 1 - normY * normY));
      return { x: side === "left" ? cx - xOffset : cx + xOffset, y };
    }
  }

  // 2. Diamond (decision) -> project onto rhombus perimeter |dx/w| + |dy/h| = 1
  if (nodeType === "decision") {
    if (side === "top" || side === "bottom") {
      const normX = (f - 0.5) * 0.9;
      const x = cx + normX * w;
      const yOffset = h * (1 - Math.abs(normX));
      return { x, y: side === "top" ? cy - yOffset : cy + yOffset };
    }
    if (side === "left" || side === "right") {
      const normY = (f - 0.5) * 0.9;
      const y = cy + normY * h;
      const xOffset = w * (1 - Math.abs(normY));
      return { x: side === "left" ? cx - xOffset : cx + xOffset, y };
    }
  }

  // 3. Actor stick figure -> keep connection points close to torso/hands
  if (nodeType === "actor") {
    const actorCy = position.y + Math.min(45, size.height * 0.42);
    const actorRx = Math.min(w, 24);
    switch (side) {
      case "top":
        return { x: cx + (f - 0.5) * 20, y: position.y + 6 };
      case "bottom":
        return { x: cx + (f - 0.5) * 32, y: position.y + size.height };
      case "left":
        return { x: cx - actorRx, y: actorCy + (f - 0.5) * 32 };
      case "right":
        return { x: cx + actorRx, y: actorCy + (f - 0.5) * 32 };
    }
  }

  // 4. Circle (initial, final, start/end circle)
  if (
    nodeType === "initial" ||
    nodeType === "final" ||
    ((nodeType === "start" || nodeType === "end") && size.width <= 40)
  ) {
    const r = Math.min(w, h);
    const baseAngle =
      side === "top"
        ? -Math.PI / 2
        : side === "bottom"
          ? Math.PI / 2
          : side === "left"
            ? Math.PI
            : 0;
    const angle = baseAngle + (f - 0.5) * 0.8;
    return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
  }

  // 5. Standard Rectangular Box
  switch (side) {
    case "top":
      return { x: position.x + size.width * f, y: position.y };
    case "bottom":
      return { x: position.x + size.width * f, y: position.y + size.height };
    case "left":
      return { x: position.x, y: position.y + size.height * f };
    case "right":
      return { x: position.x + size.width, y: position.y + size.height * f };
    default:
      return { x: cx, y: cy };
  }
}

export function getAnchorPointOnNode(
  node: DiagramNode,
  side: string,
): Position {
  return getDistributedSidePoint(node, side, 0.5);
}
