/**
 * UML Flow - Centralized Application Configuration
 *
 * Single Source of Truth for:
 * - Brand & App Identity
 * - Design System Tokens (Colors, Fonts, Radius, Shadows)
 * - Canvas & Diagram Defaults (Grid, Zoom, Layout Spacing)
 * - Localization Settings (Default Language, Supported Locales)
 * - Editor & Syntax Tokens
 */

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  surface: string;
  surface2: string;
  surface3: string;
  surface4: string;
  border: string;
  borderSubtle: string;
  text: string;
  textMuted: string;
  textInverse: string;
  success: string;
  error: string;
  warning: string;
  info: string;
}

export const APP_CONFIG = {
  app: {
    name: "UML Flow",
    tagline: "Modern Declarative UML Diagramming",
    version: "2.1.0",
    author: "UML Flow Team",
    githubUrl: "https://github.com/josapratama/uml-flow",
    defaultLocale: "id" as const,
    supportedLocales: ["id", "en"] as const,
  },

  theme: {
    fonts: {
      sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: '"JetBrains Mono", "Fira Code", "Cascadia Code", Menlo, Monaco, Consolas, monospace',
      display: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    fontSizes: {
      xs: "11px",
      sm: "12px",
      base: "13px",
      md: "14px",
      lg: "16px",
      xl: "20px",
      "2xl": "24px",
    },
    radii: {
      sm: "4px",
      md: "8px",
      lg: "12px",
      xl: "16px",
      full: "9999px",
    },
    colors: {
      // Accent palette
      accent: {
        primary: "#6366f1", // Indigo 500
        hover: "#818cf8",   // Indigo 400
        active: "#4f46e5",  // Indigo 600
        subtle: "rgba(99, 102, 241, 0.12)",
        glow: "rgba(99, 102, 241, 0.4)",
      },
      // Status semantics
      status: {
        success: "#10b981", // Emerald 500
        warning: "#f59e0b", // Amber 500
        error: "#ef4444",   // Red 500
        info: "#06b6d4",    // Cyan 500
      },
      // Dark Theme (Default)
      dark: {
        surface: "#0f0f1a",
        surface2: "#1a1a2e",
        surface3: "#252540",
        surface4: "#2f2f4a",
        border: "#3a3a5c",
        borderSubtle: "rgba(255, 255, 255, 0.08)",
        text: "#e2e8f0",
        textMuted: "#94a3b8",
        textInverse: "#0f0f1a",
        canvasBg: "#12121f",
        gridDot: "#222238",
      },
      // Light Theme
      light: {
        surface: "#f8fafc",
        surface2: "#ffffff",
        surface3: "#f1f5f9",
        surface4: "#e2e8f0",
        border: "#cbd5e1",
        borderSubtle: "rgba(0, 0, 0, 0.06)",
        text: "#1e293b",
        textMuted: "#64748b",
        textInverse: "#ffffff",
        canvasBg: "#f8fafc",
        gridDot: "#e2e8f0",
      },
      // Diagram edge and node defaults
      diagram: {
        nodeDefaultStroke: "#475569",
        nodeDefaultFill: "#ffffff",
        nodeSelectedBorder: "#6366f1",
        edgeDefaultStroke: "#555555",
        edgeSelectedStroke: "#6366f1",
        edgeLabelBg: "#ffffff",
        edgeLabelBorder: "#cbd5e1",
        edgeLabelText: "#334155",
      },
      // Syntax highlighter colors
      syntax: {
        keyword: "#c792ea",
        string: "#c3e88d",
        comment: "#64748b",
        directive: "#ffcb6b",
        visibility: "#89ddff",
        relation: "#f07178",
        type: "#82aaff",
        bracket: "#ffcb6b",
      },
    },
  },

  canvas: {
    defaultZoom: 1,
    minZoom: 0.1,
    maxZoom: 3.0,
    zoomStep: 0.15,
    gridSize: 20,
    snapThreshold: 10,
    defaultRouting: "straight" as "straight" | "orthogonal",
    defaultTheme: "light" as "light" | "dark",
    corridorSpacing: 22,
    compositeSubstateGap: 84,
  },

  layout: {
    nodeSpacing: {
      default: 80,
      state: 90,
      usecase: 70,
    },
    rankSpacing: {
      default: 120,
      state: 200,
      usecase: 180,
      deployment: 150,
    },
  },
} as const;

export type AppConfig = typeof APP_CONFIG;
export type SupportedLocale = typeof APP_CONFIG.app.supportedLocales[number];
