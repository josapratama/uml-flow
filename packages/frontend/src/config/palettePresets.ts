export interface PalettePreset {
  name: string;
  bg: string;
  border: string;
  font: string;
  label: string;
  tag?: string;
}

export const PALETTE_PRESETS: PalettePreset[] = [
  {
    name: "Skripsi Formal",
    bg: "#ffffff",
    border: "#475569",
    font: "#0f172a",
    label: "🎓 Skripsi",
    tag: "🎓 Skripsi",
  },
  {
    name: "Modern Indigo",
    bg: "#eef2ff",
    border: "#6366f1",
    font: "#1e1b4b",
    label: "💎 Indigo",
    tag: "💎 Indigo",
  },
  {
    name: "Forest Emerald",
    bg: "#ecfdf5",
    border: "#10b981",
    font: "#064e3b",
    label: "🌿 Emerald",
    tag: "🌿 Emerald",
  },
  {
    name: "Sunset Amber",
    bg: "#fffbeb",
    border: "#f59e0b",
    font: "#78350f",
    label: "🌅 Amber",
    tag: "🌅 Amber",
  },
  {
    name: "Sky Cyan",
    bg: "#f0f9ff",
    border: "#0ea5e9",
    font: "#0c4a6e",
    label: "☁️ Sky",
    tag: "☁️ Sky",
  },
  {
    name: "Cyber Violet",
    bg: "#181825",
    border: "#a855f7",
    font: "#f8fafc",
    label: "🌌 Cyber",
    tag: "🌌 Cyber",
  },
];
