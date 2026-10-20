import { useState, useCallback, useEffect } from "react";

export type CanvasTheme = "light" | "dark";

export function useTheme() {
  const [canvasTheme, setCanvasTheme] = useState<CanvasTheme>(() => {
    const saved = localStorage.getItem("uml-canvas-theme");
    return saved === "light" || saved === "dark" ? saved : "dark";
  });

  useEffect(() => {
    localStorage.setItem("uml-canvas-theme", canvasTheme);
  }, [canvasTheme]);

  const toggleCanvasTheme = useCallback(() => {
    setCanvasTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const canvasColors =
    canvasTheme === "light"
      ? {
          bg: "#f8fafc",
          grid: "#e2e8f0",
          nodeStroke: "#94a3b8",
          nodeFill: "#ffffff",
          text: "#1e293b",
        }
      : {
          bg: "#12121f",
          grid: "#202038",
          nodeStroke: "#3e3e60",
          nodeFill: "#1a1a2e",
          text: "#e2e8f0",
        };

  return { canvasTheme, toggleCanvasTheme, canvasColors };
}
