import type {
  Diagram,
  ParseResult,
  LayoutOptions,
  ExportOptions,
} from "@uml-editor/shared";

const BASE_URL = "/api";

export const api = {
  async parse(code: string): Promise<ParseResult> {
    const res = await fetch(`${BASE_URL}/parse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async layout(
    diagram: Diagram,
    options?: Partial<LayoutOptions>,
    preset?: string,
  ): Promise<{ diagram: Diagram }> {
    const res = await fetch(`${BASE_URL}/layout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ diagram, options, preset }),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async compile(
    code: string,
    layoutOptions?: Partial<LayoutOptions>,
    preset?: string,
  ): Promise<ParseResult> {
    const res = await fetch(`${BASE_URL}/compile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, layoutOptions, preset }),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async exportDiagram(
    diagram: Diagram,
    options: ExportOptions,
  ): Promise<string> {
    const res = await fetch(`${BASE_URL}/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ diagram, options }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || `Export failed: ${res.status}`);
    }
    if (options.format === "json")
      return JSON.stringify(await res.json(), null, 2);
    return res.text();
  },

  async validate(diagram: Diagram): Promise<{ issues: any[]; valid: boolean }> {
    const res = await fetch(`${BASE_URL}/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ diagram }),
    });
    return res.json();
  },

  async relayout(
    diagram: Diagram,
    preset: string,
  ): Promise<{ diagram: Diagram }> {
    return this.layout(diagram, undefined, preset);
  },

  // --- Diagram Storage API ---
  async getDiagrams(): Promise<Diagram[]> {
    const res = await fetch(`${BASE_URL}/diagrams`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async getDiagram(id: string): Promise<Diagram> {
    const res = await fetch(`${BASE_URL}/diagrams/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async saveServerDiagram(diagram: Diagram): Promise<Diagram> {
    const res = await fetch(`${BASE_URL}/diagrams`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(diagram),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async updateServerDiagram(id: string, diagram: Diagram): Promise<Diagram> {
    const res = await fetch(`${BASE_URL}/diagrams/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(diagram),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async deleteServerDiagram(id: string): Promise<boolean> {
    const res = await fetch(`${BASE_URL}/diagrams/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    return res.ok;
  },
};
