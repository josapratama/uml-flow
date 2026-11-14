import type { Diagram, DiagramNode, Edge } from "@uml-editor/shared";

export interface NodeCoupling {
  nodeId: string;
  nodeName: string;
  afferentCoupling: number; // Ca: incoming dependencies
  efferentCoupling: number; // Ce: outgoing dependencies
  instability: number; // I = Ce / (Ca + Ce), 0 = stable, 1 = unstable
}

export interface DependencyCycle {
  cycleId: string;
  nodeNames: string[];
  description: string;
  severity: "high" | "critical";
}

export interface DependencyAnalysisResult {
  nodes: { id: string; name: string; type: string }[];
  matrix: number[][]; // matrix[row][col] = count of edges from row to col
  couplings: NodeCoupling[];
  cycles: DependencyCycle[];
  hasCircularDependency: boolean;
  density: number; // graph density percentage
  recommendation: string;
}

/**
 * Analyzes Dependency Structure Matrix (DSM), coupling metrics (Ca, Ce, Instability),
 * and detects circular architecture cycles (spaghetti dependencies).
 */
export function analyzeDependencies(diagram: Diagram): DependencyAnalysisResult {
  const filteredNodes = (diagram.nodes || []).filter(
    (n) => (n.type as string) !== "note" && (n.type as string) !== "system" && (n.type as string) !== "boundary"
  );

  const nodeCount = filteredNodes.length;
  const nodes = filteredNodes.map((n) => ({
    id: n.id,
    name: n.name || n.id,
    type: n.type || "component",
  }));

  const nodeIndexMap = new Map<string, number>();
  nodes.forEach((n, idx) => nodeIndexMap.set(n.id, idx));

  // Initialize Matrix [row][col]
  const matrix: number[][] = Array.from({ length: nodeCount }, () =>
    Array.from({ length: nodeCount }, () => 0)
  );

  const edges = (diagram.edges || []).filter(
    (e) => nodeIndexMap.has(e.source) && nodeIndexMap.has(e.target)
  );

  for (const edge of edges) {
    const srcIdx = nodeIndexMap.get(edge.source);
    const tgtIdx = nodeIndexMap.get(edge.target);
    if (srcIdx !== undefined && tgtIdx !== undefined) {
      matrix[srcIdx][tgtIdx] += 1;
    }
  }

  // Calculate Couplings: Ca (in), Ce (out), Instability
  const couplings: NodeCoupling[] = nodes.map((node, i) => {
    let ce = 0; // outgoing (row i sum)
    let ca = 0; // incoming (col i sum)

    for (let j = 0; j < nodeCount; j++) {
      ce += matrix[i][j];
      ca += matrix[j][i];
    }

    const total = ca + ce;
    const instability = total > 0 ? parseFloat((ce / total).toFixed(2)) : 0;

    return {
      nodeId: node.id,
      nodeName: node.name,
      afferentCoupling: ca,
      efferentCoupling: ce,
      instability,
    };
  });

  // Cycle Detection using DFS
  const cycles: DependencyCycle[] = [];
  const visited = new Set<number>();
  const recStack: number[] = [];

  function dfsFindCycles(curr: number) {
    visited.add(curr);
    recStack.push(curr);

    for (let next = 0; next < nodeCount; next++) {
      if (matrix[curr][next] > 0) {
        const cycleStartIndex = recStack.indexOf(next);
        if (cycleStartIndex !== -1) {
          // Found cycle
          const cyclePathIndices = recStack.slice(cycleStartIndex);
          cyclePathIndices.push(next);
          const cycleNodeNames = cyclePathIndices.map((idx) => nodes[idx].name);
          const cycleKey = cycleNodeNames.join(" -> ");

          if (!cycles.some((c) => c.description === cycleKey)) {
            cycles.push({
              cycleId: `cycle_${cycles.length + 1}`,
              nodeNames: cycleNodeNames,
              description: cycleKey,
              severity: cycleNodeNames.length <= 3 ? "critical" : "high",
            });
          }
        } else if (!visited.has(next)) {
          dfsFindCycles(next);
        }
      }
    }

    recStack.pop();
  }

  for (let i = 0; i < nodeCount; i++) {
    visited.clear();
    dfsFindCycles(i);
  }

  const hasCircularDependency = cycles.length > 0;
  const maxPossibleEdges = nodeCount > 1 ? nodeCount * (nodeCount - 1) : 1;
  const density = parseFloat(((edges.length / maxPossibleEdges) * 100).toFixed(1));

  let recommendation = "Arsitektur bersih dan terstruktur secara hierarkis (Acyclic). Tidak ditemukan siklus kopling ketergantungan.";
  if (hasCircularDependency) {
    recommendation = `Terdeteksi ${cycles.length} siklus ketergantungan melingkar (Circular Dependency). Terapkan Dependency Inversion Principle (DIP), Interface Abstraction, atau GoF Observer Pattern untuk memutus ketergantungan langsung.`;
  }

  return {
    nodes,
    matrix,
    couplings,
    cycles,
    hasCircularDependency,
    density,
    recommendation,
  };
}
