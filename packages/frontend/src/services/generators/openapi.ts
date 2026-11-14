import type { Diagram, DiagramNode } from "@uml-editor/shared";

interface OpenAPISchemaProperty {
  type: string;
  format?: string;
  description?: string;
  example?: any;
  enum?: string[];
}

function mapToOpenAPIType(rawType: string): { type: string; format?: string } {
  const t = (rawType || "string").toLowerCase().trim();
  if (t === "int" || t === "integer" || t === "number" || t === "smallint" || t === "serial") {
    return { type: "integer", format: "int32" };
  }
  if (t === "bigint" || t === "long" || t === "i64" || t === "id") {
    return { type: "integer", format: "int64" };
  }
  if (t === "float" || t === "double" || t === "decimal" || t === "real" || t === "numeric") {
    return { type: "number", format: "double" };
  }
  if (t === "bool" || t === "boolean") {
    return { type: "boolean" };
  }
  if (t === "date") {
    return { type: "string", format: "date" };
  }
  if (t.includes("time") || t === "datetime" || t === "timestamp") {
    return { type: "string", format: "date-time" };
  }
  if (t.includes("email")) {
    return { type: "string", format: "email" };
  }
  if (t.includes("uuid")) {
    return { type: "string", format: "uuid" };
  }
  return { type: "string" };
}

function toPluralSnake(name: string): string {
  const clean = name.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
  if (clean.endsWith("y") && !clean.endsWith("ay") && !clean.endsWith("ey") && !clean.endsWith("oy")) {
    return clean.slice(0, -1) + "ies";
  }
  if (clean.endsWith("s") || clean.endsWith("x") || clean.endsWith("ch") || clean.endsWith("sh")) {
    return clean + "es";
  }
  return clean + "s";
}

/**
 * Generate OpenAPI 3.1 Specification in YAML or JSON from UML Class Diagram or ERD
 */
export function generateOpenAPI(diagram: Diagram, format: "yaml" | "json" = "yaml"): string {
  const entities = (diagram.nodes || []).filter(
    (n) => (n.type as string) !== "note" && (n.type as string) !== "system" && (n.type as string) !== "boundary"
  );

  const title = diagram.name || "API Service Specification";
  const desc = `RESTful API Specification auto-generated from UML Flow diagram '${diagram.name || "Architecture"}'`;

  const spec: Record<string, any> = {
    openapi: "3.1.0",
    info: {
      title,
      version: "1.0.0",
      description: desc,
      contact: {
        name: "UML Flow API Generator",
      },
    },
    servers: [
      {
        url: "http://localhost:3000/api/v1",
        description: "Local development server",
      },
    ],
    paths: {},
    components: {
      schemas: {},
    },
  };

  // Build Schemas
  for (const node of entities) {
    const entityName = node.name || node.id;
    const isEnum = (node.type as string) === "enum";
    const attrs = (node as any).attributes || [];

    if (isEnum) {
      const enumValues = attrs.map((a: any) => a.name || a);
      spec.components.schemas[entityName] = {
        type: "string",
        enum: enumValues,
        description: `Enum definition for ${entityName}`,
      };
      continue;
    }

    const properties: Record<string, OpenAPISchemaProperty> = {};
    const required: string[] = [];

    for (const attr of attrs) {
      const fieldName = attr.name || "field";
      const { type, format } = mapToOpenAPIType(attr.type);
      const prop: OpenAPISchemaProperty = { type };
      if (format) prop.format = format;
      properties[fieldName] = prop;

      if (attr.isPrimaryKey || attr.isNullable === false || attr.visibility === "+") {
        required.push(fieldName);
      }
    }

    spec.components.schemas[entityName] = {
      type: "object",
      description: `Data model for ${entityName}`,
      properties,
      ...(required.length > 0 ? { required } : {}),
    };

    // Build RESTful CRUD Paths
    const plural = toPluralSnake(entityName);
    const basePath = `/api/v1/${plural}`;
    const idPath = `/api/v1/${plural}/{id}`;

    spec.paths[basePath] = {
      get: {
        summary: `List all ${plural}`,
        description: `Retrieve a paginated list of ${entityName} records`,
        operationId: `list${entityName}s`,
        parameters: [
          {
            name: "page",
            in: "query",
            required: false,
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            required: false,
            schema: { type: "integer", default: 20 },
          },
        ],
        responses: {
          "200": {
            description: `A successful list of ${entityName} records`,
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: `#/components/schemas/${entityName}` },
                },
              },
            },
          },
        },
      },
      post: {
        summary: `Create ${entityName}`,
        description: `Create and persist a new ${entityName} entry`,
        operationId: `create${entityName}`,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: `#/components/schemas/${entityName}` },
            },
          },
        },
        responses: {
          "201": {
            description: `${entityName} created successfully`,
            content: {
              "application/json": {
                schema: { $ref: `#/components/schemas/${entityName}` },
              },
            },
          },
        },
      },
    };

    spec.paths[idPath] = {
      get: {
        summary: `Get ${entityName} by ID`,
        operationId: `get${entityName}ById`,
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: `${entityName} found`,
            content: {
              "application/json": {
                schema: { $ref: `#/components/schemas/${entityName}` },
              },
            },
          },
          "404": {
            description: `${entityName} not found`,
          },
        },
      },
      put: {
        summary: `Update ${entityName} by ID`,
        operationId: `update${entityName}ById`,
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: `#/components/schemas/${entityName}` },
            },
          },
        },
        responses: {
          "200": {
            description: `${entityName} updated successfully`,
            content: {
              "application/json": {
                schema: { $ref: `#/components/schemas/${entityName}` },
              },
            },
          },
          "404": {
            description: `${entityName} not found`,
          },
        },
      },
      delete: {
        summary: `Delete ${entityName} by ID`,
        operationId: `delete${entityName}ById`,
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "204": {
            description: `${entityName} deleted successfully`,
          },
          "404": {
            description: `${entityName} not found`,
          },
        },
      },
    };
  }

  if (format === "json") {
    return JSON.stringify(spec, null, 2);
  }

  return jsonToYaml(spec);
}

/**
 * Simple, zero-dependency JSON to YAML serializer formatted for OpenAPI specs
 */
function jsonToYaml(obj: any, indentLevel = 0): string {
  const indent = "  ".repeat(indentLevel);

  if (obj === null || obj === undefined) return "null\n";
  if (typeof obj === "boolean" || typeof obj === "number") return `${obj}\n`;
  if (typeof obj === "string") {
    if (obj.includes("\n") || obj.includes(":") || obj.includes("#") || obj.startsWith("@")) {
      return `"${obj.replace(/"/g, '\\"')}"\n`;
    }
    return `${obj}\n`;
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]\n";
    let res = "\n";
    for (const item of obj) {
      if (typeof item === "object" && item !== null) {
        const nested = jsonToYaml(item, indentLevel + 1).trimStart();
        res += `${indent}- ${nested}`;
      } else {
        res += `${indent}- ${jsonToYaml(item, 0)}`;
      }
    }
    return res;
  }

  // Object
  const keys = Object.keys(obj);
  if (keys.length === 0) return "{}\n";

  let res = indentLevel === 0 ? "" : "\n";
  for (const k of keys) {
    const val = obj[k];
    if (typeof val === "object" && val !== null) {
      res += `${indent}${k}:${jsonToYaml(val, indentLevel + 1)}`;
    } else {
      res += `${indent}${k}: ${jsonToYaml(val, 0)}`;
    }
  }
  return res;
}
