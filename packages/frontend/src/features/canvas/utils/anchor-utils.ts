import type { DiagramNode, Position } from "@uml-editor/shared";
import { getVisualSize } from "../nodes/getVisualSize";

/**
 * Given a target node and a source node, returns the best anchor side on target
 * that faces toward the source (for natural edge routing).
 */
/**
 * Helper to determine if a node is a container (composite, system, boundary)
 * that wraps another child node.
 */
export function isContainerOf(
  parent?: DiagramNode,
  child?: DiagramNode,
): boolean {
  if (!parent || !child) return false;
  if ((parent as any).substates?.some((s: any) => s.id === child.id)) return true;
  if (
    parent.type === "composite" ||
    parent.type === "system" ||
    (parent.type as string) === "boundary"
  ) {
    const pVs = getVisualSize(parent);
    const cVs = getVisualSize(child);
    return (
      parent.position.x <= child.position.x + 5 &&
      parent.position.x + pVs.width >= child.position.x + cVs.width - 5 &&
      parent.position.y <= child.position.y + 5 &&
      parent.position.y + pVs.height >= child.position.y + cVs.height - 5
    );
  }
  return false;
}

/**
 * Given a target node and a source node, returns the best anchor side on target
 * that faces toward the source (for natural edge routing), actively avoiding obstructed faces.
 */
export function getBestTargetAnchor(
  targetNode: DiagramNode,
  sourceNode: DiagramNode,
  allNodes?: DiagramNode[],
): string {
  const tSize = getVisualSize(targetNode);
  const sSize = getVisualSize(sourceNode);
  const tLeft = targetNode.position.x;
  const tRight = tLeft + tSize.width;
  const tTop = targetNode.position.y;
  const tBottom = tTop + tSize.height;
  const tCx = tLeft + tSize.width / 2;
  const tCy = tTop + tSize.height / 2;

  const sLeft = sourceNode.position.x;
  const sRight = sLeft + sSize.width;
  const sTop = sourceNode.position.y;
  const sBottom = sTop + sSize.height;
  const sCx = sLeft + sSize.width / 2;
  const sCy = sTop + sSize.height / 2;

  const dx = sCx - tCx; // positive = source is to the right
  const dy = sCy - tCy; // positive = source is below

  // Preferred sides facing source
  const horizSide = dx > 0 ? "right" : "left";
  const vertSide = dy > 0 ? "bottom" : "top";

  if (allNodes && allNodes.length > 0) {
    const isSideObstructed = (side: string): boolean => {
      const STUB = 36;
      let stubBox = { left: 0, right: 0, top: 0, bottom: 0 };
      if (side === "top") {
        stubBox = { left: tCx - 15, right: tCx + 15, top: tTop - STUB, bottom: tTop };
      } else if (side === "bottom") {
        stubBox = { left: tCx - 15, right: tCx + 15, top: tBottom, bottom: tBottom + STUB };
      } else if (side === "left") {
        stubBox = { left: tLeft - STUB, right: tLeft, top: tCy - 15, bottom: tCy + 15 };
      } else if (side === "right") {
        stubBox = { left: tRight, right: tRight + STUB, top: tCy - 15, bottom: tCy + 15 };
      }

      for (const n of allNodes) {
        if (n.id === targetNode.id || n.id === sourceNode.id) continue;
        if (isContainerOf(n, targetNode) || isContainerOf(n, sourceNode)) continue;
        if (isContainerOf(targetNode, n) || isContainerOf(sourceNode, n)) continue;

        const vs = getVisualSize(n);
        const nb = {
          left: n.position.x,
          right: n.position.x + vs.width,
          top: n.position.y,
          bottom: n.position.y + vs.height,
        };

        if (
          stubBox.left < nb.right &&
          stubBox.right > nb.left &&
          stubBox.top < nb.bottom &&
          stubBox.bottom > nb.top
        ) {
          return true;
        }
      }
      return false;
    };

    const horizBlocked = isSideObstructed(horizSide);
    const vertBlocked = isSideObstructed(vertSide);

    if (!horizBlocked && vertBlocked) return horizSide;
    if (horizBlocked && !vertBlocked) return vertSide;
  }

  // Pure horizontal overlap (one stacked vertically above/below the other)
  const overlapX = Math.max(0, Math.min(sRight, tRight) - Math.max(sLeft, tLeft));
  const overlapY = Math.max(0, Math.min(sBottom, tBottom) - Math.max(sTop, tTop));

  if (overlapX > 16 && overlapY === 0) return vertSide;
  if (overlapY > 16 && overlapX === 0) return horizSide;

  return Math.abs(dx) >= Math.abs(dy) ? horizSide : vertSide;
}

/**
 * Given a node and cursor position relative to node center,
 * returns the closest anchor side.
 */
export function getAnchorSideFromDirection(
  node: DiagramNode,
  cursorX: number,
  cursorY: number,
): string {
  const size = getVisualSize(node);
  const cx = node.position.x + size.width / 2;
  const cy = node.position.y + size.height / 2;
  const dx = cursorX - cx;
  const dy = cursorY - cy;

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? "right" : "left";
  } else {
    return dy > 0 ? "bottom" : "top";
  }
}

/**
 * Checks if a point is inside a node's visual bounds (with generous padding for drop targets).
 */
export function isPointInsideNode(
  node: DiagramNode,
  x: number,
  y: number,
  padding = 16,
): boolean {
  const vs = getVisualSize(node);
  return (
    x >= node.position.x - padding &&
    x <= node.position.x + vs.width + padding &&
    y >= node.position.y - padding &&
    y <= node.position.y + vs.height + padding
  );
}
