import { Hono } from "hono";
import { cors } from "hono/cors";
import compileRoutes from "./routes/compile";
import diagramRoutes from "./routes/diagrams";

const app = new Hono();

// Middleware
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

// Health check
app.get("/", (c) =>
  c.json({ status: "ok", service: "uml-editor-api", version: "2.0.0" }),
);

// Routes
app.route("/api", compileRoutes);
app.route("/api/diagrams", diagramRoutes);

// Start server
const port = Number(process.env.PORT) || 3001;

export default { port, fetch: app.fetch };

console.log(`🚀 UML Editor API running on http://localhost:${port}`);
