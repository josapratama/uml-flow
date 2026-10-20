import type { ActivityNode } from "@uml-editor/shared";
import { BaseDiagramParser } from "../base-parser";

export class ActivityDiagramParser extends BaseDiagramParser {
  /** Track which edges were explicitly declared in the DSL */
  private explicitEdges = new Set<string>();
  /** Track swimlane declarations */
  private swimlanes: string[] = [];
  /** Current active swimlane */
  private currentSwimlane: string | null = null;

  parseElement(): void {
    const token = this.currentToken();
    if (!token) return;

    // Swimlane declaration: swimlane "Name"
    if (token.type === "keyword" && token.value === "swimlane") {
      this.advance();
      this.skipNewlines();
      const name = this.currentToken()?.value || "Lane";
      this.advance();
      const laneName = name.replace(/^["']|["']$/g, "");
      if (!this.swimlanes.includes(laneName)) this.swimlanes.push(laneName);
      this.currentSwimlane = laneName;
      (this.diagram as any).swimlanes = this.swimlanes;
      return;
    }

    if (token.type === "bracket") {
      const val = token.value.toLowerCase();
      if (val === "start") {
        this.advance();
        this.createNode("start", "●", 30, 30);
        return;
      }
      if (val === "end") {
        this.advance();
        this.createNode("end", "◉", 30, 30);
        return;
      }
      if (["yes", "no", "true", "false"].includes(val)) {
        const condition = token.value;
        this.advance();
        this.skipNewlines();
        if (this.currentToken()?.type === "keyword") {
          this.parseElement();
          const lastEdge = this.diagram.edges[this.diagram.edges.length - 1];
          if (lastEdge) lastEdge.condition = condition;
        }
        return;
      }
      this.advance();
      return;
    }

    if (token.type === "keyword") {
      switch (token.value) {
        case "action":
        case "process": {
          this.advance();
          this.skipNewlines();
          const name =
            this.currentToken()?.type === "string"
              ? this.currentToken()!.value
              : this.currentToken()?.value || "Action";
          this.advance();
          this.createNode(
            "action",
            name,
            Math.max(120, name.length * 8 + 30),
            40,
          );
          return;
        }
        case "decision": {
          this.advance();
          this.skipNewlines();
          const name =
            this.currentToken()?.type === "string"
              ? this.currentToken()!.value
              : this.currentToken()?.value || "?";
          this.advance();
          this.createNode("decision", name, 80, 80);
          return;
        }
        case "merge": {
          this.advance();
          this.createNode("merge", "◇", 40, 40);
          return;
        }
        case "fork": {
          this.advance();
          this.createNode("fork", "═", 120, 8);
          return;
        }
        case "join": {
          this.advance();
          this.createNode("join", "═", 120, 8);
          return;
        }
      }
    }

    // Explicit edge: NodeA --> NodeB
    if (token.type === "identifier" || token.type === "string") {
      this.parseRelation();
      const lastEdge = this.diagram.edges[this.diagram.edges.length - 1];
      if (lastEdge) {
        this.explicitEdges.add(`${lastEdge.source}-->${lastEdge.target}`);
        // Remove conflicting auto-edges originating from the same source
        this.diagram.edges = this.diagram.edges.filter(
          (e) => !e.id.startsWith("edge_auto_") || e.source !== lastEdge.source,
        );
      }
      return;
    }
    this.advance();
  }

  private createNode(
    type: ActivityNode["type"],
    name: string,
    w: number,
    h: number,
  ): void {
    // Use name-based ID to avoid collisions, with type prefix for terminal nodes
    const id = `node_${type}_${name.replace(/[^a-zA-Z0-9]/g, "_")}_${this.diagram.nodes.length}`;
    const node: ActivityNode = {
      id,
      type,
      name,
      position: { x: 0, y: 0 },
      size: { width: w, height: h },
    } as any;

    // Set swimlane if active
    if (this.currentSwimlane) {
      (node as any).swimlane = this.currentSwimlane;
    }

    // Auto-connect to previous node ONLY if there's no explicit edge covering this pair
    if (this.diagram.nodes.length > 0) {
      const prev = this.diagram.nodes[this.diagram.nodes.length - 1];
      const edgeKey = `${prev.id}-->${id}`;
      if (!this.explicitEdges.has(edgeKey)) {
        this.diagram.edges.push({
          id: `edge_auto_${prev.id}_${id}`,
          source: prev.id,
          target: id,
          type: "flow",
        });
      }
    }
    this.diagram.nodes.push(node);
  }
}
