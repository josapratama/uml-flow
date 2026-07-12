import type { UseCaseNode } from "@uml-editor/shared";
import { BaseDiagramParser } from "../base-parser";

export class UseCaseDiagramParser extends BaseDiagramParser {
  parseElement(): void {
    const token = this.currentToken();
    if (!token) return;

    if (token.type === "keyword") {
      if (token.value === "actor") {
        this.parseActor();
        return;
      }
      if (token.value === "usecase") {
        this.parseUseCase();
        return;
      }
      if (token.value === "system") {
        this.parseSystem();
        return;
      }
    }
    if (token.type === "identifier" || token.type === "string") {
      this.parseRelation();
      return;
    }
    this.advance();
  }

  private parseActor(): void {
    this.advance();
    this.skipNewlines();
    const name =
      this.currentToken()?.type === "string"
        ? this.currentToken()!.value
        : this.currentToken()?.value || "Actor";
    this.advance();
    const node: UseCaseNode = {
      id: `node_actor_${name}_${this.diagram.nodes.length}`,
      type: "actor",
      name,
      position: { x: 0, y: 0 },
      size: { width: 60, height: 100 },
    };
    this.diagram.nodes.push(node);
  }

  private parseUseCase(): void {
    this.advance();
    this.skipNewlines();
    const name =
      this.currentToken()?.type === "string"
        ? this.currentToken()!.value
        : this.currentToken()?.value || "UseCase";
    this.advance();
    const node: UseCaseNode = {
      id: `node_usecase_${name}_${this.diagram.nodes.length}`,
      type: "usecase",
      name,
      position: { x: 0, y: 0 },
      size: { width: Math.max(120, name.length * 9 + 40), height: 50 },
    };
    this.diagram.nodes.push(node);
  }

  private parseSystem(): void {
    this.advance();
    this.skipNewlines();
    const name =
      this.currentToken()?.type === "string"
        ? this.currentToken()!.value
        : this.currentToken()?.value || "System";
    this.advance();
    this.skipNewlines();
    const node: UseCaseNode = {
      id: `node_system_${name}_${this.diagram.nodes.length}`,
      type: "system",
      name,
      position: { x: 0, y: 0 },
      size: { width: 300, height: 400 },
    };
    if (this.currentToken()?.value === "{") {
      this.advance();
      this.skipNewlines();
      while (
        this.pos < this.tokens.length &&
        this.currentToken()?.value !== "}"
      ) {
        this.skipNewlines();
        if (this.currentToken()?.value === "}") break;
        if (this.currentToken()?.value === "usecase") this.parseUseCase();
        else this.advance();
        this.skipNewlines();
      }
      if (this.currentToken()?.value === "}") this.advance();
    }
    this.diagram.nodes.push(node);
  }
}
