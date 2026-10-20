import type { Diagram, ERDEntity } from "@uml-editor/shared";

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
