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
  parse(input: string): ParseResult {
    const lexer = new Lexer(input);
    const tokens = lexer.tokenize().filter((t) => t.type !== "comment");
    const diagram = this.createEmptyDiagram();
    const errors: any[] = [];

    let pos = 0;

    // First pass: find @diagram declaration
    pos = this.parseDiagramDeclaration(tokens, pos, diagram, errors);

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
