import { Hono } from "hono";
import type { Diagram, LayoutOptions, ExportOptions } from "@uml-editor/shared";
import { Parser } from "../parser/parser";
import { LayoutEngine } from "../layout/layout-engine";
import { generateSVG, diagramToDSL } from "../export";
import { validateDiagram } from "../validation";

const app = new Hono();

async function parseJsonBody<T>(
  c: any,
): Promise<{ data?: T; error?: string }> {
  try {
    const data = await c.req.json<T>();
    if (!data || typeof data !== "object") {
      return { error: "Request body must be a JSON object" };
    }
    return { data };
  } catch {
    return { error: "Invalid JSON in request body" };
  }
}

/** Parse DSL to Diagram */
app.post("/parse", async (c) => {
  const { data, error } = await parseJsonBody<{ code: string }>(c);
  if (error || !data) {
    return c.json(
      {
        success: false,
        errors: [{ line: 0, column: 0, message: error || "No body provided", severity: "error" }],
      },
      400,
    );
  }
  const { code } = data;
  if (!code) {
    return c.json(
      {
        success: false,
        errors: [
          {
            line: 0,
            column: 0,
            message: "No code provided",
            severity: "error",
          },
        ],
      },
      400,
    );
  }
  const parser = new Parser();
  return c.json(parser.parse(code));
});

/** Auto-layout a diagram */
app.post("/layout", async (c) => {
  const { data, error } = await parseJsonBody<{
    diagram: Diagram;
    options?: Partial<LayoutOptions>;
    preset?: string;
  }>(c);
  if (error || !data?.diagram) {
    return c.json({ error: error || "No diagram provided" }, 400);
  }
  const { diagram, options, preset } = data;
  const engine = new LayoutEngine(options, preset as any);
  return c.json({ diagram: engine.layout(diagram) });
});

/** Parse + Layout in one step */
app.post("/compile", async (c) => {
  const { data, error } = await parseJsonBody<{
    code: string;
    layoutOptions?: Partial<LayoutOptions>;
    preset?: string;
  }>(c);
  if (error || !data) {
    return c.json(
      {
        success: false,
        errors: [{ line: 0, column: 0, message: error || "No body provided", severity: "error" }],
      },
      400,
    );
  }
  const { code, layoutOptions, preset } = data;
  if (!code) {
    return c.json(
      {
        success: false,
        errors: [
          {
            line: 0,
            column: 0,
            message: "No code provided",
            severity: "error",
          },
        ],
      },
      400,
    );
  }

  const parser = new Parser();
  const result = parser.parse(code);
  if (!result.success || !result.diagram) return c.json(result);

  const engine = new LayoutEngine(layoutOptions, preset as any);
  const layouted = engine.layout(result.diagram);
  return c.json({ success: true, diagram: layouted, errors: result.errors });
});

/** Export diagram to various formats */
app.post("/export", async (c) => {
  const { data, error } = await parseJsonBody<{
    diagram: Diagram;
    options: ExportOptions;
  }>(c);
  if (error || !data?.diagram) {
    return c.json({ error: error || "No diagram provided" }, 400);
  }
  const { diagram, options } = data;
  if (!options?.format) {
    return c.json({ error: "Missing export format option" }, 400);
  }

  switch (options.format) {
    case "json":
      return c.json(diagram);
    case "svg":
      return c.text(generateSVG(diagram, options), 200, {
        "Content-Type": "image/svg+xml",
      });
    case "dsl":
      return c.text(diagramToDSL(diagram), 200, {
        "Content-Type": "text/plain",
      });
    default:
      return c.json({ error: `Format ${options.format} not supported` }, 400);
  }
});

/** Validate diagram against rules */
app.post("/validate", async (c) => {
  const { data, error } = await parseJsonBody<{ diagram: Diagram }>(c);
  if (error || !data?.diagram) {
    return c.json({ error: error || "No diagram provided" }, 400);
  }
  const { diagram } = data;
  const issues = validateDiagram(diagram);
  return c.json({
    issues,
    valid: issues.filter((i) => i.severity === "error").length === 0,
  });
});

export default app;
