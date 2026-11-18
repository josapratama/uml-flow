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

      if (val === "initial" || val === "*") {
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
      if (val === "h" || val === "history") {
        this.advance();
        if (!this.diagram.nodes.find((n) => n.id === "node_history")) {
          this.diagram.nodes.push({
            id: "node_history",
            type: "history",
            name: "H",
            position: { x: 0, y: 0 },
            size: { width: 28, height: 28 },
          } as StateNode);
        }
        return;
      }
      if (val === "h*" || val === "deephistory") {
        this.advance();
        if (!this.diagram.nodes.find((n) => n.id === "node_deep_history")) {
          this.diagram.nodes.push({
            id: "node_deep_history",
            type: "deepHistory",
            name: "H*",
            position: { x: 0, y: 0 },
            size: { width: 28, height: 28 },
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

          if (cur.type === "keyword" && (cur.value === "entry" || cur.value === "do" || cur.value === "exit")) {
            const actType = cur.value as "entry" | "do" | "exit";
            this.advance();
            if (this.currentToken()?.value === "/") this.advance();
            const actVal = this.readToEndOfLine().trim();
            if (substates.length > 0) {
              substates[substates.length - 1][actType] = actVal;
            }
          } else if (cur.type === "keyword" && cur.value === "state") {
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
              if (!substates.find((s) => s.id === innerId)) {
                const subNode: StateNode = {
                  id: innerId,
                  type: bval === "initial" ? "initial" : "final",
                  name: bval === "initial" ? "●" : "◉",
                  position: { x: 0, y: 0 },
                  size: { width: 20, height: 20 },
                };
                substates.push(subNode);
                if (!this.diagram.nodes.find((n) => n.id === innerId)) {
                  this.diagram.nodes.push(subNode);
                }
              }
              const tgtId = `node_${name}_${tgtName}`;
              const edge: Edge = {
                id: `edge_inner_${bval}_${tgtName}_${subEdges.length}`,
                source: innerId,
                target: tgtId,
                type: relType,
              };
              if (label) edge.label = { text: label };
              subEdges.push(edge);
              this.diagram.edges.push(edge);
            } else {
              if (!substates.find((s) => s.id === innerId)) {
                const subNode: StateNode = {
                  id: innerId,
                  type: bval === "initial" ? "initial" : "final",
                  name: bval === "initial" ? "●" : "◉",
                  position: { x: 0, y: 0 },
                  size: { width: 20, height: 20 },
                };
                substates.push(subNode);
                if (!this.diagram.nodes.find((n) => n.id === innerId)) {
                  this.diagram.nodes.push(subNode);
                }
              }
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
      if (this.currentToken()?.value === ":") {
        this.advance();
        this.skipNewlines();
        const actTok = this.currentToken();
        if (actTok && (actTok.value === "entry" || actTok.value === "do" || actTok.value === "exit")) {
          const actType = actTok.value as "entry" | "do" | "exit";
          this.advance();
          if (this.currentToken()?.value === "/") this.advance();
          const actText = this.readToEndOfLine().trim();
          node[actType] = actText;
          node.size.height = 68;
          node.size.width = Math.max(node.size.width, actText.length * 7 + 40);
        }
      }
      this.diagram.nodes.push(node);
      return;
    }

    if (token.type === "identifier" || token.type === "string") {
      const next1 = this.peekNextNonNewline();
      if (next1?.value === ":") {
        const savedPos = this.pos;
        const sName = token.value;
        this.advance(); // identifier
        this.advance(); // ':'
        this.skipNewlines();
        const actTok = this.currentToken();
        if (actTok && (actTok.value === "entry" || actTok.value === "do" || actTok.value === "exit")) {
          const actType = actTok.value as "entry" | "do" | "exit";
          this.advance();
          if (this.currentToken()?.value === "/") this.advance();
          const actText = this.readToEndOfLine().trim().replace(/\s*\(\s*/g, "(").replace(/\s*\)/g, ")");
          const targetId = this.resolveOrCreateNode(sName);
          const foundNode = this.diagram.nodes.find((n) => n.id === targetId) as StateNode | undefined;
          if (foundNode) {
            foundNode[actType] = actText;
            foundNode.size.height = Math.max(foundNode.size.height, 56 + (foundNode.entry ? 16 : 0) + (foundNode.do ? 16 : 0) + (foundNode.exit ? 16 : 0));
            foundNode.size.width = Math.max(foundNode.size.width, actText.length * 7 + 40);
          }
          return;
        }
        this.pos = savedPos;
      }
      this.parseRelation();
      return;
    }
    this.advance();
  }

  protected override findNodeId(name: string): string {
    const clean = name.replace(/^\[|\]$/g, "").trim();
    const lower = clean.toLowerCase();
    if (clean === "*" || lower === "final" || clean === "◉") {
      if (!this.diagram.nodes.find((n) => n.id === "node_final")) {
        this.diagram.nodes.push({
          id: "node_final",
          type: "final",
          name: "◉",
          position: { x: 0, y: 0 },
          size: { width: 24, height: 24 },
        } as StateNode);
      }
      return "node_final";
    }
    if (lower === "initial" || clean === "●") {
      if (!this.diagram.nodes.find((n) => n.id === "node_initial")) {
        this.diagram.nodes.push({
          id: "node_initial",
          type: "initial",
          name: "●",
          position: { x: 0, y: 0 },
          size: { width: 24, height: 24 },
        } as StateNode);
      }
      return "node_initial";
    }
    if (clean === "H" || lower === "h" || lower === "history") {
      if (!this.diagram.nodes.find((n) => n.id === "node_history")) {
        this.diagram.nodes.push({
          id: "node_history",
          type: "history",
          name: "H",
          position: { x: 0, y: 0 },
          size: { width: 28, height: 28 },
        } as StateNode);
      }
      return "node_history";
    }
    if (clean === "H*" || lower === "h*" || lower === "deephistory") {
      if (!this.diagram.nodes.find((n) => n.id === "node_deep_history")) {
        this.diagram.nodes.push({
          id: "node_deep_history",
          type: "deepHistory",
          name: "H*",
          position: { x: 0, y: 0 },
          size: { width: 28, height: 28 },
        } as StateNode);
      }
      return "node_deep_history";
    }
    return super.findNodeId(name);
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

    const sourceId =
      sourceName === "*" || sourceName.toLowerCase() === "initial"
        ? this.findNodeId("initial")
        : sourceName.toLowerCase() === "final"
          ? this.findNodeId("final")
          : sourceName.toLowerCase() === "h" || sourceName.toLowerCase() === "history"
            ? this.findNodeId("history")
            : sourceName.toLowerCase() === "h*" || sourceName.toLowerCase() === "deephistory"
              ? this.findNodeId("deepHistory")
              : this.findNodeId(sourceName);

    const edge: Edge = {
      id: `edge_${sourceName}_${targetName}_${this.diagram.edges.length}`,
      source: sourceId,
      target: this.findNodeId(targetName),
      type: relType,
    };
    if (label) edge.label = { text: label };
    this.diagram.edges.push(edge);
  }
}
