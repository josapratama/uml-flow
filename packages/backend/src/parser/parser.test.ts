import { describe, expect, test } from "bun:test";
import { Parser } from "./parser";
import { LayoutEngine } from "../layout";

const USER_DSL = `[start] Mulai Pengembangan Sistem (start)
[process] 1. Analisis Kebutuhan (Requirement Analysis)\\nIdentifikasi kebutuhan 4 aktor pengguna (Admin, Kepala Desa, Sekretaris Desa, Petugas Bidang), 6 kategori dokumen arsip desa, kebutuhan ekstraksi teks OCR, koreksi teks, dan pencarian Full-Text Search (tahap1)
[process] 2. Desain Sistem\\nPerancangan "arsitektur" Smart Web (tahap2)
[process] 3. Implementasi (tahap3)
[end] Aplikasi Pengarsipan Digital Smart Web Siap Digunakan (end)

start -> tahap1
tahap1 -> tahap2
tahap2 -> tahap3
tahap3 -> end`;

describe("flowchart shorthand + auto-detect", () => {
  const r = new Parser().parse(USER_DSL);

  test("detects flowchart without @diagram", () => {
    expect(r.diagram.type).toBe("flowchart");
    expect(r.errors?.some((e) => e.message.includes("terdeteksi otomatis"))).toBe(true);
  });

  test("all nodes and edges survive (nothing swallowed)", () => {
    expect(r.diagram.nodes.length).toBe(5);
    expect(r.diagram.edges.length).toBe(4);
    expect(r.success).toBe(true);
  });

  test("preserves \\n as real newline and wraps node sizes proportionally", () => {
    const tahap1 = r.diagram.nodes.find((n: any) => n.alias === "tahap1")!;
    const startNode = r.diagram.nodes.find((n: any) => n.alias === "start")!;
    const endNode = r.diagram.nodes.find((n: any) => n.alias === "end")!;

    expect(tahap1.name).toContain("\n");
    expect(tahap1.size.width).toBeLessThanOrEqual(380);
    expect(tahap1.size.height).toBeGreaterThan(100);

    expect(startNode.size.width).toBeGreaterThan(120);
    expect(endNode.size.width).toBeGreaterThan(160);
    expect(endNode.size.height).toBeGreaterThanOrEqual(56);
  });

  test("re-layout stacks nodes cleanly without overlap", () => {
    const laidOut = new LayoutEngine(undefined, "auto").layout(r.diagram);
    for (let i = 0; i < laidOut.nodes.length - 1; i++) {
      const curr = laidOut.nodes[i];
      const next = laidOut.nodes[i + 1];
      expect(next.position.y).toBeGreaterThanOrEqual(
        curr.position.y + curr.size.height + 40,
      );
      // Centered on same vertical axis (x = 400)
      expect(Math.round(curr.position.x + curr.size.width / 2)).toBe(400);
    }
  });

  test("edges connect the right nodes", () => {
    const byAlias = (a: string) =>
      r.diagram.nodes.find((n: any) => n.alias === a)!.id;
    expect(
      r.diagram.edges.some(
        (e) => e.source === byAlias("start") && e.target === byAlias("tahap1"),
      ),
    ).toBe(true);
    expect(
      r.diagram.edges.some(
        (e) => e.source === byAlias("tahap3") && e.target === byAlias("end"),
      ),
    ).toBe(true);
  });
});

describe("parseRelation no longer swallows next line (class)", () => {
  test("garbage line does not eat following relation", () => {
    const r = new Parser().parse(`class A\nclass B\nclass C\nfoo bar baz\nA --> B\nB --> C`);
    expect(r.diagram.edges.length).toBe(2);
    expect(
      r.errors?.some((e) => e.severity === "warning" && e.line === 4),
    ).toBe(true);
  });
});

describe("warns on silently ignored input in class diagrams", () => {
  test("unknown text yields warning", () => {
    const r = new Parser().parse(`@diagram class\nhello world`);
    expect(r.errors?.some((e) => e.severity === "warning")).toBe(true);
  });
});
