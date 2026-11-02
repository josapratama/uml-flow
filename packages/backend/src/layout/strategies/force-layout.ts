import type { Diagram, LayoutOptions } from "@uml-editor/shared";

/**
 * Force-directed layout (spring-based) with bounding-box overlap resolution.
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
  const cx = 450,
    cy = 350;

  let maxDim = 140;
  for (const node of result.nodes) {
    maxDim = Math.max(maxDim, node.size.width, node.size.height);
  }

  // Initialize positions (using center coordinates)
  const positions = result.nodes.map((node, i) => {
    if (node.type === "actor") {
      return { x: 100, y: 100 + i * 140, vx: 0, vy: 0 };
    }
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    const r = Math.max(180, (n * (maxDim + 40)) / (2 * Math.PI));
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      vx: 0,
      vy: 0,
    };
  });

  // Simulation
  const repulsion = Math.max(18000, maxDim * maxDim * 0.8);
  const attraction = 0.008;
  const damping = 0.82;
  const iterations = 90;

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
      const idealDist =
        (result.nodes[si].size.height + result.nodes[ti].size.height) / 2 + 80;
      const force = (dist - idealDist) * attraction;
      positions[si].vx += (dx / dist) * force;
      positions[si].vy += (dy / dist) * force;
      positions[ti].vx -= (dx / dist) * force;
      positions[ti].vy -= (dy / dist) * force;
    }
    // Apply velocity
    for (let i = 0; i < n; i++) {
      positions[i].x += positions[i].vx;
      positions[i].y += positions[i].vy;
      positions[i].vx *= damping;
      positions[i].vy *= damping;
    }

    // Bounding-box collision resolution so nodes never overlap
    const pad = 36;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const minDX =
          (result.nodes[i].size.width + result.nodes[j].size.width) / 2 + pad;
        const minDY =
          (result.nodes[i].size.height + result.nodes[j].size.height) / 2 + pad;
        const dx = positions[i].x - positions[j].x;
        const dy = positions[i].y - positions[j].y;
        const overlapX = minDX - Math.abs(dx);
        const overlapY = minDY - Math.abs(dy);
        if (overlapX > 0 && overlapY > 0) {
          if (overlapX < overlapY) {
            const sign = dx >= 0 ? 1 : -1;
            positions[i].x += (sign * overlapX) / 2;
            positions[j].x -= (sign * overlapX) / 2;
          } else {
            const sign = dy >= 0 ? 1 : -1;
            positions[i].y += (sign * overlapY) / 2;
            positions[j].y -= (sign * overlapY) / 2;
          }
        }
      }
    }
  }

  // Convert center positions to top-left and normalize so minX/minY >= 60
  const topLefts = positions.map((p, i) => ({
    x: p.x - result.nodes[i].size.width / 2,
    y: p.y - result.nodes[i].size.height / 2,
  }));

  let minX = Infinity,
    minY = Infinity;
  for (const p of topLefts) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
  }
  const offsetX = minX < 60 ? 60 - minX : 0;
  const offsetY = minY < 60 ? 60 - minY : 0;

  for (let i = 0; i < n; i++) {
    result.nodes[i] = {
      ...result.nodes[i],
      position: {
        x: Math.round(topLefts[i].x + offsetX),
        y: Math.round(topLefts[i].y + offsetY),
      },
    };
  }

  result.edges = diagram.edges.map((e) => ({ ...e }));
  return result;
}
