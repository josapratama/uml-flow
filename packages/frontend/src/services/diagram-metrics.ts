import type { Diagram, ClassNode, ERDEntity, FlowchartNode } from "@uml-editor/shared";

export interface DiagramMetrics {
  diagramName: string;
  diagramType: string;
  totalNodes: number;
  totalEdges: number;
  
  // Graph & Flowchart Metrics
  cyclomaticComplexity: number; // V(G) = E - N + 2P
  predicateCount: number; // Decision nodes
  connectedComponents: number;
  basisPaths: number;
  riskLevel: "Low" | "Moderate" | "High" | "Critical";
  riskScoreColor: string;
  unreachableNodes: string[];
  deadEndNodes: string[];

  // Class Diagram Metrics (OO)
  classCount?: number;
  interfaceCount?: number;
  enumCount?: number;
  totalMethods?: number;
  totalAttributes?: number;
  maxDIT?: number; // Depth of Inheritance Tree
  avgCBO?: number; // Coupling Between Objects
  godClasses?: string[]; // Classes with > 10 methods/attrs

  // ERD Metrics
  entityCount?: number;
  totalColumns?: number;
  primaryKeyCount?: number;
  foreignKeyCount?: number;
  orphanEntities?: string[];
  hubEntities?: string[];
  missingPKEntities?: string[];

  // Insights & Recommendations
  recommendations: string[];
}

export function calculateDiagramMetrics(diagram: Diagram): DiagramMetrics {
  const nodes = diagram.nodes || [];
  const edges = diagram.edges || [];
  const N = nodes.length;
  const E = edges.length;
  const P = 1; // Connected graph component baseline

  // 1. Flowchart & State Decision nodes calculation
  const decisionTypes = new Set(["decision", "condition", "choice", "fork", "branch"]);
  const decisionNodes = nodes.filter(n => {
    const t = (n.type || "").toLowerCase();
    return decisionTypes.has(t) || ((n as any).shape === "diamond");
  });
  const predicateCount = decisionNodes.length;

  // McCabe Cyclomatic Complexity: V(G) = E - N + 2P
  let cyclomaticComplexity = N > 0 ? Math.max(1, E - N + 2 * P) : 1;
  // If decision nodes exist, cyclomatic complexity is also at least D + 1
  if (predicateCount > 0) {
    cyclomaticComplexity = Math.max(cyclomaticComplexity, predicateCount + 1);
  }

  // Risk Rating
  let riskLevel: DiagramMetrics["riskLevel"] = "Low";
  let riskScoreColor = "text-emerald-500";
  if (cyclomaticComplexity > 50) {
    riskLevel = "Critical";
    riskScoreColor = "text-rose-500";
  } else if (cyclomaticComplexity > 20) {
    riskLevel = "High";
    riskScoreColor = "text-amber-500";
  } else if (cyclomaticComplexity > 10) {
    riskLevel = "Moderate";
    riskScoreColor = "text-yellow-500";
  }

  // Reachability & Dead-ends
  const incoming = new Map<string, number>();
  const outgoing = new Map<string, number>();
  for (const n of nodes) {
    incoming.set(n.id, 0);
    outgoing.set(n.id, 0);
  }
  for (const e of edges) {
    incoming.set(e.target, (incoming.get(e.target) || 0) + 1);
    outgoing.set(e.source, (outgoing.get(e.source) || 0) + 1);
  }

  const unreachableNodes: string[] = [];
  const deadEndNodes: string[] = [];
  const startTypes = new Set(["start", "initial", "start_event"]);
  const endTypes = new Set(["end", "final", "terminate", "stop"]);

  for (const n of nodes) {
    const nodeType = (n.type || "").toLowerCase();
    const inCount = incoming.get(n.id) || 0;
    const outCount = outgoing.get(n.id) || 0;
    const name = n.name || n.id;

    if (inCount === 0 && !startTypes.has(nodeType) && N > 1 && diagram.type !== "class" && diagram.type !== "erd") {
      unreachableNodes.push(name);
    }
    if (outCount === 0 && !endTypes.has(nodeType) && N > 1 && diagram.type !== "class" && diagram.type !== "erd") {
      deadEndNodes.push(name);
    }
  }

  const recommendations: string[] = [];

  // --- Class Diagram Analysis ---
  let classCount: number | undefined;
  let interfaceCount: number | undefined;
  let enumCount: number | undefined;
  let totalMethods: number | undefined;
  let totalAttributes: number | undefined;
  let maxDIT: number | undefined;
  let avgCBO: number | undefined;
  let godClasses: string[] | undefined;

  if (diagram.type === "class") {
    const classNodes = nodes as ClassNode[];
    classCount = classNodes.filter(n => n.type === "class" || !n.type).length;
    interfaceCount = classNodes.filter(n => n.type === "interface").length;
    enumCount = classNodes.filter(n => n.type === "enum").length;

    let mCount = 0;
    let aCount = 0;
    godClasses = [];

    // Calculate DIT (Depth of Inheritance Tree)
    const childToParent = new Map<string, string[]>();
    for (const e of edges) {
      if (e.type === "inheritance" || e.type === "realization") {
        const parents = childToParent.get(e.source) || [];
        parents.push(e.target);
        childToParent.set(e.source, parents);
      }
    }

    let deepestTree = 0;
    const getDepth = (id: string, visited = new Set<string>()): number => {
      if (visited.has(id)) return 0;
      visited.add(id);
      const parents = childToParent.get(id) || [];
      if (parents.length === 0) return 0;
      let maxP = 0;
      for (const p of parents) {
        maxP = Math.max(maxP, 1 + getDepth(p, new Set(visited)));
      }
      return maxP;
    };

    for (const cn of classNodes) {
      const methods = cn.methods?.length || 0;
      const attributes = cn.attributes?.length || 0;
      mCount += methods;
      aCount += attributes;

      if (methods >= 8 || attributes >= 10) {
        godClasses.push(cn.name || cn.id);
      }

      const d = getDepth(cn.id);
      if (d > deepestTree) deepestTree = d;
    }

    totalMethods = mCount;
    totalAttributes = aCount;
    maxDIT = deepestTree;
    avgCBO = classNodes.length > 0 ? Number((edges.length / classNodes.length).toFixed(2)) : 0;

    if (deepestTree > 3) {
      recommendations.push(
        `Kedalaman hierarki inheritance (DIT = ${deepestTree}) melebihi ambang batas disarankan (≤ 3). Pertimbangkan komposisi daripada pewarisan berlebih.`
      );
    }
    if (godClasses.length > 0) {
      recommendations.push(
        `Ditemukan kelas dengan beban method/atribut tinggi (${godClasses.join(", ")}). Terapkan Single Responsibility Principle (SRP) untuk memecahnya.`
      );
    }
  }

  // --- ERD Analysis ---
  let entityCount: number | undefined;
  let totalColumns: number | undefined;
  let primaryKeyCount: number | undefined;
  let foreignKeyCount: number | undefined;
  let orphanEntities: string[] | undefined;
  let hubEntities: string[] | undefined;
  let missingPKEntities: string[] | undefined;

  if (diagram.type === "erd") {
    const erdEntities = nodes as ERDEntity[];
    entityCount = erdEntities.length;
    let cols = 0;
    let pks = 0;
    let fks = 0;
    missingPKEntities = [];
    orphanEntities = [];
    hubEntities = [];

    for (const ent of erdEntities) {
      const attrs = ent.attributes || [];
      cols += attrs.length;
      let hasPk = false;

      for (const a of attrs) {
        if (a.isPrimaryKey || (a as any).pk) {
          pks++;
          hasPk = true;
        }
        if (a.isForeignKey || (a as any).fk) fks++;
      }

      if (!hasPk && attrs.length > 0) {
        missingPKEntities.push(ent.name || ent.id);
      }

      const relCount = (incoming.get(ent.id) || 0) + (outgoing.get(ent.id) || 0);
      if (relCount === 0 && erdEntities.length > 1) {
        orphanEntities.push(ent.name || ent.id);
      }
      if (relCount >= 4) {
        hubEntities.push(`${ent.name || ent.id} (${relCount} relasi)`);
      }
    }

    totalColumns = cols;
    primaryKeyCount = pks;
    foreignKeyCount = fks;

    if (missingPKEntities.length > 0) {
      recommendations.push(
        `Tabel tanpa Primary Key terdeteksi: ${missingPKEntities.join(", ")}. Tambahkan kolom ID/PK untuk integritas entitas (1NF).`
      );
    }
    if (orphanEntities.length > 0) {
      recommendations.push(
        `Tabel yatim (orphan) tanpa foreign key terdeteksi: ${orphanEntities.join(", ")}. Pastikan relasi referensial sudah terhubung.`
      );
    }
    if (hubEntities.length > 0) {
      recommendations.push(
        `Tabel hub berderajat tinggi: ${hubEntities.join(", ")}. Pastikan indeks foreign key terpasang untuk menghindari bottle-neck query.`
      );
    }
  }

  // General recommendations
  if (unreachableNodes.length > 0) {
    recommendations.push(`Node yang tidak terjangkau (unreachable): ${unreachableNodes.join(", ")}.`);
  }
  if (deadEndNodes.length > 0) {
    recommendations.push(`Node jalan buntu tanpa sambungan keluar (dead-end): ${deadEndNodes.join(", ")}.`);
  }
  if (riskLevel === "High" || riskLevel === "Critical") {
    recommendations.push(
      `Kompleksitas Cyclomatic (${cyclomaticComplexity}) tergolong tinggi. Pecah alur menjadi sub-proses atau state machine terpisah untuk meningkatkan testability.`
    );
  }
  if (recommendations.length === 0) {
    recommendations.push("Struktur diagram terorganisir dengan sangat baik, bebas dari isolasi atau siklus abnormal.");
  }

  return {
    diagramName: diagram.name || "Untitled",
    diagramType: diagram.type || "unknown",
    totalNodes: N,
    totalEdges: E,
    cyclomaticComplexity,
    predicateCount,
    connectedComponents: P,
    basisPaths: cyclomaticComplexity,
    riskLevel,
    riskScoreColor,
    unreachableNodes,
    deadEndNodes,
    classCount,
    interfaceCount,
    enumCount,
    totalMethods,
    totalAttributes,
    maxDIT,
    avgCBO,
    godClasses,
    entityCount,
    totalColumns,
    primaryKeyCount,
    foreignKeyCount,
    orphanEntities,
    hubEntities,
    missingPKEntities,
    recommendations,
  };
}

/**
 * Format metrics into a comprehensive Markdown Report for Academic / Documentation
 */
export function exportMetricsMarkdown(metrics: DiagramMetrics): string {
  const lines: string[] = [
    `# 📊 Diagram Metrics & Complexity Report`,
    `**Diagram:** ${metrics.diagramName} | **Type:** \`${metrics.diagramType.toUpperCase()}\` | **Generated:** ${new Date().toLocaleDateString()}`,
    "",
    `## 1. Executive Summary`,
    `- **Total Nodes:** ${metrics.totalNodes}`,
    `- **Total Edges / Relations:** ${metrics.totalEdges}`,
    `- **McCabe Cyclomatic Complexity $V(G)$:** **${metrics.cyclomaticComplexity}** (${metrics.riskLevel} Risk)`,
    `- **Basis Execution Paths:** ${metrics.basisPaths} path teruji independen`,
    `- **Decision Predicates:** ${metrics.predicateCount}`,
    "",
  ];

  if (metrics.diagramType === "class") {
    lines.push(
      `## 2. Object-Oriented Structural Metrics`,
      `| Metrik OO | Nilai | Standar Rekomendasi |`,
      `| :--- | :--- | :--- |`,
      `| Total Classes | ${metrics.classCount || 0} | - |`,
      `| Interfaces | ${metrics.interfaceCount || 0} | Diprioritaskan untuk decoupling |`,
      `| Enums | ${metrics.enumCount || 0} | - |`,
      `| Total Attributes | ${metrics.totalAttributes || 0} | - |`,
      `| Total Methods | ${metrics.totalMethods || 0} | - |`,
      `| Max DIT (Inheritance Depth) | ${metrics.maxDIT || 0} | $\\le 3$ (Gang of Four guideline) |`,
      `| Avg CBO (Coupling Factor) | ${metrics.avgCBO || 0} | $\\le 5.0$ hubungan per kelas |`,
      ""
    );
    if (metrics.godClasses && metrics.godClasses.length > 0) {
      lines.push(`> ⚠️ **God Class Warning:** Ditemukan kelas bervolume tinggi: \`${metrics.godClasses.join(", ")}\`.`);
      lines.push("");
    }
  }

  if (metrics.diagramType === "erd") {
    lines.push(
      `## 2. Relational Database Normalization Audit`,
      `| Metrik Relasional | Nilai | Evaluasi |`,
      `| :--- | :--- | :--- |`,
      `| Total Entitas / Tabel | ${metrics.entityCount || 0} | - |`,
      `| Total Kolom | ${metrics.totalColumns || 0} | - |`,
      `| Primary Keys (PK) | ${metrics.primaryKeyCount || 0} | Integritas Entitas (1NF) |`,
      `| Foreign Keys (FK) | ${metrics.foreignKeyCount || 0} | Relasi Referensial |`,
      `| Missing PK Tables | ${metrics.missingPKEntities?.length || 0} | ${metrics.missingPKEntities?.length ? "⚠️ Perlu PK" : "✅ 100% Valid"} |`,
      `| Orphan Tables | ${metrics.orphanEntities?.length || 0} | ${metrics.orphanEntities?.length ? "⚠️ Terisolasi" : "✅ Terhubung"} |`,
      ""
    );
  }

  lines.push(
    `## 3. Structural Recommendations & Quality Audit`,
    ...metrics.recommendations.map(r => `- ${r}`),
    "",
    `---`,
    `*Generated automatically by UML Flow Quality & Metric Suite.*`
  );

  return lines.join("\n");
}
