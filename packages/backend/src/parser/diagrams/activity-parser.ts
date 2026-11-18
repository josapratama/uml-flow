import { computeFlowNodeSize, type ActivityNode, type DSLToken, type Diagram } from "@uml-editor/shared";
import { BaseDiagramParser } from "../base-parser";

export class ActivityDiagramParser extends BaseDiagramParser {
  /** Track which edges were explicitly declared in the DSL */
  private explicitEdges = new Set<string>();
  /** Track swimlane declarations */
  private swimlanes: string[] = [];
  /** Current active swimlane */
  private currentSwimlane: string | null = null;
  /** Active decision node for branching */
  private currentDecision: ActivityNode | null = null;

  constructor(diagram: Diagram, tokens: DSLToken[], startPos: number) {
    super(diagram, tokens, startPos);
    this.swimlanes = (diagram as any).swimlanes ? [...(diagram as any).swimlanes] : [];
    this.currentSwimlane =
      (diagram as any)._currentSwimlane ||
      (this.swimlanes.length > 0 ? this.swimlanes[this.swimlanes.length - 1] : null);
  }

  private hasExplicitRelations(): boolean {
    return this.tokens.some(
      (t) => t.type === "symbol" && ["-->", "->", "..>"].includes(t.value),
    );
  }

  parseElement(): void {
    const token = this.currentToken();
    if (!token) return;

    // Swimlane / Partition declaration: swimlane "Name" or partition "Name"
    if (
      (token.type === "keyword" || token.type === "identifier") &&
      (token.value === "swimlane" || token.value === "partition")
    ) {
      this.advance();
      this.skipNewlines();
      let name = this.currentToken()?.value || "Lane";
      this.advance();
      if (this.currentToken()?.value === "{") {
        this.advance();
      }
      const laneName = name.replace(/^["']|["']$/g, "");
      if (!this.swimlanes.includes(laneName)) this.swimlanes.push(laneName);
      this.currentSwimlane = laneName;
      (this.diagram as any).swimlanes = this.swimlanes;
      (this.diagram as any)._currentSwimlane = this.currentSwimlane;
      return;
    }

    if (token.type === "punctuation" && token.value === "}") {
      this.advance();
      return;
    }

    // PlantUML-style swimlane: |Swimlane Name|
    if (token.type === "operator" && token.value === "|") {
      this.advance();
      let laneName = "";
      while (
        this.pos < this.tokens.length &&
        this.currentToken()?.value !== "|" &&
        this.currentToken()?.type !== "newline"
      ) {
        laneName += (laneName ? " " : "") + this.currentToken()!.value;
        this.advance();
      }
      if (this.currentToken()?.value === "|") this.advance();
      laneName = laneName.trim().replace(/^["']|["']$/g, "");
      if (laneName) {
        if (!this.swimlanes.includes(laneName)) this.swimlanes.push(laneName);
        this.currentSwimlane = laneName;
        (this.diagram as any).swimlanes = this.swimlanes;
        (this.diagram as any)._currentSwimlane = this.currentSwimlane;
      }
      return;
    }

    // PlantUML-style action: :Action text;
    if (token.type === "punctuation" && token.value === ":") {
      this.advance();
      let actionText = "";
      while (
        this.pos < this.tokens.length &&
        this.currentToken()?.value !== ";" &&
        this.currentToken()?.type !== "newline"
      ) {
        actionText += (actionText ? " " : "") + this.currentToken()!.value;
        this.advance();
      }
      if (this.currentToken()?.value === ";") this.advance();
      actionText = actionText.trim().replace(/^["']|["']$/g, "");
      if (actionText) {
        const sz = computeFlowNodeSize("action", actionText, 13, "activity");
        this.createNode("action", actionText, sz.width, sz.height);
      }
      return;
    }

    // PlantUML-style if / else / endif
    if (token.type === "identifier" || token.type === "keyword") {
      if (token.value === "if") {
        this.advance();
        this.skipNewlines();
        let condText = "";
        if (this.currentToken()?.value === "(") {
          this.advance();
          while (
            this.pos < this.tokens.length &&
            this.currentToken()?.value !== ")" &&
            this.currentToken()?.type !== "newline"
          ) {
            condText += (condText ? " " : "") + this.currentToken()!.value;
            this.advance();
          }
          if (this.currentToken()?.value === ")") this.advance();
        }
        this.skipToNewline();
        this.createNode("decision", condText || "Decision?", 80, 80);
        return;
      }
      if (token.value === "else") {
        this.skipToNewline();
        return;
      }
      if (token.value === "endif") {
        this.skipToNewline();
        this.createNode("merge", "◇", 40, 40);
        this.currentDecision = null;
        return;
      }
      if (token.value === "stop") {
        this.advance();
        this.createNode("end", "end", 30, 30);
        return;
      }
    }

    if (token.type === "bracket") {
      const nextToken = this.peekNextNonNewline();
      if (
        nextToken &&
        nextToken.type === "symbol" &&
        ["-->", "->", "..>"].includes(nextToken.value)
      ) {
        this.parseRelation();
        return;
      }

      const val = token.value.toLowerCase();
      if (val === "start") {
        this.advance();
        const lane = this.parseTrailingSwimlane();
        this.createNode("start", "start", 30, 30, lane);
        return;
      }
      if (val === "end") {
        this.advance();
        const lane = this.parseTrailingSwimlane();
        this.createNode("end", "end", 30, 30, lane);
        return;
      }
      if (["yes", "no", "true", "false", "ya", "tidak"].includes(val)) {
        const condition = token.value;
        this.advance();
        this.skipNewlines();
        if (
          this.currentToken()?.type === "keyword" ||
          this.currentToken()?.type === "identifier"
        ) {
          const prevCount = this.diagram.nodes.length;
          this.parseElement();
          const newNode = this.diagram.nodes[this.diagram.nodes.length - 1];
          if (this.currentDecision && newNode && this.diagram.nodes.length > prevCount) {
            this.diagram.edges = this.diagram.edges.filter(
              (e) => e.target !== newNode.id,
            );
            this.diagram.edges.push({
              id: `edge_${this.currentDecision.id}_${newNode.id}`,
              source: this.currentDecision.id,
              target: newNode.id,
              type: "flow",
              condition,
              label: { text: condition },
            });
          }
        }
        return;
      }
      this.advance();
      return;
    }

    if (token.type === "keyword") {
      switch (token.value) {
        case "start": {
          this.advance();
          const lane = this.parseTrailingSwimlane();
          this.createNode("start", "start", 30, 30, lane);
          return;
        }
        case "end": {
          this.advance();
          const lane = this.parseTrailingSwimlane();
          this.createNode("end", "end", 30, 30, lane);
          return;
        }
        case "action":
        case "process": {
          this.advance();
          this.skipNewlines();
          const name =
            this.currentToken()?.type === "string"
              ? this.currentToken()!.value
              : this.currentToken()?.value || "Action";
          this.advance();
          const lane = this.parseTrailingSwimlane();
          const sz = computeFlowNodeSize("action", name, 13, "activity");
          this.createNode("action", name, sz.width, sz.height, lane);
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
          const lane = this.parseTrailingSwimlane();
          const sz = computeFlowNodeSize("decision", name, 13, "activity");
          this.createNode("decision", name, sz.width, sz.height, lane);
          return;
        }
        case "merge": {
          this.advance();
          const lane = this.parseTrailingSwimlane();
          this.createNode("merge", "◇", 40, 40, lane);
          this.currentDecision = null;
          return;
        }
        case "fork": {
          this.advance();
          const lane = this.parseTrailingSwimlane();
          this.createNode("fork", "═", 120, 8, lane);
          return;
        }
        case "join": {
          this.advance();
          const lane = this.parseTrailingSwimlane();
          this.createNode("join", "═", 120, 8, lane);
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
      }
      return;
    }
    this.advance();
  }

  private parseTrailingSwimlane(): string | null {
    const token = this.currentToken();
    if (token && token.type === "bracket") {
      const val = token.value.trim();
      const lower = val.toLowerCase();
      if (
        val &&
        !["start", "end", "yes", "no", "true", "false", "ya", "tidak"].includes(lower)
      ) {
        this.advance();
        if (!this.swimlanes.includes(val)) {
          this.swimlanes.push(val);
          (this.diagram as any).swimlanes = this.swimlanes;
        }
        return val;
      }
    }
    return null;
  }

  private createNode(
    type: ActivityNode["type"],
    name: string,
    w: number,
    h: number,
    explicitLane?: string | null,
  ): void {
    const id = `node_${type}_${name.replace(/[^a-zA-Z0-9]/g, "_")}_${this.diagram.nodes.length}`;
    const node: ActivityNode = {
      id,
      type,
      name,
      position: { x: 0, y: 0 },
      size: { width: w, height: h },
    } as any;

    // Set swimlane if explicit or active
    const lane = explicitLane || this.currentSwimlane;
    if (lane) {
      (node as any).swimlane = lane;
      if (!this.swimlanes.includes(lane)) {
        this.swimlanes.push(lane);
        (this.diagram as any).swimlanes = this.swimlanes;
      }
    }

    // Auto-connect to previous node ONLY if there are no explicit edges in the diagram
    if (!this.hasExplicitRelations() && this.diagram.nodes.length > 0) {
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

    if (type === "decision") {
      this.currentDecision = node;
    }
  }
}
