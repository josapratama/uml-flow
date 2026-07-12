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
        `${a.visibility}${a.name}${a.type ? `: ${a.type}` : ""}`.length,
      );
    for (const m of cn.methods || []) {
      const p = (m.params || [])
        .map((pp: any) => `${pp.name}: ${pp.type}`)
        .join(", ");
      maxMemberLen = Math.max(
        maxMemberLen,
        `${m.visibility}${m.name}(${p}): ${m.returnType}`.length,
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
      const len = `${a.name}: ${a.type || ""}`.length;
      maxAttrW = Math.max(maxAttrW, len * 7 + 40);
    }
    const totalW = Math.max(160, nameW, maxAttrW);
    return { width: totalW, height: totalH };
  }

  // For all other node types, use the stored size
  return node.size;
}
