import { Hono } from "hono";
import type { Diagram } from "@uml-editor/shared";
import {
  existsSync,
  readFileSync,
  writeFileSync,
  renameSync,
  mkdirSync,
} from "fs";
import { join } from "path";

/**
 * CRUD routes for diagram storage.
 * Persists diagrams to a JSON file on disk. Every diagram is owned by the
 * client workspace id (x-client-id) that created it; other clients can neither
 * list, read, modify nor delete it.
 */

const DATA_DIR = process.env.DATA_DIR || join(process.cwd(), ".data");
const DATA_FILE = join(DATA_DIR, "diagrams.json");
const MAX_ID_LENGTH = 128;
const ID_PATTERN = /^[\w.\-:]+$/;

if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

interface StoredDiagram extends Diagram {
  clientId?: string;
}

function loadDiagrams(): Map<string, StoredDiagram> {
  try {
    if (existsSync(DATA_FILE)) {
      const arr: StoredDiagram[] = JSON.parse(readFileSync(DATA_FILE, "utf-8"));
      return new Map(arr.map((d) => [d.id, d]));
    }
  } catch (e) {
    console.error("[diagrams] Could not read store, starting empty:", e);
  }
  return new Map();
}

const diagrams = loadDiagrams();

/** Atomic write: temp file + rename, so a crash never leaves a half-written store. */
function flushToDisk(): void {
  try {
    const tmp = `${DATA_FILE}.tmp`;
    writeFileSync(tmp, JSON.stringify([...diagrams.values()]), "utf-8");
    renameSync(tmp, DATA_FILE);
  } catch (e) {
    console.error("[diagrams] Failed to persist to disk:", e);
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let dirty = false;
/** Debounced save: bursts of edits are coalesced into one disk write. */
function scheduleSave(): void {
  dirty = true;
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    dirty = false;
    flushToDisk();
  }, 300);
}

function flushPending(): void {
  if (dirty) {
    dirty = false;
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = null;
    flushToDisk();
  }
}
process.on("exit", flushPending);
for (const sig of ["SIGINT", "SIGTERM"] as const) {
  process.on(sig, () => {
    flushPending();
    process.exit(0);
  });
}

const app = new Hono();

/** Every route needs a client workspace id; reject anonymous access. */
app.use("*", async (c, next) => {
  const clientId = c.req.header("x-client-id");
  if (!clientId || clientId.length > 200) {
    return c.json({ error: "Missing x-client-id header" }, 400);
  }
  await next();
});

function validId(id: string | undefined): id is string {
  return !!id && id.length <= MAX_ID_LENGTH && ID_PATTERN.test(id);
}

async function readBody(c: any): Promise<StoredDiagram | null> {
  try {
    const body = await c.req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) return null;
    if (!Array.isArray(body.nodes) || !Array.isArray(body.edges)) return null;
    return body as StoredDiagram;
  } catch {
    return null;
  }
}

app.get("/", (c) => {
  const clientId = c.req.header("x-client-id")!;
  return c.json([...diagrams.values()].filter((d) => d.clientId === clientId));
});

app.get("/:id", (c) => {
  const clientId = c.req.header("x-client-id")!;
  const diagram = diagrams.get(c.req.param("id"));
  if (!diagram) return c.json({ error: "Not found" }, 404);
  if (diagram.clientId && diagram.clientId !== clientId) {
    return c.json({ error: "Forbidden: diagram owned by another client" }, 403);
  }
  return c.json(diagram);
});

app.post("/", async (c) => {
  const clientId = c.req.header("x-client-id")!;
  const diagram = await readBody(c);
  if (!diagram) {
    return c.json(
      { error: "Body must be a diagram object with nodes[] and edges[]" },
      400,
    );
  }

  if (!diagram.id) diagram.id = `diagram_${Date.now()}`;
  if (!validId(diagram.id)) return c.json({ error: "Invalid diagram id" }, 400);

  const existing = diagrams.get(diagram.id);
  if (existing && existing.clientId && existing.clientId !== clientId) {
    return c.json({ error: "Forbidden: diagram owned by another client" }, 403);
  }

  const now = new Date().toISOString();
  diagram.clientId = clientId;
  diagram.metadata = {
    ...(existing?.metadata || diagram.metadata || { version: 1 }),
    createdAt: existing?.metadata?.createdAt || now,
    updatedAt: now,
  } as any;
  diagrams.set(diagram.id, diagram);
  scheduleSave();
  return c.json(diagram, 201);
});

app.put("/:id", async (c) => {
  const clientId = c.req.header("x-client-id")!;
  const id = c.req.param("id");
  if (!validId(id)) return c.json({ error: "Invalid diagram id" }, 400);
  const existing = diagrams.get(id);

  if (existing?.clientId && existing.clientId !== clientId) {
    return c.json({ error: "Forbidden: diagram owned by another client" }, 403);
  }

  const diagram = await readBody(c);
  if (!diagram) {
    return c.json(
      { error: "Body must be a diagram object with nodes[] and edges[]" },
      400,
    );
  }

  const now = new Date().toISOString();
  diagram.id = id;
  // Legacy unowned diagrams are claimed by the first client that saves them
  diagram.clientId = existing?.clientId || clientId;
  diagram.metadata = {
    ...(existing?.metadata || diagram.metadata || {}),
    createdAt: existing?.metadata?.createdAt || diagram.metadata?.createdAt || now,
    updatedAt: now,
    version: (existing?.metadata?.version || diagram.metadata?.version || 0) + 1,
  } as any;
  diagrams.set(id, diagram);
  scheduleSave();
  return c.json(diagram);
});

app.delete("/:id", (c) => {
  const clientId = c.req.header("x-client-id")!;
  const id = c.req.param("id");
  const existing = diagrams.get(id);

  if (!existing) return c.json({ error: "Not found" }, 404);
  if (existing.clientId && existing.clientId !== clientId) {
    return c.json({ error: "Forbidden: diagram owned by another client" }, 403);
  }

  diagrams.delete(id);
  scheduleSave();
  return c.json({ success: true });
});

export default app;
