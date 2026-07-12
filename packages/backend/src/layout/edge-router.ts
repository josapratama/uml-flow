import type { Edge, Position, LayoutOptions } from "@uml-editor/shared";
import type { LayoutNode } from "./types";

/**
 * Calculates edge waypoints between source and target nodes.
 * Supports straight and orthogonal routing.
 */
export function routeEdge(
  edge: Edge,
  graph: Map<string, LayoutNode>,
  options: LayoutOptions,
): Edge {
  const source = graph.get(edge.source);
  const target = graph.get(edge.target);
  if (!source || !target) return edge;

  const srcBottom: Position = {
    x: source.position.x + source.width / 2,
    y: source.position.y + source.height,
  };
  const srcTop: Position = {
    x: source.position.x + source.width / 2,
    y: source.position.y,
  };
  const tgtTop: Position = {
    x: target.position.x + target.width / 2,
    y: target.position.y,
  };
  const tgtBottom: Position = {
    x: target.position.x + target.width / 2,
    y: target.position.y + target.height,
  };

  const goingDown = source.position.y < target.position.y;
  const from = goingDown ? srcBottom : srcTop;
  const to = goingDown ? tgtTop : tgtBottom;

  const points: Position[] = [];

  if (options.edgeRouting === "straight") {
    points.push(from, to);
  } else {
    // Orthogonal routing
    points.push(from);
    if (Math.abs(from.x - to.x) > 5) {
      const midY = (from.y + to.y) / 2;
      points.push({ x: from.x, y: midY });
      points.push({ x: to.x, y: midY });
    }
    points.push(to);
  }

  return { ...edge, points };
}
