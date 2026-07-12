/**
 * Token classification rules for the DSL lexer.
 * Centralized so both lexer and syntax highlighter can share them.
 */

export const KEYWORDS = new Set([
  "class",
  "interface",
  "abstract",
  "enum",
  "participant",
  "actor",
  "usecase",
  "system",
  "state",
  "activity",
  "action",
  "decision",
  "merge",
  "fork",
  "join",
  "start",
  "end",
  "process",
  "io",
  "document",
  "database",
  "subroutine",
  "entity",
  "component",
  "node",
  "device",
  "artifact",
  "package",
  "swimlane",
  "as",
  "static",
  "initial",
  "final",
  "connector",
  "preparation",
  "provided",
  "required",
  "interface",
]);

/** Relation symbols ordered by length (longest first for greedy matching). */
export const RELATION_SYMBOLS = [
  "<<include>>",
  "<<extend>>",
  "||--||",
  "||--o{",
  "}o--||",
  "}o--o{",
  "--|>",
  "..|>",
  "-->>",
  "-->",
  "..>",
  "o--",
  "*--",
  "->",
];

export const PUNCTUATION = new Set(["{", "}", "(", ")", ":", ",", ";"]);

export const OPERATOR_CHARS = new Set(["<", ">", "-", ".", "*", "o", "|", "}"]);

export function isIdentStart(ch: string): boolean {
  return /[a-zA-Z_]/.test(ch);
}

export function isIdentChar(ch: string): boolean {
  return /[a-zA-Z0-9_]/.test(ch);
}
