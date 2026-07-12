import type { Diagram, LayoutOptions } from "@uml-editor/shared";

/**
 * Linear (vertical) layout.
 * Used for: Activity, Flowchart diagrams.
 * Nodes are stacked vertically, centered on a single axis.
 * Edge routing is handled entirely by the frontend.
 */
export function layoutLinear(
  diagram: Diagram,
  _options: LayoutOptions,
): Diagram {
  const result = { ...diagram, nodes: [...diagram.nodes] };
  const centerX = 300;
  let y = 60;

  for (let i = 0; i < result.nodes.length; i++) {
    const node = result.nodes[i];
    const x = centerX - node.size.width / 2;
    result.nodes[i] = { ...node, position: { x, y } };
    y += node.size.height + 60;
  }

  // Don't set edge.points — let frontend calculate dynamically
  result.edges = diagram.edges.map((e) => ({ ...e }));
  return result;
}
