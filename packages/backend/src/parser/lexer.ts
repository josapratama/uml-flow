import type { DSLToken } from "@uml-editor/shared";
import {
  KEYWORDS,
  RELATION_SYMBOLS,
  PUNCTUATION,
  OPERATOR_CHARS,
  isIdentStart,
  isIdentChar,
} from "./token-rules";

/**
 * DSL Lexer — converts raw text into a stream of tokens.
 * Supports all diagram types (class, sequence, activity, flowchart, ERD, state, usecase).
 */
export class Lexer {
  private input: string;
  private pos = 0;
  private line = 1;
  private column = 1;
  private tokens: DSLToken[] = [];

  constructor(input: string) {
    this.input = input;
  }

  tokenize(): DSLToken[] {
    while (this.pos < this.input.length) {
      this.skipWhitespace();
      if (this.pos >= this.input.length) break;

      const ch = this.peek();

      if (ch === "/" && this.peekAt(1) === "/") {
        this.readComment();
        continue;
      }
      if (ch === "\n") {
        this.emitNewline();
        continue;
      }
      if (ch === "\r") {
        this.pos++;
        continue;
      }
      if (ch === '"' || ch === "'") {
        this.readString(ch);
        continue;
      }
      if (ch === "[") {
        this.readBracket();
        continue;
      }
      if (this.tryVisibility(ch)) continue;
      if (this.tryERDPrimaryKey(ch)) continue;
      if (this.tryRelation()) continue;
      if (PUNCTUATION.has(ch)) {
        this.emitSingle("punctuation", ch);
        continue;
      }
      if (ch === "@") {
        this.readDirective();
        continue;
      }
      if (isIdentStart(ch)) {
        this.readIdentifier();
        continue;
      }
      if (OPERATOR_CHARS.has(ch)) {
        this.emitSingle("operator", ch);
        continue;
      }

      // Skip unknown characters
      this.pos++;
      this.column++;
    }

    return this.tokens;
  }

  // --- Character access ---

  private peek(): string {
    return this.input[this.pos];
  }
  private peekAt(offset: number): string | undefined {
    return this.input[this.pos + offset];
  }

  // --- Emit helpers ---

  private emit(type: DSLToken["type"], value: string, col: number): void {
    this.tokens.push({ type, value, line: this.line, column: col });
  }

  private emitSingle(type: DSLToken["type"], value: string): void {
    this.emit(type, value, this.column);
    this.pos++;
    this.column++;
  }

  private emitNewline(): void {
    this.emit("newline", "\n", this.column);
    this.pos++;
    this.line++;
    this.column = 1;
  }

  // --- Whitespace ---

  private skipWhitespace(): void {
    while (this.pos < this.input.length) {
      const ch = this.input[this.pos];
      if (ch !== " " && ch !== "\t") break;
      this.pos++;
      this.column++;
    }
  }

  // --- Token readers ---

  private readComment(): void {
    const startCol = this.column;
    this.pos += 2;
    this.column += 2;
    let value = "";
    while (this.pos < this.input.length && this.input[this.pos] !== "\n") {
      value += this.input[this.pos];
      this.pos++;
      this.column++;
    }
    this.emit("comment", value.trim(), startCol);
  }

  private readString(quote: string): void {
    const startCol = this.column;
    this.pos++;
    this.column++;
    let value = "";
    while (this.pos < this.input.length && this.input[this.pos] !== quote) {
      if (this.input[this.pos] === "\\") {
        this.pos++;
        this.column++;
      }
      value += this.input[this.pos];
      this.pos++;
      this.column++;
    }
    this.pos++;
    this.column++; // closing quote
    this.emit("string", value, startCol);
  }

  private readBracket(): void {
    const startCol = this.column;
    this.pos++;
    this.column++; // skip [
    let value = "";
    while (this.pos < this.input.length && this.input[this.pos] !== "]") {
      value += this.input[this.pos];
      this.pos++;
      this.column++;
    }
    this.pos++;
    this.column++; // skip ]
    this.emit("bracket", value.trim(), startCol);
  }

  private readDirective(): void {
    const startCol = this.column;
    let value = "@";
    this.pos++;
    this.column++;
    while (this.pos < this.input.length && isIdentChar(this.input[this.pos])) {
      value += this.input[this.pos];
      this.pos++;
      this.column++;
    }
    this.emit("keyword", value, startCol);
  }

  private readIdentifier(): void {
    const startCol = this.column;
    let value = "";
    while (this.pos < this.input.length && isIdentChar(this.input[this.pos])) {
      value += this.input[this.pos];
      this.pos++;
      this.column++;
    }
    const type = KEYWORDS.has(value) ? "keyword" : "identifier";
    this.emit(type as DSLToken["type"], value, startCol);
  }

  // --- Context-sensitive checks ---

  private tryVisibility(ch: string): boolean {
    if (!["+", "-", "#", "~"].includes(ch)) return false;
    if (!this.isInsideBlock()) return false;
    this.emitSingle("visibility", ch);
    return true;
  }

  private tryERDPrimaryKey(ch: string): boolean {
    if (ch !== "*") return false;
    if (!this.isInsideEntityBlock()) return false;
    this.emitSingle("operator", "*");
    return true;
  }

  private tryRelation(): boolean {
    for (const rel of RELATION_SYMBOLS) {
      if (this.input.substring(this.pos, this.pos + rel.length) === rel) {
        this.emit("symbol", rel, this.column);
        this.pos += rel.length;
        this.column += rel.length;
        return true;
      }
    }
    return false;
  }

  // --- Context helpers ---

  private isInsideBlock(): boolean {
    let depth = 0;
    for (const t of this.tokens) {
      if (t.type === "punctuation" && t.value === "{") depth++;
      if (t.type === "punctuation" && t.value === "}") depth--;
    }
    return depth > 0;
  }

  private isInsideEntityBlock(): boolean {
    let inEntity = false;
    let depth = 0;
    for (const t of this.tokens) {
      if (t.type === "keyword" && t.value === "entity") inEntity = true;
      if (t.type === "punctuation" && t.value === "{") depth++;
      if (t.type === "punctuation" && t.value === "}") {
        depth--;
        if (depth === 0) inEntity = false;
      }
    }
    return inEntity && depth > 0;
  }
}
