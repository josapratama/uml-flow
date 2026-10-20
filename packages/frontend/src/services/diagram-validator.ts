import type { Diagram, DiagramNode } from "@uml-editor/shared";

export interface NodeWarning {
  nodeId: string;
  message: string;
  severity: "warning" | "info";
}

/**
 * Validate diagram and return per-node warnings.
 * These can be displayed as icons on the canvas.
 */
export function validateDiagramNodes(
  diagram: Diagram,
  locale: "id" | "en" = "id"
): NodeWarning[] {
  const warnings: NodeWarning[] = [];
  const isId = locale === "id";

  for (const node of diagram.nodes) {
    // Class diagram validations
    if ("attributes" in node && "methods" in node) {
      const cn = node as any;
      if (
        cn.attributes.length === 0 &&
        cn.methods.length === 0 &&
        cn.type !== "enum"
      ) {
        warnings.push({
          nodeId: node.id,
          message: isId
            ? "Kelas kosong — tidak ada atribut atau metode"
            : "Empty class — no attributes or methods",
          severity: "info",
        });
      }
      if (cn.type === "interface" && cn.attributes.length > 0) {
        warnings.push({
          nodeId: node.id,
          message: isId
            ? "Interface umumnya tidak memiliki atribut"
            : "Interfaces typically don't have attributes",
          severity: "warning",
        });
      }
      if (!node.name || node.name.trim().length === 0) {
        warnings.push({
          nodeId: node.id,
          message: isId ? "Node tidak memiliki nama" : "Node has no name",
          severity: "warning",
        });
      }
    }

    // ERD validations
    if ("attributes" in node && !("methods" in node)) {
      const erd = node as any;
      const hasPK = erd.attributes?.some((a: any) => a.isPrimaryKey);
      if (!hasPK && erd.attributes?.length > 0) {
        warnings.push({
          nodeId: node.id,
          message: isId
            ? "Entitas tidak memiliki primary key"
            : "Entity has no primary key",
          severity: "warning",
        });
      }
    }

    // Orphan node (no connections)
    const hasEdge = diagram.edges.some(
      (e) => e.source === node.id || e.target === node.id
    );
    if (
      !hasEdge &&
      diagram.nodes.length > 1 &&
      (node.type as string) !== "note"
    ) {
      warnings.push({
        nodeId: node.id,
        message: isId
          ? "Node terisolasi — tanpa koneksi relasi"
          : "Isolated node — no connections",
        severity: "info",
      });
    }
  }

  return warnings;
}
