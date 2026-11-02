import { getInnerTextMaxWidth, wrapMultilineText } from "@uml-editor/shared";

/** Light-theme palette, identical to the canvas (getFlowchartColors, light mode). */
const LIGHT_COLORS: Record<string, { bg: string; border: string; font: string }> = {
  start: { bg: "#C8E6C9", border: "#4ade80", font: "#14532d" },
  end: { bg: "#FFCDD2", border: "#f87171", font: "#7f1d1d" },
  process: { bg: "#E3F2FD", border: "#60a5fa", font: "#0f172a" },
  decision: { bg: "#FFF9C4", border: "#facc15", font: "#0f172a" },
  io: { bg: "#F3E5F5", border: "#c084fc", font: "#0f172a" },
  database: { bg: "#E8F5E9", border: "#2dd4bf", font: "#0f172a" },
  document: { bg: "#FFF3E0", border: "#fb923c", font: "#0f172a" },
  subroutine: { bg: "#E0F7FA", border: "#38bdf8", font: "#0f172a" },
  connector: { bg: "#EEF2FF", border: "#818cf8", font: "#0f172a" },
  preparation: { bg: "#ffffff", border: "#cbd5e1", font: "#0f172a" },
  action: { bg: "#ffffff", border: "#cbd5e1", font: "#0f172a" },
  merge: { bg: "#E8F5E9", border: "#60a5fa", font: "#0f172a" },
};

export const FLOW_NODE_TYPES = new Set([
  "start",
  "end",
  "process",
  "decision",
  "io",
  "document",
  "database",
  "subroutine",
  "connector",
  "preparation",
  "action",
  "fork",
  "join",
  "merge",
]);

function esc(str: string): string {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function textBlock(
  text: string,
  cx: number,
  cy: number,
  type: string,
  boxWidth: number,
  o: { fontSize: number; fontFamily: string; fill: string; weight?: string; italic?: boolean },
): string {
  if (!text) return "";
  const lineHeight = o.fontSize + 4;
  const innerW = getInnerTextMaxWidth(type, boxWidth);
  const maxChars = Math.max(12, Math.floor((innerW - 16) / (o.fontSize * 0.58)));
  const { lines, isHeaderLine } = wrapMultilineText(text, maxChars);
  if (!lines.length) return "";
  const startY = cy - (lines.length * lineHeight) / 2 + lineHeight * 0.72;
  const base = o.weight && o.weight !== "normal" ? ` font-weight="${o.weight}"` : "";
  const italic = o.italic ? ' font-style="italic"' : "";
  let out = `<text x="${cx}" y="${startY.toFixed(1)}" text-anchor="middle" font-size="${o.fontSize}" font-family="${esc(o.fontFamily)}" fill="${o.fill}"${base}${italic}>`;
  lines.forEach((line, i) => {
    const fw = isHeaderLine[i] && !base ? ' font-weight="600"' : "";
    out += `<tspan x="${cx}" dy="${i === 0 ? 0 : lineHeight}"${fw}>${esc(line)}</tspan>`;
  });
  return out + "</text>";
}

/**
 * Renders flowchart/activity nodes with the same shapes, colors, per-node style
 * overrides and text wrapping used on the canvas, so exports match the screen.
 */
export function renderFlowNode(node: any): string {
  const { position: p, size: s, name, type } = node;
  const style = node.style || {};
  const pal = LIGHT_COLORS[type] || LIGHT_COLORS.process;
  const fill = style.backgroundColor || pal.bg;
  const stroke = style.borderColor || pal.border;
  const font = style.fontColor || pal.font;
  const sw = style.borderStyle === "none" ? 0 : (style.borderWidth ?? 1.5);
  const dash =
    style.borderStyle === "dashed"
      ? ' stroke-dasharray="6 4"'
      : style.borderStyle === "dotted"
        ? ' stroke-dasharray="2 3"'
        : "";
  const attrs = `fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${dash}`;
  const radius = style.borderRadius ?? 8;
  const fontSize = style.fontSize ?? 13;
  const txt = {
    fontSize,
    fontFamily: style.fontFamily || "Inter, system-ui, sans-serif",
    fill: font,
    weight: style.fontWeight === "bold" ? "bold" : undefined,
    italic: style.fontStyle === "italic",
  };
  const { x, y } = p;
  const w = s.width;
  const h = s.height;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const opacity = style.opacity !== undefined ? ` opacity="${style.opacity}"` : "";
  let svg = `<g${opacity}>`;

  // Tiny activity symbols
  if ((type === "start" || type === "end") && w <= 36 && h <= 36) {
    svg += type === "start"
      ? `<circle cx="${cx}" cy="${cy}" r="12" fill="${style.borderColor || "#333"}"/>`
      : `<circle cx="${cx}" cy="${cy}" r="14" fill="none" stroke="${style.borderColor || "#333"}" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="9" fill="${style.borderColor || "#333"}"/>`;
    return svg + "</g>";
  }
  if (type === "fork" || type === "join") {
    return svg + `<rect x="${x}" y="${cy - 3}" width="${w}" height="6" rx="3" fill="${style.borderColor || "#333"}"/></g>`;
  }

  switch (type) {
    case "start":
    case "end": {
      const rx = Math.min((w - 4) / 2, (h - 4) / 2, style.borderRadius ?? 28);
      svg += `<rect x="${x + 2}" y="${y + 2}" width="${w - 4}" height="${h - 4}" rx="${rx}" ${attrs}/>`;
      txt.weight = txt.weight || "600";
      break;
    }
    case "decision":
      svg += `<polygon points="${cx},${y + 2} ${x + w - 2},${cy} ${cx},${y + h - 2} ${x + 2},${cy}" ${attrs}/>`;
      break;
    case "merge":
      svg += `<polygon points="${cx},${y} ${x + w},${cy} ${cx},${y + h} ${x},${cy}" ${attrs}/>`;
      return svg + "</g>";
    case "io":
      svg += `<polygon points="${x + 15},${y} ${x + w},${y} ${x + w - 15},${y + h} ${x},${y + h}" ${attrs}/>`;
      break;
    case "document":
      svg += `<path d="M ${x} ${y} H ${x + w} V ${y + h - 10} Q ${x + w * 0.75} ${y + h - 20} ${cx} ${y + h - 10} Q ${x + w * 0.25} ${y + h} ${x} ${y + h - 10} Z" ${attrs}/>`;
      break;
    case "database":
      svg += `<ellipse cx="${cx}" cy="${y + 10}" rx="${w / 2 - 2}" ry="10" ${attrs}/>`;
      svg += `<rect x="${x + 2}" y="${y + 10}" width="${w - 4}" height="${h - 20}" ${attrs}/>`;
      svg += `<ellipse cx="${cx}" cy="${y + h - 10}" rx="${w / 2 - 2}" ry="10" ${attrs}/>`;
      break;
    case "subroutine":
      svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" ${attrs}/>`;
      svg += `<line x1="${x + 10}" y1="${y}" x2="${x + 10}" y2="${y + h}" stroke="${stroke}"/>`;
      svg += `<line x1="${x + w - 10}" y1="${y}" x2="${x + w - 10}" y2="${y + h}" stroke="${stroke}"/>`;
      break;
    case "connector":
      svg += `<circle cx="${cx}" cy="${cy}" r="${Math.min(w, h) / 2 - 2}" ${attrs}/>`;
      break;
    case "action":
      svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" ${attrs}/>`;
      break;
    default:
      svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" ${attrs}/>`;
  }

  const ty = type === "document" ? cy - 4 : type === "database" ? cy + 4 : cy;
  svg += textBlock(name, cx, ty, type, w, txt);
  return svg + "</g>";
}

