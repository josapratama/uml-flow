import type { Diagram } from "@uml-editor/shared";

/**
 * Converts a Diagram model back to DSL text.
 * Supports all diagram types: class, sequence, activity, flowchart, erd, state, usecase, component, deployment.
 */
export function diagramToDSL(diagram: Diagram): string {
  let dsl = `@diagram "${diagram.name}" ${diagram.type}\n\n`;

  switch (diagram.type) {
    case "class":
      dsl += generateClassDSL(diagram);
      break;
    case "sequence":
      dsl += generateSequenceDSL(diagram);
      break;
    case "activity":
      dsl += generateActivityDSL(diagram);
      break;
    case "flowchart":
      dsl += generateFlowchartDSL(diagram);
      break;
    case "erd":
      dsl += generateERDDSL(diagram);
      break;
    case "state":
      dsl += generateStateDSL(diagram);
      break;
    case "usecase":
      dsl += generateUseCaseDSL(diagram);
      break;
    case "component":
      dsl += generateComponentDSL(diagram);
      break;
    case "deployment":
      dsl += generateDeploymentDSL(diagram);
      break;
    default:
      dsl += generateGenericDSL(diagram);
      break;
  }

  return dsl;
}

// ── Class ──────────────────────────────────────────────────────────────────

function generateClassDSL(diagram: Diagram): string {
  let dsl = "";
  for (const node of diagram.nodes) {
    if (
      node.type === "class" ||
      node.type === "interface" ||
      node.type === "abstract" ||
      node.type === "enum" ||
      "attributes" in node ||
      "methods" in node
    ) {
      const cn = node as any;
      const keyword =
        cn.type === "abstract"
          ? "abstract class"
          : cn.type === "interface"
            ? "interface"
            : cn.type === "enum"
              ? "enum"
              : "class";
      dsl += `${keyword} ${cn.name} {\n`;
      for (const attr of cn.attributes || []) {
        dsl += `  ${attr.visibility || ""}${attr.name || ""}${attr.type ? ": " + attr.type : ""}\n`;
      }
      for (const method of cn.methods || []) {
        const params = Array.isArray(method.params)
          ? method.params
              .map((p: any) =>
                typeof p === "string"
                  ? p
                  : `${p.name || ""}${p.type ? ": " + p.type : ""}`,
              )
              .join(", ")
          : typeof method.params === "string"
            ? method.params
            : "";
        dsl += `  ${method.visibility || ""}${method.name || ""}(${params}): ${method.returnType || "void"}\n`;
      }
      dsl += "}\n\n";
    }
  }
  dsl += generateEdgesDSL(diagram);
  return dsl;
}

// ── Sequence ───────────────────────────────────────────────────────────────

function generateSequenceDSL(diagram: Diagram): string {
  let dsl = "";
  const participants = (diagram as any).participants || [];
  const messages = (diagram as any).messages || [];
  const fragments = (diagram as any).fragments || [];

  for (const p of participants) {
    const typeKw = p.type && p.type !== "object" ? ` as ${p.type}` : "";
    dsl += `participant ${p.name}${typeKw}\n`;
  }
  if (participants.length > 0) dsl += "\n";

  // Sort messages by their index
  const sortedMessages = [...messages].sort(
    (a: any, b: any) => (a.order ?? 0) - (b.order ?? 0),
  );

  // Build fragment ranges map for annotation
  const fragMap = new Map<number, string>();
  for (const frag of fragments) {
    fragMap.set(
      frag.startOrder,
      `${frag.type}${frag.label ? ` [${frag.label}]` : ""} {`,
    );
    fragMap.set(frag.endOrder + 1, "}");
  }

  for (let i = 0; i < sortedMessages.length; i++) {
    const fragStart = fragMap.get(i);
    if (fragStart) dsl += `${fragStart}\n`;

    const msg = sortedMessages[i];
    const fromP = participants.find((p: any) => p.id === msg.from);
    const toP = participants.find((p: any) => p.id === msg.to);
    if (fromP && toP) {
      const arrow =
        msg.type === "return" ? "-->>" : msg.type === "async" ? "->>" : "->";
      dsl += `${fromP.name} ${arrow} ${toP.name}: ${msg.label}\n`;
    }

    const fragEnd = fragMap.get(i + 1);
    if (fragEnd) dsl += `${fragEnd}\n`;
  }

  return dsl;
}

// ── Activity ───────────────────────────────────────────────────────────────

function generateActivityDSL(diagram: Diagram): string {
  let dsl = "";
  const nodeMap = new Map(diagram.nodes.map((n) => [n.id, n]));

  // Write swimlanes if present
  const swimlanes: string[] = (diagram as any).swimlanes || [];
  if (swimlanes.length > 0) {
    for (const lane of swimlanes) {
      dsl += `swimlane "${lane}"\n`;
    }
    dsl += "\n";
  }

  // Determine traversal order via edges (BFS from start)
  const adj = new Map<string, string[]>();
  for (const n of diagram.nodes) adj.set(n.id, []);
  for (const e of diagram.edges) adj.get(e.source)?.push(e.target);

  const startNodes = diagram.nodes.filter((n) => n.type === "start");
  const visited = new Set<string>();
  const ordered: string[] = [];
  const queue = startNodes.map((n) => n.id);

  while (queue.length > 0) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    ordered.push(id);
    for (const next of adj.get(id) || []) queue.push(next);
  }
  // Add any unvisited nodes
  for (const n of diagram.nodes) {
    if (!visited.has(n.id)) ordered.push(n.id);
  }

  const writtenEdges = new Set<string>();

  for (const nodeId of ordered) {
    const node = nodeMap.get(nodeId) as any;
    if (!node) continue;
    if (node.type === "start") {
      dsl += `[start]\n`;
    } else if (node.type === "end") {
      dsl += `[end]\n`;
    } else if (node.type === "decision") {
      dsl += `decision "${node.name}"\n`;
    } else if (node.type === "fork") {
      dsl += `fork\n`;
    } else if (node.type === "join") {
      dsl += `join\n`;
    } else if (node.type === "merge") {
      dsl += `merge\n`;
    } else {
      const swimlane = node.swimlane ? ` [${node.swimlane}]` : "";
      dsl += `action "${node.name}"${swimlane}\n`;
    }
  }

  // Write explicit edges (skip auto-sequential ones)
  dsl += "\n";
  for (const edge of diagram.edges) {
    const key = `${edge.source}-->${edge.target}`;
    if (writtenEdges.has(key)) continue;
    writtenEdges.add(key);
    const src = nodeMap.get(edge.source);
    const tgt = nodeMap.get(edge.target);
    if (src && tgt) {
      const cond = (edge as any).condition
        ? ` [${(edge as any).condition}]`
        : "";
      const label = edge.label ? ` : ${edge.label.text}` : "";
      const srcName =
        src.type === "start"
          ? "[start]"
          : src.type === "end"
            ? "[end]"
            : formatName(src.name);
      const tgtName =
        tgt.type === "start"
          ? "[start]"
          : tgt.type === "end"
            ? "[end]"
            : formatName(tgt.name);
      dsl += `${srcName} --> ${tgtName}${cond}${label}\n`;
    }
  }

  return dsl;
}

// ── Flowchart ──────────────────────────────────────────────────────────────

function generateFlowchartDSL(diagram: Diagram): string {
  let dsl = "";
  for (const node of diagram.nodes as any[]) {
    const keyword =
      node.type === "start"
        ? "start"
        : node.type === "end"
          ? "end"
          : node.type === "decision"
            ? "decision"
            : node.type === "io"
              ? "io"
              : node.type === "document"
                ? "document"
                : node.type === "database"
                  ? "database"
                  : node.type === "subroutine"
                    ? "subroutine"
                    : "process";
    dsl += `${keyword} "${node.name}"\n`;
  }
  dsl += "\n";
  dsl += generateEdgesDSL(diagram);
  return dsl;
}

// ── ERD ────────────────────────────────────────────────────────────────────

function generateERDDSL(diagram: Diagram): string {
  let dsl = "";
  for (const node of diagram.nodes as any[]) {
    if (node.type !== "entity" && !("attributes" in node && !("methods" in node)))
      continue;
    dsl += `entity ${node.name} {\n`;
    const cols = node.attributes || node.columns || [];
    for (const col of cols) {
      const isPk = col.isPrimaryKey ?? col.isPrimary ?? false;
      const pk = isPk ? "*" : "";
      const tags: string[] = [];
      if (col.isForeignKey) tags.push("fk");
      if (col.isUnique) tags.push("unique");
      if (col.isNullable) tags.push("nullable");
      const tagStr = tags.length ? ` [${tags.join(", ")}]` : "";
      dsl += `  ${pk}${col.name}: ${col.type || "varchar"}${tagStr}\n`;
    }
    dsl += "}\n\n";
  }
  dsl += generateEdgesDSL(diagram);
  return dsl;
}

// ── State ──────────────────────────────────────────────────────────────────

function generateStateDSL(diagram: Diagram): string {
  let dsl = "";
  // Track which node IDs are substates (should not be emitted at top level)
  const subStateIds = new Set<string>();
  for (const node of diagram.nodes as any[]) {
    if (node.type === "composite" && node.substates) {
      for (const sub of node.substates) subStateIds.add(sub.id);
    }
  }

  for (const node of diagram.nodes as any[]) {
    if (subStateIds.has(node.id)) continue; // skip substates at top level
    if (node.type === "initial") {
      dsl += `[initial]\n`;
    } else if (node.type === "final") {
      dsl += `[final]\n`;
    } else if (node.type === "composite") {
      dsl += `state "${node.name}" {\n`;
      const subs: any[] = node.substates || [];
      for (const sub of subs) {
        if (sub.type === "initial") dsl += `  [initial]\n`;
        else if (sub.type === "final") dsl += `  [final]\n`;
        else dsl += `  state ${formatName(sub.name)}\n`;
      }
      // Write internal edges
      const subIds = new Set(subs.map((s: any) => s.id));
      for (const edge of diagram.edges) {
        if (subIds.has(edge.source) && subIds.has(edge.target)) {
          const srcN = subs.find((s: any) => s.id === edge.source);
          const tgtN = subs.find((s: any) => s.id === edge.target);
          if (srcN && tgtN) {
            const srcName =
              srcN.type === "initial"
                ? "[initial]"
                : srcN.type === "final"
                  ? "[final]"
                  : formatName(srcN.name);
            const tgtName =
              tgtN.type === "initial"
                ? "[initial]"
                : tgtN.type === "final"
                  ? "[final]"
                  : formatName(tgtN.name);
            const label = edge.label ? ` : ${edge.label.text}` : "";
            dsl += `  ${srcName} --> ${tgtName}${label}\n`;
          }
        }
      }
      dsl += `}\n\n`;
    } else {
      dsl += `state ${formatName(node.name)}\n`;
    }
  }
  dsl += "\n";

  const compositeSubIds = new Set<string>();
  for (const node of diagram.nodes as any[]) {
    if (node.type === "composite") {
      for (const sub of node.substates || []) compositeSubIds.add(sub.id);
    }
  }

  const nodeMap = new Map(diagram.nodes.map((n) => [n.id, n]));
  for (const edge of diagram.edges) {
    // Skip purely internal composite edges
    if (compositeSubIds.has(edge.source) && compositeSubIds.has(edge.target))
      continue;
    const src = nodeMap.get(edge.source) as any;
    const tgt = nodeMap.get(edge.target) as any;
    if (src && tgt) {
      const srcName =
        src.type === "initial"
          ? "[initial]"
          : src.type === "final"
            ? "[final]"
            : formatName(src.name);
      const tgtName =
        tgt.type === "initial"
          ? "[initial]"
          : tgt.type === "final"
            ? "[final]"
            : formatName(tgt.name);
      const label = edge.label ? ` : ${edge.label.text}` : "";
      dsl += `${srcName} --> ${tgtName}${label}\n`;
    }
  }
  return dsl;
}

// ── Use Case ───────────────────────────────────────────────────────────────

function generateUseCaseDSL(diagram: Diagram): string {
  let dsl = "";
  for (const node of diagram.nodes as any[]) {
    const aliasStr = node.alias ? ` as ${node.alias}` : "";
    if (node.type === "actor") {
      dsl += `actor ${formatName(node.name)}${aliasStr}\n`;
    } else if (node.type === "usecase") {
      dsl += `usecase "${node.name}"${aliasStr}\n`;
    } else if (node.type === "system") {
      dsl += `system "${node.name}"\n`;
    }
  }
  dsl += "\n";
  const nodeMap = new Map(diagram.nodes.map((n) => [n.id, n]));
  for (const edge of diagram.edges) {
    const src = nodeMap.get(edge.source) as any;
    const tgt = nodeMap.get(edge.target) as any;
    if (src && tgt) {
      const srcName =
        src.alias ||
        (src.type === "usecase" ? `"${src.name}"` : formatName(src.name));
      const tgtName =
        tgt.alias ||
        (tgt.type === "usecase" ? `"${tgt.name}"` : formatName(tgt.name));
      if (edge.type === "include") {
        dsl += `${srcName} <<include>> ${tgtName}\n`;
      } else if (edge.type === "extend") {
        dsl += `${srcName} <<extend>> ${tgtName}\n`;
      } else {
        dsl += `${srcName} --> ${tgtName}\n`;
      }
    }
  }
  return dsl;
}

// ── Component ──────────────────────────────────────────────────────────────

function generateComponentDSL(diagram: Diagram): string {
  let dsl = "";
  for (const node of diagram.nodes as any[]) {
    const aliasStr = node.alias ? ` as ${node.alias}` : "";
    if (node.type === "component") {
      dsl += `component "${node.name}"`;
      if (node.stereotype) dsl += ` <<${node.stereotype}>>`;
      dsl += `${aliasStr}\n`;
    } else if (node.type === "interface-provided") {
      dsl += `interface "${node.name}" provided${aliasStr}\n`;
    } else if (node.type === "interface-required") {
      dsl += `interface "${node.name}" required${aliasStr}\n`;
    }
  }
  dsl += "\n";
  const nodeMap = new Map(diagram.nodes.map((n) => [n.id, n]));
  for (const edge of diagram.edges) {
    const source = nodeMap.get(edge.source) as any;
    const target = nodeMap.get(edge.target) as any;
    if (source && target) {
      const srcName = source.alias || formatName(source.name);
      const tgtName = target.alias || formatName(target.name);
      const symbol = getRelationSymbol(edge.type);
      dsl += `${srcName} ${symbol} ${tgtName}`;
      if (edge.label) dsl += ` : ${edge.label.text}`;
      dsl += "\n";
    }
  }
  return dsl;
}

// ── Deployment ─────────────────────────────────────────────────────────────

function generateDeploymentDSL(diagram: Diagram): string {
  let dsl = "";
  for (const node of diagram.nodes as any[]) {
    if (node.type === "node") {
      dsl += `node "${node.name}"`;
      if (node.stereotype) dsl += ` <<${node.stereotype}>>`;
      dsl += "\n";
    } else if (node.type === "device") {
      dsl += `device "${node.name}"\n`;
    } else if (node.type === "artifact") {
      dsl += `artifact "${node.name}"\n`;
    } else if (node.type === "component") {
      dsl += `component "${node.name}"\n`;
    }
  }
  dsl += "\n";
  dsl += generateEdgesDSL(diagram);
  return dsl;
}

// ── Generic fallback ───────────────────────────────────────────────────────

function generateGenericDSL(diagram: Diagram): string {
  let dsl = "";
  for (const node of diagram.nodes as any[]) {
    dsl += `node "${node.name}" ${node.type}\n`;
  }
  dsl += "\n";
  dsl += generateEdgesDSL(diagram);
  return dsl;
}

// ── Shared edge writer ─────────────────────────────────────────────────────

function formatName(name: string): string {
  if (!name) return '""';
  if (name.startsWith("[") && name.endsWith("]")) return name;
  if (name.includes(" ") || /[^a-zA-Z0-9_]/.test(name)) {
    return `"${name}"`;
  }
  return name;
}

function generateEdgesDSL(diagram: Diagram): string {
  let dsl = "";
  const nodeMap = new Map(diagram.nodes.map((n) => [n.id, n]));
  for (const edge of diagram.edges) {
    const source = nodeMap.get(edge.source);
    const target = nodeMap.get(edge.target);
    if (source && target) {
      const symbol = getRelationSymbol(edge.type);
      dsl += `${formatName(source.name)} ${symbol} ${formatName(target.name)}`;
      if (edge.label) dsl += ` : ${edge.label.text}`;
      dsl += "\n";
    }
  }
  return dsl;
}

function getRelationSymbol(type: string): string {
  const map: Record<string, string> = {
    inheritance: "--|>",
    realization: "..|>",
    association: "-->",
    dependency: "..>",
    aggregation: "o--",
    composition: "*--",
    flow: "-->",
    include: "..>",
    extend: "..>",
    deploy: "-->",
    manifest: "..>",
    "one-to-one": "||--||",
    "one-to-many": "||--o{",
    "many-to-many": "}o--o{",
  };
  return map[type] || "-->";
}
