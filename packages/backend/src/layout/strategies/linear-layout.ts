import type { Diagram, DiagramNode, LayoutOptions } from "@uml-editor/shared";

/**
 * Linear (vertical) layout.
 * Used for: Activity, Flowchart diagrams.
 * Nodes are ordered by flow topology and stacked vertically, centered on a single axis.
 * Edge routing is handled entirely by the frontend.
 */
export function layoutLinear(
  diagram: Diagram,
  _options: LayoutOptions,
): Diagram {
  if (diagram.nodes.length === 0) return diagram;

  const orderedNodes = orderNodesByFlow(diagram);
  const centerX = 400;
  const verticalGap = 52;
  let y = 60;

  const positioned = orderedNodes.map((node) => {
    const x = Math.round(centerX - node.size.width / 2);
    const currentY = Math.round(y);
    y += node.size.height + verticalGap;
    return { ...node, position: { x, y: currentY } };
  });

  return {
    ...diagram,
    nodes: positioned,
    edges: diagram.edges.map((e) => ({ ...e })),
  };
}

function orderNodesByFlow(diagram: Diagram): DiagramNode[] {
  if (diagram.edges.length === 0) return [...diagram.nodes];

  const nodeMap = new Map(diagram.nodes.map((n) => [n.id, n]));
  const adj = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const n of diagram.nodes) {
    adj.set(n.id, []);
    inDegree.set(n.id, 0);
  }

  for (const e of diagram.edges) {
    if (nodeMap.has(e.source) && nodeMap.has(e.target) && e.source !== e.target) {
      adj.get(e.source)!.push(e.target);
      inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
    }
  }

  // Prefer explicit 'start' or zero-in-degree nodes first
  const roots = diagram.nodes.filter(
    (n) => n.type === "start" || (inDegree.get(n.id) || 0) === 0,
  );
  const visited = new Set<string>();
  const result: DiagramNode[] = [];

  const visit = (id: string) => {
    if (visited.has(id)) return;
    const node = nodeMap.get(id);
    if (!node) return;
    visited.add(id);
    result.push(node);
    for (const nextId of adj.get(id) || []) {
      visit(nextId);
    }
  };

  for (const r of roots) {
    visit(r.id);
  }
  for (const n of diagram.nodes) {
    visit(n.id);
  }

  return result;
}
