/**
 * Mermaid.js to UML Flow DSL Converter
 * Converts Mermaid diagram definitions (classDiagram, sequenceDiagram, erDiagram, stateDiagram, flowchart/graph)
 * into uml-flow DSL.
 */

export function isMermaidCode(text: string): boolean {
  if (!text) return false;
  const trimmed = text.trim();
  return (
    /^(?:classDiagram|sequenceDiagram|erDiagram|stateDiagram(?:-v2)?|flowchart\s+(?:TD|TB|BT|RL|LR)|graph\s+(?:TD|TB|BT|RL|LR))/m.test(
      trimmed,
    )
  );
}

export function parseMermaidToDSL(
  mermaidText: string,
  diagramName = "Imported Mermaid Diagram",
): string {
  const trimmed = mermaidText.trim();

  if (/^classDiagram/m.test(trimmed)) {
    return parseMermaidClassDiagram(trimmed, diagramName);
  }
  if (/^sequenceDiagram/m.test(trimmed)) {
    return parseMermaidSequenceDiagram(trimmed, diagramName);
  }
  if (/^erDiagram/m.test(trimmed)) {
    return parseMermaidERDiagram(trimmed, diagramName);
  }
  if (/^stateDiagram(?:-v2)?/m.test(trimmed)) {
    return parseMermaidStateDiagram(trimmed, diagramName);
  }
  if (/^(?:flowchart|graph)\s+/m.test(trimmed)) {
    return parseMermaidFlowchart(trimmed, diagramName);
  }

  // Fallback: return as-is
  return mermaidText;
}

/**
 * Convert Mermaid classDiagram to uml-flow DSL
 */
function parseMermaidClassDiagram(text: string, diagramName: string): string {
  const lines = text.split("\n");
  const output: string[] = [`@diagram "${diagramName}" class`, ""];
  const classes = new Map<
    string,
    {
      type: "class" | "interface" | "abstract" | "enum";
      members: string[];
    }
  >();
  const relationships: string[] = [];

  let currentClass: string | null = null;

  for (let rawLine of lines) {
    let line = rawLine.trim();
    if (!line || line.startsWith("%%") || line === "classDiagram") continue;

    // Detect class declaration block: class Foo {
    const classBlockMatch = line.match(/^class\s+([A-Za-z0-9_]+)\s*(?:\{)?$/);
    if (classBlockMatch) {
      currentClass = classBlockMatch[1];
      if (!classes.has(currentClass)) {
        classes.set(currentClass, { type: "class", members: [] });
      }
      if (line.endsWith("{")) continue;
    }

    if (line === "}") {
      currentClass = null;
      continue;
    }

    // Inside class block
    if (currentClass && !line.includes("<|--") && !line.includes("--|>") && !line.includes("-->")) {
      const entry = classes.get(currentClass);
      if (entry) {
        entry.members.push(normalizeClassMember(line));
      }
      continue;
    }

    // Standalone member: ClassName : +type name or ClassName : +name()
    const memberMatch = line.match(/^([A-Za-z0-9_]+)\s*:\s*(.+)$/);
    if (memberMatch) {
      const clsName = memberMatch[1];
      const member = memberMatch[2].trim();
      if (!classes.has(clsName)) {
        classes.set(clsName, { type: "class", members: [] });
      }
      classes.get(clsName)!.members.push(normalizeClassMember(member));
      continue;
    }

    // Annotation <<interface>> or <<enumeration>>
    const annotMatch = line.match(/^<<(\w+)>>\s*([A-Za-z0-9_]+)$/) || line.match(/^class\s+([A-Za-z0-9_]+)\s*<<(\w+)>>$/);
    if (annotMatch) {
      const ann = (annotMatch[1] || annotMatch[2]).toLowerCase();
      const name = annotMatch[1] && annotMatch[2] ? (annotMatch[1].length > annotMatch[2].length ? annotMatch[1] : annotMatch[2]) : "";
      const targetName = /^[A-Za-z0-9_]+$/.test(annotMatch[2]) ? annotMatch[2] : annotMatch[1];
      if (!classes.has(targetName)) {
        classes.set(targetName, { type: "class", members: [] });
      }
      if (ann.includes("interface")) classes.get(targetName)!.type = "interface";
      else if (ann.includes("enum")) classes.get(targetName)!.type = "enum";
      else if (ann.includes("abstract")) classes.get(targetName)!.type = "abstract";
      continue;
    }

    // Relationships in Mermaid:
    // Class01 <|-- Class02 (Class02 extends Class01)
    // Class01 *-- Class02 (Composition)
    // Class01 o-- Class02 (Aggregation)
    // Class01 --> Class02 (Association)
    // Class01 ..> Class02 (Dependency)
    // Class01 ..|> Class02 (Class01 implements Class02)
    const relMatch = line.match(/^([A-Za-z0-9_]+)\s*([<|*o.\-]+(?:\|>|>|--)?)\s*([A-Za-z0-9_]+)(?:\s*:\s*(.+))?$/);
    if (relMatch) {
      const left = relMatch[1];
      const op = relMatch[2];
      const right = relMatch[3];
      const label = relMatch[4] ? ` : ${relMatch[4]}` : "";

      if (!classes.has(left)) classes.set(left, { type: "class", members: [] });
      if (!classes.has(right)) classes.set(right, { type: "class", members: [] });

      if (op === "<|--") {
        relationships.push(`${right} --|> ${left}${label}`);
      } else if (op === "--|>") {
        relationships.push(`${left} --|> ${right}${label}`);
      } else if (op.includes("..|>")) {
        relationships.push(`${left} ..|> ${right}${label}`);
      } else if (op.includes("<|..")) {
        relationships.push(`${right} ..|> ${left}${label}`);
      } else if (op.includes("*--")) {
        relationships.push(`${left} *-- ${right}${label}`);
      } else if (op.includes("--*")) {
        relationships.push(`${right} *-- ${left}${label}`);
      } else if (op.includes("o--")) {
        relationships.push(`${left} o-- ${right}${label}`);
      } else if (op.includes("--o")) {
        relationships.push(`${right} o-- ${left}${label}`);
      } else if (op.includes("..>")) {
        relationships.push(`${left} ..> ${right}${label}`);
      } else if (op.includes("<..")) {
        relationships.push(`${right} ..> ${left}${label}`);
      } else {
        relationships.push(`${left} --> ${right}${label}`);
      }
      continue;
    }
  }

  // Emit class blocks
  for (const [name, info] of classes.entries()) {
    output.push(`${info.type} ${name} {`);
    for (const m of info.members) {
      output.push(`  ${m}`);
    }
    output.push("}", "");
  }

  // Emit relations
  for (const rel of relationships) {
    output.push(rel);
  }

  return output.join("\n");
}

function normalizeClassMember(str: string): string {
  let s = str.trim();
  // Mermaid format: +String name or +name: String or +getName() String
  const vis = /^[+\-#~]/.test(s) ? s[0] : "+";
  if (/^[+\-#~]/.test(s)) s = s.substring(1).trim();

  // Method check: has parens
  if (s.includes("(") && s.includes(")")) {
    const parenIdx = s.indexOf("(");
    const closeParenIdx = s.indexOf(")");
    const name = s.substring(0, parenIdx).trim();
    const params = s.substring(parenIdx + 1, closeParenIdx).trim();
    const ret = s.substring(closeParenIdx + 1).replace(/^[:\s]+/, "").trim() || "void";
    return `${vis}${name}(${params}): ${ret}`;
  }

  // Attribute check: type name or name: type
  if (s.includes(":")) {
    const [n, t] = s.split(":");
    return `${vis}${n.trim()}: ${t.trim()}`;
  }
  const parts = s.split(/\s+/);
  if (parts.length >= 2) {
    const type = parts[0];
    const name = parts[1];
    return `${vis}${name}: ${type}`;
  }
  return `${vis}${s}: string`;
}

/**
 * Convert Mermaid sequenceDiagram to uml-flow DSL
 */
function parseMermaidSequenceDiagram(text: string, diagramName: string): string {
  const lines = text.split("\n");
  const output: string[] = [`@diagram "${diagramName}" sequence`, ""];
  const participants = new Set<string>();
  const actions: string[] = [];

  for (let rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("%%") || line === "sequenceDiagram" || line === "autonumber") {
      continue;
    }

    // participant Alice or actor Bob as Bob Smith
    const partMatch = line.match(/^(participant|actor)\s+([A-Za-z0-9_]+)(?:\s+as\s+(.+))?$/);
    if (partMatch) {
      const type = partMatch[1];
      const name = partMatch[2];
      participants.add(name);
      if (type === "actor") {
        output.push(`participant ${name} as actor`);
      } else {
        output.push(`participant ${name}`);
      }
      continue;
    }

    // Message arrows:
    // A->>B: text (sync)
    // A-->>B: text (reply)
    // A->B: text
    // A-->B: text
    const msgMatch = line.match(/^([A-Za-z0-9_]+)\s*(-{1,2}>>?|\-{1,2}\>|\-{1,2}\))\s*([A-Za-z0-9_]+)\s*:\s*(.+)$/);
    if (msgMatch) {
      const from = msgMatch[1];
      const op = msgMatch[2];
      const to = msgMatch[3];
      const msg = msgMatch[4].trim();

      participants.add(from);
      participants.add(to);

      const arrow = op.includes("--") ? "-->" : "->";
      actions.push(`${from} ${arrow} ${to}: ${msg}`);
      continue;
    }

    // Alt / Else / Opt / Loop
    if (/^alt\b/i.test(line)) {
      actions.push(`[alt] ${line.replace(/^alt\s*/i, "")}`);
    } else if (/^else\b/i.test(line)) {
      actions.push("[else]");
    } else if (/^end\b/i.test(line)) {
      actions.push("[end]");
    } else if (/^opt\b/i.test(line)) {
      actions.push(`[opt] ${line.replace(/^opt\s*/i, "")}`);
    } else if (/^loop\b/i.test(line)) {
      actions.push(`[loop] ${line.replace(/^loop\s*/i, "")}`);
    }
  }

  output.push("", ...actions);
  return output.join("\n");
}

/**
 * Convert Mermaid erDiagram to uml-flow DSL
 */
function parseMermaidERDiagram(text: string, diagramName: string): string {
  const lines = text.split("\n");
  const output: string[] = [`@diagram "${diagramName}" erd`, ""];
  const entities = new Map<string, string[]>();
  const relations: string[] = [];

  let currentEntity: string | null = null;

  for (let rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("%%") || line === "erDiagram") continue;

    // Entity block: CUSTOMER {
    const entMatch = line.match(/^([A-Za-z0-9_]+)\s*\{$/);
    if (entMatch) {
      currentEntity = entMatch[1];
      if (!entities.has(currentEntity)) entities.set(currentEntity, []);
      continue;
    }

    if (line === "}") {
      currentEntity = null;
      continue;
    }

    // Inside entity block: string name or int id PK or string email "comment"
    if (currentEntity) {
      const parts = line.split(/\s+/);
      if (parts.length >= 2) {
        const type = parts[0];
        const name = parts[1];
        const isPK = parts.includes("PK");
        const isFK = parts.includes("FK");
        let attr = `${isPK ? "*" : ""}${name}: ${type}`;
        if (isFK) attr += " [fk]";
        entities.get(currentEntity)!.push(attr);
      }
      continue;
    }

    // Relations: CUSTOMER ||--o{ ORDER : places
    const relMatch = line.match(/^([A-Za-z0-9_]+)\s*([|o{}]+--[|o{}]+)\s*([A-Za-z0-9_]+)(?:\s*:\s*["']?([^"']+)["']?)?$/);
    if (relMatch) {
      const e1 = relMatch[1];
      let op = relMatch[2];
      const e2 = relMatch[3];
      const label = relMatch[4] ? ` : ${relMatch[4]}` : "";

      if (!entities.has(e1)) entities.set(e1, []);
      if (!entities.has(e2)) entities.set(e2, []);

      // Normalize ERD operator to uml-flow
      if (op.includes("o{") || op.includes("{o")) {
        op = "||--o{";
      } else if (op.includes("}o")) {
        op = "}o--||";
      } else {
        op = "||--||";
      }
      relations.push(`${e1} ${op} ${e2}${label}`);
    }
  }

  for (const [name, attrs] of entities.entries()) {
    output.push(`entity ${name} {`);
    for (const a of attrs) {
      output.push(`  ${a}`);
    }
    output.push("}", "");
  }

  output.push(...relations);
  return output.join("\n");
}

/**
 * Convert Mermaid stateDiagram to uml-flow DSL
 */
function parseMermaidStateDiagram(text: string, diagramName: string): string {
  const lines = text.split("\n");
  const output: string[] = [`@diagram "${diagramName}" state`, ""];
  const states = new Set<string>();
  const transitions: string[] = [];

  for (let rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("%%") || line.startsWith("stateDiagram")) continue;

    // Transition: StateA --> StateB : event or [*] --> StateA
    const transMatch = line.match(/^(\[\*\]|[A-Za-z0-9_]+)\s*-->\s*(\[\*\]|[A-Za-z0-9_]+)(?:\s*:\s*(.+))?$/);
    if (transMatch) {
      const src = transMatch[1] === "[*]" ? "[initial]" : transMatch[1];
      const tgt = transMatch[2] === "[*]" ? "[final]" : transMatch[2];
      const evt = transMatch[3] ? ` : ${transMatch[3]}` : "";

      if (src !== "[initial]") states.add(src);
      if (tgt !== "[final]") states.add(tgt);

      transitions.push(`${src} --> ${tgt}${evt}`);
      continue;
    }

    // State declaration: state "State Description" as StateA or state StateA
    const stateMatch = line.match(/^state\s+(?:["']([^"']+)["']\s+as\s+)?([A-Za-z0-9_]+)/);
    if (stateMatch) {
      const name = stateMatch[2];
      states.add(name);
    }
  }

  output.push("[initial]");
  for (const s of states) {
    output.push(`state ${s}`);
  }
  output.push("[final]", "");
  output.push(...transitions);

  return output.join("\n");
}

/**
 * Convert Mermaid flowchart / graph to uml-flow flowchart DSL
 */
function parseMermaidFlowchart(text: string, diagramName: string): string {
  const lines = text.split("\n");
  const output: string[] = [`@diagram "${diagramName}" flowchart`, ""];
  const nodes = new Map<string, { type: string; label: string }>();
  const edges: string[] = [];

  for (let rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("%%") || /^(?:flowchart|graph)\s+/i.test(line)) {
      continue;
    }

    // Match nodes in connections: A[Text] -->|Condition| B(Text) or A --> B
    const linkMatch = line.match(/^([A-Za-z0-9_]+)(?:\[([^\]]+)\]|\(([^\)]+)\)|\{([^}]+)\})?\s*-->\s*(?:\|([^|]+)\|\s*)?([A-Za-z0-9_]+)(?:\[([^\]]+)\]|\(([^\)]+)\)|\{([^}]+)\})?$/);
    if (linkMatch) {
      const id1 = linkMatch[1];
      const text1 = linkMatch[2] || linkMatch[3] || linkMatch[4] || id1;
      const type1 = linkMatch[4] ? "decision" : linkMatch[3] ? "start" : "process";

      const cond = linkMatch[5] ? ` : ${linkMatch[5].trim()}` : "";

      const id2 = linkMatch[6];
      const text2 = linkMatch[7] || linkMatch[8] || linkMatch[9] || id2;
      const type2 = linkMatch[9] ? "decision" : linkMatch[8] ? "end" : "process";

      if (!nodes.has(id1)) nodes.set(id1, { type: type1, label: text1 });
      if (!nodes.has(id2)) nodes.set(id2, { type: type2, label: text2 });

      edges.push(`"${nodes.get(id1)!.label}" --> "${nodes.get(id2)!.label}"${cond}`);
      continue;
    }

    // Standalone node: A[Process Label] or B{Decision?} or C(Start)
    const nodeMatch = line.match(/^([A-Za-z0-9_]+)(?:\[([^\]]+)\]|\(([^\)]+)\)|\{([^}]+)\})$/);
    if (nodeMatch) {
      const id = nodeMatch[1];
      const label = nodeMatch[2] || nodeMatch[3] || nodeMatch[4] || id;
      const type = nodeMatch[4] ? "decision" : nodeMatch[3] ? "start" : "process";
      nodes.set(id, { type, label });
    }
  }

  for (const node of nodes.values()) {
    output.push(`${node.type} "${node.label}"`);
  }
  output.push("", ...edges);

  return output.join("\n");
}
