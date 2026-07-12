import type { Diagram, LayoutOptions } from "@uml-editor/shared";

/**
 * Grid layout — arranges nodes in a uniform grid.
 * Supports all diagram types. Spacing adapts to node sizes.
 */
export function layoutGrid(diagram: Diagram, options: LayoutOptions): Diagram {
  if (diagram.nodes.length === 0) return diagram;

  const result = { ...diagram, nodes: [...diagram.nodes] };
  const n = result.nodes.length;
  const cols = Math.ceil(Math.sqrt(n));

  // Calculate max node size for spacing
  let maxW = 0,
    maxH = 0;
  for (const node of result.nodes) {
    maxW = Math.max(maxW, node.size.width);
    maxH = Math.max(maxH, node.size.height);
  }
  const spacingX = maxW + options.nodeSpacing;
  const spacingY = maxH + Math.round(options.nodeSpacing * 0.6);

  for (let i = 0; i < n; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    result.nodes[i] = {
      ...result.nodes[i],
      position: { x: 60 + col * spacingX, y: 60 + row * spacingY },
    };
  }

  result.edges = diagram.edges.map((e) => ({ ...e }));
  return result;
}
