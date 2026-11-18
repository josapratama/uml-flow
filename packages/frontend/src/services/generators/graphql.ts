import type { Diagram, ClassNode, ERDEntity } from "@uml-editor/shared";

function mapGraphQLType(t: string): string {
  if (!t) return "String";
  const lower = t.toLowerCase().trim();
  if (lower === "id" || lower === "uuid" || lower === "guid") return "ID";
  if (lower === "string" || lower === "varchar" || lower === "text") return "String";
  if (lower === "int" || lower === "integer" || lower === "serial") return "Int";
  if (lower === "float" || lower === "double" || lower === "decimal") return "Float";
  if (lower === "bool" || lower === "boolean") return "Boolean";
  if (lower === "datetime" || lower === "date" || lower === "timestamp") return "String"; // Standard ISO string
  if (lower.endsWith("[]") || lower.startsWith("list<")) {
    const inner = lower.replace(/\[\]$/, "").replace(/^list<|>$/g, "");
    return `[${mapGraphQLType(inner)}!]!`;
  }
  // Custom type or object reference
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function sanitizeIdentifier(name: string): string {
  return (name || "Item").replace(/[^a-zA-Z0-9_]/g, "_");
}

function toPascalCase(name: string): string {
  return (name || "Item")
    .replace(/[^a-zA-Z0-9_]/g, " ")
    .split(/[\s_]+/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

function toCamelCase(name: string): string {
  const pascal = toPascalCase(name);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Generate modern GraphQL Schema Definition Language (SDL) from Class Diagram or ERD
 */
export function generateGraphQL(diagram: Diagram): string {
  const lines: string[] = [
    `# ------------------------------------------------------------------------------`,
    `# GraphQL Schema Definition (SDL)`,
    `# Diagram: ${diagram.name || "Untitled"} (${diagram.type})`,
    `# Generated At: ${new Date().toISOString()}`,
    `# ------------------------------------------------------------------------------`,
    "",
  ];

  if (diagram.type === "class") {
    const nodes = (diagram.nodes as ClassNode[]).filter(n => "name" in n);

    if (nodes.length === 0) {
      lines.push("# No classes found in diagram");
      return lines.join("\n");
    }

    // Generate Enums first
    const enums = nodes.filter(n => n.type === "enum");
    for (const en of enums) {
      const enumName = sanitizeIdentifier(en.name);
      lines.push(`enum ${enumName} {`);
      const attrs = en.attributes || [];
      if (attrs.length === 0) {
        lines.push("  DEFAULT");
      } else {
        for (const a of attrs) {
          lines.push(`  ${sanitizeIdentifier(a.name).toUpperCase()}`);
        }
      }
      lines.push("}");
      lines.push("");
    }

    // Generate Interfaces
    const interfaces = nodes.filter(n => n.type === "interface");
    for (const iface of interfaces) {
      const ifaceName = sanitizeIdentifier(iface.name);
      lines.push(`interface ${ifaceName} {`);
      for (const attr of iface.attributes || []) {
        const isOptional = attr.name.endsWith("?") || (attr.type && attr.type.toLowerCase().includes("optional"));
        const cleanName = toCamelCase(attr.name.replace(/\?$/, ""));
        const gqlType = mapGraphQLType(attr.type || "string");
        const suffix = isOptional ? "" : "!";
        lines.push(`  ${cleanName}: ${gqlType}${suffix}`);
      }
      lines.push("}");
      lines.push("");
    }

    // Generate Object Types & Input Types
    const classes = nodes.filter(n => n.type !== "enum" && n.type !== "interface");
    for (const cls of classes) {
      const typeName = sanitizeIdentifier(cls.name);

      // Check inheritance/interfaces
      const edges = diagram.edges.filter(
        e => e.source === cls.id && (e.type === "inheritance" || e.type === "realization")
      );
      const implementedInterfaces = edges
        .map(e => {
          const target = interfaces.find(i => i.id === e.target);
          return target ? sanitizeIdentifier(target.name) : "";
        })
        .filter(Boolean);

      const implementsClause = implementedInterfaces.length > 0 ? ` implements ${implementedInterfaces.join(" & ")}` : "";

      lines.push(`type ${typeName}${implementsClause} {`);
      const attrs = cls.attributes || [];
      if (attrs.length === 0) {
        lines.push("  id: ID!");
      } else {
        for (const attr of attrs) {
          const isOptional = attr.name.endsWith("?") || (attr.type && attr.type.toLowerCase().includes("optional"));
          const cleanName = toCamelCase(attr.name.replace(/\?$/, ""));
          const gqlType = mapGraphQLType(attr.type || "string");
          const suffix = isOptional ? "" : "!";
          lines.push(`  ${cleanName}: ${gqlType}${suffix}`);
        }
      }
      lines.push("}");
      lines.push("");

      // Corresponding Create Input Type
      lines.push(`input Create${typeName}Input {`);
      for (const attr of attrs) {
        const cleanName = toCamelCase(attr.name.replace(/\?$/, ""));
        if (cleanName === "id") continue; // Exclude ID on create
        const isOptional = attr.name.endsWith("?") || (attr.type && attr.type.toLowerCase().includes("optional"));
        const gqlType = mapGraphQLType(attr.type || "string");
        const suffix = isOptional ? "" : "!";
        lines.push(`  ${cleanName}: ${gqlType}${suffix}`);
      }
      lines.push("}");
      lines.push("");
    }

    // Query & Mutation Root Types
    lines.push(`type Query {`);
    for (const cls of classes) {
      const typeName = sanitizeIdentifier(cls.name);
      const camel = toCamelCase(typeName);
      lines.push(`  get${typeName}(id: ID!): ${typeName}`);
      lines.push(`  list${typeName}s(limit: Int = 20, offset: Int = 0): [${typeName}!]!`);
    }
    lines.push("}");
    lines.push("");

    lines.push(`type Mutation {`);
    for (const cls of classes) {
      const typeName = sanitizeIdentifier(cls.name);
      lines.push(`  create${typeName}(input: Create${typeName}Input!): ${typeName}!`);
      lines.push(`  delete${typeName}(id: ID!): Boolean!`);
    }
    lines.push("}");
  } else if (diagram.type === "erd") {
    const entities = (diagram.nodes as ERDEntity[]).filter(n => "name" in n);

    if (entities.length === 0) {
      lines.push("# No entities found in ERD diagram");
      return lines.join("\n");
    }

    for (const entity of entities) {
      const typeName = toPascalCase(entity.name);
      lines.push(`type ${typeName} {`);
      for (const attr of entity.attributes || []) {
        const cleanName = toCamelCase(attr.name);
        const isPk = attr.isPrimaryKey || (attr as any).pk;
        const gqlType = isPk ? "ID" : mapGraphQLType(attr.type || "string");
        const isNullable = Boolean(attr.isNullable || (attr as any).nullable);
        const suffix = isNullable ? "" : "!";
        lines.push(`  ${cleanName}: ${gqlType}${suffix}`);
      }
      lines.push("}");
      lines.push("");

      lines.push(`input Create${typeName}Input {`);
      for (const attr of entity.attributes || []) {
        if (attr.isPrimaryKey || (attr as any).pk) continue; // Exclude auto-PK on create input
        const cleanName = toCamelCase(attr.name);
        const gqlType = mapGraphQLType(attr.type || "string");
        const isNullable = Boolean(attr.isNullable || (attr as any).nullable);
        const suffix = isNullable ? "" : "!";
        lines.push(`  ${cleanName}: ${gqlType}${suffix}`);
      }
      lines.push("}");
      lines.push("");
    }

    lines.push(`type Query {`);
    for (const entity of entities) {
      const typeName = toPascalCase(entity.name);
      lines.push(`  get${typeName}(id: ID!): ${typeName}`);
      lines.push(`  all${typeName}s: [${typeName}!]!`);
    }
    lines.push("}");
  } else {
    lines.push(`# GraphQL export is only supported for Class and ERD diagrams.`);
  }

  return lines.join("\n");
}
