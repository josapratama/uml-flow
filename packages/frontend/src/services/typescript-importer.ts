/**
 * Reverse TypeScript Code Importer
 * Parses TypeScript interfaces, classes, enums, and string union types into UML Flow DSL.
 */

export function isTypeScriptCode(code: string): boolean {
  const stripped = code.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "").trim();
  return (
    /\b(interface|class|enum)\s+[A-Za-z0-9_]+/i.test(stripped) ||
    /\btype\s+[A-Za-z0-9_]+\s*=\s*(?:'[^']+'|"[^"]+")/i.test(stripped)
  );
}

interface ParsedMember {
  name: string;
  type?: string;
  isMethod: boolean;
  params?: string;
  visibility: "+" | "-" | "#";
  isOptional?: boolean;
}

interface ParsedClass {
  name: string;
  kind: "class" | "interface" | "enum";
  extends?: string[];
  implements?: string[];
  members: ParsedMember[];
}

export function parseTypeScriptToDSL(tsCode: string): string {
  // Strip block and line comments
  const clean = tsCode.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "");
  const lines: string[] = ['@diagram(type: "class")', ""];
  const relationships: string[] = [];
  const parsedClasses: ParsedClass[] = [];

  // Match enum definitions: enum Name { A, B = "B", C }
  const enumRegex = /enum\s+([A-Za-z0-9_]+)\s*\{([^}]*)\}/g;
  let match: RegExpExecArray | null;
  while ((match = enumRegex.exec(clean)) !== null) {
    const enumName = match[1];
    const body = match[2];
    const rawItems = body.split(",").map(s => s.trim()).filter(Boolean);
    const members: ParsedMember[] = [];
    for (const item of rawItems) {
      const itemName = item.split("=")[0].trim();
      if (itemName) {
        members.push({
          name: itemName,
          isMethod: false,
          visibility: "+",
        });
      }
    }
    parsedClasses.push({
      name: enumName,
      kind: "enum",
      members,
    });
  }

  // Match string union types: type Status = "ACTIVE" | "PENDING" | "INACTIVE";
  const typeUnionRegex = /type\s+([A-Za-z0-9_]+)\s*=\s*([^;]+);/g;
  while ((match = typeUnionRegex.exec(clean)) !== null) {
    const typeName = match[1];
    const unionPart = match[2];
    if (unionPart.includes('"') || unionPart.includes("'")) {
      const values = unionPart
        .split("|")
        .map(v => v.trim().replace(/^['"]|['"]$/g, ""))
        .filter(Boolean);

      if (values.length > 0) {
        parsedClasses.push({
          name: typeName,
          kind: "enum",
          members: values.map(v => ({
            name: v,
            isMethod: false,
            visibility: "+",
          })),
        });
      }
    }
  }

  // Match interface or class definitions
  const classOrInterfaceRegex = /(?:export\s+)?(?:default\s+)?(interface|class)\s+([A-Za-z0-9_]+)(?:\s+extends\s+([^{]+?))?(?:\s+implements\s+([^{]+?))?\s*\{/g;
  while ((match = classOrInterfaceRegex.exec(clean)) !== null) {
    const kind = match[1] as "class" | "interface";
    const name = match[2];
    const extendsClause = match[3]?.trim();
    const implementsClause = match[4]?.trim();

    const extendsList = extendsClause
      ? extendsClause.split(",").map(s => s.trim()).filter(Boolean)
      : [];
    const implementsList = implementsClause
      ? implementsClause.split(",").map(s => s.trim()).filter(Boolean)
      : [];

    // Find the matching closing bracket for this block
    const startIndex = match.index + match[0].length;
    let depth = 1;
    let endIndex = startIndex;
    while (depth > 0 && endIndex < clean.length) {
      if (clean[endIndex] === "{") depth++;
      else if (clean[endIndex] === "}") depth--;
      endIndex++;
    }

    const body = clean.slice(startIndex, endIndex - 1);
    const members = parseBodyMembers(body);

    parsedClasses.push({
      name,
      kind,
      extends: extendsList,
      implements: implementsList,
      members,
    });

    for (const parent of extendsList) {
      relationships.push(`${parent} <|-- ${name} : extends`);
    }
    for (const iface of implementsList) {
      relationships.push(`${iface} <|.. ${name} : implements`);
    }
  }

  // Format parsed classes into UML Flow DSL
  for (const cls of parsedClasses) {
    lines.push(`${cls.kind} ${cls.name} {`);
    for (const m of cls.members) {
      const vis = m.visibility || "+";
      if (m.isMethod) {
        lines.push(`  ${vis}${m.name}(${m.params || ""}): ${m.type || "void"}`);
      } else {
        const opt = m.isOptional ? "?" : "";
        const typeStr = m.type ? `: ${m.type}` : "";
        lines.push(`  ${vis}${m.name}${opt}${typeStr}`);
      }
    }
    lines.push("}");
    lines.push("");
  }

  // Add relationships
  if (relationships.length > 0) {
    lines.push("// Relasi Inheritance & Implementation");
    for (const rel of relationships) {
      lines.push(rel);
    }
    lines.push("");
  }

  return lines.join("\n").trim();
}

function parseBodyMembers(body: string): ParsedMember[] {
  const members: ParsedMember[] = [];
  // Split by line or semicolon
  const rawLines = body
    .split(/\r?\n|;/)
    .map(s => s.trim())
    .filter(Boolean);

  for (const line of rawLines) {
    if (!line || line.startsWith("//") || line.startsWith("/*")) continue;

    // Visibility
    let visibility: "+" | "-" | "#" = "+";
    let text = line;
    if (text.startsWith("public ")) {
      visibility = "+";
      text = text.slice(7).trim();
    } else if (text.startsWith("private ")) {
      visibility = "-";
      text = text.slice(8).trim();
    } else if (text.startsWith("protected ")) {
      visibility = "#";
      text = text.slice(10).trim();
    }

    // Check if method: methodName(params): returnType
    const methodMatch = /^([A-Za-z0-9_]+)\s*\(([^)]*)\)\s*(?::\s*([^;{]+))?/.exec(text);
    if (methodMatch) {
      const methodName = methodMatch[1];
      const params = methodMatch[2].trim();
      const returnType = (methodMatch[3] || "void").trim();
      members.push({
        name: methodName,
        isMethod: true,
        params,
        type: returnType,
        visibility,
      });
      continue;
    }

    // Check if property: propName?: type
    const propMatch = /^([A-Za-z0-9_]+)(\?)?\s*:\s*([^;]+)/.exec(text);
    if (propMatch) {
      const propName = propMatch[1];
      const isOptional = Boolean(propMatch[2]);
      const propType = propMatch[3].trim();
      members.push({
        name: propName,
        isMethod: false,
        isOptional,
        type: propType,
        visibility,
      });
      continue;
    }

    // Simple word without colon
    const simpleWord = /^([A-Za-z0-9_]+)/.exec(text);
    if (simpleWord) {
      members.push({
        name: simpleWord[1],
        isMethod: false,
        visibility,
      });
    }
  }

  return members;
}
