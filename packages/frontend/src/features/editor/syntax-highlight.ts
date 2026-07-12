/**
 * Token-based syntax highlighting for the DSL editor.
 * Produces HTML with span classes for each token type.
 */

const KEYWORDS = new Set([
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
]);

const RELATIONS = [
  "<<include>>",
  "<<extend>>",
  "--|>",
  "..|>",
  "-->>",
  "-->",
  "..>",
  "o--",
  "*--",
  "->",
  "||--||",
  "||--o{",
  "}o--||",
  "}o--o{",
];

export function highlightCode(code: string): string {
  return code.split("\n").map(highlightLine).join("\n");
}

function highlightLine(line: string): string {
  const commentIdx = line.indexOf("//");
  let main = commentIdx >= 0 ? line.substring(0, commentIdx) : line;
  const comment =
    commentIdx >= 0 ? wrap("hl-comment", esc(line.substring(commentIdx))) : "";

  const tokens: string[] = [];
  let i = 0;

  while (i < main.length) {
    const ch = main[i];

    // Whitespace
    if (ch === " " || ch === "\t") {
      let ws = "";
      while (i < main.length && (main[i] === " " || main[i] === "\t")) {
        ws += main[i];
        i++;
      }
      tokens.push(ws);
      continue;
    }

    // String
    if (ch === '"' || ch === "'") {
      const q = ch;
      let s = q;
      i++;
      while (i < main.length && main[i] !== q) {
        if (main[i] === "\\") {
          s += main[i];
          i++;
        }
        s += main[i];
        i++;
      }
      if (i < main.length) {
        s += main[i];
        i++;
      }
      tokens.push(wrap("hl-string", esc(s)));
      continue;
    }

    // Directive
    if (ch === "@") {
      let d = "@";
      i++;
      while (i < main.length && /[a-zA-Z_]/.test(main[i])) {
        d += main[i];
        i++;
      }
      tokens.push(wrap("hl-directive", esc(d)));
      continue;
    }

    // Bracket
    if (ch === "[") {
      let b = "[";
      i++;
      while (i < main.length && main[i] !== "]") {
        b += main[i];
        i++;
      }
      if (i < main.length) {
        b += main[i];
        i++;
      }
      tokens.push(wrap("hl-bracket", esc(b)));
      continue;
    }

    // Visibility
    if (
      (ch === "+" || ch === "-" || ch === "#" || ch === "~") &&
      i + 1 < main.length &&
      /[a-zA-Z_]/.test(main[i + 1])
    ) {
      tokens.push(wrap("hl-visibility", esc(ch)));
      i++;
      continue;
    }

    // Relations
    let foundRel = false;
    for (const rel of RELATIONS) {
      if (main.substring(i, i + rel.length) === rel) {
        tokens.push(wrap("hl-relation", esc(rel)));
        i += rel.length;
        foundRel = true;
        break;
      }
    }
    if (foundRel) continue;

    // Identifier/keyword
    if (/[a-zA-Z_]/.test(ch)) {
      let w = "";
      while (i < main.length && /[a-zA-Z0-9_]/.test(main[i])) {
        w += main[i];
        i++;
      }
      tokens.push(KEYWORDS.has(w) ? wrap("hl-keyword", esc(w)) : esc(w));
      continue;
    }

    // Colon + type
    if (ch === ":") {
      tokens.push(esc(":"));
      i++;
      let ws = "";
      while (i < main.length && main[i] === " ") {
        ws += " ";
        i++;
      }
      tokens.push(ws);
      if (i < main.length && /[a-zA-Z_]/.test(main[i])) {
        let t = "";
        while (i < main.length && /[a-zA-Z0-9_]/.test(main[i])) {
          t += main[i];
          i++;
        }
        tokens.push(wrap("hl-type", esc(t)));
      }
      continue;
    }

    tokens.push(esc(ch));
    i++;
  }

  return tokens.join("") + comment;
}

function wrap(cls: string, content: string): string {
  return `<span class="${cls}">${content}</span>`;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
