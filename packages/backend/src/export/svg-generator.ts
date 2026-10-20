import type { Diagram, ExportOptions } from "@uml-editor/shared";

/**
 * Computes the bounding box of a diagram and returns padded width/height.
 */
function computeBoundingBox(diagram: Diagram): {
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
} {
  let minX = Infinity,
    minY = Infinity,
    maxX = 0,
    maxY = 0;

  for (const node of diagram.nodes) {
    const { position, size } = node;
    minX = Math.min(minX, position.x);
    minY = Math.min(minY, position.y);
    maxX = Math.max(maxX, position.x + size.width);
    maxY = Math.max(maxY, position.y + size.height);
  }

  // Also include edge points in bounding box
  for (const edge of diagram.edges) {
    if (edge.points) {
      for (const pt of edge.points) {
        minX = Math.min(minX, pt.x);
        minY = Math.min(minY, pt.y);
        maxX = Math.max(maxX, pt.x);
        maxY = Math.max(maxY, pt.y);
      }
    }
  }

  // Also include sequence diagram participants
  if (diagram.participants) {
    for (const p of diagram.participants) {
      minX = Math.min(minX, p.position.x - 60);
      minY = Math.min(minY, p.position.y - 40);
      maxX = Math.max(maxX, p.position.x + 60);
    }
    const msgCount = diagram.messages?.length || 0;
    maxY = Math.max(maxY, 100 + (msgCount + 2) * 50 + 80);
  }

  if (!isFinite(minX)) {
    minX = 0;
    minY = 0;
    maxX = 800;
    maxY = 600;
  }

  const padding = 40;
  return {
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2,
    offsetX: padding - minX,
    offsetY: padding - minY,
  };
}

/**
 * Computes edge points for layouts that don't pre-calculate them.
 * Uses center-to-center routing as a fallback.
 */
function computeEdgePoints(diagram: Diagram): Diagram {
  const nodeMap = new Map(diagram.nodes.map((n) => [n.id, n]));
  const edges = diagram.edges.map((edge) => {
    if (edge.points && edge.points.length >= 2) return edge;
    const src = nodeMap.get(edge.source);
    const tgt = nodeMap.get(edge.target);
    if (!src || !tgt) return edge;

    const srcCX = src.position.x + src.size.width / 2;
    const srcCY = src.position.y + src.size.height / 2;
    const tgtCX = tgt.position.x + tgt.size.width / 2;
    const tgtCY = tgt.position.y + tgt.size.height / 2;

    // Find edge exit/entry points on node borders
    const from = getEdgePoint(
      src.position,
      src.size,
      tgtCX - srcCX,
      tgtCY - srcCY,
    );
    const to = getEdgePoint(
      tgt.position,
      tgt.size,
      srcCX - tgtCX,
      srcCY - tgtCY,
    );

    return { ...edge, points: [from, to] };
  });
  return { ...diagram, edges };
}

function getEdgePoint(
  pos: { x: number; y: number },
  size: { width: number; height: number },
  dx: number,
  dy: number,
): { x: number; y: number } {
  const cx = pos.x + size.width / 2;
  const cy = pos.y + size.height / 2;
  const hw = size.width / 2;
  const hh = size.height / 2;
  const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
  const nx = dx / len,
    ny = dy / len;

  // Find intersection with rectangle border
  let t = Infinity;
  if (nx > 0) t = Math.min(t, hw / nx);
  else if (nx < 0) t = Math.min(t, -hw / nx);
  if (ny > 0) t = Math.min(t, hh / ny);
  else if (ny < 0) t = Math.min(t, -hh / ny);

  return { x: cx + nx * t, y: cy + ny * t };
}

/**
 * Generates SVG from a Diagram model.
 */
export function generateSVG(diagram: Diagram, options: ExportOptions): string {
  // Compute edge points for layouts that don't set them
  const diagramWithEdges = computeEdgePoints(diagram);

  // Auto-size based on content
  const bbox = computeBoundingBox(diagramWithEdges);
  const width = options.width || bbox.width;
  const height = options.height || bbox.height;
  const offsetX = options.width ? 0 : bbox.offsetX;
  const offsetY = options.height ? 0 : bbox.offsetY;
  const bg = options.background || "#ffffff";

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
  svg += `<rect width="100%" height="100%" fill="${bg}"/>`;
  svg += `<style>
    .node-rect { fill: #fff; stroke: #333; stroke-width: 1.5; }
    .node-title { font: bold 14px sans-serif; fill: #333; }
    .node-member { font: 12px monospace; fill: #555; }
    .edge-line { stroke: #666; stroke-width: 1.5; fill: none; }
    .edge-label { font: 11px sans-serif; fill: #444; }
    .separator { stroke: #ccc; stroke-width: 1; }
  </style>`;

  // Arrow markers
  svg += `<defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10" fill="none" stroke="#666" stroke-width="1.5"/>
    </marker>
    <marker id="arrow-filled" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 Z" fill="#666"/>
    </marker>
    <marker id="arrow-hollow" markerWidth="12" markerHeight="12" refX="11" refY="6" orient="auto">
      <path d="M 0 0 L 12 6 L 0 12 Z" fill="white" stroke="#666" stroke-width="1"/>
    </marker>
    <marker id="diamond-hollow" markerWidth="12" markerHeight="8" refX="12" refY="4" orient="auto">
      <polygon points="0,4 6,0 12,4 6,8" fill="white" stroke="#666" stroke-width="1"/>
    </marker>
    <marker id="diamond-filled" markerWidth="12" markerHeight="8" refX="12" refY="4" orient="auto">
      <polygon points="0,4 6,0 12,4 6,8" fill="#666"/>
    </marker>
  </defs>`;

  // Render with offset transform to normalize coordinates
  svg += `<g transform="translate(${offsetX}, ${offsetY})">`;

  // Render sequence diagrams specially
  if (diagram.type === "sequence") {
    svg += renderSequenceDiagram(diagramWithEdges);
  } else {
    for (const node of diagramWithEdges.nodes) {
      svg += renderNode(node);
    }
    for (const edge of diagramWithEdges.edges) {
      svg += renderEdge(edge);
    }
  }

  svg += "</g>";
  svg += "</svg>";
  return svg;
}

function renderNode(node: any): string {
  const { position, size, name } = node;
  let svg = "";

  if (
    node.type === "class" ||
    node.type === "interface" ||
    node.type === "abstract" ||
    node.type === "enum" ||
    "attributes" in node ||
    "methods" in node
  ) {
    // Class / interface / abstract / enum node
    const headerColor =
      node.type === "interface"
        ? "#E8F4FD"
        : node.type === "abstract"
          ? "#FFF3E0"
          : node.type === "enum"
            ? "#F3E5F5"
            : "#E8F5E9";
    svg += `<rect x="${position.x}" y="${position.y}" width="${size.width}" height="${size.height}" fill="white" stroke="#333" stroke-width="1.5" rx="3"/>`;
    svg += `<rect x="${position.x}" y="${position.y}" width="${size.width}" height="28" fill="${headerColor}" stroke="#333" stroke-width="1.5" rx="3"/>`;
    svg += `<rect x="${position.x}" y="${position.y + 16}" width="${size.width}" height="12" fill="${headerColor}"/>`;
    if (node.type === "interface") {
      svg += `<text x="${position.x + size.width / 2}" y="${position.y + 11}" text-anchor="middle" font-size="9" fill="#555" font-style="italic">«interface»</text>`;
      svg += `<text x="${position.x + size.width / 2}" y="${position.y + 23}" text-anchor="middle" font-size="12" font-weight="bold" fill="#333">${escapeXml(name)}</text>`;
    } else if (node.type === "abstract") {
      svg += `<text x="${position.x + size.width / 2}" y="${position.y + 11}" text-anchor="middle" font-size="9" fill="#555" font-style="italic">«abstract»</text>`;
      svg += `<text x="${position.x + size.width / 2}" y="${position.y + 23}" text-anchor="middle" font-size="12" font-weight="bold" fill="#333" font-style="italic">${escapeXml(name)}</text>`;
    } else if (node.type === "enum") {
      svg += `<text x="${position.x + size.width / 2}" y="${position.y + 11}" text-anchor="middle" font-size="9" fill="#555" font-style="italic">«enum»</text>`;
      svg += `<text x="${position.x + size.width / 2}" y="${position.y + 23}" text-anchor="middle" font-size="12" font-weight="bold" fill="#333">${escapeXml(name)}</text>`;
    } else {
      svg += `<text x="${position.x + size.width / 2}" y="${position.y + 19}" text-anchor="middle" font-size="13" font-weight="bold" fill="#333">${escapeXml(name)}</text>`;
    }
    const sepY = position.y + 30;
    svg += `<line x1="${position.x}" y1="${sepY}" x2="${position.x + size.width}" y2="${sepY}" stroke="#ccc" stroke-width="1"/>`;
    let y = sepY + 15;
    for (const attr of node.attributes || []) {
      const vis = attr.visibility || "";
      const attrName = attr.name || "";
      const attrType = attr.type ? ": " + attr.type : "";
      svg += `<text x="${position.x + 8}" y="${y}" font-size="11" font-family="monospace" fill="#555">${escapeXml(vis + attrName + attrType)}</text>`;
      y += 17;
    }
    if (node.methods && node.methods.length > 0) {
      svg += `<line x1="${position.x}" y1="${y - 2}" x2="${position.x + size.width}" y2="${y - 2}" stroke="#ccc" stroke-width="1"/>`;
      y += 8;
      for (const m of node.methods) {
        const params = Array.isArray(m.params)
          ? m.params
              .map((p: any) =>
                typeof p === "string"
                  ? p
                  : `${p.name || ""}${p.type ? ": " + p.type : ""}`,
              )
              .join(", ")
          : typeof m.params === "string"
            ? m.params
            : "";
        svg += `<text x="${position.x + 8}" y="${y}" font-size="11" font-family="monospace" fill="#555">${escapeXml(`${m.visibility || ""}${m.name || ""}(${params}): ${m.returnType || "void"}`)}</text>`;
        y += 17;
      }
    }
  } else if (
    node.type === "entity" ||
    (node.type === "weak-entity" || ("attributes" in node && !("methods" in node)))
  ) {
    // ERD entity
    svg += `<rect x="${position.x}" y="${position.y}" width="${size.width}" height="${size.height}" fill="white" stroke="#333" stroke-width="1.5" rx="3"/>`;
    svg += `<rect x="${position.x}" y="${position.y}" width="${size.width}" height="28" fill="#FFF3E0" stroke="#333" stroke-width="1.5" rx="3"/>`;
    svg += `<rect x="${position.x}" y="${position.y + 16}" width="${size.width}" height="12" fill="#FFF3E0"/>`;
    svg += `<text x="${position.x + size.width / 2}" y="${position.y + 19}" text-anchor="middle" font-size="13" font-weight="bold" fill="#333">${escapeXml(name)}</text>`;
    svg += `<line x1="${position.x}" y1="${position.y + 30}" x2="${position.x + size.width}" y2="${position.y + 30}" stroke="#ccc" stroke-width="1"/>`;
    let y = position.y + 45;
    const cols = node.attributes || node.columns || [];
    for (const col of cols) {
      const isPk = col.isPrimaryKey ?? col.isPrimary ?? false;
      const isFk = col.isForeignKey ?? col.isFk ?? false;
      const icon = isPk ? "🔑" : isFk ? "🔗" : "  ";
      svg += `<text x="${position.x + 8}" y="${y}" font-size="11" font-family="monospace" fill="#555">${icon} ${escapeXml(col.name)}: ${escapeXml(col.type)}</text>`;
      y += 17;
    }
  } else if (
    ((node.type === "actor" ||
      node.type === "usecase" ||
      node.type === "system") &&
      "system" in node) ||
    node.type === "actor" ||
    node.type === "usecase"
  ) {
    // Use case nodes
    if (node.type === "actor") {
      const cx = position.x + size.width / 2;
      const cy = position.y + 15;
      svg += `<circle cx="${cx}" cy="${cy}" r="10" fill="none" stroke="#333" stroke-width="1.5"/>`;
      svg += `<line x1="${cx}" y1="${cy + 10}" x2="${cx}" y2="${cy + 30}" stroke="#333" stroke-width="1.5"/>`;
      svg += `<line x1="${cx - 12}" y1="${cy + 18}" x2="${cx + 12}" y2="${cy + 18}" stroke="#333" stroke-width="1.5"/>`;
      svg += `<line x1="${cx}" y1="${cy + 30}" x2="${cx - 8}" y2="${cy + 42}" stroke="#333" stroke-width="1.5"/>`;
      svg += `<line x1="${cx}" y1="${cy + 30}" x2="${cx + 8}" y2="${cy + 42}" stroke="#333" stroke-width="1.5"/>`;
      svg += `<text x="${cx}" y="${position.y + 62}" text-anchor="middle" font-size="12" fill="#333">${escapeXml(name)}</text>`;
    } else if (node.type === "usecase") {
      svg += `<ellipse cx="${position.x + size.width / 2}" cy="${position.y + size.height / 2}" rx="${size.width / 2}" ry="${size.height / 2}" fill="#E3F2FD" stroke="#333" stroke-width="1.5"/>`;
      svg += `<text x="${position.x + size.width / 2}" y="${position.y + size.height / 2 + 4}" text-anchor="middle" font-size="12" fill="#333">${escapeXml(name)}</text>`;
    } else {
      svg += `<rect x="${position.x}" y="${position.y}" width="${size.width}" height="${size.height}" fill="none" stroke="#333" stroke-width="2" stroke-dasharray="8,4" rx="2"/>`;
      svg += `<text x="${position.x + 8}" y="${position.y + 16}" font-size="11" fill="#555">«system»</text>`;
      svg += `<text x="${position.x + size.width / 2}" y="${position.y + size.height / 2 + 4}" text-anchor="middle" font-size="13" font-weight="bold" fill="#333">${escapeXml(name)}</text>`;
    }
  } else if (
    node.type === "state" ||
    node.type === "initial" ||
    node.type === "final"
  ) {
    // State diagram nodes
    if (node.type === "initial") {
      const cx = position.x + size.width / 2,
        cy = position.y + size.height / 2;
      svg += `<circle cx="${cx}" cy="${cy}" r="12" fill="#333"/>`;
    } else if (node.type === "final") {
      const cx = position.x + size.width / 2,
        cy = position.y + size.height / 2;
      svg += `<circle cx="${cx}" cy="${cy}" r="14" fill="none" stroke="#333" stroke-width="2"/>`;
      svg += `<circle cx="${cx}" cy="${cy}" r="9" fill="#333"/>`;
    } else {
      svg += `<rect x="${position.x}" y="${position.y}" width="${size.width}" height="${size.height}" fill="#E8EAF6" stroke="#333" stroke-width="1.5" rx="10"/>`;
      svg += `<text x="${position.x + size.width / 2}" y="${position.y + size.height / 2 + 4}" text-anchor="middle" font-size="12" fill="#333">${escapeXml(name)}</text>`;
    }
  } else if (
    node.type === "component" ||
    node.type === "interface-provided" ||
    node.type === "interface-required"
  ) {
    // Component diagram
    if (node.type === "component") {
      svg += `<rect x="${position.x}" y="${position.y}" width="${size.width}" height="${size.height}" fill="#E8F4FD" stroke="#333" stroke-width="1.5" rx="3"/>`;
      svg += `<rect x="${position.x + size.width - 20}" y="${position.y + 8}" width="14" height="10" fill="white" stroke="#333" stroke-width="1"/>`;
      svg += `<rect x="${position.x + size.width - 18}" y="${position.y + 11}" width="4" height="4" fill="white" stroke="#333" stroke-width="1"/>`;
      svg += `<text x="${position.x + (size.width - 10) / 2}" y="${position.y + size.height / 2 + 4}" text-anchor="middle" font-size="12" fill="#333">${escapeXml(name)}</text>`;
    } else {
      svg += `<circle cx="${position.x + size.width / 2}" cy="${position.y + size.height / 2}" r="${Math.min(size.width, size.height) / 2}" fill="none" stroke="#333" stroke-width="1.5"/>`;
      svg += `<text x="${position.x + size.width / 2}" y="${position.y + size.height + 14}" text-anchor="middle" font-size="11" fill="#333">${escapeXml(name)}</text>`;
    }
  } else if (
    node.type === "node" ||
    node.type === "device" ||
    node.type === "artifact"
  ) {
    // Deployment diagram
    const d3offset = 8;
    if (node.type === "node" || node.type === "device") {
      svg += `<rect x="${position.x}" y="${position.y}" width="${size.width}" height="${size.height}" fill="#FFF8E1" stroke="#333" stroke-width="1.5"/>`;
      svg += `<polygon points="${position.x},${position.y} ${position.x + d3offset},${position.y - d3offset} ${position.x + size.width + d3offset},${position.y - d3offset} ${position.x + size.width},${position.y}" fill="#FFECB3" stroke="#333" stroke-width="1.5"/>`;
      svg += `<polygon points="${position.x + size.width},${position.y} ${position.x + size.width + d3offset},${position.y - d3offset} ${position.x + size.width + d3offset},${position.y + size.height - d3offset} ${position.x + size.width},${position.y + size.height}" fill="#FFE082" stroke="#333" stroke-width="1.5"/>`;
      svg += `<text x="${position.x + size.width / 2}" y="${position.y + 16}" text-anchor="middle" font-size="9" fill="#555" font-style="italic">«${node.type}»</text>`;
      svg += `<text x="${position.x + size.width / 2}" y="${position.y + size.height / 2 + 8}" text-anchor="middle" font-size="12" font-weight="bold" fill="#333">${escapeXml(name)}</text>`;
    } else {
      // artifact
      svg += `<rect x="${position.x}" y="${position.y}" width="${size.width}" height="${size.height}" fill="white" stroke="#333" stroke-width="1.5" rx="3"/>`;
      svg += `<text x="${position.x + size.width / 2}" y="${position.y + 14}" text-anchor="middle" font-size="9" fill="#555" font-style="italic">«artifact»</text>`;
      svg += `<text x="${position.x + size.width / 2}" y="${position.y + size.height / 2 + 8}" text-anchor="middle" font-size="12" fill="#333">${escapeXml(name)}</text>`;
    }
  } else {
    // Generic / activity / flowchart nodes
    const fillColor =
      node.type === "decision"
        ? "#FFF9C4"
        : node.type === "start"
          ? "#333"
          : node.type === "end"
            ? "white"
            : node.type === "action"
              ? "white"
              : "#fff";
    if (node.type === "start") {
      svg += `<circle cx="${position.x + size.width / 2}" cy="${position.y + size.height / 2}" r="12" fill="#333"/>`;
    } else if (node.type === "end") {
      const cx = position.x + size.width / 2,
        cy = position.y + size.height / 2;
      svg += `<circle cx="${cx}" cy="${cy}" r="14" fill="none" stroke="#333" stroke-width="2"/>`;
      svg += `<circle cx="${cx}" cy="${cy}" r="9" fill="#333"/>`;
    } else if (node.type === "decision") {
      const cx = position.x + size.width / 2,
        cy = position.y + size.height / 2;
      svg += `<polygon points="${cx},${position.y} ${position.x + size.width},${cy} ${cx},${position.y + size.height} ${position.x},${cy}" fill="${fillColor}" stroke="#333" stroke-width="1.5"/>`;
      svg += `<text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="11" fill="#333">${escapeXml(name)}</text>`;
    } else if (node.type === "fork" || node.type === "join") {
      svg += `<rect x="${position.x}" y="${position.y + size.height / 2 - 3}" width="${size.width}" height="6" rx="3" fill="#333"/>`;
    } else if (node.type === "action") {
      svg += `<rect x="${position.x}" y="${position.y}" width="${size.width}" height="${size.height}" rx="10" fill="white" stroke="#333" stroke-width="1.5"/>`;
      svg += `<text x="${position.x + size.width / 2}" y="${position.y + size.height / 2 + 4}" text-anchor="middle" font-size="12" fill="#333">${escapeXml(name)}</text>`;
    } else {
      svg += `<rect x="${position.x}" y="${position.y}" width="${size.width}" height="${size.height}" fill="${fillColor}" stroke="#333" stroke-width="1.5" rx="3"/>`;
      svg += `<text x="${position.x + size.width / 2}" y="${position.y + size.height / 2 + 5}" text-anchor="middle" font-size="13" font-weight="bold" fill="#333">${escapeXml(name)}</text>`;
    }
  }

  return svg;
}

function renderEdge(edge: any): string {
  if (!edge.points || edge.points.length < 2) return "";
  const points = edge.points;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++)
    d += ` L ${points[i].x} ${points[i].y}`;

  const dash = ["dependency", "realization"].includes(edge.type)
    ? ' stroke-dasharray="5,5"'
    : "";

  let markerEnd = "url(#arrow)";
  let markerStart = "";
  if (edge.type === "inheritance") markerEnd = "url(#arrow-hollow)";
  else if (edge.type === "realization") markerEnd = "url(#arrow-hollow)";
  else if (edge.type === "composition") {
    markerEnd = "url(#arrow)";
    markerStart = "url(#diamond-filled)";
  } else if (edge.type === "aggregation") {
    markerEnd = "url(#arrow)";
    markerStart = "url(#diamond-hollow)";
  }

  let svg = `<path d="${d}" fill="none" stroke="#666" stroke-width="1.5"${dash} marker-end="${markerEnd}"${markerStart ? ` marker-start="${markerStart}"` : ""}/>`;

  if (edge.label) {
    const mid = points[Math.floor(points.length / 2)];
    const labelText =
      typeof edge.label === "string" ? edge.label : edge.label.text || "";
    svg += `<text x="${mid.x}" y="${mid.y - 8}" font-size="11" font-family="sans-serif" fill="#444" text-anchor="middle">${escapeXml(labelText)}</text>`;
  }
  return svg;
}

function escapeXml(str: string | undefined | null): string {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function renderSequenceDiagram(diagram: any): string {
  const participants = diagram.participants || [];
  const messages = diagram.messages || [];
  const msgSpacing = 50;
  const startY = 100;
  const lifelineEnd = startY + (messages.length + 2) * msgSpacing + 40;
  let svg = "";

  // Participants (top)
  for (const p of participants) {
    const boxW = Math.max(80, p.name.length * 8 + 20);
    if (p.type === "actor") {
      const cx = p.position.x,
        cy = p.position.y || 50;
      svg += `<circle cx="${cx}" cy="${cy - 15}" r="10" fill="none" stroke="#444" stroke-width="1.5"/>`;
      svg += `<line x1="${cx}" y1="${cy - 5}" x2="${cx}" y2="${cy + 15}" stroke="#444" stroke-width="1.5"/>`;
      svg += `<line x1="${cx - 12}" y1="${cy + 3}" x2="${cx + 12}" y2="${cy + 3}" stroke="#444" stroke-width="1.5"/>`;
      svg += `<line x1="${cx}" y1="${cy + 15}" x2="${cx - 8}" y2="${cy + 27}" stroke="#444" stroke-width="1.5"/>`;
      svg += `<line x1="${cx}" y1="${cy + 15}" x2="${cx + 8}" y2="${cy + 27}" stroke="#444" stroke-width="1.5"/>`;
      svg += `<text x="${cx}" y="${cy + 42}" text-anchor="middle" font-size="11" fill="#333">${escapeXml(p.name)}</text>`;
    } else {
      svg += `<rect x="${p.position.x - boxW / 2}" y="${(p.position.y || 60) - 15}" width="${boxW}" height="30" rx="3" fill="#E3F2FD" stroke="#444" stroke-width="1.5"/>`;
      svg += `<text x="${p.position.x}" y="${(p.position.y || 60) + 4}" text-anchor="middle" font-size="12" fill="#333">${escapeXml(p.name)}</text>`;
    }
    // Lifeline
    svg += `<line x1="${p.position.x}" y1="${startY - 10}" x2="${p.position.x}" y2="${lifelineEnd}" stroke="#999" stroke-width="1" stroke-dasharray="4,4"/>`;
  }

  // Messages
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const fromP = participants.find((p: any) => p.id === msg.from);
    const toP = participants.find((p: any) => p.id === msg.to);
    if (!fromP || !toP) continue;
    const y = startY + i * msgSpacing;
    const x1 = fromP.position.x,
      x2 = toP.position.x;
    const midX = (x1 + x2) / 2;
    const dash =
      msg.type === "return" || msg.type === "async"
        ? ' stroke-dasharray="5,3"'
        : "";
    svg += `<line x1="${x1}" y1="${y}" x2="${x2 - (x2 > x1 ? 8 : -8)}" y2="${y}" stroke="#555" stroke-width="1.5"${dash} marker-end="url(#arrow)"/>`;
    svg += `<text x="${midX}" y="${y - 8}" text-anchor="middle" font-size="11" fill="#444">${escapeXml(msg.label)}</text>`;
  }

  return svg;
}
