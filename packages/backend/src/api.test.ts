import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { rateLimit } from "./middleware/rate-limit";

process.env.DATA_DIR = `${process.cwd()}/.data-test-${Date.now()}`;
const { default: diagramRoutes } = await import("./routes/diagrams");

const app = new Hono();
app.route("/api/diagrams", diagramRoutes);

const body = (name: string) =>
  JSON.stringify({ id: `d_${name}`, name, type: "flowchart", nodes: [], edges: [] });
const call = (path: string, init: RequestInit & { client?: string } = {}) => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (init.client) headers["x-client-id"] = init.client;
  const p = path === "/" ? "" : path;
  return app.request(`/api/diagrams${p}`, { ...init, headers });
};

describe("diagram storage access control", () => {
  test("requests without x-client-id are rejected", async () => {
    expect((await call("/")).status).toBe(400);
    expect((await call("/d_x")).status).toBe(400);
  });

  test("owner can create, read, list; others cannot", async () => {
    expect((await call("/", { method: "POST", client: "alice", body: body("a1") })).status).toBe(201);
    expect((await call("/d_a1", { client: "alice" })).status).toBe(200);
    expect((await call("/d_a1", { client: "bob" })).status).toBe(403);
    const bobList = await (await call("/", { client: "bob" })).json();
    expect(bobList.length).toBe(0);
    const aliceList = await (await call("/", { client: "alice" })).json();
    expect(aliceList.length).toBe(1);
  });

  test("others cannot overwrite, hijack or delete", async () => {
    expect((await call("/d_a1", { method: "PUT", client: "bob", body: body("evil") })).status).toBe(403);
    expect((await call("/", { method: "POST", client: "bob", body: body("a1") })).status).toBe(403);
    expect((await call("/d_a1", { method: "DELETE", client: "bob" })).status).toBe(403);
    expect((await call("/d_a1", { method: "DELETE", client: "alice" })).status).toBe(200);
  });

  test("rejects malformed bodies and ids", async () => {
    expect((await call("/", { method: "POST", client: "alice", body: "[]" })).status).toBe(400);
    expect((await call("/", { method: "POST", client: "alice", body: '{"nodes":1}' })).status).toBe(400);
    expect(
      (await call("/", {
        method: "POST",
        client: "alice",
        body: JSON.stringify({ id: "../etc/passwd", nodes: [], edges: [] }),
      })).status,
    ).toBe(400);
  });
});

describe("rate limiter", () => {
  test("blocks after the limit and reports Retry-After", async () => {
    const limited = new Hono();
    limited.use("*", rateLimit({ windowMs: 60_000, max: 3 }));
    limited.get("/", (c) => c.text("ok"));
    const statuses: number[] = [];
    for (let i = 0; i < 5; i++)
      statuses.push((await limited.request("/", { headers: { "x-forwarded-for": "1.2.3.4" } })).status);
    expect(statuses).toEqual([200, 200, 200, 429, 429]);
    // a different IP has its own bucket
    expect((await limited.request("/", { headers: { "x-forwarded-for": "5.6.7.8" } })).status).toBe(200);
  });
});

