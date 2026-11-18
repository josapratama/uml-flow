import type { Diagram, DiagramNode, Edge, ERDAttribute, UMLAttribute, UMLMethod } from "@uml-editor/shared";

export interface RepairResult {
  repairedDiagram: Diagram;
  fixLogs: string[];
  hasChanges: boolean;
}

/**
 * Diagram Health Doctor & Auto-Repair Engine.
 * Analyzes structural anomalies, dangling leaves, orphan nodes,
 * missing primary keys, and broken connections, then automatically heals the diagram.
 */
export function repairDiagram(diagram: Diagram): RepairResult {
  if (!diagram || (!diagram.nodes && !diagram.participants)) {
    return { repairedDiagram: diagram, fixLogs: [], hasChanges: false };
  }

  const fixLogs: string[] = [];
  const nodes: DiagramNode[] = JSON.parse(JSON.stringify(diagram.nodes || []));
  let edges: Edge[] = JSON.parse(JSON.stringify(diagram.edges || []));

  const nodeMap = new Map<string, DiagramNode>(nodes.map((n) => [n.id, n]));

  // 1. Prune broken edges referencing non-existent nodes
  const initialEdgeCount = edges.length;
  edges = edges.filter((e) => nodeMap.has(e.source) && nodeMap.has(e.target));
  if (edges.length < initialEdgeCount) {
    const removedCount = initialEdgeCount - edges.length;
    fixLogs.push(`Membersihkan ${removedCount} garis relasi dengan node referensi tidak valid`);
  }

  // 2. ERD: Auto-inject Primary Key (id: int [PK]) if missing
  if (diagram.type === "erd") {
    for (const node of nodes) {
      const anyNode = node as any;
      if (anyNode.attributes && Array.isArray(anyNode.attributes)) {
        const hasPK = anyNode.attributes.some((a: any) => a.isPrimaryKey);
        if (!hasPK) {
          const pkAttr: ERDAttribute = {
            name: "id",
            type: "int",
            isPrimaryKey: true,
            isForeignKey: false,
            isNullable: false,
            isUnique: true,
          };
          anyNode.attributes.unshift(pkAttr);
          fixLogs.push(`Menambahkan Primary Key [id: int PK] pada entitas tabel '${node.name || node.id}'`);
        }
      }
    }
  }

  // 3. Class Diagram: Populate empty classes with default id & getter
  if (diagram.type === "class") {
    for (const node of nodes) {
      const cn = node as any;
      if (cn.type !== "enum" && (!cn.attributes || cn.attributes.length === 0) && (!cn.methods || cn.methods.length === 0)) {
        cn.attributes = [
          {
            visibility: "-",
            name: "id",
            type: "int",
          } as UMLAttribute,
        ];
        cn.methods = [
          {
            visibility: "+",
            name: "getId",
            params: [],
            returnType: "int",
          } as UMLMethod,
        ];
        fixLogs.push(`Mengisi atribut & metode dasar pada kelas kosong '${node.name || node.id}'`);
      }
    }
  }

  // 4. Flowchart / Activity: Auto-add End node & connect dead-end leaf processes
  if (diagram.type === "flowchart" || diagram.type === "activity") {
    const outgoingCount = new Map<string, number>();
    for (const n of nodes) outgoingCount.set(n.id, 0);
    for (const e of edges) {
      outgoingCount.set(e.source, (outgoingCount.get(e.source) || 0) + 1);
    }

    const terminalTypes = new Set(["end", "final", "terminal"]);
    const startTypes = new Set(["start", "initial"]);

    // Find leaf nodes (outgoing === 0, not terminal, not note)
    const deadEndNodes = nodes.filter((n) => {
      const type = (n.type || "").toLowerCase();
      return (
        outgoingCount.get(n.id) === 0 &&
        !terminalTypes.has(type) &&
        type !== "note"
      );
    });

    if (deadEndNodes.length > 0) {
      let endNode: DiagramNode | undefined = nodes.find((n) => terminalTypes.has((n.type || "").toLowerCase()));
      if (!endNode) {
        // Calculate position below the lowest node
        let maxY = -Infinity;
        let avgX = 0;
        for (const n of nodes) {
          maxY = Math.max(maxY, n.position.y + (n.size?.height || 50));
          avgX += n.position.x;
        }
        avgX = nodes.length > 0 ? avgX / nodes.length : 200;

        const newEndNode: DiagramNode = {
          id: `end_${Date.now()}`,
          name: "Selesai",
          type: (diagram.type === "activity" ? "end" : "end") as any,
          position: { x: avgX, y: maxY + 80 },
          size: { width: 100, height: 50 },
        } as DiagramNode;
        nodes.push(newEndNode);
        nodeMap.set(newEndNode.id, newEndNode);
        fixLogs.push(`Membuat node terminal 'Selesai' di akhir diagram`);
        endNode = newEndNode;
      }

      // Connect all dead-end nodes to the end node
      if (endNode) {
        for (const leaf of deadEndNodes) {
          const edgeId = `edge_heal_${leaf.id}_to_${endNode.id}`;
          edges.push({
            id: edgeId,
            source: leaf.id,
            target: endNode.id,
            type: "flow",
          });
          fixLogs.push(`Menyambungkan alur akhir dari '${leaf.name || leaf.id}' ke node 'Selesai'`);
        }
      }
    }

    // Check if flowchart lacks Start node
    const hasStart = nodes.some((n) => startTypes.has((n.type || "").toLowerCase()));
    if (!hasStart && nodes.length > 0) {
      let minY = Infinity;
      let topNode: DiagramNode | null = null;
      for (const n of nodes) {
        if ((n.type as string) !== "note" && n.position.y < minY) {
          minY = n.position.y;
          topNode = n;
        }
      }
      if (topNode) {
        const startNode: DiagramNode = {
          id: `start_${Date.now()}`,
          name: "Mulai",
          type: diagram.type === "activity" ? "start" : "start",
          position: { x: topNode.position.x, y: Math.max(20, topNode.position.y - 90) },
          size: { width: 100, height: 50 },
        } as any;
        nodes.unshift(startNode);
        nodeMap.set(startNode.id, startNode);
        edges.unshift({
          id: `edge_heal_start_to_${topNode.id}`,
          source: startNode.id,
          target: topNode.id,
          type: "flow",
        });
        fixLogs.push(`Menambahkan node 'Mulai' di puncak alur diagram`);
      }
    }
  }

  // 5. Connect Orphan Nodes (nodes with 0 incoming & 0 outgoing edges)
  const connectedNodeIds = new Set<string>();
  for (const e of edges) {
    connectedNodeIds.add(e.source);
    connectedNodeIds.add(e.target);
  }

  const orphanNodes = nodes.filter(
    (n) => !connectedNodeIds.has(n.id) && (n.type as string) !== "note"
  );

  if (orphanNodes.length > 0 && nodes.length > orphanNodes.length) {
    const connectedNodes = nodes.filter((n) => connectedNodeIds.has(n.id) && (n.type as string) !== "note");

    for (const orphan of orphanNodes) {
      if (connectedNodes.length === 0) break;

      // Find closest connected node
      let closestNode = connectedNodes[0];
      let minDist = Infinity;

      for (const candidate of connectedNodes) {
        const dx = candidate.position.x - orphan.position.x;
        const dy = candidate.position.y - orphan.position.y;
        const dist = dx * dx + dy * dy;
        if (dist < minDist) {
          minDist = dist;
          closestNode = candidate;
        }
      }

      const relationType =
        diagram.type === "class"
          ? "association"
          : diagram.type === "erd"
            ? "one-to-many"
            : "flow";

      edges.push({
        id: `edge_heal_orphan_${closestNode.id}_${orphan.id}`,
        source: closestNode.id,
        target: orphan.id,
        type: relationType,
      });

      connectedNodeIds.add(orphan.id);
      connectedNodes.push(orphan);
      fixLogs.push(`Menghubungkan node terisolasi '${orphan.name || orphan.id}' ke simpul terdekat '${closestNode.name || closestNode.id}'`);
    }
  }

  const hasChanges = fixLogs.length > 0;

  return {
    repairedDiagram: {
      ...diagram,
      nodes,
      edges,
    },
    fixLogs,
    hasChanges,
  };
}
