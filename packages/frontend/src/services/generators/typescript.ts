import type { Diagram, ClassNode } from "@uml-editor/shared";

function mapType(t: string): string {
  if (!t) return "any";
  const lower = t.toLowerCase();
  if (lower === "string") return "string";
  if (lower === "int" || lower === "integer" || lower === "number")
    return "number";
  if (lower === "bool" || lower === "boolean") return "boolean";
  if (lower === "void") return "void";
  if (lower === "date") return "Date";
  return t;
}

/**
 * Generate TypeScript interfaces/classes from a class diagram.
 */
export function generateTypeScript(diagram: Diagram): string {
  if (diagram.type !== "class")
    return "// Only class diagrams can generate code";
  const nodes = diagram.nodes as ClassNode[];
  const lines: string[] = [
    "// Auto-generated from UML Class Diagram",
    `// Diagram: ${diagram.name}`,
    "",
  ];

  for (const node of nodes) {
    if (!("attributes" in node)) continue;
    const cn = node as ClassNode;

    // Determine keyword
    const keyword =
      cn.type === "interface"
        ? "interface"
        : cn.type === "abstract"
          ? "abstract class"
          : cn.type === "enum"
            ? "enum"
            : "class";

    // Find inheritance/realization
    const parentEdges = diagram.edges.filter(
      (e) =>
        e.source === cn.id &&
        (e.type === "inheritance" || e.type === "realization"),
    );
    const parentNames = parentEdges
      .map((e) => {
        const parent = nodes.find((n) => n.id === e.target);
        return parent?.name || "";
      })
      .filter(Boolean);

    // Build declaration
    let decl = `export ${keyword} ${cn.name}`;
    if (cn.type === "enum") {
      lines.push(`${decl} {`);
      for (const attr of cn.attributes || []) {
        lines.push(`  ${attr.name},`);
      }
      lines.push("}", "");
      continue;
    }

    if (parentNames.length > 0) {
      const extendsParents = parentEdges
        .filter((e) => e.type === "inheritance")
        .map((e) => nodes.find((n) => n.id === e.target)?.name)
        .filter(Boolean);
      const implParents = parentEdges
        .filter((e) => e.type === "realization")
        .map((e) => nodes.find((n) => n.id === e.target)?.name)
        .filter(Boolean);
      if (extendsParents.length)
        decl += ` extends ${extendsParents.join(", ")}`;
      if (implParents.length) decl += ` implements ${implParents.join(", ")}`;
    }

    lines.push(`${decl} {`);

    // Attributes
    for (const attr of cn.attributes || []) {
      const vis =
        attr.visibility === "+"
          ? "public"
          : attr.visibility === "-"
            ? "private"
            : attr.visibility === "#"
              ? "protected"
              : "";
      const type = mapType(attr.type);
      if (keyword === "interface") {
        lines.push(`  ${attr.name}: ${type};`);
      } else {
        lines.push(`  ${vis} ${attr.name}: ${type};`);
      }
    }

    if ((cn.attributes?.length || 0) > 0 && (cn.methods?.length || 0) > 0)
      lines.push("");

    // Methods
    for (const method of cn.methods || []) {
      const vis =
        method.visibility === "+"
          ? "public"
          : method.visibility === "-"
            ? "private"
            : method.visibility === "#"
              ? "protected"
              : "";
      const params = Array.isArray(method.params)
        ? method.params
            .map((p) =>
              typeof p === "string" ? p : `${p.name}: ${mapType(p.type)}`,
            )
            .join(", ")
        : "";
      const ret = mapType(method.returnType);
      if (keyword === "interface") {
        lines.push(`  ${method.name}(${params}): ${ret};`);
      } else {
        const abs = method.isAbstract ? "abstract " : "";
        lines.push(`  ${vis} ${abs}${method.name}(${params}): ${ret} {}`);
      }
    }

    lines.push("}", "");
  }

  return lines.join("\n");
}
