import { useState, useCallback } from "react";

export type CanvasTheme = "light" | "dark";

export function useTheme() {
  const [canvasTheme, setCanvasTheme] = useState<CanvasTheme>("light");

  const toggleCanvasTheme = useCallback(() => {
    setCanvasTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const canvasColors =
    canvasTheme === "light"
      ? {
          bg: "#fafafa",
          grid: "#e2e8f0",
          nodeStroke: "#444",
          nodeFill: "#fff",
          text: "#333",
        }
      : {
          bg: "#1a1a2e",
          grid: "#2a2a4a",
          nodeStroke: "#6366f1",
          nodeFill: "#252540",
          text: "#e2e8f0",
        };

  return { canvasTheme, toggleCanvasTheme, canvasColors };
}
