/**
 * Prisma Schema Reverse Importer.
 * Parses schema.prisma definitions into UML Flow ERD DSL syntax.
 */

export function isPrismaCode(code: string): boolean {
  if (!code || typeof code !== "string") return false;
  const trimmed = code.trim();
  return (
    (trimmed.includes("model ") || trimmed.includes("datasource ") || trimmed.includes("generator ")) &&
    trimmed.includes("{") &&
    trimmed.includes("}")
  );
}

interface ParsedField {
  name: string;
  type: string;
  isPk: boolean;
  isUnique: boolean;
  isNullable: boolean;
  isRelation: boolean;
  relationTarget?: string;
}

interface ParsedModel {
  name: string;
  fields: ParsedField[];
}

interface ParsedEnum {
  name: string;
  values: string[];
}

export function parsePrismaToDSL(code: string): string {
  const models: ParsedModel[] = [];
  const enums: ParsedEnum[] = [];
  const relations: Array<{ from: string; to: string; type: string }> = [];

  // Remove single line comments
  const cleanCode = code.replace(/\/\/.*$/gm, "");

  // Match enums: enum Role { ADMIN USER }
  const enumRegex = /enum\s+(\w+)\s*\{([^}]+)\}/g;
  let enumMatch: RegExpExecArray | null;
  while ((enumMatch = enumRegex.exec(cleanCode)) !== null) {
    const enumName = enumMatch[1];
    const body = enumMatch[2];
    const values = body
      .split(/\s+/)
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
    enums.push({ name: enumName, values });
  }

  // Match models: model User { ... }
  const modelRegex = /model\s+(\w+)\s*\{([^}]+)\}/g;
  let modelMatch: RegExpExecArray | null;
  while ((modelMatch = modelRegex.exec(cleanCode)) !== null) {
    const modelName = modelMatch[1];
    const body = modelMatch[2];
    const fields: ParsedField[] = [];

    const lines = body.split("\n");
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith("@@")) continue;

      const parts = line.split(/\s+/);
      if (parts.length < 2) continue;

      const fieldName = parts[0];
      const fieldType = parts[1];

      const isPk = line.includes("@id");
      const isUnique = line.includes("@unique");
      const isNullable = fieldType.endsWith("?");
      const cleanType = fieldType.replace("?", "").replace("[]", "");

      // Check if this is a relation to another model
      const isArrayRelation = fieldType.endsWith("[]");
      const isSingleRelation = line.includes("@relation");

      if (isArrayRelation) {
        relations.push({ from: modelName, to: cleanType, type: "1-to-many" });
      } else if (isSingleRelation) {
        // Many-to-one parent relation
      } else {
        fields.push({
          name: fieldName,
          type: cleanType.toLowerCase(),
          isPk,
          isUnique,
          isNullable,
          isRelation: false,
        });
      }
    }

    models.push({ name: modelName, fields });
  }

  // Generate UML Flow ERD DSL
  let dsl = `@diagram erd\n\n`;

  // Render enums as notes or types
  for (const en of enums) {
    dsl += `note "Enum ${en.name}: ${en.values.join(", ")}" as enum_${en.name.toLowerCase()}\n`;
  }
  if (enums.length > 0) dsl += `\n`;

  // Render entity tables
  for (const m of models) {
    dsl += `entity ${m.name} {\n`;
    for (const f of m.fields) {
      let flags = "";
      if (f.isPk) flags += " [PK]";
      if (f.isUnique) flags += " [UNIQUE]";
      if (f.isNullable) flags += " [NULLABLE]";
      dsl += `  ${f.name}: ${f.type}${flags}\n`;
    }
    dsl += `}\n\n`;
  }

  // Render relations
  const renderedRel = new Set<string>();
  for (const r of relations) {
    const key = `${r.from}_${r.to}`;
    if (!renderedRel.has(key)) {
      renderedRel.add(key);
      dsl += `${r.from} ||--o{ ${r.to} : "has"\n`;
    }
  }

  return dsl.trim();
}
