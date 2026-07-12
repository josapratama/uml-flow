import type { Diagram, LayoutOptions } from "@uml-editor/shared";

/**
 * Radial layout — root nodes at center, children in concentric rings.
 * Supports all diagram types. Finds roots via incoming edge analysis.
 */
export function layoutRadial(
  diagram: Diagram,
  _options: LayoutOptions,
): Diagram {
  if (diagram.nodes.length === 0) return diagram;

  const result = { ...diagram, nodes: [...diagram.nodes] };
  const cx = 400,
    cy = 350;

  // Find root nodes (no incoming edges)
  const incoming = new Set<string>();
  for (const e of diagram.edges) incoming.add(e.target);
  const roots = result.nodes.filter((n) => !incoming.has(n.id));
  if (roots.length === 0 && result.nodes.length > 0)
    roots.push(result.nodes[0]);

  // BFS to assign levels
  const levels = new Map<string, number>();
  const queue: string[] = [];
  for (const r of roots) {
    levels.set(r.id, 0);
    queue.push(r.id);
  }

  const adj = new Map<string, string[]>();
  for (const n of result.nodes) adj.set(n.id, []);
  for (const e of diagram.edges) adj.get(e.source)?.push(e.target);

  while (queue.length > 0) {
    const id = queue.shift()!;
    const level = levels.get(id)!;
    for (const child of adj.get(id) || []) {
      if (!levels.has(child)) {
        levels.set(child, level + 1);
        queue.push(child);
      }
    }
  }

  // Assign unvisited nodes
  let maxLevel = 0;
  for (const [, l] of levels) maxLevel = Math.max(maxLevel, l);
  for (const n of result.nodes) {
    if (!levels.has(n.id)) levels.set(n.id, maxLevel + 1);
  }

  // Group by level
  const levelGroups = new Map<number, string[]>();
  for (const [id, level] of levels) {
    const group = levelGroups.get(level) || [];
    group.push(id);
    levelGroups.set(level, group);
  }

  // Position in rings
  const ringSpacing = 150;
  for (const [level, ids] of levelGroups) {
    if (level === 0 && ids.length === 1) {
      // Single root at center
      const idx = result.nodes.findIndex((n) => n.id === ids[0]);
      if (idx >= 0)
        result.nodes[idx] = {
          ...result.nodes[idx],
          position: { x: cx, y: cy },
        };
    } else {
      const radius = level === 0 ? 60 : level * ringSpacing;
      const angleStep = (2 * Math.PI) / ids.length;
      const startAngle = -Math.PI / 2; // Start from top
      ids.forEach((id, i) => {
        const idx = result.nodes.findIndex((n) => n.id === id);
        if (idx >= 0) {
          result.nodes[idx] = {
            ...result.nodes[idx],
            position: {
              x: Math.round(cx + radius * Math.cos(startAngle + angleStep * i)),
              y: Math.round(cy + radius * Math.sin(startAngle + angleStep * i)),
            },
          };
        }
      });
    }
  }

  result.edges = diagram.edges.map((e) => ({ ...e }));
  return result;
}
