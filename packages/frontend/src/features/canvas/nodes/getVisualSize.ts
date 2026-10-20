import type { DiagramNode, Size } from "@uml-editor/shared";
import { resolveStyle } from "./useNodeStyle";

/**
 * Calculates the actual visual (rendered) size of a node.
 * This matches what the node renderers draw, which may differ from node.size.
 * Used by NodeAnchors and edge routing to position correctly.
 */
export function getVisualSize(node: DiagramNode): Size {
  // ClassNode types (class, interface, abstract, enum) calculate their own size
  if ("attributes" in node && "methods" in node) {
    const cn = node as any;
    const s = resolveStyle(cn.style);

    const stereotype =
      cn.type === "interface"
        ? "«interface»"
        : cn.type === "abstract"
          ? "«abstract»"
          : cn.type === "enum"
            ? "«enumeration»"
            : null;

    const headerH = stereotype ? 42 : 30;
    const memberFs = Math.max(10, s.fontSize - 1);
    const lineH = memberFs + 7;
    const attrH = (cn.attributes?.length || 0) * lineH;
    const methodH = (cn.methods?.length || 0) * lineH;
    const totalH = headerH + attrH + (methodH > 0 ? methodH + 8 : 0) + 10;

    const memberCharW = memberFs * 0.62;
    const titleCharW = s.fontSize * 0.65;
    const stereoCharW = (s.fontSize - 4) * 0.58;

    let maxMemberLen = 0;
    for (const a of cn.attributes || [])
      maxMemberLen = Math.max(
        maxMemberLen,
        `${a.visibility || ""}${a.name || ""}${a.type ? `: ${a.type}` : ""}`.length,
      );
    for (const m of cn.methods || []) {
      const p = Array.isArray(m.params)
        ? m.params
            .map((pp: any) =>
              typeof pp === "string" ? pp : `${pp?.name || ""}${pp?.type ? ": " + pp.type : ""}`,
            )
            .filter(Boolean)
            .join(", ")
        : typeof m.params === "string"
          ? m.params
          : "";
      maxMemberLen = Math.max(
        maxMemberLen,
        `${m.visibility || ""}${m.name || ""}(${p}): ${m.returnType || "void"}`.length,
      );
    }

    const titleW = cn.name.length * titleCharW + 30;
    const memberW = maxMemberLen * memberCharW + 24;
    const stereoW = stereotype ? stereotype.length * stereoCharW + 28 : 0;
    const totalW = Math.max(100, titleW, memberW, stereoW);

    return { width: totalW, height: totalH };
  }

  // ERD entities (have attributes but no methods)
  if ("attributes" in node && !("methods" in node)) {
    const erd = node as any;
    const s = resolveStyle(erd.style);
    const headerH = 32;
    const rowH = Math.max(20, s.fontSize + 7);
    const attrCount = erd.attributes?.length || 0;
    const totalH = headerH + attrCount * rowH + 8;
    const nameW = erd.name.length * 9 + 40;
    let maxAttrW = 0;
    for (const a of erd.attributes || []) {
      const iconW = a.isPrimaryKey || a.isForeignKey ? 24 : 12;
      const attrNameW = (a.name || "").length * 7.5;
      const typeStr = `${a.type || ""}${a.isNullable ? " ?" : ""}${a.isUnique ? " UQ" : ""}`;
      const typeW = typeStr.length * 7.0;
      // icon + name + comfortable column gap (28px) + type + right margin (12px)
      const rowW = iconW + attrNameW + 28 + typeW + 12;
      maxAttrW = Math.max(maxAttrW, rowW);
    }
    const totalW = Math.max(180, nameW, Math.round(maxAttrW));
    return { width: totalW, height: totalH };
  }

  // For all other node types, adapt size to multiline text if needed
  if (node.name && node.size) {
    const lines = node.name.split("\n");
    if (lines.length > 1) {
      const s = resolveStyle((node as any).style);
      const fs = s.fontSize || 12;
      const charW = fs * 0.58;
      let maxLineLen = 0;
      for (const line of lines) {
        maxLineLen = Math.max(maxLineLen, line.length);
      }
      const neededW = Math.max(
        node.size.width,
        Math.round(maxLineLen * charW + 28),
      );
      const neededH = Math.max(
        node.size.height,
        Math.round(lines.length * (fs + 6) + 20),
      );
      return { width: neededW, height: neededH };
    }
  }

  return node.size;
}
