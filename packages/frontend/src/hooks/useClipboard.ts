import { useState, useCallback } from "react";
import type { DiagramNode, Edge } from "@uml-editor/shared";

interface ClipboardData {
  nodes: DiagramNode[];
  edges: Edge[];
}

/**
 * Manages copy/paste of nodes and edges.
 */
export function useClipboard() {
  const [clipboard, setClipboard] = useState<ClipboardData | null>(null);

  const copy = useCallback((nodes: DiagramNode[], edges: Edge[]) => {
    // Only copy edges that connect copied nodes
    const nodeIds = new Set(nodes.map((n) => n.id));
    const relevantEdges = edges.filter(
      (e) => nodeIds.has(e.source) && nodeIds.has(e.target),
    );
    setClipboard({
      nodes: structuredClone(nodes),
      edges: structuredClone(relevantEdges),
    });
  }, []);

  const paste = useCallback(
    (offsetX: number = 40, offsetY: number = 40): ClipboardData | null => {
      if (!clipboard) return null;

      // Generate new IDs and offset positions
      const idMap = new Map<string, string>();
      const newNodes = clipboard.nodes.map((n) => {
        const newId = `${n.id}_copy_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        idMap.set(n.id, newId);
        return {
          ...n,
          id: newId,
          position: { x: n.position.x + offsetX, y: n.position.y + offsetY },
        };
      });

      const newEdges = clipboard.edges.map((e) => ({
        ...e,
        id: `edge_copy_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        source: idMap.get(e.source) || e.source,
        target: idMap.get(e.target) || e.target,
      }));

      return { nodes: newNodes, edges: newEdges };
    },
    [clipboard],
  );

  const hasContent = clipboard !== null && clipboard.nodes.length > 0;

  return { copy, paste, hasContent };
}
