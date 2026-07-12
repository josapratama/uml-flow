/**
 * Shared hook/utility to merge node style with defaults.
 * Used by all node renderers to apply custom styling.
 */

export interface ResolvedStyle {
  fontFamily: string;
  fontSize: number;
  fontColor: string;
  fontWeight: "normal" | "bold" | "light";
  fontStyle: "normal" | "italic";
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  borderStyle: "solid" | "dashed" | "dotted" | "none";
  opacity: number;
}

const DEFAULTS: ResolvedStyle = {
  fontFamily: "Inter, system-ui, sans-serif",
  fontSize: 13,
  fontColor: "#333333",
  fontWeight: "normal",
  fontStyle: "normal",
  backgroundColor: "#ffffff",
  borderColor: "#444444",
  borderWidth: 1.5,
  borderRadius: 4,
  borderStyle: "solid",
  opacity: 1,
};

/** Merges custom node style with defaults. */
export function resolveStyle(nodeStyle?: Record<string, any>): ResolvedStyle {
  return { ...DEFAULTS, ...(nodeStyle || {}) };
}

/** Returns the stroke color considering selection state. */
export function getStroke(s: ResolvedStyle, isSelected: boolean): string {
  return isSelected ? "#6366f1" : s.borderColor;
}

/** Returns stroke width considering selection state. */
export function getStrokeWidth(s: ResolvedStyle, isSelected: boolean): number {
  return isSelected ? 2 : s.borderWidth;
}
