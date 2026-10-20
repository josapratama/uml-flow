import type { Diagram, ClassNode, ERDEntity, ERDAttribute } from "@uml-editor/shared";

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

    for (const attr of cn.attributes || []) {
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

    if ((cn.attributes?.length || 0) > 0 && (cn.methods?.length || 0) > 0)
      lines.push("");

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
              typeof p === "string" ? p : `${mapJavaType(p.type)} ${p.name}`,
            )
            .join(", ")
        : "";
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

/**
 * Generate SQL DDL (CREATE TABLE, PRIMARY KEY, FOREIGN KEY) from an ERD diagram.
 */
export function generateSQL(diagram: Diagram): string {
  if (diagram.type !== "erd") {
    return "-- Only ERD diagrams can generate SQL DDL";
  }

  const entities = (diagram.nodes || []).filter(
    (n): n is ERDEntity => n.type === "entity" || "attributes" in n,
  );

  if (entities.length === 0) {
    return "-- No entities found in ERD diagram";
  }

  const lines: string[] = [
    "-- ===================================================",
    `-- Auto-generated SQL DDL Schema`,
    `-- Diagram: ${diagram.name || "ERD Diagram"}`,
    `-- Generated: ${new Date().toISOString()}`,
    "-- ===================================================",
    "",
  ];

  const entityMap = new Map<string, ERDEntity>();
  for (const ent of entities) {
    entityMap.set(ent.id, ent);
  }

  const junctionTables: Array<{
    name: string;
    source: ERDEntity;
    target: ERDEntity;
  }> = [];

  for (const ent of entities) {
    const tableName = sanitizeSqlIdentifier(ent.name);
    lines.push(`CREATE TABLE ${tableName} (`);

    const colDefs: string[] = [];
    const pks: string[] = [];
    const uniques: string[] = [];
    const fks: string[] = [];

    const attrs = ent.attributes || [];
    for (const attr of attrs) {
      const colName = sanitizeSqlIdentifier(attr.name);
      const colType = mapSqlType(attr.type);
      const isPk = !!attr.isPrimaryKey;
      const isUnique = !!attr.isUnique;
      const isNullable = isPk ? false : !!attr.isNullable;

      let def = `  ${colName} ${colType}`;
      if (!isNullable) def += " NOT NULL";
      colDefs.push(def);

      if (isPk) pks.push(colName);
      else if (isUnique) uniques.push(colName);
    }

    if (pks.length > 0) {
      colDefs.push(`  PRIMARY KEY (${pks.join(", ")})`);
    }

    for (const u of uniques) {
      colDefs.push(`  CONSTRAINT uq_${tableName}_${u} UNIQUE (${u})`);
    }

    // Foreign Keys from edges
    const incomingEdges = (diagram.edges || []).filter(
      (e) => e.target === ent.id && (e.type === "one-to-many" || e.type === "one-to-one"),
    );

    for (const edge of incomingEdges) {
      const parent = entityMap.get(edge.source);
      if (!parent) continue;

      const parentTable = sanitizeSqlIdentifier(parent.name);
      const parentPk = (parent.attributes || []).find((a) => a.isPrimaryKey)?.name || "id";

      const expectedColNames = [
        `${parent.name.toLowerCase()}_id`,
        `${parent.name.toLowerCase()}id`,
        `${parent.name.toLowerCase()}_${parentPk.toLowerCase()}`,
      ];

      const matchingAttr = attrs.find(
        (a) =>
          a.isForeignKey ||
          expectedColNames.includes(a.name.toLowerCase()) ||
          a.name.toLowerCase().startsWith(parent.name.toLowerCase()),
      );

      const fkCol = matchingAttr ? sanitizeSqlIdentifier(matchingAttr.name) : `${parentTable}_id`;
      fks.push(
        `  CONSTRAINT fk_${tableName}_${parentTable} FOREIGN KEY (${fkCol}) REFERENCES ${parentTable}(${sanitizeSqlIdentifier(parentPk)}) ON DELETE CASCADE`,
      );
    }

    // Foreign Keys explicitly flagged with isForeignKey
    for (const attr of attrs) {
      if (attr.isForeignKey) {
        const colName = sanitizeSqlIdentifier(attr.name);
        const alreadyCovered = fks.some((f) => f.includes(`FOREIGN KEY (${colName})`));
        if (!alreadyCovered) {
          const prefix = attr.name.replace(/_id$/i, "").replace(/id$/i, "").toLowerCase();
          const targetEnt = entities.find(
            (e) => e.name.toLowerCase() === prefix || e.name.toLowerCase() === `${prefix}s`,
          );
          if (targetEnt && targetEnt.id !== ent.id) {
            const targetTable = sanitizeSqlIdentifier(targetEnt.name);
            const targetPk =
              (targetEnt.attributes || []).find((a) => a.isPrimaryKey)?.name || "id";
            fks.push(
              `  CONSTRAINT fk_${tableName}_${colName} FOREIGN KEY (${colName}) REFERENCES ${targetTable}(${sanitizeSqlIdentifier(targetPk)}) ON DELETE CASCADE`,
            );
          }
        }
      }
    }

    colDefs.push(...fks);
    lines.push(colDefs.join(",\n"));
    lines.push(");", "");
  }

  // Handle many-to-many edges
  const m2mEdges = (diagram.edges || []).filter((e) => e.type === "many-to-many");
  for (const edge of m2mEdges) {
    const src = entityMap.get(edge.source);
    const tgt = entityMap.get(edge.target);
    if (!src || !tgt) continue;

    const juncName = `${sanitizeSqlIdentifier(src.name)}_${sanitizeSqlIdentifier(tgt.name)}`;
    if (junctionTables.some((j) => j.name === juncName)) continue;
    junctionTables.push({ name: juncName, source: src, target: tgt });

    const srcPk = (src.attributes || []).find((a) => a.isPrimaryKey)?.name || "id";
    const tgtPk = (tgt.attributes || []).find((a) => a.isPrimaryKey)?.name || "id";
    const srcCol = `${sanitizeSqlIdentifier(src.name).toLowerCase()}_${sanitizeSqlIdentifier(srcPk)}`;
    const tgtCol = `${sanitizeSqlIdentifier(tgt.name).toLowerCase()}_${sanitizeSqlIdentifier(tgtPk)}`;

    lines.push(`-- Junction table for many-to-many relationship`);
    lines.push(`CREATE TABLE ${juncName} (`);
    lines.push(`  ${srcCol} INT NOT NULL,`);
    lines.push(`  ${tgtCol} INT NOT NULL,`);
    lines.push(`  PRIMARY KEY (${srcCol}, ${tgtCol}),`);
    lines.push(
      `  CONSTRAINT fk_${juncName}_${sanitizeSqlIdentifier(src.name)} FOREIGN KEY (${srcCol}) REFERENCES ${sanitizeSqlIdentifier(src.name)}(${sanitizeSqlIdentifier(srcPk)}) ON DELETE CASCADE,`,
    );
    lines.push(
      `  CONSTRAINT fk_${juncName}_${sanitizeSqlIdentifier(tgt.name)} FOREIGN KEY (${tgtCol}) REFERENCES ${sanitizeSqlIdentifier(tgt.name)}(${sanitizeSqlIdentifier(tgtPk)}) ON DELETE CASCADE`,
    );
    lines.push(");", "");
  }

  return lines.join("\n");
}

function sanitizeSqlIdentifier(name: string): string {
  return (name || "unnamed").replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase();
}

function mapSqlType(type: string): string {
  if (!type || type.trim() === "") return "VARCHAR(255)";
  const t = type.trim();

  if (/\w+\s*\([^)]+\)/.test(t)) {
    return t.toUpperCase();
  }

  const lower = t.toLowerCase();
  switch (lower) {
    case "string":
    case "varchar":
      return "VARCHAR(255)";
    case "text":
    case "longtext":
    case "mediumtext":
      return "TEXT";
    case "int":
    case "integer":
    case "number":
      return "INT";
    case "bigint":
    case "long":
      return "BIGINT";
    case "smallint":
    case "short":
      return "SMALLINT";
    case "serial":
    case "auto_increment":
      return "SERIAL";
    case "bool":
    case "boolean":
      return "BOOLEAN";
    case "date":
      return "DATE";
    case "time":
      return "TIME";
    case "datetime":
    case "timestamp":
      return "TIMESTAMP";
    case "float":
      return "FLOAT";
    case "double":
    case "real":
      return "DOUBLE PRECISION";
    case "decimal":
    case "numeric":
    case "money":
      return "DECIMAL(10, 2)";
    case "uuid":
      return "UUID";
    case "json":
    case "jsonb":
      return "JSON";
    case "blob":
    case "binary":
    case "bytea":
      return "BYTEA";
    default:
      return t.toUpperCase();
  }
}

/**
 * Generate XState v5 Machine & TypeScript types from a State Machine diagram.
 */
export function generateXState(diagram: Diagram): string {
  if (diagram.type !== "state") {
    return "// Only state diagrams can generate XState code";
  }

  const nodes = (diagram.nodes || []).filter(
    (n) =>
      n.type === "state" ||
      n.type === "initial" ||
      n.type === "final" ||
      n.type === "composite",
  );

  const stateNodes = nodes.filter(
    (n) => n.type === "state" || n.type === "composite",
  );
  const initialNode = nodes.find(
    (n) => n.type === "initial" || n.name === "initial" || n.name === "*",
  );

  let initialTarget = stateNodes[0] ? sanitizeIdentifier(stateNodes[0].name) : "idle";
  if (initialNode) {
    const initEdge = (diagram.edges || []).find((e) => e.source === initialNode.id);
    if (initEdge) {
      const targetNode = nodes.find((n) => n.id === initEdge.target);
      if (targetNode) initialTarget = sanitizeIdentifier(targetNode.name);
    }
  }

  const machineId = sanitizeIdentifier(diagram.name || "stateMachine");
  const events = new Set<string>();

  const lines: string[] = [
    `// Auto-generated XState v5 State Machine & TypeScript types`,
    `// Diagram: ${diagram.name || "State Diagram"}`,
    `// Generated: ${new Date().toISOString()}`,
    "",
    `import { setup, createMachine } from "xstate";`,
    "",
    `export const ${machineId}Machine = createMachine({`,
    `  id: "${machineId}",`,
    `  initial: "${initialTarget}",`,
    `  states: {`,
  ];

  for (const sn of stateNodes) {
    const sName = sanitizeIdentifier(sn.name);
    const outgoing = (diagram.edges || []).filter((e) => e.source === sn.id);

    lines.push(`    ${sName}: {`);

    const transitions: Array<{ event: string; target: string }> = [];
    let isFinal = false;

    for (const edge of outgoing) {
      const targetNode = nodes.find((n) => n.id === edge.target);
      if (!targetNode) continue;

      if (
        targetNode.type === "final" ||
        targetNode.name === "final" ||
        targetNode.name === "*"
      ) {
        isFinal = true;
        continue;
      }

      const rawEvent = edge.label?.text || edge.condition || "NEXT";
      const eventName = sanitizeIdentifier(rawEvent).toUpperCase();
      events.add(eventName);
      transitions.push({
        event: eventName,
        target: sanitizeIdentifier(targetNode.name),
      });
    }

    if (isFinal && transitions.length === 0) {
      lines.push(`      type: "final",`);
    }

    if (transitions.length > 0) {
      lines.push(`      on: {`);
      for (const t of transitions) {
        lines.push(`        ${t.event}: { target: "${t.target}" },`);
      }
      lines.push(`      },`);
    }

    lines.push(`    },`);
  }

  lines.push(`  },`);
  lines.push(`});`, "");

  // TypeScript State Union
  const stateNames = stateNodes.map((s) => `"${sanitizeIdentifier(s.name)}"`);
  lines.push(
    `export type ${capitalize(machineId)}State = ${
      stateNames.join(" | ") || "string"
    };`,
  );

  // TypeScript Event Union
  const eventTypes = Array.from(events).map((e) => `{ type: "${e}" }`);
  lines.push(
    `export type ${capitalize(machineId)}Event = ${
      eventTypes.join(" | ") || `{ type: "NEXT" }`
    };`,
  );

  return lines.join("\n");
}

function sanitizeIdentifier(name: string): string {
  const clean = (name || "state").replace(/[^a-zA-Z0-9_]/g, "_");
  return clean.replace(/^_+|_+$/g, "") || "state";
}

function capitalize(s: string): string {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}


