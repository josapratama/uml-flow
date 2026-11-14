/**
 * JSON Payload to Visual Diagram Reverse Importer.
 * Converts API response objects, payload arrays, and nested JSON into UML Flow ERD or Class DSL.
 */

export function isJSONPayload(code: string): boolean {
  if (!code || typeof code !== "string") return false;
  const trimmed = code.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return false;
  try {
    const parsed = JSON.parse(trimmed);
    return typeof parsed === "object" && parsed !== null;
  } catch {
    return false;
  }
}

interface InferredField {
  name: string;
  type: string;
  isPk: boolean;
}

interface InferredEntity {
  name: string;
  fields: InferredField[];
}

function inferType(val: any): string {
  if (val === null || val === undefined) return "string";
  if (typeof val === "boolean") return "bool";
  if (typeof val === "number") {
    return Number.isInteger(val) ? "int" : "float";
  }
  if (typeof val === "string") {
    // Check if ISO date
    if (/^\d{4}-\d{2}-\d{2}(T|\b)/.test(val)) return "datetime";
    return "string";
  }
  if (Array.isArray(val)) {
    if (val.length > 0 && typeof val[0] === "object") return "object[]";
    return "string[]";
  }
  if (typeof val === "object") return "object";
  return "string";
}

function toPascal(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter) => letter.toUpperCase())
    .replace(/[\s_-]+/g, "");
}

/**
 * Parses JSON object or array into UML Flow ERD / Class DSL
 */
export function parseJSONToDSL(code: string, diagramType: "erd" | "class" = "erd"): string {
  let parsed: any;
  try {
    parsed = JSON.parse(code.trim());
  } catch {
    return "";
  }

  const entities: InferredEntity[] = [];
  const relations: Array<{ from: string; to: string; label: string }> = [];

  function processObject(obj: Record<string, any>, entityName: string) {
    if (!obj || typeof obj !== "object") return;

    const fields: InferredField[] = [];

    for (const key of Object.keys(obj)) {
      const val = obj[key];
      const typeStr = inferType(val);

      if (typeStr === "object" && val !== null) {
        const childName = toPascal(key);
        processObject(val, childName);
        relations.push({ from: entityName, to: childName, label: "has" });
      } else if (typeStr === "object[]" && Array.isArray(val) && val.length > 0) {
        const childName = toPascal(key.replace(/s$/i, "Item"));
        processObject(val[0], childName);
        relations.push({ from: entityName, to: childName, label: "contains" });
      } else {
        const isPk = /^(id|_id|uuid)$/i.test(key);
        fields.push({
          name: key,
          type: typeStr,
          isPk,
        });
      }
    }

    entities.push({ name: entityName, fields });
  }

  if (Array.isArray(parsed)) {
    if (parsed.length > 0 && typeof parsed[0] === "object") {
      processObject(parsed[0], "Record");
    } else {
      processObject({ items: parsed }, "Payload");
    }
  } else {
    processObject(parsed, "Data");
  }

  // Generate DSL
  let dsl = `@diagram ${diagramType}\n\n`;

  for (const ent of entities) {
    if (diagramType === "erd") {
      dsl += `entity ${ent.name} {\n`;
      for (const f of ent.fields) {
        const pkFlag = f.isPk ? " [PK]" : "";
        dsl += `  ${f.name}: ${f.type}${pkFlag}\n`;
      }
      dsl += `}\n\n`;
    } else {
      dsl += `class ${ent.name} {\n`;
      for (const f of ent.fields) {
        dsl += `  +${f.name}: ${f.type}\n`;
      }
      dsl += `}\n\n`;
    }
  }

  // Relations
  for (const r of relations) {
    if (diagramType === "erd") {
      dsl += `${r.from} ||--o{ ${r.to} : "${r.label}"\n`;
    } else {
      dsl += `${r.from} --> ${r.to} : "${r.label}"\n`;
    }
  }

  return dsl.trim();
}
