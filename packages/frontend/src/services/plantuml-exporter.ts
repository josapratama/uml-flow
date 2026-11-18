import type { Diagram, DiagramNode, Edge } from "@uml-editor/shared";

function safeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_]/g, "_");
}

function safeText(text: string): string {
  return (text || "").replace(/"/g, "'").replace(/\n/g, "\\n");
}

function formatVisibility(vis?: string): string {
  if (!vis) return "+";
  switch (vis) {
    case "public":
      return "+";
    case "private":
      return "-";
    case "protected":
      return "#";
    case "package":
      return "~";
    default:
      return vis;
  }
}

/**
 * Converts a UML Flow Diagram AST into valid PlantUML (@startuml ... @enduml) syntax.
 */
export function exportToPlantUML(diagram: Diagram): string {
  switch (diagram.type) {
    case "sequence":
      return exportSequenceToPlantUML(diagram);
    case "erd":
      return exportERDToPlantUML(diagram);
    case "class":
      return exportClassToPlantUML(diagram);
    case "state":
      return exportStateToPlantUML(diagram);
    case "usecase":
      return exportUseCaseToPlantUML(diagram);
    case "component":
      return exportComponentToPlantUML(diagram);
    case "flowchart":
    case "activity":
    default:
      return exportFlowchartToPlantUML(diagram);
  }
}

function exportClassToPlantUML(diagram: Diagram): string {
  const lines: string[] = [
    "@startuml",
    `title ${safeText(diagram.name)}`,
    "skinparam classAttributeIconSize 0",
    "skinparam monochrome false",
    "skinparam shadowing false",
    "",
  ];

  for (const node of diagram.nodes) {
    const isInterface = node.type === "interface" || (node as any).isInterface;
    const kind = isInterface ? "interface" : "class";
    lines.push(`${kind} "${safeText(node.name)}" as ${safeId(node.id)} {`);

    const attrs = (node as any).attributes || [];
    for (const attr of attrs) {
      const vis = formatVisibility(attr.visibility);
      lines.push(`  ${vis}${attr.name}: ${attr.type || "string"}`);
    }

    const methods = (node as any).methods || [];
    if (attrs.length > 0 && methods.length > 0) {
      lines.push("  --");
    }

    for (const m of methods) {
      const vis = formatVisibility(m.visibility);
      const params = (m.params || (m as any).parameters || [])
        .map((p: any) => `${p.name}: ${p.type}`)
        .join(", ");
      lines.push(`  ${vis}${m.name}(${params}): ${m.returnType || "void"}`);
    }

    lines.push("}");
    lines.push("");
  }

  for (const edge of diagram.edges) {
    const src = safeId(edge.source);
    const tgt = safeId(edge.target);
    const label = edge.label?.text ? ` : ${safeText(edge.label.text)}` : "";

    switch (edge.type as string) {
      case "inheritance":
      case "generalization":
        lines.push(`${tgt} <|-- ${src}${label}`);
        break;
      case "realization":
      case "implementation":
        lines.push(`${tgt} <|.. ${src}${label}`);
        break;
      case "composition":
        lines.push(`${src} *-- ${tgt}${label}`);
        break;
      case "aggregation":
        lines.push(`${src} o-- ${tgt}${label}`);
        break;
      case "dependency":
        lines.push(`${src} ..> ${tgt}${label}`);
        break;
      case "association":
      default:
        lines.push(`${src} --> ${tgt}${label}`);
        break;
    }
  }

  lines.push("", "@enduml");
  return lines.join("\n");
}

function exportSequenceToPlantUML(diagram: Diagram): string {
  const lines: string[] = [
    "@startuml",
    `title ${safeText(diagram.name)}`,
    "autonumber",
    "",
  ];

  for (const p of diagram.participants || []) {
    lines.push(`participant "${safeText(p.name)}" as ${safeId(p.id)}`);
  }
  lines.push("");

  for (const msg of diagram.messages || []) {
    const from = safeId(msg.from);
    const to = safeId(msg.to);
    const text = safeText((msg as any).label || (msg as any).text);
    if ((msg.type as string) === "return" || (msg.type as string) === "reply") {
      lines.push(`${from} --> ${to} : ${text}`);
    } else {
      lines.push(`${from} -> ${to} : ${text}`);
    }
  }

  lines.push("", "@enduml");
  return lines.join("\n");
}

function exportERDToPlantUML(diagram: Diagram): string {
  const lines: string[] = [
    "@startuml",
    `title ${safeText(diagram.name)}`,
    "!theme plain",
    "hide circle",
    "skinparam linetype ortho",
    "",
  ];

  for (const node of diagram.nodes) {
    lines.push(`entity "${safeText(node.name)}" as ${safeId(node.id)} {`);
    const cols = (node as any).attributes || (node as any).columns || [];
    for (const col of cols) {
      const isPk = col.isPrimaryKey || (col as any).pk;
      const isFk = col.isForeignKey || (col as any).fk;
      const marker = isPk ? "* " : isFk ? "# " : "  ";
      const tag = isPk ? " <<PK>>" : isFk ? " <<FK>>" : "";
      lines.push(`  ${marker}${col.name} : ${col.type || "text"}${tag}`);
    }
    lines.push("}");
    lines.push("");
  }

  for (const edge of diagram.edges) {
    const src = safeId(edge.source);
    const tgt = safeId(edge.target);
    const label = edge.label?.text ? ` : ${safeText(edge.label.text)}` : "";
    lines.push(`${src} ||--o{ ${tgt}${label}`);
  }

  lines.push("", "@enduml");
  return lines.join("\n");
}

function exportComponentToPlantUML(diagram: Diagram): string {
  const lines: string[] = [
    "@startuml",
    `title ${safeText(diagram.name)}`,
    "skinparam componentStyle rectangle",
    "",
  ];

  for (const node of diagram.nodes) {
    lines.push(`[${safeText(node.name)}] as ${safeId(node.id)}`);
  }
  lines.push("");

  for (const edge of diagram.edges) {
    const src = safeId(edge.source);
    const tgt = safeId(edge.target);
    const label = edge.label?.text ? ` : ${safeText(edge.label.text)}` : "";
    lines.push(`${src} ..> ${tgt}${label}`);
  }

  lines.push("", "@enduml");
  return lines.join("\n");
}

function exportUseCaseToPlantUML(diagram: Diagram): string {
  const lines: string[] = [
    "@startuml",
    `title ${safeText(diagram.name)}`,
    "left to right direction",
    "",
  ];

  for (const node of diagram.nodes) {
    if (node.type === "actor") {
      lines.push(`:${safeText(node.name)}: as ${safeId(node.id)}`);
    } else {
      lines.push(`(${safeText(node.name)}) as ${safeId(node.id)}`);
    }
  }
  lines.push("");

  for (const edge of diagram.edges) {
    const src = safeId(edge.source);
    const tgt = safeId(edge.target);
    const label = edge.label?.text ? ` : ${safeText(edge.label.text)}` : "";
    lines.push(`${src} --> ${tgt}${label}`);
  }

  lines.push("", "@enduml");
  return lines.join("\n");
}

function exportStateToPlantUML(diagram: Diagram): string {
  const lines: string[] = [
    "@startuml",
    `title ${safeText(diagram.name)}`,
    "",
  ];

  for (const node of diagram.nodes) {
    if (node.type === "start" || node.type === "initial") {
      lines.push(`state "${safeText(node.name)}" as ${safeId(node.id)}`);
    } else {
      lines.push(`state "${safeText(node.name)}" as ${safeId(node.id)}`);
    }
  }
  lines.push("");

  for (const edge of diagram.edges) {
    const src = safeId(edge.source);
    const tgt = safeId(edge.target);
    const label = edge.label?.text ? ` : ${safeText(edge.label.text)}` : "";
    lines.push(`${src} --> ${tgt}${label}`);
  }

  lines.push("", "@enduml");
  return lines.join("\n");
}

function exportFlowchartToPlantUML(diagram: Diagram): string {
  const lines: string[] = [
    "@startuml",
    `title ${safeText(diagram.name)}`,
    "skinparam defaultTextAlignment center",
    "",
  ];

  for (const node of diagram.nodes) {
    const id = safeId(node.id);
    const label = safeText(node.name);
    if (node.type === "start" || node.type === "end" || (node.type as string) === "terminal") {
      lines.push(`(${label}) as ${id}`);
    } else if (node.type === "decision") {
      lines.push(`<<choice>> as ${id}`);
      lines.push(`note right of ${id} : ${label}`);
    } else {
      lines.push(`[${label}] as ${id}`);
    }
  }
  lines.push("");

  for (const edge of diagram.edges) {
    const src = safeId(edge.source);
    const tgt = safeId(edge.target);
    const label = edge.label?.text ? ` : ${safeText(edge.label.text)}` : "";
    lines.push(`${src} --> ${tgt}${label}`);
  }

  lines.push("", "@enduml");
  return lines.join("\n");
}
