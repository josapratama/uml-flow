import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "hono/bun";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import compileRoutes from "./routes/compile";
import diagramRoutes from "./routes/diagrams";

const app = new Hono();

// Middleware — CORS enabled for all origins
app.use(
  "*",
  cors({
    origin: (origin) => origin || "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

// Health check endpoints
app.get("/health", (c) =>
  c.json({ status: "ok", service: "uml-editor-api", version: "2.0.0" }),
);
app.get("/api/health", (c) =>
  c.json({ status: "ok", service: "uml-editor-api", version: "2.0.0" }),
);

// API Routes
app.route("/api", compileRoutes);
app.route("/api/diagrams", diagramRoutes);

// Static frontend serving (Production SPA)
const candidateDistDirs = [
  resolve(process.cwd(), "packages/frontend/dist"),
  resolve(process.cwd(), "../frontend/dist"),
  resolve(import.meta.dirname, "../../frontend/dist"),
];
const distDir = candidateDistDirs.find(
  (dir) => existsSync(dir) && existsSync(resolve(dir, "index.html")),
);

if (distDir) {
  const indexHtml = readFileSync(resolve(distDir, "index.html"), "utf-8");
  // Serve static assets from build output
  app.use("/*", serveStatic({ root: distDir }));
  // Fallback to index.html for client-side SPA routing
  app.get("*", (c) => c.html(indexHtml));
  console.log(`📦 Serving frontend SPA from ${distDir}`);
} else {
  // Fallback when running backend standalone without frontend build
  app.get("/", (c) =>
    c.json({
      status: "ok",
      service: "uml-editor-api",
      version: "2.0.0",
      note: "Frontend build not found. Run 'bun run build' to generate static assets.",
    }),
  );
}

// Start server
const port = Number(process.env.PORT) || 3001;

export default { port, fetch: app.fetch };

console.log(`🚀 UML Editor API running on http://localhost:${port}`);
