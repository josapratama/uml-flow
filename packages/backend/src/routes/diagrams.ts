import { Hono } from "hono";
import type { Diagram } from "@uml-editor/shared";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

/**
 * CRUD routes for diagram storage.
 * Persists diagrams to a JSON file on disk, isolated by client workspace id (x-client-id).
 */

const DATA_DIR = join(process.cwd(), ".data");
const DATA_FILE = join(DATA_DIR, "diagrams.json");

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

interface StoredDiagram extends Diagram {
  clientId?: string;
}

/** Load diagrams from disk. */
function loadDiagrams(): Map<string, StoredDiagram> {
  try {
    if (existsSync(DATA_FILE)) {
      const raw = readFileSync(DATA_FILE, "utf-8");
      const arr: StoredDiagram[] = JSON.parse(raw);
      return new Map(arr.map((d) => [d.id, d]));
    }
  } catch {
    // Corrupted file — start fresh
  }
  return new Map();
}

/** Persist diagrams to disk. */
function saveDiagrams(diagrams: Map<string, StoredDiagram>): void {
  try {
    const arr = [...diagrams.values()];
    writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2), "utf-8");
  } catch (e) {
    console.error("[diagrams] Failed to persist to disk:", e);
  }
}

// In-memory cache, backed by file
const diagrams = loadDiagrams();

const app = new Hono();

app.get("/", (c) => {
  const clientId = c.req.header("x-client-id");
  const all = [...diagrams.values()];
  if (clientId) {
    // Return diagrams owned by this client or public unassigned ones
    return c.json(all.filter((d) => !d.clientId || d.clientId === clientId));
  }
  return c.json(all);
});

app.get("/:id", (c) => {
  const id = c.req.param("id");
  const diagram = diagrams.get(id);
  if (!diagram) return c.json({ error: "Not found" }, 404);
  return c.json(diagram);
});

app.post("/", async (c) => {
  const clientId = c.req.header("x-client-id");
  let diagram: StoredDiagram;
  try {
    diagram = await c.req.json();
    if (!diagram || typeof diagram !== "object") {
      return c.json({ error: "Request body must be a JSON object" }, 400);
    }
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  if (clientId && !diagram.clientId) {
    diagram.clientId = clientId;
  }

  if (!diagram.metadata) {
    diagram.metadata = {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };
  }
  if (!diagram.id) {
    diagram.id = `diagram_${Date.now()}`;
  }
  diagram.metadata.createdAt = new Date().toISOString();
  diagram.metadata.updatedAt = new Date().toISOString();
  diagrams.set(diagram.id, diagram);
  saveDiagrams(diagrams);
  return c.json(diagram, 201);
});

app.put("/:id", async (c) => {
  const id = c.req.param("id");
  const clientId = c.req.header("x-client-id");
  const existing = diagrams.get(id);

  if (existing && existing.clientId && clientId && existing.clientId !== clientId) {
    return c.json({ error: "Forbidden: diagram owned by another client" }, 403);
  }

  let diagram: StoredDiagram;
  try {
    diagram = await c.req.json();
    if (!diagram || typeof diagram !== "object") {
      return c.json({ error: "Request body must be a JSON object" }, 400);
    }
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  diagram.id = id;
  if (existing?.clientId) {
    diagram.clientId = existing.clientId;
  } else if (clientId) {
    diagram.clientId = clientId;
  }

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
  const clientId = c.req.header("x-client-id");
  const existing = diagrams.get(id);

  if (!existing) return c.json({ error: "Not found" }, 404);

  if (existing.clientId && clientId && existing.clientId !== clientId) {
    return c.json({ error: "Forbidden: diagram owned by another client" }, 403);
  }

  diagrams.delete(id);
  saveDiagrams(diagrams);
  return c.json({ success: true });
});

export default app;
