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
 * Uses smart matching: tries ID match first, then falls back to name + type matching.
 */
export function compareDiagrams(before: Diagram, after: Diagram): DiffResult {
  const beforeById = new Map(before.nodes.map((n) => [n.id, n]));
  const beforeByName = new Map(
    before.nodes.map((n) => [`${n.type}_${n.name}`, n]),
  );

  const matchedBeforeIds = new Set<string>();
  const nodePairs: Array<{ beforeNode: DiagramNode; afterNode: DiagramNode }> =
    [];
  const addedNodes: DiagramNode[] = [];

  for (const afterNode of after.nodes) {
    let matchedBefore: DiagramNode | undefined = beforeById.get(afterNode.id);
    if (!matchedBefore) {
      matchedBefore = beforeByName.get(`${afterNode.type}_${afterNode.name}`);
    }
    if (matchedBefore && !matchedBeforeIds.has(matchedBefore.id)) {
      matchedBeforeIds.add(matchedBefore.id);
      nodePairs.push({ beforeNode: matchedBefore, afterNode });
    } else {
      addedNodes.push(afterNode);
    }
  }

  const removedNodes = before.nodes.filter((n) => !matchedBeforeIds.has(n.id));

  // Modified nodes (content or layout differences)
  const modifiedNodes: { node: DiagramNode; changes: string[] }[] = [];
  for (const { beforeNode, afterNode } of nodePairs) {
    const changes: string[] = [];
    if (beforeNode.name !== afterNode.name) {
      changes.push(`name: "${beforeNode.name}" → "${afterNode.name}"`);
    }
    if (
      Math.abs(beforeNode.position.x - afterNode.position.x) > 2 ||
      Math.abs(beforeNode.position.y - afterNode.position.y) > 2
    ) {
      changes.push("position moved");
    }
    if (
      Math.abs(beforeNode.size.width - afterNode.size.width) > 2 ||
      Math.abs(beforeNode.size.height - afterNode.size.height) > 2
    ) {
      changes.push("size resized");
    }

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

  // Edge diff (smart match by endpoint nodes and relation type)
  const beforeEdgeKeys = new Set(
    before.edges.map((e) => `${e.source}_${e.target}_${e.type}`),
  );
  const afterEdgeKeys = new Set(
    after.edges.map((e) => `${e.source}_${e.target}_${e.type}`),
  );

  const addedEdges = after.edges.filter(
    (e) =>
      !beforeEdgeKeys.has(`${e.source}_${e.target}_${e.type}`) &&
      !before.edges.some((be) => be.id === e.id),
  );
  const removedEdges = before.edges.filter(
    (e) =>
      !afterEdgeKeys.has(`${e.source}_${e.target}_${e.type}`) &&
      !after.edges.some((ae) => ae.id === e.id),
  );

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
