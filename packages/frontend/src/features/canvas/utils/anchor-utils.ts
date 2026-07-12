import type { DiagramNode, Position } from "@uml-editor/shared";
import { getVisualSize } from "../nodes/getVisualSize";

/**
 * Given a target node and a source node, returns the best anchor side on target
 * that faces toward the source (for natural edge routing).
 */
export function getBestTargetAnchor(
  targetNode: DiagramNode,
  sourceNode: DiagramNode,
): string {
  const tSize = getVisualSize(targetNode);
  const sSize = getVisualSize(sourceNode);
  const tCx = targetNode.position.x + tSize.width / 2;
  const tCy = targetNode.position.y + tSize.height / 2;
  const sCx = sourceNode.position.x + sSize.width / 2;
  const sCy = sourceNode.position.y + sSize.height / 2;

  const dx = sCx - tCx;
  const dy = sCy - tCy;

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? "right" : "left";
  } else {
    return dy > 0 ? "bottom" : "top";
  }
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
 * Checks if a point is inside a node's visual bounds.
 */
export function isPointInsideNode(
  node: DiagramNode,
  x: number,
  y: number,
): boolean {
  const vs = getVisualSize(node);
  return (
    x >= node.position.x &&
    x <= node.position.x + vs.width &&
    y >= node.position.y &&
    y <= node.position.y + vs.height
  );
}
