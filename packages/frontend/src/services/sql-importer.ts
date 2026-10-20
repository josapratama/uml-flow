/**
 * SQL DDL to UML Flow ERD Converter
 * Parses standard SQL CREATE TABLE statements and generates UML Flow ERD DSL code.
 */

interface ColumnDef {
  name: string;
  type: string;
  isPk: boolean;
  isFk: boolean;
  isNullable: boolean;
  isUnique: boolean;
}

interface TableDef {
  name: string;
  columns: ColumnDef[];
}

interface RelationDef {
  sourceTable: string;
  targetTable: string;
  foreignKey: string;
}

export function isSQLDDL(text: string): boolean {
  if (!text) return false;
  return /CREATE\s+TABLE/i.test(text);
}

export function parseSQLToERD(
  sqlText: string,
  diagramName = "Database Schema",
): string {
  // Strip block comments /* ... */ and line comments -- ...
  const cleaned = sqlText
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/--.*$/gm, "")
    .replace(/#.*$/gm, "");

  const tables: TableDef[] = [];
  const relations: RelationDef[] = [];

  // Match CREATE TABLE [IF NOT EXISTS] `?tableName`? ( body )
  const tableRegex =
    /CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+[`"']?([A-Za-z0-9_]+)[`"']?\s*\(([\s\S]*?)\)(?:\s*ENGINE[^\n;]*)?(?:\s*DEFAULT\s+CHARSET[^\n;]*)?;/gi;

  let match: RegExpExecArray | null;
  while ((match = tableRegex.exec(cleaned)) !== null) {
    const tableName = match[1];
    const body = match[2];

    const columns: ColumnDef[] = [];
    const pkColumns = new Set<string>();

    // Split body by commas that are NOT inside parentheses
    const lines = splitSQLStatements(body);

    for (let rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      // Table-level PRIMARY KEY (col1, col2)
      const pkMatch = line.match(/^PRIMARY\s+KEY\s*\(([^)]+)\)/i);
      if (pkMatch) {
        pkMatch[1]
          .split(",")
          .map((c) => c.trim().replace(/[`"']/g, ""))
          .forEach((c) => pkColumns.add(c));
        continue;
      }

      // Table-level FOREIGN KEY (col) REFERENCES other_table(other_col)
      const fkMatch = line.match(
        /(?:CONSTRAINT\s+[`"']?[A-Za-z0-9_]+[`"']?\s+)?FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+[`"']?([A-Za-z0-9_]+)[`"']?\s*\(([^)]+)\)/i,
      );
      if (fkMatch) {
        const fkCol = fkMatch[1].trim().replace(/[`"']/g, "");
        const targetTable = fkMatch[2].trim().replace(/[`"']/g, "");
        relations.push({
          sourceTable: targetTable,
          targetTable: tableName,
          foreignKey: fkCol,
        });
        continue;
      }

      // Skip generic constraints or indexes: KEY, INDEX, UNIQUE KEY, CHECK
      if (/^(?:KEY|INDEX|UNIQUE\s+KEY|CHECK|CONSTRAINT)\b/i.test(line)) {
        // Check if it's UNIQUE (col)
        const uqMatch = line.match(/^UNIQUE\s*(?:KEY)?\s*(?:[`"']?[A-Za-z0-9_]+[`"']?\s*)?\(([^)]+)\)/i);
        if (uqMatch) {
          const uqCol = uqMatch[1].trim().replace(/[`"']/g, "");
          const existing = columns.find((c) => c.name === uqCol);
          if (existing) existing.isUnique = true;
        }
        continue;
      }

      // Regular column definition: col_name data_type(size) [constraints]
      const colParts = line.match(/^[`"']?([A-Za-z0-9_]+)[`"']?\s+([A-Za-z0-9_]+(?:\s*\([^)]+\))?)(.*)$/i);
      if (colParts) {
        const colName = colParts[1];
        const colType = colParts[2].toLowerCase().replace(/\s+/g, "");
        const modifiers = colParts[3] || "";

        const isInlinePk = /PRIMARY\s+KEY/i.test(modifiers);
        const isUnique = /UNIQUE/i.test(modifiers);
        const isNotNull = /NOT\s+NULL/i.test(modifiers);

        // Check if inline references other_table(col)
        const inlineFkMatch = modifiers.match(/REFERENCES\s+[`"']?([A-Za-z0-9_]+)[`"']?/i);
        if (inlineFkMatch) {
          relations.push({
            sourceTable: inlineFkMatch[1],
            targetTable: tableName,
            foreignKey: colName,
          });
        }

        columns.push({
          name: colName,
          type: colType,
          isPk: isInlinePk,
          isFk: false,
          isNullable: !isNotNull,
          isUnique,
        });
      }
    }

    // Apply table-level primary keys
    for (const col of columns) {
      if (pkColumns.has(col.name)) {
        col.isPk = true;
      }
    }

    tables.push({ name: tableName, columns });
  }

  // Mark foreign keys in columns
  for (const rel of relations) {
    const targetTable = tables.find(
      (t) => t.name.toLowerCase() === rel.targetTable.toLowerCase(),
    );
    if (targetTable) {
      const col = targetTable.columns.find(
        (c) => c.name.toLowerCase() === rel.foreignKey.toLowerCase(),
      );
      if (col) col.isFk = true;
    }
  }

  // Generate UML Flow ERD DSL
  const output: string[] = [`@diagram "${diagramName}" erd`, ""];

  for (const table of tables) {
    output.push(`entity ${table.name} {`);
    for (const col of table.columns) {
      const flags: string[] = [];
      if (col.isPk) flags.push("pk");
      if (col.isFk) flags.push("fk");
      if (col.isUnique && !col.isPk) flags.push("unique");

      const prefix = col.isPk ? "*" : "";
      const flagStr = flags.length > 0 ? ` [${flags.join(", ")}]` : "";
      output.push(`  ${prefix}${col.name}: ${col.type}${flagStr}`);
    }
    output.push("}");
    output.push("");
  }

  // Deduplicate and output relationships
  const seenRels = new Set<string>();
  for (const rel of relations) {
    const key = `${rel.sourceTable}_${rel.targetTable}_${rel.foreignKey}`;
    if (!seenRels.has(key)) {
      seenRels.add(key);
      output.push(
        `${rel.sourceTable} ||--o{ ${rel.targetTable} : "${rel.foreignKey}"`,
      );
    }
  }

  return output.join("\n");
}

/** Split body by commas not nested inside parentheses */
function splitSQLStatements(body: string): string[] {
  const result: string[] = [];
  let current = "";
  let parenDepth = 0;

  for (let i = 0; i < body.length; i++) {
    const char = body[i];
    if (char === "(") parenDepth++;
    else if (char === ")") parenDepth--;

    if (char === "," && parenDepth === 0) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    result.push(current.trim());
  }

  return result;
}
