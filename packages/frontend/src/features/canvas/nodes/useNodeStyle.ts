/**
 * Shared hook/utility to merge node style with defaults.
 * Automatically adapts to canvas dark/light mode for sleek visuals.
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

export function resolveStyle(nodeStyle?: Record<string, any>): ResolvedStyle {
  const isLight = typeof window !== "undefined" && localStorage.getItem("uml-canvas-theme") === "light";

  const defaults: ResolvedStyle = {
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
    fontSize: 13,
    fontColor: isLight ? "#1e293b" : "#f1f5f9",
    fontWeight: "normal",
    fontStyle: "normal",
    backgroundColor: isLight ? "#ffffff" : "#1e1e36",
    borderColor: isLight ? "#cbd5e1" : "#43436d",
    borderWidth: 1.5,
    borderRadius: 8,
    borderStyle: "solid",
    opacity: 1,
  };

  return { ...defaults, ...(nodeStyle || {}) };
}

export function isDarkCanvas(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("uml-canvas-theme") !== "light";
}

export function getThemeColor(lightColor: string, darkColor: string, customColor?: string): string {
  if (customColor) return customColor;
  return isDarkCanvas() ? darkColor : lightColor;
}

/** Returns the stroke color considering selection state. */
export function getStroke(s: ResolvedStyle, isSelected: boolean): string {
  return isSelected ? "#818cf8" : s.borderColor;
}

/** Returns stroke width considering selection state. */
export function getStrokeWidth(s: ResolvedStyle, isSelected: boolean): number {
  return isSelected ? 2.5 : s.borderWidth;
}
