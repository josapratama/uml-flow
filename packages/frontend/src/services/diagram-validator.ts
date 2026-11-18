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
  locale: string = "id"
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

    // Flowchart specific validations
    if (diagram.type === "flowchart" || diagram.type === "activity") {
      const outgoingEdges = diagram.edges.filter((e) => e.source === node.id);
      const incomingEdges = diagram.edges.filter((e) => e.target === node.id);
      const nodeType = node.type as string;

      // Decision nodes must branch to at least 2 directions
      if (nodeType === "decision" && outgoingEdges.length < 2) {
        warnings.push({
          nodeId: node.id,
          message: isId
            ? "Node keputusan (decision) memerlukan minimal 2 cabang keluar (misal: Ya dan Tidak)"
            : "Decision node should have at least 2 outgoing branches (e.g. Yes and No)",
          severity: "warning",
        });
      }

      // Non-terminal nodes with no outgoing edges (accidental dead-end)
      if (
        nodeType !== "end" &&
        nodeType !== "terminal" &&
        nodeType !== "note" &&
        outgoingEdges.length === 0 &&
        diagram.nodes.length > 1
      ) {
        warnings.push({
          nodeId: node.id,
          message: isId
            ? "Alur proses berhenti tanpa mencapai node End/Terminal"
            : "Process flow dead-ends without reaching an End/Terminal node",
          severity: "warning",
        });
      }

      // Start node shouldn't have incoming edges
      if (nodeType === "start" && incomingEdges.length > 0) {
        warnings.push({
          nodeId: node.id,
          message: isId
            ? "Node Start umumnya tidak memiliki relasi masuk"
            : "Start node should typically not have incoming edges",
          severity: "info",
        });
      }
    }
  }

  // Multi-start check in Flowchart
  if (diagram.type === "flowchart" || diagram.type === "activity") {
    const startNodes = diagram.nodes.filter(
      (n) => (n.type as string) === "start"
    );
    if (startNodes.length > 1) {
      for (const sn of startNodes) {
        warnings.push({
          nodeId: sn.id,
          message: isId
            ? "Ditemukan lebih dari 1 node Start pada flowchart"
            : "Multiple Start nodes found in flowchart",
          severity: "warning",
        });
      }
    }
  }

  // Sequence participant inactivity check
  if (diagram.type === "sequence" && diagram.participants) {
    const messages = diagram.messages || [];
    for (const p of diagram.participants) {
      const hasMsg = messages.some((m) => m.from === p.id || m.to === p.id);
      if (!hasMsg && diagram.participants.length > 1) {
        warnings.push({
          nodeId: p.id,
          message: isId
            ? "Partisipan tidak memiliki pesan masuk maupun keluar"
            : "Participant has no incoming or outgoing messages",
          severity: "info",
        });
      }
    }
  }

  return warnings;
}
