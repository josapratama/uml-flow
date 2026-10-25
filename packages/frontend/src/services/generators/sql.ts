import type { Diagram, ERDEntity } from "@uml-editor/shared";

export type SqlDialect = "postgres" | "mysql" | "sqlite";

function sanitizeSqlIdentifier(name: string): string {
  return (name || "unnamed").replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase();
}

function mapSqlType(type: string, dialect: SqlDialect): string {
  if (!type || type.trim() === "") {
    return dialect === "sqlite" ? "TEXT" : "VARCHAR(255)";
  }
  const t = type.trim();

  if (/\w+\s*\([^)]+\)/.test(t)) {
    return t.toUpperCase();
  }

  const lower = t.toLowerCase();
  switch (lower) {
    case "string":
    case "varchar":
      return dialect === "sqlite" ? "TEXT" : "VARCHAR(255)";
    case "text":
    case "longtext":
    case "mediumtext":
      return "TEXT";
    case "int":
    case "integer":
    case "number":
      return dialect === "postgres" ? "INTEGER" : dialect === "sqlite" ? "INTEGER" : "INT";
    case "bigint":
    case "long":
      return dialect === "sqlite" ? "INTEGER" : "BIGINT";
    case "smallint":
    case "short":
      return dialect === "sqlite" ? "INTEGER" : "SMALLINT";
    case "serial":
    case "auto_increment":
      if (dialect === "postgres") return "SERIAL";
      if (dialect === "sqlite") return "INTEGER";
      return "INT AUTO_INCREMENT";
    case "bool":
    case "boolean":
      if (dialect === "sqlite") return "INTEGER";
      if (dialect === "mysql") return "TINYINT(1)";
      return "BOOLEAN";
    case "date":
      return dialect === "sqlite" ? "TEXT" : "DATE";
    case "time":
      return dialect === "sqlite" ? "TEXT" : "TIME";
    case "datetime":
    case "timestamp":
      if (dialect === "postgres") return "TIMESTAMP WITH TIME ZONE";
      if (dialect === "sqlite") return "TEXT";
      return "DATETIME";
    case "float":
      return dialect === "sqlite" ? "REAL" : "FLOAT";
    case "double":
    case "real":
      return dialect === "sqlite" ? "REAL" : dialect === "postgres" ? "DOUBLE PRECISION" : "DOUBLE";
    case "decimal":
    case "numeric":
    case "money":
      return dialect === "sqlite" ? "NUMERIC" : "DECIMAL(12, 2)";
    case "uuid":
      if (dialect === "postgres") return "UUID";
      if (dialect === "mysql") return "VARCHAR(36)";
      return "TEXT";
    case "json":
    case "jsonb":
      if (dialect === "postgres") return "JSONB";
      if (dialect === "sqlite") return "TEXT";
      return "JSON";
    default:
      return dialect === "sqlite" ? "TEXT" : "VARCHAR(255)";
  }
}

/**
 * Universal SQL DDL Schema Generator
 * Supports PostgreSQL, MySQL, and SQLite dialects.
 */
export function generateSQL(
  diagram: Diagram | null | undefined,
  dialect: SqlDialect = "postgres"
): string {
  if (!diagram) return "-- No diagram provided";
  if (diagram.type !== "erd") {
    return `-- Only ERD diagrams are supported for SQL DDL export (current: ${diagram.type})`;
  }

  const entities = (diagram.nodes || []).filter(
    (n): n is ERDEntity => n.type === "erd-entity" || (n as any).type === "entity",
  );

  if (entities.length === 0) {
    return "-- No entities found in ERD diagram";
  }

  const dialectNames: Record<SqlDialect, string> = {
    postgres: "PostgreSQL",
    mysql: "MySQL",
    sqlite: "SQLite",
  };

  const lines: string[] = [
    "-- ===================================================",
    `-- Auto-generated SQL DDL Schema (${dialectNames[dialect]})`,
    `-- Diagram: ${diagram.name || "ERD Diagram"}`,
    `-- Generated: ${new Date().toISOString()}`,
    "-- ===================================================",
    "",
  ];

  if (dialect === "sqlite") {
    lines.push("PRAGMA foreign_keys = ON;\n");
  }

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
      let colType = mapSqlType(attr.type, dialect);
      const isPk = !!attr.isPrimaryKey;
      const isUnique = !!attr.isUnique;
      const isNullable = isPk ? false : !!attr.isNullable;

      // SQLite special primary key auto increment
      if (dialect === "sqlite" && isPk && (attr.type.toLowerCase().includes("int") || attr.type.toLowerCase().includes("serial"))) {
        colDefs.push(`  ${colName} INTEGER PRIMARY KEY AUTOINCREMENT`);
        continue;
      }

      let def = `  ${colName} ${colType}`;
      if (!isNullable && !isPk) def += " NOT NULL";
      colDefs.push(def);

      if (isPk) pks.push(colName);
      else if (isUnique) uniques.push(colName);
    }

    if (pks.length > 0 && !(dialect === "sqlite" && pks.length === 1 && colDefs.some((c) => c.includes("PRIMARY KEY AUTOINCREMENT")))) {
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
    if (dialect === "mysql") {
      lines.push(") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;", "");
    } else {
      lines.push(");", "");
    }
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
    if (dialect === "mysql") {
      lines.push(") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;", "");
    } else {
      lines.push(");", "");
    }
  }

  return lines.join("\n");
}
