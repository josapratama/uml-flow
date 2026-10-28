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
    this.skipNewlines();

    let alias: string | undefined;
    if (this.currentToken()?.value === "as") {
      this.advance();
      this.skipNewlines();
      alias = this.currentToken()?.value;
      this.advance();
    }

    const id = `node_actor_${name.replace(/\s+/g, "_")}_${this.diagram.nodes.length}`;
    const node: UseCaseNode = {
      id,
      type: "actor",
      name,
      position: { x: 0, y: 0 },
      size: { width: 60, height: 100 },
    };
    if (alias) {
      (node as any).alias = alias;
      this.aliasMap.set(alias, id);
    }
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
    this.skipNewlines();

    let alias: string | undefined;
    if (this.currentToken()?.value === "as") {
      this.advance();
      this.skipNewlines();
      alias = this.currentToken()?.value;
      this.advance();
    }

    const id = `node_usecase_${name.replace(/\s+/g, "_")}_${this.diagram.nodes.length}`;
    const node: UseCaseNode = {
      id,
      type: "usecase",
      name,
      position: { x: 0, y: 0 },
      size: { width: Math.max(120, name.length * 9 + 40), height: 50 },
    };
    if (alias) {
      (node as any).alias = alias;
      this.aliasMap.set(alias, id);
    }
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

    const id = `node_system_${name.replace(/\s+/g, "_")}_${this.diagram.nodes.length}`;
    const node: UseCaseNode = {
      id,
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
