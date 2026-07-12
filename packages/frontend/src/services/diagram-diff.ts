import type { Diagram, DiagramNode, Edge } from "@uml-editor/shared";

export interface DiffResult {
  addedNodes: DiagramNode[];
  removedNodes: DiagramNode[];
  modifiedNodes: { node: DiagramNode; changes: string[] }[];
  addedEdges: Edge[];
  removedEdges: Edge[];
  summary: string;
}

/**
 * Compare two diagrams and return the differences.
 * Useful for version comparison or before/after analysis.
 */
export function compareDiagrams(before: Diagram, after: Diagram): DiffResult {
  const beforeNodeIds = new Set(before.nodes.map((n) => n.id));
  const afterNodeIds = new Set(after.nodes.map((n) => n.id));
  const beforeEdgeIds = new Set(before.edges.map((e) => e.id));
  const afterEdgeIds = new Set(after.edges.map((e) => e.id));

  // Added/removed nodes
  const addedNodes = after.nodes.filter((n) => !beforeNodeIds.has(n.id));
  const removedNodes = before.nodes.filter((n) => !afterNodeIds.has(n.id));

  // Modified nodes (same ID, different content)
  const modifiedNodes: { node: DiagramNode; changes: string[] }[] = [];
  for (const afterNode of after.nodes) {
    if (!beforeNodeIds.has(afterNode.id)) continue;
    const beforeNode = before.nodes.find((n) => n.id === afterNode.id);
    if (!beforeNode) continue;

    const changes: string[] = [];
    if (beforeNode.name !== afterNode.name)
      changes.push(`name: "${beforeNode.name}" → "${afterNode.name}"`);
    if (
      beforeNode.position.x !== afterNode.position.x ||
      beforeNode.position.y !== afterNode.position.y
    )
      changes.push("position changed");
    if (
      beforeNode.size.width !== afterNode.size.width ||
      beforeNode.size.height !== afterNode.size.height
    )
      changes.push("size changed");

    // Check attributes/methods for class nodes
    if ("attributes" in beforeNode && "attributes" in afterNode) {
      const bAttrs = (beforeNode as any).attributes?.length || 0;
      const aAttrs = (afterNode as any).attributes?.length || 0;
      if (bAttrs !== aAttrs) changes.push(`attributes: ${bAttrs} → ${aAttrs}`);
    }
    if ("methods" in beforeNode && "methods" in afterNode) {
      const bMethods = (beforeNode as any).methods?.length || 0;
      const aMethods = (afterNode as any).methods?.length || 0;
      if (bMethods !== aMethods)
        changes.push(`methods: ${bMethods} → ${aMethods}`);
    }

    if (changes.length > 0) modifiedNodes.push({ node: afterNode, changes });
  }

  // Added/removed edges
  const addedEdges = after.edges.filter((e) => !beforeEdgeIds.has(e.id));
  const removedEdges = before.edges.filter((e) => !afterEdgeIds.has(e.id));

  const summary =
    [
      addedNodes.length > 0 ? `+${addedNodes.length} nodes` : "",
      removedNodes.length > 0 ? `-${removedNodes.length} nodes` : "",
      modifiedNodes.length > 0 ? `~${modifiedNodes.length} modified` : "",
      addedEdges.length > 0 ? `+${addedEdges.length} edges` : "",
      removedEdges.length > 0 ? `-${removedEdges.length} edges` : "",
    ]
      .filter(Boolean)
      .join(", ") || "No changes";

  return {
    addedNodes,
    removedNodes,
    modifiedNodes,
    addedEdges,
    removedEdges,
    summary,
  };
}
