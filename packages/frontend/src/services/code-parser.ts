import type { Diagram, ClassNode } from "@uml-editor/shared";
export { isMermaidCode, parseMermaidToDSL } from "./mermaid-importer";

/**
 * Parse TypeScript/JavaScript code and generate a class diagram.
 * Simple regex-based parser — handles common patterns.
 */
export function parseTypeScriptToClassDiagram(
  code: string,
  name: string = "Parsed Diagram",
): Diagram {
  const nodes: ClassNode[] = [];
  const edges: any[] = [];
  let nodeIndex = 0;

  // Match class/interface/enum declarations
  const classRegex =
    /(?:export\s+)?(?:(abstract)\s+)?(class|interface|enum)\s+(\w+)(?:\s+extends\s+([\w,\s]+))?(?:\s+implements\s+([\w,\s]+))?\s*\{([^}]*)\}/gs;

  let match;
  while ((match = classRegex.exec(code)) !== null) {
    const isAbstract = !!match[1];
    const keyword = match[2]; // class, interface, enum
    const className = match[3];
    const extendsStr = match[4];
    const implementsStr = match[5];
    const body = match[6];

    const type =
      keyword === "interface"
        ? "interface"
        : keyword === "enum"
          ? "enum"
          : isAbstract
            ? "abstract"
            : "class";

    const attributes: any[] = [];
    const methods: any[] = [];

    if (type === "enum") {
      // Parse enum members
      const members = body
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean);
      for (const member of members) {
        const name = member.split("=")[0].trim();
        if (name)
          attributes.push({ visibility: "+", name, type: "", isStatic: false });
      }
    } else {
      // Parse properties and methods
      const lines = body
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      for (const line of lines) {
        // Skip comments
        if (
          line.startsWith("//") ||
          line.startsWith("*") ||
          line.startsWith("/*")
        )
          continue;

        // TypeScript Method: name(...): type or name(...) {
        const methodMatch = line.match(
          /^(?:(public|private|protected|static|abstract|readonly)\s+)*(\w+)\s*\(([^)]*)\)\s*(?::\s*(\w+[\[\]<>]*))?/,
        );
        // Java Method: [vis/modifiers] returnType methodName(params) {
        const javaMethodMatch = line.match(
          /^(?:(public|private|protected|static|abstract|final|synchronized)\s+)*([\w<>\[\]]+)\s+(\w+)\s*\(([^)]*)\)\s*(?:throws\s+[\w,\s]+)?\s*[{;]?\s*$/,
        );

        if (methodMatch && !line.includes("=") && methodMatch[2] !== "constructor") {
          const modifiers = line.substring(0, line.indexOf(methodMatch[2]!));
          const vis = modifiers.includes("private")
            ? "-"
            : modifiers.includes("protected")
              ? "#"
              : "+";
          const methodName = methodMatch[2];
          const paramsStr = methodMatch[3];
          const returnType = methodMatch[4] || "void";
          const params = paramsStr
            ? paramsStr
                .split(",")
                .map((p) => {
                  const raw = p.trim();
                  if (raw.includes(":")) {
                    const [pn, pt] = raw.split(":");
                    return { name: pn.trim(), type: pt?.trim() || "any" };
                  }
                  const parts = raw.split(/\s+/);
                  if (parts.length >= 2) {
                    return {
                      name: parts[parts.length - 1],
                      type: parts.slice(0, -1).join(" "),
                    };
                  }
                  return { name: parts[0] || "arg", type: "any" };
                })
                .filter((p) => p.name)
            : [];
          methods.push({
            visibility: vis,
            name: methodName,
            params,
            returnType,
            isAbstract: modifiers.includes("abstract"),
          });
          continue;
        } else if (javaMethodMatch && javaMethodMatch[3] !== "constructor") {
          const modifiers = line.substring(0, line.indexOf(javaMethodMatch[3]!));
          const vis = modifiers.includes("private")
            ? "-"
            : modifiers.includes("protected")
              ? "#"
              : "+";
          const returnType = javaMethodMatch[2];
          const methodName = javaMethodMatch[3];
          const paramsStr = javaMethodMatch[4];
          const params = paramsStr
            ? paramsStr
                .split(",")
                .map((p) => {
                  const parts = p.trim().split(/\s+/);
                  if (parts.length >= 2) {
                    return {
                      name: parts[parts.length - 1],
                      type: parts.slice(0, -1).join(" "),
                    };
                  }
                  return { name: parts[0] || "arg", type: "any" };
                })
                .filter((p) => p.name)
            : [];
          methods.push({
            visibility: vis,
            name: methodName,
            params,
            returnType,
            isAbstract: modifiers.includes("abstract"),
          });
          continue;
        }

        // TypeScript Property: name: type or name = value
        const propMatch = line.match(
          /^(?:(public|private|protected|static|readonly)\s+)*(\w+)\s*[?!]?\s*(?::\s*([\w\[\]<>|&\s]+?))?(?:\s*=.*)?[;,]?\s*$/,
        );
        // Java Field: [modifiers] Type name [= value];
        const javaFieldMatch = line.match(
          /^(?:(public|private|protected|static|final|volatile|transient)\s+)+([\w<>\[\]]+)\s+(\w+)(?:\s*=.*)?[;,]?\s*$/,
        );

        if (javaFieldMatch) {
          const modifiers = line.substring(0, line.indexOf(javaFieldMatch[3]!));
          const vis = modifiers.includes("private")
            ? "-"
            : modifiers.includes("protected")
              ? "#"
              : "+";
          const propType = javaFieldMatch[2];
          const propName = javaFieldMatch[3];
          if (propName) {
            attributes.push({
              visibility: vis,
              name: propName,
              type: propType,
              isStatic: modifiers.includes("static"),
            });
            continue;
          }
        }

        if (propMatch) {
          const modifiers = line.substring(0, line.indexOf(propMatch[2]!));
          const vis = modifiers.includes("private")
            ? "-"
            : modifiers.includes("protected")
              ? "#"
              : "+";
          const propName = propMatch[2];
          const propType = propMatch[3]?.trim() || "any";
          if (propName && propName !== "constructor") {
            attributes.push({
              visibility: vis,
              name: propName,
              type: propType,
              isStatic: modifiers.includes("static"),
            });
          }
        }
      }
    }

    const x = 100 + (nodeIndex % 3) * 280;
    const y = 100 + Math.floor(nodeIndex / 3) * 250;

    const node: ClassNode = {
      id: `parsed_${className}_${Date.now()}_${nodeIndex}`,
      type: type as any,
      name: className,
      position: { x, y },
      size: { width: 180, height: 80 },
      attributes,
      methods,
    };
    nodes.push(node);
    nodeIndex++;

    // Create inheritance edges
    if (extendsStr) {
      const parents = extendsStr.split(",").map((s) => s.trim());
      for (const parent of parents) {
        edges.push({
          _pendingTarget: parent,
          _source: className,
          type: "inheritance",
        });
      }
    }
    if (implementsStr) {
      const ifaces = implementsStr.split(",").map((s) => s.trim());
      for (const iface of ifaces) {
        edges.push({
          _pendingTarget: iface,
          _source: className,
          type: "realization",
        });
      }
    }
  }

  // Resolve edges
  const resolvedEdges = edges
    .map((e, i) => {
      const source = nodes.find((n) => n.name === e._source);
      const target = nodes.find((n) => n.name === e._pendingTarget);
      if (!source || !target) return null;
      return {
        id: `edge_parsed_${i}`,
        source: source.id,
        target: target.id,
        type: e.type,
      };
    })
    .filter(Boolean);

  return {
    id: `diagram_parsed_${Date.now()}`,
    name,
    type: "class",
    nodes: nodes as any,
    edges: resolvedEdges as any,
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    },
  };
}
