import type { StateNode, Edge } from "@uml-editor/shared";
import { BaseDiagramParser } from "../base-parser";

export class StateDiagramParser extends BaseDiagramParser {
  parseElement(): void {
    const token = this.currentToken();
    if (!token) return;

    if (token.type === "bracket") {
      const val = token.value.toLowerCase();
      // Check if this is a relation: [initial] --> SomeState
      const next = this.peekNextNonNewline();
      if (next?.type === "symbol") {
        this.parseBracketRelation(val);
        return;
      }

      if (val === "initial") {
        this.advance();
        if (!this.diagram.nodes.find((n) => n.id === "node_initial")) {
          this.diagram.nodes.push({
            id: "node_initial",
            type: "initial",
            name: "●",
            position: { x: 0, y: 0 },
            size: { width: 24, height: 24 },
          } as StateNode);
        }
        return;
      }
      if (val === "final") {
        this.advance();
        if (!this.diagram.nodes.find((n) => n.id === "node_final")) {
          this.diagram.nodes.push({
            id: "node_final",
            type: "final",
            name: "◉",
            position: { x: 0, y: 0 },
            size: { width: 24, height: 24 },
          } as StateNode);
        }
        return;
      }
      this.advance();
      return;
    }

    if (token.type === "keyword" && token.value === "state") {
      this.advance();
      this.skipNewlines();

      const name =
        this.currentToken()?.type === "string"
          ? this.currentToken()!.value
          : this.currentToken()?.value || "State";
      this.advance();
      this.skipNewlines();

      // Check for composite state: state "Name" { ... }
      if (this.currentToken()?.value === "{") {
        this.advance(); // skip '{'
        const substates: StateNode[] = [];
        const subEdges: Edge[] = [];

        // Parse inner block until '}'
        while (this.pos < this.tokens.length) {
          this.skipNewlines();
          const cur = this.currentToken();
          if (!cur || cur.value === "}") {
            this.advance();
            break;
          }

          if (cur.type === "keyword" && cur.value === "state") {
            // nested state declaration
            this.advance();
            this.skipNewlines();
            const subName =
              this.currentToken()?.type === "string"
                ? this.currentToken()!.value
                : this.currentToken()?.value || "SubState";
            this.advance();
            const subId = `node_${name}_${subName}`;
            substates.push({
              id: subId,
              type: "state",
              name: subName,
              position: { x: 0, y: 0 },
              size: {
                width: Math.max(90, subName.length * 9 + 20),
                height: 44,
              },
            });
            // Also register substate as a top-level node so edges can reference it
            if (!this.diagram.nodes.find((n) => n.id === subId)) {
              this.diagram.nodes.push(substates[substates.length - 1]);
            }
          } else if (cur.type === "bracket") {
            // [initial] or [final] inside composite
            const bval = cur.value.toLowerCase();
            this.advance();
            const innerId = `node_${name}_${bval}`;
            substates.push({
              id: innerId,
              type: bval === "initial" ? "initial" : "final",
              name: bval === "initial" ? "●" : "◉",
              position: { x: 0, y: 0 },
              size: { width: 20, height: 20 },
            });
            if (!this.diagram.nodes.find((n) => n.id === innerId)) {
              this.diagram.nodes.push(substates[substates.length - 1]);
            }
          } else if (cur.type === "identifier" || cur.type === "string") {
            // transition inside composite: SubA --> SubB : label
            const srcName = cur.value;
            this.advance();
            this.skipNewlines();
            const relTok = this.currentToken();
            if (relTok?.type === "symbol") {
              const relType = this.mapRelationType(relTok.value);
              this.advance();
              this.skipNewlines();
              const tgtName = this.currentToken()?.value || "";
              this.advance();
              let label: string | undefined;
              if (this.currentToken()?.value === ":") {
                this.advance();
                label = this.readToEndOfLine();
              }
              const srcId = `node_${name}_${srcName}`;
              const tgtId = `node_${name}_${tgtName}`;
              const edge: Edge = {
                id: `edge_inner_${srcName}_${tgtName}_${subEdges.length}`,
                source: srcId,
                target: tgtId,
                type: relType,
              };
              if (label) edge.label = { text: label };
              subEdges.push(edge);
              this.diagram.edges.push(edge);
            }
          } else {
            this.advance();
          }
        }

        // Calculate composite node size based on substates count
        const innerW = Math.max(200, name.length * 10 + 60);
        const innerH = Math.max(120, substates.length * 60 + 50);
        const compositeId = `node_composite_${name}`;
        const compositeNode: StateNode = {
          id: compositeId,
          type: "composite",
          name,
          position: { x: 0, y: 0 },
          size: { width: innerW, height: innerH },
          substates,
        };
        this.diagram.nodes.push(compositeNode);
        return;
      }

      // Regular state
      const node: StateNode = {
        id: `node_state_${name}_${this.diagram.nodes.length}`,
        type: "state",
        name,
        position: { x: 0, y: 0 },
        size: { width: Math.max(100, name.length * 9 + 30), height: 50 },
      };
      this.diagram.nodes.push(node);
      return;
    }

    if (token.type === "identifier") {
      this.parseRelation();
      return;
    }
    this.advance();
  }

  private parseBracketRelation(sourceName: string): void {
    this.advance();
    this.skipNewlines();
    const relToken = this.currentToken();
    if (!relToken || relToken.type !== "symbol") {
      this.skipToNewline();
      return;
    }
    const relType = this.mapRelationType(relToken.value);
    this.advance();
    this.skipNewlines();
    const targetToken = this.currentToken();
    if (!targetToken) return;
    const targetName =
      targetToken.type === "bracket" ? targetToken.value : targetToken.value;
    this.advance();

    let label: string | undefined;
    if (this.currentToken()?.value === ":") {
      this.advance();
      label = this.readToEndOfLine();
    }

    const edge: Edge = {
      id: `edge_${sourceName}_${targetName}_${this.diagram.edges.length}`,
      source: `node_${sourceName}`,
      target: this.findNodeId(targetName),
      type: relType,
    };
    if (label) edge.label = { text: label };
    this.diagram.edges.push(edge);
  }
}
