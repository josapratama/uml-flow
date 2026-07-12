import type { Diagram, ClassNode } from "@uml-editor/shared";

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
      for (const attr of cn.attributes) {
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
    for (const attr of cn.attributes) {
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

    if (cn.attributes.length > 0 && cn.methods.length > 0) lines.push("");

    // Methods
    for (const method of cn.methods) {
      const vis =
        method.visibility === "+"
          ? "public"
          : method.visibility === "-"
            ? "private"
            : method.visibility === "#"
              ? "protected"
              : "";
      const params = method.params
        .map((p) => `${p.name}: ${mapType(p.type)}`)
        .join(", ");
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

/**
 * Generate Java classes/interfaces from a class diagram.
 */
export function generateJava(diagram: Diagram): string {
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

    const keyword =
      cn.type === "interface"
        ? "interface"
        : cn.type === "abstract"
          ? "abstract class"
          : cn.type === "enum"
            ? "enum"
            : "class";

    const parentEdges = diagram.edges.filter(
      (e) =>
        e.source === cn.id &&
        (e.type === "inheritance" || e.type === "realization"),
    );

    let decl = `public ${keyword} ${cn.name}`;
    if (cn.type === "enum") {
      lines.push(`${decl} {`);
      lines.push(`  ${cn.attributes.map((a) => a.name).join(", ")}`);
      lines.push("}", "");
      continue;
    }

    const extendsParents = parentEdges
      .filter((e) => e.type === "inheritance")
      .map((e) => nodes.find((n) => n.id === e.target)?.name)
      .filter(Boolean);
    const implParents = parentEdges
      .filter((e) => e.type === "realization")
      .map((e) => nodes.find((n) => n.id === e.target)?.name)
      .filter(Boolean);
    if (extendsParents.length) decl += ` extends ${extendsParents[0]}`;
    if (implParents.length) decl += ` implements ${implParents.join(", ")}`;

    lines.push(`${decl} {`);

    for (const attr of cn.attributes) {
      const vis =
        attr.visibility === "+"
          ? "public"
          : attr.visibility === "-"
            ? "private"
            : attr.visibility === "#"
              ? "protected"
              : "package";
      lines.push(`  ${vis} ${mapJavaType(attr.type)} ${attr.name};`);
    }

    if (cn.attributes.length > 0 && cn.methods.length > 0) lines.push("");

    for (const method of cn.methods) {
      const vis =
        method.visibility === "+"
          ? "public"
          : method.visibility === "-"
            ? "private"
            : method.visibility === "#"
              ? "protected"
              : "";
      const params = method.params
        .map((p) => `${mapJavaType(p.type)} ${p.name}`)
        .join(", ");
      const ret = mapJavaType(method.returnType);
      const abs = method.isAbstract ? "abstract " : "";
      if (keyword === "interface") {
        lines.push(`  ${ret} ${method.name}(${params});`);
      } else if (method.isAbstract) {
        lines.push(`  ${vis} ${abs}${ret} ${method.name}(${params});`);
      } else {
        lines.push(`  ${vis} ${ret} ${method.name}(${params}) {`);
        lines.push(`    // TODO: implement`);
        lines.push(`  }`);
      }
    }

    lines.push("}", "");
  }

  return lines.join("\n");
}

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

function mapJavaType(t: string): string {
  if (!t) return "Object";
  const lower = t.toLowerCase();
  if (lower === "string") return "String";
  if (lower === "int" || lower === "integer" || lower === "number")
    return "int";
  if (lower === "bool" || lower === "boolean") return "boolean";
  if (lower === "void") return "void";
  if (lower === "date") return "Date";
  return t;
}
