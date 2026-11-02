import type { Diagram, DiagramNode, Edge } from "@uml-editor/shared";

function safeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_]/g, "_");
}

function safeText(text: string): string {
  return (text || "").replace(/"/g, "'").replace(/\n/g, "\\n");
}

/**
 * Converts a UML Flow Diagram AST into valid Mermaid.js diagram code.
 */
export function exportToMermaid(diagram: Diagram): string {
  switch (diagram.type) {
    case "sequence":
      return exportSequenceToMermaid(diagram);
    case "erd":
      return exportERDToMermaid(diagram);
    case "class":
      return exportClassToMermaid(diagram);
    case "state":
      return exportStateToMermaid(diagram);
    case "usecase":
      return exportUseCaseToMermaid(diagram);
    case "flowchart":
    case "activity":
    default:
      return exportFlowchartToMermaid(diagram);
  }
}

function exportFlowchartToMermaid(diagram: Diagram): string {
  const lines: string[] = ["flowchart TD"];

  for (const node of diagram.nodes) {
    const id = safeId(node.id);
    const label = safeText(node.name);
    const typeStr = node.type as string;
    switch (typeStr) {
      case "start":
      case "end":
      case "terminal":
        lines.push(`    ${id}(["${label}"])`);
        break;
      case "decision":
        lines.push(`    ${id}{"${label}"}`);
        break;
      case "io":
      case "manual-input":
        lines.push(`    ${id}[/"${label}"/]`);
        break;
      case "database":
      case "datastore":
        lines.push(`    ${id}[("${label}")]`);
        break;
      case "document":
        lines.push(`    ${id}>"${label}"]`);
        break;
      case "preparation":
        lines.push(`    ${id}{{"${label}"}}`);
        break;
      default:
        lines.push(`    ${id}["${label}"]`);
        break;
    }
  }

  for (const edge of diagram.edges) {
    const sid = safeId(edge.source);
    const tid = safeId(edge.target);
    const label = edge.label?.text ? `|"${safeText(edge.label.text)}"|` : "";
    const isDashed = (edge.type as string) === "dependency" || (edge.type as string) === "dashed";
    const arrow = isDashed ? `-.->${label}` : `-->${label}`;
    lines.push(`    ${sid} ${arrow} ${tid}`);
  }

  return lines.join("\n");
}

function exportSequenceToMermaid(diagram: Diagram): string {
  const lines: string[] = ["sequenceDiagram", "    autonumber"];

  if (diagram.participants && diagram.participants.length > 0) {
    for (const p of diagram.participants) {
      const isActor = (p as any).type === "actor";
      const kw = isActor ? "actor" : "participant";
      lines.push(`    ${kw} ${safeId(p.id)} as "${safeText(p.name)}"`);
    }
  } else {
    for (const n of diagram.nodes) {
      lines.push(`    participant ${safeId(n.id)} as "${safeText(n.name)}"`);
    }
  }

  if (diagram.messages && diagram.messages.length > 0) {
    for (const msg of diagram.messages) {
      const from = safeId(msg.from);
      const to = safeId(msg.to);
      const txt = safeText(msg.label);
      let arrow = "->>";
      if (msg.type === "return") arrow = "-->>";
      else if (msg.type === "async") arrow = "-)";
      lines.push(`    ${from}${arrow}${to}: ${txt}`);
    }
  }

  return lines.join("\n");
}

function exportClassToMermaid(diagram: Diagram): string {
  const lines: string[] = ["classDiagram"];

  for (const n of diagram.nodes) {
    const id = safeId(n.name || n.id);
    lines.push(`    class ${id} {`);
    if ((n as any).stereotype) {
      lines.push(`        <<${(n as any).stereotype}>>`);
    } else if ((n.type as string) === "interface") {
      lines.push(`        <<interface>>`);
    } else if ((n.type as string) === "abstract") {
      lines.push(`        <<abstract>>`);
    }

    if ("attributes" in n && Array.isArray((n as any).attributes)) {
      for (const attr of (n as any).attributes) {
        const sign = attr.visibility === "private" ? "-" : attr.visibility === "protected" ? "#" : "+";
        lines.push(`        ${sign}${attr.type || "String"} ${attr.name}`);
      }
    }
    if ("methods" in n && Array.isArray((n as any).methods)) {
      for (const m of (n as any).methods) {
        const sign = m.visibility === "private" ? "-" : m.visibility === "protected" ? "#" : "+";
        lines.push(`        ${sign}${m.name}() ${m.returnType || "void"}`);
      }
    }
    lines.push(`    }`);
  }

  for (const edge of diagram.edges) {
    const sn = diagram.nodes.find((n) => n.id === edge.source);
    const tn = diagram.nodes.find((n) => n.id === edge.target);
    if (!sn || !tn) continue;
    const sid = safeId(sn.name || sn.id);
    const tid = safeId(tn.name || tn.id);
    let rel = "-->";
    const eType = edge.type as string;
    switch (eType) {
      case "inheritance":
      case "generalization":
        rel = "<|--";
        break;
      case "realization":
      case "implementation":
        rel = "<|..";
        break;
      case "composition":
        rel = "*--";
        break;
      case "aggregation":
        rel = "o--";
        break;
      case "dependency":
        rel = "..>";
        break;
      default:
        rel = "-->";
    }
    const label = edge.label?.text ? ` : "${safeText(edge.label.text)}"` : "";
    lines.push(`    ${tid} ${rel} ${sid}${label}`);
  }

  return lines.join("\n");
}

function exportERDToMermaid(diagram: Diagram): string {
  const lines: string[] = ["erDiagram"];

  for (const n of diagram.nodes) {
    const id = safeId(n.name || n.id).toUpperCase();
    lines.push(`    ${id} {`);
    if ("attributes" in n && Array.isArray((n as any).attributes)) {
      for (const col of (n as any).attributes) {
        const colType = (col.type || "string").replace(/[^a-zA-Z0-9_]/g, "_");
        const colName = col.name.replace(/[^a-zA-Z0-9_]/g, "_");
        const key = col.isPrimaryKey ? "PK" : col.isForeignKey ? "FK" : "";
        lines.push(`        ${colType} ${colName} ${key}`);
      }
    }
    lines.push(`    }`);
  }

  for (const edge of diagram.edges) {
    const sn = diagram.nodes.find((n) => n.id === edge.source);
    const tn = diagram.nodes.find((n) => n.id === edge.target);
    if (!sn || !tn) continue;
    const sid = safeId(sn.name || sn.id).toUpperCase();
    const tid = safeId(tn.name || tn.id).toUpperCase();
    const label = edge.label?.text ? safeText(edge.label.text) : "relates";
    lines.push(`    ${sid} ||--o{ ${tid} : "${label}"`);
  }

  return lines.join("\n");
}

function exportStateToMermaid(diagram: Diagram): string {
  const lines: string[] = ["stateDiagram-v2"];

  for (const n of diagram.nodes) {
    if (n.type === "initial" || n.type === "start") {
      lines.push(`    [*] --> ${safeId(n.id)}`);
    } else if (n.type === "final" || n.type === "end") {
      lines.push(`    ${safeId(n.id)} --> [*]`);
    } else {
      lines.push(`    ${safeId(n.id)} : ${safeText(n.name)}`);
    }
  }

  for (const edge of diagram.edges) {
    const sid = safeId(edge.source);
    const tid = safeId(edge.target);
    const label = edge.label?.text ? ` : ${safeText(edge.label.text)}` : "";
    lines.push(`    ${sid} --> ${tid}${label}`);
  }

  return lines.join("\n");
}

function exportUseCaseToMermaid(diagram: Diagram): string {
  const lines: string[] = ["flowchart LR"];

  const actors = diagram.nodes.filter((n) => n.type === "actor");
  const usecases = diagram.nodes.filter((n) => n.type === "usecase");

  for (const a of actors) {
    lines.push(`    ${safeId(a.id)}["👤 ${safeText(a.name)}"]`);
  }

  lines.push(`    subgraph System ["System Scope"]`);
  for (const uc of usecases) {
    lines.push(`        ${safeId(uc.id)}(["${safeText(uc.name)}"])`);
  }
  lines.push(`    end`);

  for (const edge of diagram.edges) {
    const sid = safeId(edge.source);
    const tid = safeId(edge.target);
    const label = edge.label?.text ? `|"${safeText(edge.label.text)}"|` : "";
    const isDashed = edge.label?.text?.includes("include") || edge.label?.text?.includes("extend");
    const arrow = isDashed ? `-.->${label}` : `-->${label}`;
    lines.push(`    ${sid} ${arrow} ${tid}`);
  }

  return lines.join("\n");
}
