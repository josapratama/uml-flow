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
    pos = this.parseDiagramDeclaration(tokens, pos, diagram);

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
  ): number {
    // Scan for @diagram directive
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type === "keyword" && tokens[i].value === "@diagram") {
        i++;
        // Skip newlines
        while (i < tokens.length && tokens[i].type === "newline") i++;
        // Read name
        if (i < tokens.length && tokens[i].type === "string") {
          diagram.name = tokens[i].value;
          i++;
        }
        while (i < tokens.length && tokens[i].type === "newline") i++;
        // Read type
        if (
          i < tokens.length &&
          (tokens[i].type === "keyword" || tokens[i].type === "identifier")
        ) {
          const t = tokens[i].value as DiagramType;
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
          if (validTypes.includes(t)) diagram.type = t;
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
