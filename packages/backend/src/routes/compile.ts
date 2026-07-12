import { Hono } from "hono";
import type { Diagram, LayoutOptions, ExportOptions } from "@uml-editor/shared";
import { Parser } from "../parser/parser";
import { LayoutEngine } from "../layout/layout-engine";
import { generateSVG, diagramToDSL } from "../export";
import { validateDiagram } from "../validation";

const app = new Hono();

/** Parse DSL to Diagram */
app.post("/parse", async (c) => {
  const { code } = await c.req.json<{ code: string }>();
  if (!code)
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
  const parser = new Parser();
  return c.json(parser.parse(code));
});

/** Auto-layout a diagram */
app.post("/layout", async (c) => {
  const { diagram, options, preset } = await c.req.json<{
    diagram: Diagram;
    options?: Partial<LayoutOptions>;
    preset?: string;
  }>();
  if (!diagram) return c.json({ error: "No diagram provided" }, 400);
  const engine = new LayoutEngine(options, preset as any);
  return c.json({ diagram: engine.layout(diagram) });
});

/** Parse + Layout in one step */
app.post("/compile", async (c) => {
  const { code, layoutOptions, preset } = await c.req.json<{
    code: string;
    layoutOptions?: Partial<LayoutOptions>;
    preset?: string;
  }>();
  if (!code)
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

  const parser = new Parser();
  const result = parser.parse(code);
  if (!result.success || !result.diagram) return c.json(result);

  const engine = new LayoutEngine(layoutOptions, preset as any);
  const layouted = engine.layout(result.diagram);
  return c.json({ success: true, diagram: layouted, errors: result.errors });
});

/** Export diagram to various formats */
app.post("/export", async (c) => {
  const { diagram, options } = await c.req.json<{
    diagram: Diagram;
    options: ExportOptions;
  }>();
  if (!diagram) return c.json({ error: "No diagram provided" }, 400);

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
  const { diagram } = await c.req.json<{ diagram: Diagram }>();
  if (!diagram) return c.json({ error: "No diagram provided" }, 400);
  const issues = validateDiagram(diagram);
  return c.json({
    issues,
    valid: issues.filter((i) => i.severity === "error").length === 0,
  });
});

export default app;
