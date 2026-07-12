/**
 * Node/Edge styling properties.
 * Applied per-node or per-edge for visual customization.
 */
export interface NodeStyle {
  fontFamily?: string;
  fontSize?: number;
  fontColor?: string;
  fontWeight?: "normal" | "bold" | "light";
  fontStyle?: "normal" | "italic";
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  borderStyle?: "solid" | "dashed" | "dotted" | "none";
  opacity?: number;
}

export interface EdgeStyle {
  strokeColor?: string;
  strokeWidth?: number;
  fontFamily?: string;
  fontSize?: number;
  fontColor?: string;
}

export const DEFAULT_NODE_STYLE: NodeStyle = {
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

export const DEFAULT_EDGE_STYLE: EdgeStyle = {
  strokeColor: "#555555",
  strokeWidth: 1.5,
  fontFamily: "Inter, system-ui, sans-serif",
  fontSize: 11,
  fontColor: "#444444",
};

export const FONT_OPTIONS = [
  { label: "System (Inter)", value: "Inter, system-ui, sans-serif" },
  { label: "Monospace", value: "'JetBrains Mono', monospace" },
  { label: "Serif", value: "'Georgia', serif" },
  { label: "Handwritten", value: "'Comic Sans MS', cursive" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Times New Roman", value: "'Times New Roman', serif" },
];

export const FONT_SIZES = [9, 10, 11, 12, 13, 14, 16, 18, 20, 24];

export const COLOR_PRESETS = [
  "#333333",
  "#555555",
  "#1e40af",
  "#dc2626",
  "#16a34a",
  "#9333ea",
  "#ea580c",
  "#0891b2",
  "#4f46e5",
  "#be185d",
  "#ffffff",
  "#f8fafc",
  "#fef3c7",
  "#dcfce7",
  "#dbeafe",
  "#fce7f3",
  "#e0e7ff",
  "#f0fdf4",
  "#fef9c3",
  "#ffe4e6",
];
