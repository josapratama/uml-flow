import type { Diagram, LayoutOptions } from "@uml-editor/shared";

/**
 * Radial layout — root nodes at center, children in concentric rings.
 * Supports all diagram types. Adapts ring radius to node sizes so nodes do not overlap.
 */
export function layoutRadial(
  diagram: Diagram,
  _options: LayoutOptions,
): Diagram {
  if (diagram.nodes.length === 0) return diagram;

  const result = { ...diagram, nodes: [...diagram.nodes] };

  let maxW = 140,
    maxH = 60;
  for (const node of result.nodes) {
    maxW = Math.max(maxW, node.size.width);
    maxH = Math.max(maxH, node.size.height);
  }

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

  const ringSpacing = Math.max(180, Math.max(maxW, maxH) * 0.75 + 70);
  const cx = Math.max(450, maxLevel * ringSpacing + maxW / 2 + 60);
  const cy = Math.max(400, maxLevel * ringSpacing + maxH / 2 + 60);

  for (const [level, ids] of levelGroups) {
    if (level === 0 && ids.length === 1) {
      const idx = result.nodes.findIndex((n) => n.id === ids[0]);
      if (idx >= 0) {
        const nd = result.nodes[idx];
        result.nodes[idx] = {
          ...nd,
          position: {
            x: Math.round(cx - nd.size.width / 2),
            y: Math.round(cy - nd.size.height / 2),
          },
        };
      }
    } else {
      const minCircumference = ids.length * (Math.max(maxW, maxH) + 50);
      const radius = Math.max(
        level === 0 ? 120 : level * ringSpacing,
        minCircumference / (2 * Math.PI),
      );
      const angleStep = (2 * Math.PI) / ids.length;
      const startAngle = -Math.PI / 2;
      ids.forEach((id, i) => {
        const idx = result.nodes.findIndex((n) => n.id === id);
        if (idx >= 0) {
          const nd = result.nodes[idx];
          result.nodes[idx] = {
            ...nd,
            position: {
              x: Math.round(
                cx + radius * Math.cos(startAngle + angleStep * i) - nd.size.width / 2,
              ),
              y: Math.round(
                cy + radius * Math.sin(startAngle + angleStep * i) - nd.size.height / 2,
              ),
            },
          };
        }
      });
    }
  }

  // Normalize so minX/minY >= 60
  let minX = Infinity,
    minY = Infinity;
  for (const nd of result.nodes) {
    minX = Math.min(minX, nd.position.x);
    minY = Math.min(minY, nd.position.y);
  }
  const offsetX = minX < 60 ? 60 - minX : 0;
  const offsetY = minY < 60 ? 60 - minY : 0;
  if (offsetX !== 0 || offsetY !== 0) {
    result.nodes = result.nodes.map((nd) => ({
      ...nd,
      position: {
        x: Math.round(nd.position.x + offsetX),
        y: Math.round(nd.position.y + offsetY),
      },
    }));
  }

  result.edges = diagram.edges.map((e) => ({ ...e }));
  return result;
}
