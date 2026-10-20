import type {
  Diagram,
  DiagramNode,
  Edge,
  Position,
  LayoutOptions,
} from "@uml-editor/shared";
import type { LayoutNode } from "../types";
import { routeEdge } from "../edge-router";

/**
 * Sugiyama-style layered layout.
 * Used for: Class, ERD, State, UseCase diagrams.
 *
 * Steps:
 * 1. Assign ranks (layers) via topological sort
 * 2. Order nodes within ranks (barycenter heuristic)
 * 3. Assign x/y positions
 */
export function layoutLayered(
  diagram: Diagram,
  options: LayoutOptions,
): Diagram {
  // Track substates belonging to composite nodes
  const substateToComposite = new Map<string, string>();
  for (const node of diagram.nodes) {
    if (node.type === "composite" && (node as any).substates) {
      for (const sub of (node as any).substates) {
        substateToComposite.set(sub.id, node.id);
      }
    }
  }

  // Filter top-level diagram so only top-level nodes are ranked and positioned
  const topLevelDiagram: Diagram = {
    ...diagram,
    nodes: diagram.nodes.filter((n) => !substateToComposite.has(n.id)),
  };

  const graph = buildGraph(topLevelDiagram);
  const reverseForRank = diagram.type === "class" || diagram.type === "erd";

  assignRanks(graph, topLevelDiagram.edges, reverseForRank);
  orderWithinRanks(graph, topLevelDiagram.edges);
  assignPositions(graph, options, topLevelDiagram.edges);

  const result = { ...diagram, nodes: [...diagram.nodes] };
  for (let i = 0; i < result.nodes.length; i++) {
    const ln = graph.get(result.nodes[i].id);
    if (ln)
      result.nodes[i] = { ...result.nodes[i], position: { ...ln.position } };
  }

  // Position substates neatly INSIDE their composite parent node
  for (let i = 0; i < result.nodes.length; i++) {
    const comp = result.nodes[i];
    if (comp.type === "composite" && (comp as any).substates) {
      const subs: any[] = (comp as any).substates;
      if (subs.length > 0) {
        let currentX = comp.position.x + 24;
        const subY = comp.position.y + 54;
        let maxHeight = 44;

        for (const sub of subs) {
          const subNodeIdx = result.nodes.findIndex((n) => n.id === sub.id);
          const subW =
            sub.size?.width ||
            (sub.type === "initial" || sub.type === "final" ? 22 : 90);
          const subH =
            sub.size?.height ||
            (sub.type === "initial" || sub.type === "final" ? 22 : 44);
          maxHeight = Math.max(maxHeight, subH);

          const pos = {
            x: currentX,
            y:
              sub.type === "initial" || sub.type === "final"
                ? subY + (44 - subH) / 2
                : subY,
          };

          if (subNodeIdx >= 0) {
            result.nodes[subNodeIdx] = {
              ...result.nodes[subNodeIdx],
              position: pos,
              size: { width: subW, height: subH },
            };
          }
          currentX += subW + 28;
        }

        // Auto-size composite container to comfortably fit all substates
        const neededWidth = Math.max(
          comp.size.width,
          currentX - comp.position.x + 20,
        );
        const neededHeight = Math.max(comp.size.height, 54 + maxHeight + 28);
        result.nodes[i] = {
          ...result.nodes[i],
          size: { width: neededWidth, height: neededHeight },
        };
      }
    }
  }

  result.edges = diagram.edges.map((e) => ({ ...e }));
  return result;
}

function buildGraph(diagram: Diagram): Map<string, LayoutNode> {
  const graph = new Map<string, LayoutNode>();
  for (const node of diagram.nodes) {
    graph.set(node.id, {
      id: node.id,
      rank: 0,
      order: 0,
      position: { x: 0, y: 0 },
      width: node.size.width,
      height: node.size.height,
    });
  }
  return graph;
}

/**
 * Assign ranks using Kahn's topological sort.
 * For class/ERD diagrams, edges are reversed so parents appear above children.
 */
function assignRanks(
  graph: Map<string, LayoutNode>,
  edges: Edge[],
  reverse: boolean,
): void {
  const adj = new Map<string, string[]>();
  const inDeg = new Map<string, number>();

  for (const [id] of graph) {
    adj.set(id, []);
    inDeg.set(id, 0);
  }

  for (const edge of edges) {
    if (!graph.has(edge.source) || !graph.has(edge.target)) continue;
    const from = reverse ? edge.target : edge.source;
    const to = reverse ? edge.source : edge.target;
    adj.get(from)?.push(to);
    inDeg.set(to, (inDeg.get(to) || 0) + 1);
  }

  const queue: string[] = [];
  for (const [id, deg] of inDeg) {
    if (deg === 0) queue.push(id);
  }

  const ranks = new Map<string, number>();
  while (queue.length > 0) {
    const id = queue.shift()!;
    const rank = ranks.get(id) || 0;
    const node = graph.get(id);
    if (node) node.rank = rank;

    for (const neighbor of adj.get(id) || []) {
      ranks.set(neighbor, Math.max(ranks.get(neighbor) || 0, rank + 1));
      const deg = (inDeg.get(neighbor) || 1) - 1;
      inDeg.set(neighbor, deg);
      if (deg === 0) queue.push(neighbor);
    }
  }

  // Handle disconnected/cyclic nodes
  let maxRank = 0;
  for (const [, node] of graph) maxRank = Math.max(maxRank, node.rank);
  for (const [id, node] of graph) {
    if (!ranks.has(id) && inDeg.get(id) !== 0) node.rank = maxRank + 1;
  }
}

/** Barycenter heuristic to minimize edge crossings. */
function orderWithinRanks(graph: Map<string, LayoutNode>, edges: Edge[]): void {
  const rankGroups = new Map<number, LayoutNode[]>();
  for (const [, node] of graph) {
    const group = rankGroups.get(node.rank) || [];
    group.push(node);
    rankGroups.set(node.rank, group);
  }

  for (const [, group] of rankGroups) group.forEach((n, i) => (n.order = i));

  // Build undirected adjacency
  const adj = new Map<string, string[]>();
  for (const [id] of graph) adj.set(id, []);
  for (const edge of edges) {
    if (graph.has(edge.source) && graph.has(edge.target)) {
      adj.get(edge.source)?.push(edge.target);
      adj.get(edge.target)?.push(edge.source);
    }
  }

  // 6 passes of barycenter ordering
  for (let pass = 0; pass < 6; pass++) {
    for (const [, group] of rankGroups) {
      for (const node of group) {
        const neighbors = (adj.get(node.id) || [])
          .map((id) => graph.get(id))
          .filter((n) => n && n.rank !== node.rank);
        if (neighbors.length > 0) {
          node.order =
            neighbors.reduce((sum, n) => sum + n!.order, 0) / neighbors.length;
        }
      }
      group.sort((a, b) => a.order - b.order);
      group.forEach((n, i) => (n.order = i));
    }
  }
}

/** Assign x/y coordinates based on rank and order. */
function assignPositions(
  graph: Map<string, LayoutNode>,
  options: LayoutOptions,
  edges: Edge[] = [],
): void {
  const rankGroups = new Map<number, LayoutNode[]>();
  for (const [, node] of graph) {
    const group = rankGroups.get(node.rank) || [];
    group.push(node);
    rankGroups.set(node.rank, group);
  }

  const isHorizontal = options.direction === "LR" || options.direction === "RL";
  const ranks = [...rankGroups.keys()].sort((a, b) => a - b);
  let primaryOffset = 60;

  for (const rank of ranks) {
    const group = rankGroups.get(rank)!;
    group.sort((a, b) => a.order - b.order);

    let totalSecondary = 0;
    for (const node of group) {
      totalSecondary +=
        (isHorizontal ? node.height : node.width) + options.nodeSpacing;
    }
    totalSecondary -= options.nodeSpacing;

    let secondaryOffset = Math.max(60, 400 - totalSecondary / 2);

    // If an intermediate rank with 1 node is bypassed by an edge spanning across it,
    // stagger it to the side to create a clear triangular layout and prevent overlapping lines
    if (group.length === 1 && hasBypassEdge(rank, graph, edges)) {
      secondaryOffset = Math.max(60, secondaryOffset - 160);
    }
    let maxPrimary = 0;

    for (const node of group) {
      if (isHorizontal) {
        node.position.x = primaryOffset;
        node.position.y = secondaryOffset;
        secondaryOffset += node.height + options.nodeSpacing;
        maxPrimary = Math.max(maxPrimary, node.width);
      } else {
        node.position.x = secondaryOffset;
        node.position.y = primaryOffset;
        secondaryOffset += node.width + options.nodeSpacing;
        maxPrimary = Math.max(maxPrimary, node.height);
      }
    }
    primaryOffset += maxPrimary + options.rankSpacing;
  }
}

/** Check if any edge spans across this rank from a lower rank to a higher rank */
function hasBypassEdge(
  rank: number,
  graph: Map<string, LayoutNode>,
  edges: Edge[],
): boolean {
  for (const edge of edges) {
    const src = graph.get(edge.source);
    const tgt = graph.get(edge.target);
    if (!src || !tgt) continue;
    const minR = Math.min(src.rank, tgt.rank);
    const maxR = Math.max(src.rank, tgt.rank);
    if (rank > minR && rank < maxR) {
      return true;
    }
  }
  return false;
}

