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
  protected aliasMap: Map<string, string> = new Map();

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
    let angleDepth = 0;
    while (this.pos < this.tokens.length) {
      const tok = this.currentToken();
      if (!tok || tok.type === "newline") break;
      if (tok.value === "<") {
        angleDepth++;
      } else if (tok.value === ">") {
        angleDepth = Math.max(0, angleDepth - 1);
      } else if (angleDepth === 0) {
        if (
          tok.value === "," ||
          tok.value === ")" ||
          tok.value === "{" ||
          tok.type === "bracket"
        ) {
          break;
        }
      }
      type += tok.value;
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
    const cleanName = name.replace(/^\[|\]$/g, "").trim();
    if (this.aliasMap.has(name)) return this.aliasMap.get(name)!;
    if (this.aliasMap.has(cleanName)) return this.aliasMap.get(cleanName)!;

    // 1. Exact name or ID match
    const node = this.diagram.nodes.find(
      (n) =>
        n.name === name ||
        n.id === name ||
        n.name === cleanName ||
        n.id === `node_${name}` ||
        n.id === `node_${cleanName}` ||
        (n as any).alias === name ||
        (n as any).alias === cleanName
    );
    if (node) return node.id;

    // 2. Match terminal nodes by type
    const lower = cleanName.toLowerCase();
    if (["start", "end", "initial", "final"].includes(lower)) {
      const terminal = this.diagram.nodes.find(
        (n) => n.type === lower || n.name === "●" || n.name === "◉"
      );
      if (terminal) return terminal.id;
    }

    return `node_${name}`;
  }

  protected resolveOrCreateNode(name: string): string {
    const existing = this.findNodeId(name);
    if (this.diagram.nodes.some((n) => n.id === existing)) {
      return existing;
    }

    // Auto-create missing node based on diagram type
    const cleanName = name.replace(/^["']|["']$/g, "").trim();
    const nodeId = `node_${cleanName.replace(/\s+/g, "_")}_${this.diagram.nodes.length}`;
    const defaultType = this.getDefaultNodeType();
    const newNode: any = {
      id: nodeId,
      name: cleanName,
      type: defaultType,
      position: { x: 0, y: 0 },
      size: { width: 140, height: 60 },
    };
    if (this.diagram.type === "class") {
      newNode.attributes = [];
      newNode.methods = [];
    } else if (this.diagram.type === "erd") {
      newNode.attributes = [];
    }
    this.diagram.nodes.push(newNode);
    return nodeId;
  }

  protected getDefaultNodeType(): string {
    switch (this.diagram.type) {
      case "class":
        return "class";
      case "erd":
        return "entity";
      case "usecase":
        return "usecase";
      case "component":
        return "component";
      case "deployment":
        return "node";
      case "activity":
        return "action";
      case "flowchart":
        return "process";
      case "state":
        return "state";
      default:
        return "class";
    }
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

    const sourceId = this.resolveOrCreateNode(sourceName);
    const targetId = this.resolveOrCreateNode(targetName);

    const edge: Edge = {
      id: `edge_${sourceName}_${targetName}_${this.diagram.edges.length}`,
      source: sourceId,
      target: targetId,
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
