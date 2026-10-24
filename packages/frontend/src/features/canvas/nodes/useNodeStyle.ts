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

export function getContrastTextColor(bgColor?: string): string {
  if (!bgColor) return isDarkCanvas() ? "#f1f5f9" : "#1e293b";
  if (bgColor === "transparent") return isDarkCanvas() ? "#f1f5f9" : "#1e293b";
  
  let hex = bgColor.trim().replace("#", "");
  if (hex.startsWith("rgba") || hex.startsWith("rgb")) {
    const match = hex.match(/\d+/g);
    if (match && match.length >= 3) {
      const r = parseInt(match[0], 10);
      const g = parseInt(match[1], 10);
      const b = parseInt(match[2], 10);
      const yiq = (r * 299 + g * 587 + b * 114) / 1000;
      return yiq >= 145 ? "#0f172a" : "#f8fafc";
    }
  }
  if (hex.length === 3) {
    hex = hex.split("").map((c) => c + c).join("");
  }
  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 145 ? "#0f172a" : "#f8fafc";
  }
  return isDarkCanvas() ? "#f1f5f9" : "#1e293b";
}

export function isDarkCanvas(themeOverride?: string): boolean {
  if (themeOverride) return themeOverride !== "light";
  if (typeof window === "undefined") return false;
  return localStorage.getItem("uml-canvas-theme") !== "light";
}

export function resolveStyle(nodeStyle?: Record<string, any>, themeOverride?: string): ResolvedStyle {
  const isLight = !isDarkCanvas(themeOverride);

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

  const merged = { ...defaults, ...(nodeStyle || {}) };
  // If custom background is provided without an explicit fontColor, guarantee high contrast text
  if (nodeStyle?.backgroundColor && !nodeStyle?.fontColor) {
    merged.fontColor = getContrastTextColor(nodeStyle.backgroundColor);
  }

  return merged;
}

export function getFlowchartColors(
  type: string,
  isDark: boolean,
  customStyle?: Record<string, any>
): { bg: string; border: string; font: string } {
  const hasCustomBg = !!customStyle?.backgroundColor;
  const hasCustomBorder = !!customStyle?.borderColor;
  const hasCustomFont = !!customStyle?.fontColor;

  if (isDark) {
    // Dark Theme: modern dark surfaces with distinctive theme accents
    let bg = "#1a2035"; // process (navy/indigo surface)
    let border = "#3b82f6";
    let text = "#f1f5f9";

    switch (type) {
      case "start":
        bg = "#14291e";
        border = "#22c55e";
        text = "#86efac";
        break;
      case "end":
        bg = "#2a151b";
        border = "#ef4444";
        text = "#fca5a5";
        break;
      case "process":
        bg = "#1a2035";
        border = "#3b82f6";
        text = "#f1f5f9";
        break;
      case "decision":
        bg = "#262014";
        border = "#eab308";
        text = "#fef08a";
        break;
      case "io":
        bg = "#231834";
        border = "#a855f7";
        text = "#e9d5ff";
        break;
      case "database":
        bg = "#13262a";
        border = "#06b6d4";
        text = "#a5f3fc";
        break;
      case "document":
        bg = "#2a1c14";
        border = "#f97316";
        text = "#fed7aa";
        break;
      case "subroutine":
        bg = "#142330";
        border = "#0ea5e9";
        text = "#bae6fd";
        break;
      case "connector":
        bg = "#1f1d2e";
        border = "#818cf8";
        text = "#e0e7ff";
        break;
      default:
        bg = "#1e1e36";
        border = "#43436d";
        text = "#f1f5f9";
        break;
    }

    const finalBg = hasCustomBg ? customStyle!.backgroundColor : bg;
    const finalBorder = hasCustomBorder ? customStyle!.borderColor : border;
    const finalFont = hasCustomFont
      ? customStyle!.fontColor
      : hasCustomBg
        ? getContrastTextColor(finalBg)
        : text;

    return { bg: finalBg, border: finalBorder, font: finalFont };
  } else {
    // Light Theme: soft pastel cards with dark readable text
    let bg = "#E3F2FD";
    let border = "#60a5fa";
    let text = "#0f172a";

    switch (type) {
      case "start":
        bg = "#C8E6C9";
        border = "#4ade80";
        text = "#14532d";
        break;
      case "end":
        bg = "#FFCDD2";
        border = "#f87171";
        text = "#7f1d1d";
        break;
      case "process":
        bg = "#E3F2FD";
        border = "#60a5fa";
        text = "#0f172a";
        break;
      case "decision":
        bg = "#FFF9C4";
        border = "#facc15";
        text = "#0f172a";
        break;
      case "io":
        bg = "#F3E5F5";
        border = "#c084fc";
        text = "#0f172a";
        break;
      case "database":
        bg = "#E8F5E9";
        border = "#2dd4bf";
        text = "#0f172a";
        break;
      case "document":
        bg = "#FFF3E0";
        border = "#fb923c";
        text = "#0f172a";
        break;
      case "subroutine":
        bg = "#E0F7FA";
        border = "#38bdf8";
        text = "#0f172a";
        break;
      case "connector":
        bg = "#EEF2FF";
        border = "#818cf8";
        text = "#0f172a";
        break;
      default:
        bg = "#ffffff";
        border = "#cbd5e1";
        text = "#0f172a";
        break;
    }

    const finalBg = hasCustomBg ? customStyle!.backgroundColor : bg;
    const finalBorder = hasCustomBorder ? customStyle!.borderColor : border;
    const finalFont = hasCustomFont
      ? customStyle!.fontColor
      : hasCustomBg
        ? getContrastTextColor(finalBg)
        : text;

    return { bg: finalBg, border: finalBorder, font: finalFont };
  }
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
