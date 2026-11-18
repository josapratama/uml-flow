import type { Diagram, ClassNode, ERDEntity } from "@uml-editor/shared";

function mapRustType(t: string): string {
  if (!t) return "String";
  const isOptional = t.endsWith("?");
  const base = isOptional ? t.slice(0, -1) : t;
  const lower = base.toLowerCase().trim();
  let mapped = "String";

  if (lower === "string" || lower === "varchar" || lower === "text") mapped = "String";
  else if (lower === "int" || lower === "integer" || lower === "serial") mapped = "i32";
  else if (lower === "long" || lower === "bigint") mapped = "i64";
  else if (lower === "float") mapped = "f32";
  else if (lower === "double" || lower === "decimal" || lower === "numeric") mapped = "f64";
  else if (lower === "bool" || lower === "boolean") mapped = "bool";
  else if (lower === "datetime" || lower === "date" || lower === "timestamp") mapped = "chrono::DateTime<chrono::Utc>";
  else if (lower === "uuid" || lower === "guid") mapped = "uuid::Uuid";
  else if (lower === "void") mapped = "()";
  else if (lower.endsWith("[]") || lower.startsWith("list<")) {
    const inner = lower.replace(/\[\]$/, "").replace(/^list<|>$/g, "");
    mapped = `Vec<${mapRustType(inner)}>`;
  } else {
    mapped = toPascalCase(base);
  }

  return isOptional ? `Option<${mapped}>` : mapped;
}

function toPascalCase(name: string): string {
  return (name || "Item")
    .replace(/[^a-zA-Z0-9_]/g, " ")
    .split(/[\s_]+/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

function toSnakeCase(name: string): string {
  return (name || "item")
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .toLowerCase();
}

/**
 * Generate modern idiomatic Rust structs & enums using Serde
 */
export function generateRust(diagram: Diagram): string {
  const lines: string[] = [
    `// ------------------------------------------------------------------------------`,
    `// Auto-generated Rust models from UML Flow`,
    `// Diagram: ${diagram.name || "Untitled"} (${diagram.type})`,
    `// Generated At: ${new Date().toISOString()}`,
    `// ------------------------------------------------------------------------------`,
    "",
    "use serde::{Serialize, Deserialize};",
    "",
  ];

  if (diagram.type === "class") {
    const nodes = (diagram.nodes as ClassNode[]).filter(n => "name" in n);

    if (nodes.length === 0) {
      lines.push("// No class nodes found in diagram");
      return lines.join("\n");
    }

    // 1. Enums
    const enums = nodes.filter(n => n.type === "enum");
    for (const en of enums) {
      const enumName = toPascalCase(en.name);
      lines.push("#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]");
      lines.push('#[serde(rename_all = "SCREAMING_SNAKE_CASE")]');
      lines.push(`pub enum ${enumName} {`);
      const attrs = en.attributes || [];
      if (attrs.length === 0) {
        lines.push("    Default,");
      } else {
        for (const a of attrs) {
          const variant = toPascalCase(a.name);
          lines.push(`    ${variant},`);
        }
      }
      lines.push("}");
      lines.push("");
    }

    // 2. Structs & Implementations
    const classes = nodes.filter(n => n.type !== "enum");
    for (const cls of classes) {
      const structName = toPascalCase(cls.name);
      lines.push("#[derive(Debug, Clone, Serialize, Deserialize)]");
      lines.push(`pub struct ${structName} {`);

      const attrs = cls.attributes || [];
      for (const attr of attrs) {
        const isOptional = attr.name.endsWith("?") || (attr.type && (attr.type.endsWith("?") || attr.type.toLowerCase().includes("optional")));
        const cleanName = attr.name.replace(/\?$/, "");
        const fieldName = toSnakeCase(cleanName);
        let rustType = mapRustType(attr.type || "string");
        if (isOptional && !rustType.startsWith("Option<")) {
          rustType = `Option<${rustType}>`;
        }

        if (isOptional) {
          lines.push('    #[serde(skip_serializing_if = "Option::is_none")]');
        }
        lines.push(`    pub ${fieldName}: ${rustType},`);
      }

      lines.push("}");
      lines.push("");

      // Impl block
      lines.push(`impl ${structName} {`);
      lines.push(`    /// Constructor stub`);
      lines.push(`    pub fn new() -> Self {`);
      lines.push(`        Self {`);
      for (const attr of attrs) {
        const isOptional = attr.name.endsWith("?") || (attr.type && (attr.type.endsWith("?") || attr.type.toLowerCase().includes("optional")));
        const fieldName = toSnakeCase(attr.name.replace(/\?$/, ""));
        let rustType = mapRustType(attr.type || "string");
        if (isOptional) {
          lines.push(`            ${fieldName}: None,`);
        } else if (rustType === "String") {
          lines.push(`            ${fieldName}: String::new(),`);
        } else if (rustType === "i32" || rustType === "i64" || rustType === "f32" || rustType === "f64") {
          lines.push(`            ${fieldName}: 0 as ${rustType},`);
        } else if (rustType === "bool") {
          lines.push(`            ${fieldName}: false,`);
        } else if (rustType.startsWith("Vec<")) {
          lines.push(`            ${fieldName}: Vec::new(),`);
        } else {
          lines.push(`            ${fieldName}: Default::default(),`);
        }
      }
      lines.push(`        }`);
      lines.push(`    }`);

      // Methods
      for (const m of cls.methods || []) {
        const methodName = toSnakeCase(m.name);
        const params = ((m as any).parameters || m.params || [])
          .map((p: any) => `${toSnakeCase(p.name)}: ${mapRustType(p.type)}`)
          .join(", ");
        const paramStr = params ? `&self, ${params}` : "&self";
        const retType = m.returnType ? mapRustType(m.returnType) : "()";

        lines.push("");
        lines.push(`    pub fn ${methodName}(${paramStr}) -> ${retType} {`);
        if (retType === "bool") {
          lines.push("        true");
        } else if (retType === "i32" || retType === "i64" || retType === "f64") {
          lines.push("        0");
        } else if (retType === "String") {
          lines.push('        String::new()');
        } else if (retType === "()") {
          lines.push("        // Method logic");
        } else {
          lines.push("        todo!()");
        }
        lines.push("    }");
      }

      lines.push("}");
      lines.push("");
    }
  } else if (diagram.type === "erd") {
    const entities = (diagram.nodes as ERDEntity[]).filter(n => "name" in n);

    if (entities.length === 0) {
      lines.push("// No entities found in ERD diagram");
      return lines.join("\n");
    }

    for (const ent of entities) {
      const structName = toPascalCase(ent.name);
      lines.push("#[derive(Debug, Clone, Serialize, Deserialize)]");
      lines.push(`pub struct ${structName} {`);
      for (const attr of ent.attributes || []) {
        const fieldName = toSnakeCase(attr.name);
        const isNullable = Boolean(attr.isNullable || (attr as any).nullable);
        let rustType = mapRustType(attr.type || "string");
        if (isNullable && !rustType.startsWith("Option<")) {
          rustType = `Option<${rustType}>`;
        }

        if (attr.isPrimaryKey || (attr as any).pk) {
          lines.push("    /// Primary Key");
        }
        if (isNullable) {
          lines.push('    #[serde(skip_serializing_if = "Option::is_none")]');
        }
        lines.push(`    pub ${fieldName}: ${rustType},`);
      }
      lines.push("}");
      lines.push("");
    }
  } else {
    lines.push(`// Rust export is only supported for Class and ERD diagrams.`);
  }

  return lines.join("\n");
}
