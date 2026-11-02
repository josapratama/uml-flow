import { Hono } from "hono";
import { cors } from "hono/cors";
import { bodyLimit } from "hono/body-limit";
import { serveStatic } from "hono/bun";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import compileRoutes from "./routes/compile";
import diagramRoutes from "./routes/diagrams";
import { rateLimit } from "./middleware/rate-limit";

const app = new Hono();

/**
 * CORS: the SPA is served from the same origin, so cross-origin access is only
 * granted to localhost (dev) and origins listed in CORS_ORIGINS (comma separated,
 * e.g. "https://uml-flow.josapratama.com").
 */
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

function isAllowedOrigin(origin: string): boolean {
  if (allowedOrigins.includes(origin)) return true;
  try {
    const { hostname } = new URL(origin);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

app.use(
  "/api/*",
  cors({
    origin: (origin) => (origin && isAllowedOrigin(origin) ? origin : ""),
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "x-client-id"],
  }),
);

// Abuse protection for the API: payload size cap + per-IP rate limit
app.use(
  "/api/*",
  bodyLimit({
    maxSize: 5 * 1024 * 1024,
    onError: (c) => c.json({ error: "Payload too large (max 5 MB)" }, 413),
  }),
);
app.use("/api/*", rateLimit({ windowMs: 60_000, max: 600 }));
app.use(
  "/api/diagrams/*",
  rateLimit({ windowMs: 60_000, max: 240 }),
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
