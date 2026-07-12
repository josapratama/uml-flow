import type { FlowchartNode } from "@uml-editor/shared";
import { BaseDiagramParser } from "../base-parser";

/**
 * Flowchart / Flowgraph parser.
 * Supports: start, end, process, decision, io, document, database,
 * subroutine, connector, preparation.
 *
 * Syntax:
 *   start "Begin"
 *   process "Do Work"
 *   decision "OK?"
 *     [yes] process "Continue"
 *     [no] process "Retry"
 *   end "Done"
 *
 * Or explicit connections:
 *   NodeA --> NodeB : label
 */
export class FlowchartParser extends BaseDiagramParser {
  private static VALID_TYPES = [
    "start",
    "end",
    "process",
    "decision",
    "io",
    "document",
    "database",
    "subroutine",
    "connector",
    "preparation",
  ];

  parseElement(): void {
    const token = this.currentToken();
    if (!token) return;

    if (
      token.type === "keyword" &&
      FlowchartParser.VALID_TYPES.includes(token.value)
    ) {
      this.parseFlowNode(token.value as FlowchartNode["type"]);
      return;
    }

    if (token.type === "bracket") {
      const val = token.value.toLowerCase();
      this.advance();
      this.skipNewlines();
      // Condition label for decision branch
      if (
        this.currentToken()?.type === "keyword" &&
        FlowchartParser.VALID_TYPES.includes(this.currentToken()!.value)
      ) {
        this.parseElement();
        const lastEdge = this.diagram.edges[this.diagram.edges.length - 1];
        if (lastEdge) lastEdge.condition = val;
      }
      return;
    }

    if (token.type === "identifier") {
      this.parseRelation();
      return;
    }
    this.advance();
  }

  private parseFlowNode(type: FlowchartNode["type"]): void {
    this.advance();
    this.skipNewlines();
    const name =
      this.currentToken()?.type === "string"
        ? this.currentToken()!.value
        : this.currentToken()?.value || type;
    this.advance();

    const size = this.getSize(type, name);
    const id = `node_${type}_${this.diagram.nodes.length}`;
    const node: FlowchartNode = {
      id,
      type,
      name,
      position: { x: 0, y: 0 },
      size,
    };

    // Auto-connect to previous node
    if (this.diagram.nodes.length > 0) {
      const prev = this.diagram.nodes[this.diagram.nodes.length - 1];
      this.diagram.edges.push({
        id: `edge_${prev.id}_${id}`,
        source: prev.id,
        target: id,
        type: "flow",
      });
    }

    this.diagram.nodes.push(node);
  }

  private getSize(
    type: string,
    name: string,
  ): { width: number; height: number } {
    const w = Math.max(120, name.length * 8 + 40);
    switch (type) {
      case "start":
      case "end":
      case "connector":
        return { width: 80, height: 40 };
      case "decision":
        return { width: 100, height: 80 };
      case "database":
        return { width: w, height: 60 };
      default:
        return { width: w, height: 45 };
    }
  }
}
