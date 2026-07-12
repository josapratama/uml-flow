import type { Diagram, LayoutOptions } from "@uml-editor/shared";

/**
 * Force-directed layout (spring-based).
 * Supports all diagram types.
 * Special handling: actors biased to left for use case diagrams.
 */
export function layoutForce(
  diagram: Diagram,
  _options: LayoutOptions,
): Diagram {
  if (diagram.nodes.length === 0) return diagram;

  const result = { ...diagram, nodes: [...diagram.nodes] };
  const n = result.nodes.length;
  const cx = 400,
    cy = 300;

  // Initialize positions
  const positions = result.nodes.map((node, i) => {
    // Use case: actors on left
    if (node.type === "actor") {
      return { x: 80, y: 80 + i * 130, vx: 0, vy: 0 };
    }
    const angle = (2 * Math.PI * i) / n;
    const r = Math.max(150, n * 25);
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      vx: 0,
      vy: 0,
    };
  });

  // Build adjacency
  const adj = new Map<number, number[]>();
  for (let i = 0; i < n; i++) adj.set(i, []);
  for (const edge of diagram.edges) {
    const si = result.nodes.findIndex((nd) => nd.id === edge.source);
    const ti = result.nodes.findIndex((nd) => nd.id === edge.target);
    if (si >= 0 && ti >= 0) {
      adj.get(si)!.push(ti);
      adj.get(ti)!.push(si);
    }
  }

  // Simulation
  const repulsion = 8000;
  const attraction = 0.005;
  const damping = 0.85;
  const iterations = 80;

  for (let iter = 0; iter < iterations; iter++) {
    // Repulsion
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = positions[i].x - positions[j].x;
        const dy = positions[i].y - positions[j].y;
        const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        const force = repulsion / (dist * dist);
        const fx = (dx / dist) * force,
          fy = (dy / dist) * force;
        positions[i].vx += fx;
        positions[i].vy += fy;
        positions[j].vx -= fx;
        positions[j].vy -= fy;
      }
    }
    // Attraction
    for (const edge of diagram.edges) {
      const si = result.nodes.findIndex((nd) => nd.id === edge.source);
      const ti = result.nodes.findIndex((nd) => nd.id === edge.target);
      if (si < 0 || ti < 0) continue;
      const dx = positions[ti].x - positions[si].x;
      const dy = positions[ti].y - positions[si].y;
      const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
      const force = dist * attraction;
      positions[si].vx += (dx / dist) * force;
      positions[si].vy += (dy / dist) * force;
      positions[ti].vx -= (dx / dist) * force;
      positions[ti].vy -= (dy / dist) * force;
    }
    // Apply
    for (let i = 0; i < n; i++) {
      positions[i].x += positions[i].vx;
      positions[i].y += positions[i].vy;
      positions[i].vx *= damping;
      positions[i].vy *= damping;
    }
  }

  // Normalize: ensure no negative positions
  let minX = Infinity,
    minY = Infinity;
  for (const p of positions) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
  }
  const offsetX = minX < 40 ? 40 - minX : 0;
  const offsetY = minY < 40 ? 40 - minY : 0;

  for (let i = 0; i < n; i++) {
    result.nodes[i] = {
      ...result.nodes[i],
      position: {
        x: Math.round(positions[i].x + offsetX),
        y: Math.round(positions[i].y + offsetY),
      },
    };
  }

  result.edges = diagram.edges.map((e) => ({ ...e }));
  return result;
}
