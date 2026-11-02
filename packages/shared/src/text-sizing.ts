import type { Size } from "./types";

/**
 * Wraps a single line or multiline text (with explicit `\n`) into visual lines
 * that fit within `maxChars` characters per line.
 */
export function wrapMultilineText(
  text: string,
  maxChars: number,
): { lines: string[]; isHeaderLine: boolean[] } {
  if (!text) return { lines: [], isHeaderLine: [] };

  const rawLines = text.split("\n");
  const hasExplicitNewline = rawLines.length > 1;
  const lines: string[] = [];
  const isHeaderLine: boolean[] = [];
  const safeMaxChars = Math.max(10, maxChars);

  rawLines.forEach((rawLine, paragraphIdx) => {
    const trimmed = rawLine.trim();
    if (!trimmed) return;
    const isHeader = hasExplicitNewline && paragraphIdx === 0;

    if (trimmed.length <= safeMaxChars) {
      lines.push(trimmed);
      isHeaderLine.push(isHeader);
    } else {
      const words = trimmed.split(/\s+/);
      let currentLine = "";
      for (const word of words) {
        if (!currentLine) {
          currentLine = word;
        } else if ((currentLine + " " + word).length <= safeMaxChars) {
          currentLine += " " + word;
        } else {
          lines.push(currentLine);
          isHeaderLine.push(isHeader);
          currentLine = word;
        }
      }
      if (currentLine) {
        lines.push(currentLine);
        isHeaderLine.push(isHeader);
      }
    }
  });

  return { lines, isHeaderLine };
}

/**
 * Returns the usable text width (`maxWidth` passed to SvgMultilineText)
 * for a given node type and box width.
 */
export function getInnerTextMaxWidth(type: string, boxWidth: number): number {
  switch (type) {
    case "start":
    case "end":
      return Math.max(40, boxWidth - 28);
    case "decision":
      return Math.max(40, Math.floor(boxWidth * 0.72));
    case "io":
      return Math.max(40, boxWidth - 34);
    case "subroutine":
      return Math.max(40, boxWidth - 28);
    case "connector":
      return Math.max(24, boxWidth - 8);
    default:
      return Math.max(40, boxWidth - 20);
  }
}

/**
 * Computes optimal wrapped width and height for flowchart, activity, state,
 * and general text-based nodes so long descriptions wrap cleanly into
 * well-proportioned cards instead of stretching horizontally.
 */
export function computeFlowNodeSize(
  type: string,
  name: string,
  fontSize = 13,
  diagramType?: string,
): Size {
  const cleanName = (name || "").trim();

  // Activity diagram special symbols
  if (diagramType === "activity") {
    if (
      (type === "start" && (cleanName === "start" || cleanName === "●" || !cleanName)) ||
      (type === "end" && (cleanName === "end" || cleanName === "◉" || !cleanName))
    ) {
      return { width: 30, height: 30 };
    }
  }

  if (type === "merge" && (cleanName === "◇" || cleanName === "merge" || !cleanName)) {
    return { width: 40, height: 40 };
  }
  if (type === "fork" || type === "join") {
    return { width: 120, height: 8 };
  }
  if (type === "initial" || type === "final") {
    return { width: 28, height: 28 };
  }
  if (type === "connector" && cleanName.length <= 4) {
    return { width: 48, height: 48 };
  }

  const approxCharWidth = fontSize * 0.58;
  const lineHeight = fontSize + 4;

  // Target width bounds depending on shape
  let minWidth = 140;
  let maxWidth = 380;
  let horizontalPad = 36; // boxWidth - innerusable
  let verticalPad = 24;

  if (type === "start" || type === "end") {
    minWidth = 120;
    maxWidth = 320;
    horizontalPad = 48;
    verticalPad = 24;
  } else if (type === "decision") {
    minWidth = 130;
    maxWidth = 300;
    horizontalPad = 60;
    verticalPad = 36;
  } else if (type === "io" || type === "subroutine") {
    minWidth = 150;
    maxWidth = 380;
    horizontalPad = 52;
    verticalPad = 26;
  } else if (type === "database" || type === "document") {
    minWidth = 150;
    maxWidth = 380;
    horizontalPad = 38;
    verticalPad = 34;
  }

  // Determine how many characters fit per line at maxWidth
  const maxInnerW = getInnerTextMaxWidth(type, maxWidth);
  const maxCharsAtCap = Math.max(
    14,
    Math.floor((maxInnerW - 16) / approxCharWidth),
  );

  const initialWrap = wrapMultilineText(cleanName, maxCharsAtCap);
  const longestLineChars = Math.max(
    1,
    ...initialWrap.lines.map((l) => l.length),
  );

  let width: number;
  if (type === "decision") {
    const rawW = Math.ceil((longestLineChars * approxCharWidth + 24) / 0.72);
    width = Math.min(maxWidth, Math.max(minWidth, rawW));
  } else {
    const rawW = Math.ceil(longestLineChars * approxCharWidth + horizontalPad);
    width = Math.min(maxWidth, Math.max(minWidth, rawW));
  }

  // Re-wrap using the exact final width so line count matches SvgMultilineText 100%
  const finalInnerW = getInnerTextMaxWidth(type, width);
  const finalMaxChars = Math.max(
    12,
    Math.floor((finalInnerW - 16) / approxCharWidth),
  );
  const finalWrap = wrapMultilineText(cleanName, finalMaxChars);
  const lineCount = Math.max(1, finalWrap.lines.length);

  let height: number;
  if (type === "decision") {
    height = Math.max(
      80,
      Math.ceil((lineCount * lineHeight + verticalPad) / 0.68),
    );
  } else if (type === "start" || type === "end") {
    height = Math.max(44, lineCount * lineHeight + verticalPad);
  } else if (type === "database") {
    height = Math.max(60, lineCount * lineHeight + verticalPad);
  } else {
    height = Math.max(48, lineCount * lineHeight + verticalPad);
  }

  const evenW = Math.ceil(width / 2) * 2;
  const evenH = Math.ceil(height / 2) * 2;
  return { width: evenW, height: evenH };
}
