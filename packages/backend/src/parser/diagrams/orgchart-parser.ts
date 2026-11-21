import type { OrgChartNode } from "@uml-editor/shared";
import { BaseDiagramParser } from "../base-parser";

/**
 * Organization Chart parser.
 * Supports: leader, manager, staff, unit, assistant.
 *
 * Syntax:
 *   leader "Kepala Desa" as kades {
 *     person: "Ahmad Fauzi, S.Sos"
 *     department: "Pemerintahan Desa"
 *   }
 *
 *   manager "Sekretaris Desa" as sekdes
 *
 *   kades --> sekdes : memimpin
 *   kades ..> bpd : koordinasi
 */
export class OrgChartParser extends BaseDiagramParser {
  private static VALID_TYPES = [
    "leader",
    "manager",
    "staff",
    "unit",
    "assistant",
    "root",
  ];

  protected getDefaultNodeType(): string {
    return "staff";
  }

  parseElement(): void {
    const token = this.currentToken();
    if (!token) return;

    if (
      (token.type === "keyword" || token.type === "identifier") &&
      OrgChartParser.VALID_TYPES.includes(token.value)
    ) {
      // Check if this keyword is part of an edge: e.g. `leader --> staff`
      if (this.tokens[this.pos + 1]?.type === "symbol") {
        this.parseRelation();
        return;
      }
      this.parseOrgNode(token.value as OrgChartNode["type"]);
      return;
    }

    // Explicit relation: e.g. `kades --> sekdes`
    if (token.type === "identifier" || token.type === "string") {
      this.parseRelation();
      return;
    }

    this.advance();
  }

  private parseOrgNode(nodeType: OrgChartNode["type"]): void {
    this.advance(); // consume keyword
    this.skipNewlines();

    let name = "Node";
    let alias: string | undefined;

    // 1. Read name (string or identifier)
    if (this.currentToken()?.type === "string") {
      name = this.currentToken()!.value;
      this.advance();
    } else if (this.currentToken()?.type === "identifier") {
      name = this.currentToken()!.value;
      this.advance();
    }

    // 2. Check for optional alias: "as <alias>"
    this.skipNewlines();
    if (
      this.currentToken()?.type === "keyword" &&
      this.currentToken()?.value === "as"
    ) {
      this.advance();
      this.skipNewlines();
      if (
        this.currentToken()?.type === "identifier" ||
        this.currentToken()?.type === "string"
      ) {
        alias = this.currentToken()!.value;
        this.advance();
      }
    }

    const cleanAlias = alias || name.replace(/\s+/g, "_").toLowerCase();
    const nodeId = `node_${cleanAlias}`;
    this.aliasMap.set(cleanAlias, nodeId);
    this.aliasMap.set(name, nodeId);

    let person: string | undefined;
    let department: string | undefined;
    let role: string | undefined;

    // 3. Optional property block { ... }
    this.skipNewlines();
    if (this.currentToken()?.value === "{") {
      this.advance();
      this.skipNewlines();

      while (this.pos < this.tokens.length && this.currentToken()?.value !== "}") {
        const propToken = this.currentToken();
        if (!propToken) break;

        if (
          propToken.type === "keyword" ||
          propToken.type === "identifier"
        ) {
          const key = propToken.value.toLowerCase();
          this.advance();

          // Optional colon ":"
          if (this.currentToken()?.value === ":") {
            this.advance();
          }

          let val = "";
          while (
            this.pos < this.tokens.length &&
            this.currentToken()?.type !== "newline" &&
            this.currentToken()?.value !== "}"
          ) {
            val += this.currentToken()!.value + " ";
            this.advance();
          }
          val = val.trim().replace(/^["']|["']$/g, "");

          if (key === "person" || key === "name" || key === "nama") {
            person = val;
          } else if (key === "department" || key === "divisi" || key === "dept" || key === "unit") {
            department = val;
          } else if (key === "role" || key === "jabatan" || key === "nip") {
            role = val;
          }
        } else {
          this.advance();
        }
        this.skipNewlines();
      }

      if (this.currentToken()?.value === "}") {
        this.advance();
      }
    }

    const effectiveType = nodeType === "root" ? "leader" : nodeType;

    const node: OrgChartNode = {
      id: nodeId,
      type: effectiveType,
      name,
      person,
      department,
      role,
      position: { x: 0, y: 0 },
      size: { width: 220, height: 85 },
    };

    this.diagram.nodes.push(node);
  }
}
