import type { Diagram, ClassNode, ERDEntity } from "@uml-editor/shared";

function mapPythonType(t: string): string {
  if (!t) return "Any";
  const lower = t.toLowerCase().trim();
  if (lower === "string" || lower === "varchar" || lower === "text") return "str";
  if (lower === "int" || lower === "integer" || lower === "number" || lower === "serial") return "int";
  if (lower === "float" || lower === "double" || lower === "decimal") return "float";
  if (lower === "bool" || lower === "boolean") return "bool";
  if (lower === "date") return "date";
  if (lower === "datetime" || lower === "timestamp") return "datetime";
  if (lower === "void" || lower === "none") return "None";
  if (lower.endsWith("[]") || lower.startsWith("list<")) {
    const inner = lower.replace(/\[\]$/, "").replace(/^list<|>$/g, "");
    return `List[${mapPythonType(inner)}]`;
  }
  return t;
}

function sanitizeIdentifier(name: string): string {
  return (name || "unnamed").replace(/[^a-zA-Z0-9_]/g, "_");
}

function toSnakeCase(name: string): string {
  return (name || "table")
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .toLowerCase();
}

/**
 * Generate modern Pydantic v2 Models from Class Diagram or ERD
 */
export function generatePythonPydantic(diagram: Diagram): string {
  const lines: string[] = [
    '"""',
    `Auto-generated Pydantic v2 Models from UML Flow`,
    `Diagram: ${diagram.name || "Untitled"} (${diagram.type})`,
    `Generated At: ${new Date().toISOString()}`,
    '"""',
    "",
    "from __future__ import annotations",
    "from typing import Optional, List, Any",
    "from datetime import datetime, date",
    "from enum import Enum",
    "from pydantic import BaseModel, Field, ConfigDict",
    "",
  ];

  if (diagram.type === "class") {
    const nodes = (diagram.nodes as ClassNode[]).filter(n => "name" in n);

    for (const node of nodes) {
      const className = sanitizeIdentifier(node.name);

      // Handle Enum
      if (node.type === "enum") {
        lines.push(`class ${className}(str, Enum):`);
        const attrs = node.attributes || [];
        if (attrs.length === 0) {
          lines.push("    pass");
        } else {
          for (const attr of attrs) {
            const valName = sanitizeIdentifier(attr.name).toUpperCase();
            lines.push(`    ${valName} = "${attr.name}"`);
          }
        }
        lines.push("");
        continue;
      }

      // Handle inheritance
      const parentEdges = diagram.edges.filter(
        e => e.source === node.id && (e.type === "inheritance" || e.type === "realization")
      );
      const parentNames = parentEdges
        .map(e => {
          const parent = nodes.find(n => n.id === e.target);
          return parent ? sanitizeIdentifier(parent.name) : "";
        })
        .filter(Boolean);

      const baseClass = parentNames.length > 0 ? parentNames.join(", ") : "BaseModel";
      lines.push(`class ${className}(${baseClass}):`);
      lines.push(`    """${className} model definition."""`);
      lines.push("    model_config = ConfigDict(from_attributes=True)");
      lines.push("");

      const attrs = node.attributes || [];
      if (attrs.length === 0) {
        lines.push("    pass");
      } else {
        for (const attr of attrs) {
          const pyType = mapPythonType(attr.type ? attr.type.replace(/\?$/, "") : "str");
          const isOptional = attr.name.endsWith("?") || (attr.type && (attr.type.endsWith("?") || attr.type.toLowerCase().includes("optional")));
          const cleanName = sanitizeIdentifier(attr.name.replace(/\?$/, ""));
          
          if (isOptional) {
            lines.push(`    ${cleanName}: Optional[${pyType}] = None`);
          } else {
            lines.push(`    ${cleanName}: ${pyType}`);
          }
        }
      }

      // Methods as documentation or stubs
      if (node.methods && node.methods.length > 0) {
        lines.push("");
        for (const method of node.methods) {
          const methodName = toSnakeCase(method.name);
          const retType = mapPythonType(method.returnType || "None");
          const params = (method.parameters || []).map(p => `${sanitizeIdentifier(p.name)}: ${mapPythonType(p.type)}`);
          const fullParams = ["self", ...params].join(", ");
          lines.push(`    def ${methodName}(${fullParams}) -> ${retType}:`);
          lines.push(`        """Method ${method.name} stub."""`);
          lines.push("        raise NotImplementedError()");
          lines.push("");
        }
      }
      lines.push("");
    }
  } else if (diagram.type === "erd") {
    // ERD Entities to Pydantic Schemas
    const entities = diagram.nodes as unknown as ERDEntity[];
    for (const ent of entities) {
      const className = sanitizeIdentifier(ent.name);
      lines.push(`class ${className}Base(BaseModel):`);
      lines.push(`    """Base schema for ${className}."""`);
      lines.push("    model_config = ConfigDict(from_attributes=True)");
      lines.push("");

      const attrs = ent.attributes || [];
      if (attrs.length === 0) {
        lines.push("    pass");
      } else {
        for (const attr of attrs) {
          const pyType = mapPythonType(attr.type || "str");
          const cleanName = sanitizeIdentifier(attr.name);
          if (attr.pk) {
            lines.push(`    ${cleanName}: ${pyType} = Field(..., description="Primary Key")`);
          } else if (attr.nullable) {
            lines.push(`    ${cleanName}: Optional[${pyType}] = None`);
          } else {
            lines.push(`    ${cleanName}: ${pyType}`);
          }
        }
      }
      lines.push("");
    }
  } else {
    lines.push(`# Catatan: Pydantic generator dirancang untuk diagram bertipe "Class" atau "ERD".`);
    lines.push(`# Tipe diagram aktif saat ini: "${diagram.type}".`);
  }

  return lines.join("\n");
}

/**
 * Generate modern SQLAlchemy 2.0 ORM Declarative Models from ERD or Class Diagram
 */
export function generatePythonSQLAlchemy(diagram: Diagram): string {
  const lines: string[] = [
    '"""',
    `Auto-generated SQLAlchemy 2.0 ORM Models from UML Flow`,
    `Diagram: ${diagram.name || "Untitled"} (${diagram.type})`,
    `Generated At: ${new Date().toISOString()}`,
    '"""',
    "",
    "from __future__ import annotations",
    "from typing import Optional, List",
    "from datetime import datetime, date",
    "from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship",
    "from sqlalchemy import String, Integer, Float, Boolean, DateTime, Date, ForeignKey, Text",
    "",
    "class Base(DeclarativeBase):",
    "    pass",
    "",
  ];

  function mapSqlAlchemyType(t: string): { pyType: string; colType: string } {
    const lower = (t || "str").toLowerCase().trim();
    if (lower === "int" || lower === "integer" || lower === "serial") {
      return { pyType: "int", colType: "Integer" };
    }
    if (lower === "float" || lower === "double" || lower === "decimal") {
      return { pyType: "float", colType: "Float" };
    }
    if (lower === "bool" || lower === "boolean") {
      return { pyType: "bool", colType: "Boolean" };
    }
    if (lower === "date") {
      return { pyType: "date", colType: "Date" };
    }
    if (lower === "datetime" || lower === "timestamp") {
      return { pyType: "datetime", colType: "DateTime" };
    }
    if (lower === "text" || lower === "longtext") {
      return { pyType: "str", colType: "Text" };
    }
    return { pyType: "str", colType: "String(255)" };
  }

  if (diagram.type === "erd") {
    const entities = diagram.nodes as unknown as ERDEntity[];

    for (const ent of entities) {
      const className = sanitizeIdentifier(ent.name);
      const tableName = toSnakeCase(ent.name);

      lines.push(`class ${className}(Base):`);
      lines.push(`    __tablename__ = "${tableName}"`);
      lines.push("");

      const attrs = ent.attributes || [];
      if (attrs.length === 0) {
        lines.push("    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)");
      } else {
        for (const attr of attrs) {
          const cleanName = sanitizeIdentifier(attr.name);
          const { pyType, colType } = mapSqlAlchemyType(attr.type || "str");
          const args: string[] = [colType];

          if (attr.pk) {
            args.push("primary_key=True");
            if (pyType === "int") args.push("autoincrement=True");
          }
          if (attr.fk) {
            args.push(`ForeignKey("${cleanName}_table.id")`);
          }
          if (attr.nullable) {
            args.push("nullable=True");
            lines.push(`    ${cleanName}: Mapped[Optional[${pyType}]] = mapped_column(${args.join(", ")})`);
          } else {
            lines.push(`    ${cleanName}: Mapped[${pyType}] = mapped_column(${args.join(", ")})`);
          }
        }
      }
      lines.push("");
    }
  } else if (diagram.type === "class") {
    const nodes = (diagram.nodes as ClassNode[]).filter(n => "name" in n && n.type !== "enum");

    for (const node of nodes) {
      const className = sanitizeIdentifier(node.name);
      const tableName = toSnakeCase(node.name);

      lines.push(`class ${className}(Base):`);
      lines.push(`    __tablename__ = "${tableName}"`);
      lines.push("");

      const attrs = node.attributes || [];
      let hasPk = false;

      for (const attr of attrs) {
        const cleanName = sanitizeIdentifier(attr.name);
        const { pyType, colType } = mapSqlAlchemyType(attr.type || "str");
        const isPk = cleanName.toLowerCase() === "id" || attr.name.toLowerCase().includes("id");
        if (isPk) hasPk = true;

        const args = [colType];
        if (isPk) args.push("primary_key=True");
        lines.push(`    ${cleanName}: Mapped[${pyType}] = mapped_column(${args.join(", ")})`);
      }

      if (!hasPk && attrs.length === 0) {
        lines.push("    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)");
      }

      lines.push("");
    }
  } else {
    lines.push(`# Catatan: SQLAlchemy generator dirancang untuk diagram bertipe "ERD" atau "Class".`);
    lines.push(`# Tipe diagram aktif saat ini: "${diagram.type}".`);
  }

  return lines.join("\n");
}

/**
 * Universal Python Code Generator Dispatcher
 */
export function generatePython(diagram: Diagram, target: "pydantic" | "sqlalchemy" = "pydantic"): string {
  if (target === "sqlalchemy") {
    return generatePythonSQLAlchemy(diagram);
  }
  return generatePythonPydantic(diagram);
}
