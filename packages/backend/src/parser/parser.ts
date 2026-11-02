import type {
  DSLToken,
  Diagram,
  DiagramType,
  ParseResult,
} from "@uml-editor/shared";
import { Lexer } from "./lexer";
import { BaseDiagramParser } from "./base-parser";
import {
  ClassDiagramParser,
  SequenceDiagramParser,
  UseCaseDiagramParser,
  ActivityDiagramParser,
  StateDiagramParser,
  FlowchartParser,
  ERDParser,
  ComponentDiagramParser,
  DeploymentDiagramParser,
} from "./diagrams";

/**
 * Main parser orchestrator.
 * Tokenizes input, detects diagram type, delegates to specific parser.
 */
export class Parser {
  private static FLOW_TYPES =
    "start|end|process|decision|io|document|database|subroutine|connector|preparation";

  /**
   * Normalizes the shorthand `[process] Some text (id)` into the canonical
   * `process "Some text" as id`. Line count is preserved so error positions stay valid.
   * Literal "\n" sequences inside the text are flattened to " - ".
   */
  private normalizeShorthand(input: string): string {
    const re = new RegExp(
      `^(\\s*)\\[(${Parser.FLOW_TYPES})\\]\\s*(.*?)\\s*(?:\\(([\\p{L}\\p{N}_-]+)\\))?\\s*$`,
      "u",
    );
    return input
      .split("\n")
      .map((line) => {
        const m = line.replace(/\r$/, "").match(re);
        if (!m) return line;
        const [, indent, type, rawText, alias] = m;
        const text = rawText
          .replace(/\\/g, "\\\\")
          .replace(/\\\\n/g, "\\n")
          .replace(/"/g, '\\"')
          .trim();
        return `${indent}${type} "${text || type}"${alias ? ` as ${alias}` : ""}`;
      })
      .join("\n");
  }

  /** Guess the diagram type when no @diagram declaration exists. */
  private detectType(input: string): DiagramType | null {
    if (/^\s*(process|io|subroutine|preparation|connector)\s+["'\w]/im.test(input))
      return "flowchart";
    if (/^\s*participant\s+/im.test(input)) return "sequence";
    if (/^\s*entity\s+/im.test(input)) return "erd";
    return null;
  }

  parse(rawInput: string): ParseResult {
    const input = this.normalizeShorthand(rawInput);
    const lexer = new Lexer(input);
    const tokens = lexer.tokenize().filter((t) => t.type !== "comment");
    const diagram = this.createEmptyDiagram();
    const errors: any[] = [];

    let pos = 0;

    // First pass: find @diagram declaration
    pos = this.parseDiagramDeclaration(tokens, pos, diagram, errors);

    // Auto-detect type when not declared explicitly
    const hasDeclaration = tokens.some(
      (t) => t.type === "keyword" && t.value === "@diagram",
    );
    if (!hasDeclaration) {
      const detected = this.detectType(input);
      if (detected) {
        diagram.type = detected;
        errors.push({
          line: 1,
          column: 1,
          message: `Tipe diagram terdeteksi otomatis sebagai "${detected}". Tambahkan "@diagram ${detected}" di baris pertama agar eksplisit.`,
          severity: "warning",
        });
      }
    }

    const warnIgnored = diagram.type === "class" || diagram.type === "flowchart";
    const warnedLines = new Set<number>();

    // Second pass: parse elements using diagram-specific parser
    while (pos < tokens.length) {
      // Skip newlines
      while (pos < tokens.length && tokens[pos].type === "newline") pos++;
      if (pos >= tokens.length) break;

      // Skip @diagram if encountered again
      if (tokens[pos].type === "keyword" && tokens[pos].value === "@diagram") {
        while (pos < tokens.length && tokens[pos].type !== "newline") pos++;
        continue;
      }

      const startTok = tokens[pos];
      const before = diagram.nodes.length + diagram.edges.length;
      const parser = this.createDiagramParser(diagram, tokens, pos);
      try {
        parser.parseElement();
      } catch (e: any) {
        errors.push({
          line: tokens[pos]?.line ?? 0,
          column: tokens[pos]?.column ?? 0,
          message: e.message || "Parse error",
          severity: "error",
        });
        // Skip to next line on error
        while (pos < tokens.length && tokens[pos].type !== "newline") pos++;
      }
      const newPos = parser.getPos();
      errors.push(...parser.getErrors());

      // Warn about statements that produced nothing (silently dropped input)
      const contentTypes = ["identifier", "string", "keyword", "bracket"];
      const declaresBlock =
        startTok.type === "keyword" &&
        ["class", "interface", "abstract", "enum"].includes(startTok.value);
      if (
        warnIgnored &&
        contentTypes.includes(startTok.type) &&
        !declaresBlock &&
        diagram.nodes.length + diagram.edges.length === before &&
        !warnedLines.has(startTok.line)
      ) {
        warnedLines.add(startTok.line);
        errors.push({
          line: startTok.line,
          column: startTok.column,
          message: `Baris ${startTok.line} tidak dikenali untuk diagram "${diagram.type}" dan diabaikan.`,
          severity: "warning",
        });
      }

      // Prevent infinite loop
      if (newPos <= pos) pos++;
      else pos = newPos;
    }

    return {
      success: errors.filter((e) => e.severity === "error").length === 0,
      diagram,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  private parseDiagramDeclaration(
    tokens: DSLToken[],
    pos: number,
    diagram: Diagram,
    errors: any[],
  ): number {
    const validTypes = [
      "class",
      "sequence",
      "usecase",
      "activity",
      "state",
      "flowchart",
      "erd",
      "component",
      "deployment",
    ];

    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type === "keyword" && tokens[i].value === "@diagram") {
        i++;
        while (i < tokens.length && tokens[i].type === "newline") i++;

        let name: string | undefined;
        let type: string | undefined;

        if (i < tokens.length) {
          const tok1 = tokens[i];
          if (validTypes.includes(tok1.value.toLowerCase())) {
            type = tok1.value.toLowerCase();
            i++;
          } else {
            name = tok1.value;
            i++;
            while (i < tokens.length && tokens[i].type === "newline") i++;
            if (i < tokens.length) {
              type = tokens[i].value.toLowerCase();
              i++;
            }
          }
        }

        if (name) diagram.name = name;
        if (type) {
          if (validTypes.includes(type)) {
            diagram.type = type as DiagramType;
          } else {
            errors.push({
              line: tokens[i - 1]?.line ?? 1,
              column: tokens[i - 1]?.column ?? 1,
              message: `Unknown diagram type "${type}". Expected one of: ${validTypes.join(", ")}`,
              severity: "warning",
            });
          }
        }
        break;
      }
    }
    return pos;
  }

  private createDiagramParser(
    diagram: Diagram,
    tokens: DSLToken[],
    pos: number,
  ): BaseDiagramParser {
    switch (diagram.type) {
      case "class":
        return new ClassDiagramParser(diagram, tokens, pos);
      case "sequence":
        return new SequenceDiagramParser(diagram, tokens, pos);
      case "usecase":
        return new UseCaseDiagramParser(diagram, tokens, pos);
      case "activity":
        return new ActivityDiagramParser(diagram, tokens, pos);
      case "state":
        return new StateDiagramParser(diagram, tokens, pos);
      case "flowchart":
        return new FlowchartParser(diagram, tokens, pos);
      case "erd":
        return new ERDParser(diagram, tokens, pos);
      case "component":
        return new ComponentDiagramParser(diagram, tokens, pos);
      case "deployment":
        return new DeploymentDiagramParser(diagram, tokens, pos);
      default:
        return new ClassDiagramParser(diagram, tokens, pos);
    }
  }

  private createEmptyDiagram(): Diagram {
    return {
      id: `diagram_${Date.now()}`,
      name: "Untitled",
      type: "class",
      nodes: [],
      edges: [],
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
      },
    };
  }
}
