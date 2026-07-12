import type {
  DSLToken,
  Diagram,
  Edge,
  RelationType,
  ParseError,
} from "@uml-editor/shared";

/**
 * Base class for diagram-specific parsers.
 * Provides shared utilities: token navigation, error handling, relation parsing.
 */
export abstract class BaseDiagramParser {
  protected tokens: DSLToken[] = [];
  protected pos: number = 0;
  protected errors: ParseError[] = [];
  protected diagram: Diagram;

  constructor(diagram: Diagram, tokens: DSLToken[], startPos: number) {
    this.diagram = diagram;
    this.tokens = tokens;
    this.pos = startPos;
  }

  abstract parseElement(): void;

  getPos(): number {
    return this.pos;
  }
  getErrors(): ParseError[] {
    return this.errors;
  }

  // --- Token navigation ---

  protected currentToken(): DSLToken | undefined {
    return this.tokens[this.pos];
  }

  protected advance(): void {
    this.pos++;
  }

  protected skipNewlines(): void {
    while (
      this.pos < this.tokens.length &&
      this.tokens[this.pos]?.type === "newline"
    )
      this.pos++;
  }

  protected skipToNewline(): void {
    while (
      this.pos < this.tokens.length &&
      this.tokens[this.pos]?.type !== "newline"
    )
      this.pos++;
  }

  protected peekNextNonNewline(): DSLToken | undefined {
    let i = this.pos + 1;
    while (i < this.tokens.length && this.tokens[i].type === "newline") i++;
    return this.tokens[i];
  }

  protected addError(message: string): void {
    const token = this.currentToken();
    this.errors.push({
      line: token?.line ?? 0,
      column: token?.column ?? 0,
      message,
      severity: "error",
    });
  }

  // --- Shared parsing utilities ---

  protected readType(): string {
    let type = "";
    while (
      this.pos < this.tokens.length &&
      this.currentToken()?.type !== "newline" &&
      this.currentToken()?.value !== "," &&
      this.currentToken()?.value !== ")" &&
      this.currentToken()?.value !== "{" &&
      this.currentToken()?.type !== "bracket"
    ) {
      type += this.currentToken()!.value;
      this.advance();
    }
    return type.trim() || "any";
  }

  protected readToEndOfLine(): string {
    let text = "";
    while (
      this.pos < this.tokens.length &&
      this.currentToken()?.type !== "newline"
    ) {
      text += this.currentToken()!.value + " ";
      this.advance();
    }
    return text.trim();
  }

  protected findNodeId(name: string): string {
    // Try exact name match first (handles all parsers)
    const node = this.diagram.nodes.find((n) => n.name === name);
    if (node) return node.id;
    // Fallback: construct legacy-style id (for compatibility)
    return `node_${name}`;
  }

  protected parseRelation(): void {
    const sourceName = this.currentToken()!.value;
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
      targetToken.type === "string" ? targetToken.value : targetToken.value;
    this.advance();

    let label: string | undefined;
    if (this.currentToken()?.value === ":") {
      this.advance();
      label = this.readToEndOfLine();
    }

    const edge: Edge = {
      id: `edge_${sourceName}_${targetName}_${this.diagram.edges.length}`,
      source: this.findNodeId(sourceName),
      target: this.findNodeId(targetName),
      type: relType,
    };
    if (label) edge.label = { text: label };
    this.diagram.edges.push(edge);
  }

  protected mapRelationType(symbol: string): RelationType {
    const map: Record<string, RelationType> = {
      "--|>": "inheritance",
      "..|>": "realization",
      "-->": "association",
      "..>": "dependency",
      "o--": "aggregation",
      "*--": "composition",
      "->": "association",
      "<<include>>": "include",
      "<<extend>>": "extend",
      "||--||": "one-to-one",
      "||--o{": "one-to-many",
      "}o--||": "one-to-many",
      "}o--o{": "many-to-many",
    };
    return map[symbol] || "association";
  }
}
