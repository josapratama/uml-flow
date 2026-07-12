import type { ERDEntity } from "@uml-editor/shared";
import { BaseDiagramParser } from "../base-parser";

export class ERDParser extends BaseDiagramParser {
  parseElement(): void {
    const token = this.currentToken();
    if (!token) return;

    if (token.type === "keyword" && token.value === "entity") {
      this.parseEntity();
      return;
    }
    if (token.type === "identifier") {
      this.parseRelation();
      return;
    }
    this.advance();
  }

  private parseEntity(): void {
    this.advance();
    this.skipNewlines();
    const nameToken = this.currentToken();
    if (!nameToken) {
      this.addError("Expected entity name");
      return;
    }
    const name =
      nameToken.type === "string" ? nameToken.value : nameToken.value;
    this.advance();
    this.skipNewlines();

    const entity: ERDEntity = {
      id: `node_entity_${name}_${this.diagram.nodes.length}`,
      type: "entity",
      name,
      position: { x: 0, y: 0 },
      size: { width: 200, height: 80 },
      attributes: [],
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
        this.parseAttribute(entity);
        this.skipNewlines();
      }
      if (this.currentToken()?.value === "}") this.advance();
    }

    // Calculate size
    const charW = 7.5;
    let maxLen = name.length;
    for (const a of entity.attributes) {
      maxLen = Math.max(
        maxLen,
        `${a.isPrimaryKey ? "* " : ""}${a.name}: ${a.type}`.length,
      );
    }
    entity.size.width = Math.max(180, maxLen * charW + 30);
    entity.size.height = Math.max(60, 35 + entity.attributes.length * 22 + 10);
    this.diagram.nodes.push(entity);
  }

  private parseAttribute(entity: ERDEntity): void {
    let isPK = false;
    if (
      this.currentToken()?.type === "operator" &&
      this.currentToken()?.value === "*"
    ) {
      isPK = true;
      this.advance();
    }

    const nameToken = this.currentToken();
    if (
      !nameToken ||
      (nameToken.type !== "identifier" && nameToken.type !== "keyword")
    ) {
      this.advance();
      return;
    }
    const attrName = nameToken.value;
    this.advance();

    let type = "varchar";
    if (this.currentToken()?.value === ":") {
      this.advance();
      type = this.readType();
    }

    let isFK = false,
      isUnique = false,
      isNullable = true;
    if (this.currentToken()?.type === "bracket") {
      const constraint = this.currentToken()!.value.toLowerCase();
      if (constraint.includes("fk") || constraint.includes("foreign"))
        isFK = true;
      if (constraint.includes("unique")) isUnique = true;
      if (constraint.includes("not null") || constraint.includes("nn"))
        isNullable = false;
      this.advance();
    }

    if (isPK) isNullable = false;
    entity.attributes.push({
      name: attrName,
      type,
      isPrimaryKey: isPK,
      isForeignKey: isFK,
      isNullable,
      isUnique,
    });
  }
}
