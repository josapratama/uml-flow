import { Hono } from "hono";
import type { Diagram } from "@uml-editor/shared";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

/**
 * CRUD routes for diagram storage.
 * Persists diagrams to a JSON file on disk so data survives server restarts.
 */

const DATA_DIR = join(process.cwd(), ".data");
const DATA_FILE = join(DATA_DIR, "diagrams.json");

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

/** Load diagrams from disk. */
function loadDiagrams(): Map<string, Diagram> {
  try {
    if (existsSync(DATA_FILE)) {
      const raw = readFileSync(DATA_FILE, "utf-8");
      const arr: Diagram[] = JSON.parse(raw);
      return new Map(arr.map((d) => [d.id, d]));
    }
  } catch {
    // Corrupted file — start fresh
  }
  return new Map();
}

/** Persist diagrams to disk. */
function saveDiagrams(diagrams: Map<string, Diagram>): void {
  try {
    const arr = [...diagrams.values()];
    writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2), "utf-8");
  } catch (e) {
    console.error("[diagrams] Failed to persist to disk:", e);
  }
}

// In-memory cache, backed by file
let diagrams = loadDiagrams();

const app = new Hono();

app.get("/", (c) => c.json([...diagrams.values()]));

app.get("/:id", (c) => {
  const diagram = diagrams.get(c.req.param("id"));
  if (!diagram) return c.json({ error: "Not found" }, 404);
  return c.json(diagram);
});

app.post("/", async (c) => {
  let diagram: Diagram;
  try {
    diagram = await c.req.json<Diagram>();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }
  if (!diagram.metadata) {
    diagram.metadata = {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };
  }
  diagram.id = `diagram_${Date.now()}`;
  diagram.metadata.createdAt = new Date().toISOString();
  diagram.metadata.updatedAt = new Date().toISOString();
  diagrams.set(diagram.id, diagram);
  saveDiagrams(diagrams);
  return c.json(diagram, 201);
});

app.put("/:id", async (c) => {
  const id = c.req.param("id");
  let diagram: Diagram;
  try {
    diagram = await c.req.json<Diagram>();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }
  diagram.id = id;
  if (!diagram.metadata) {
    diagram.metadata = {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };
  }
  diagram.metadata.updatedAt = new Date().toISOString();
  diagram.metadata.version = (diagram.metadata.version || 0) + 1;
  diagrams.set(id, diagram);
  saveDiagrams(diagrams);
  return c.json(diagram);
});

app.delete("/:id", (c) => {
  const id = c.req.param("id");
  if (!diagrams.has(id)) return c.json({ error: "Not found" }, 404);
  diagrams.delete(id);
  saveDiagrams(diagrams);
  return c.json({ success: true });
});

export default app;
