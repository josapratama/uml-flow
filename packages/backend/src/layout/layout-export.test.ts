import { describe, expect, test } from "bun:test";
import { Parser } from "../parser/parser";
import { LayoutEngine } from "./layout-engine";
import { generateSVG } from "../export/svg-generator";
import { diagramToDSL } from "../export/dsl-generator";
import type { Diagram } from "@uml-editor/shared";

const BRANCHING = `@diagram flowchart
start "Mulai" as s
process "Input data pengguna\\nValidasi dan normalisasi seluruh kolom formulir" as a
decision "Data valid?" as d
process "Simpan ke database" as ok
process "Tampilkan pesan kesalahan" as bad
end "Selesai" as e

s --> a
a --> d
d --> ok : Ya
d --> bad : Tidak
ok --> e
bad --> e`;

function overlaps(a: any, b: any): boolean {
  return !(
    a.position.x + a.size.width <= b.position.x ||
    b.position.x + b.size.width <= a.position.x ||
    a.position.y + a.size.height <= b.position.y ||
    b.position.y + b.size.height <= a.position.y
  );
}

function parseFlow(src: string): Diagram {
  const r = new Parser().parse(src);
  expect(r.success).toBe(true);
  return r.diagram;
}

describe("layout: branching flowchart", () => {
  for (const preset of ["auto", "layered", "linear", "grid", "force", "radial"] as const) {
    test(`preset "${preset}" never overlaps nodes`, () => {
      const laid = new LayoutEngine(undefined, preset).layout(parseFlow(BRANCHING));
      for (let i = 0; i < laid.nodes.length; i++)
        for (let j = i + 1; j < laid.nodes.length; j++)
          expect(overlaps(laid.nodes[i], laid.nodes[j])).toBe(false);
    });
  }

  test("auto layout keeps the Ya/Tidak branches side by side", () => {
    const laid = new LayoutEngine(undefined, "auto").layout(parseFlow(BRANCHING));
    const ok = laid.nodes.find((n: any) => n.alias === "ok")!;
    const bad = laid.nodes.find((n: any) => n.alias === "bad")!;
    expect(ok.position.y).toBe(bad.position.y);
    expect(ok.position.x).not.toBe(bad.position.x);
  });
});

describe("export: SVG matches canvas shapes", () => {
  const svg = generateSVG(
    new LayoutEngine(undefined, "auto").layout(
      parseFlow(`@diagram flowchart
io "Input"
document "Laporan"
database "DB"
subroutine "Proses"
connector "A"`),
    ),
    { format: "svg" } as any,
  );

  test("io is a parallelogram, database has ellipses, document uses a path", () => {
    expect(svg).toContain("<polygon"); // io
    expect(svg).toContain("<ellipse"); // database
    expect(svg).toContain("<path d=\"M "); // document wave
  });

  test("uses node colors instead of plain white boxes", () => {
    expect(svg).toContain("#F3E5F5"); // io fill
    expect(svg).toContain("#E8F5E9"); // database fill
  });

  test("respects custom style and wraps multiline text", () => {
    const d = parseFlow(`@diagram flowchart\nprocess "Judul\\nIsi baris kedua" as p`);
    (d.nodes[0] as any).style = { backgroundColor: "#123456", borderStyle: "dashed" };
    const out = generateSVG(new LayoutEngine().layout(d), { format: "svg" } as any);
    expect(out).toContain("#123456");
    expect(out).toContain("stroke-dasharray");
    expect((out.match(/<tspan/g) || []).length).toBeGreaterThanOrEqual(2);
  });
});

describe("DSL round-trip", () => {
  test("duplicate names keep distinct edges via aliases", () => {
    const d = parseFlow(`@diagram flowchart
process "Cek" as a
process "Cek" as b
process "Lanjut" as c
a --> b
b --> c`);
    const dsl = diagramToDSL(d);
    const again = new Parser().parse(dsl);
    expect(again.success).toBe(true);
    expect(again.diagram.nodes.length).toBe(3);
    expect(again.diagram.edges.length).toBe(2);
    const ids = new Set(again.diagram.edges.map((e) => `${e.source}>${e.target}`));
    expect(ids.size).toBe(2);
  });

  test("multiline names survive DSL generation", () => {
    const d = parseFlow(`@diagram flowchart\nprocess "Judul\\nIsi" as p`);
    const again = new Parser().parse(diagramToDSL(d));
    expect(again.diagram.nodes[0].name).toBe("Judul\nIsi");
  });
});

