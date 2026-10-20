import { useCallback } from "react";
import type { Diagram } from "@uml-editor/shared";
import {
  parseTypeScriptToClassDiagram,
  isMermaidCode,
  parseMermaidToDSL,
} from "../services/code-parser";

interface UseFileImportOptions {
  onCodeImport: (code: string) => void;
  onDiagramImport: (diagram: Diagram) => void;
}

/**
 * Handles file import via drag-and-drop or file picker.
 * Supports .json (diagram), .uml/.txt (DSL code), .ts/.js/.java (auto-generate class diagram),
 * and .mmd/.mermaid (Mermaid diagram auto-conversion).
 */
export function useFileImport({
  onCodeImport,
  onDiagramImport,
}: UseFileImportOptions) {
  const handleFile = useCallback(
    async (file: File) => {
      const text = await file.text();

      // JSON diagram import
      if (file.name.endsWith(".json")) {
        try {
          const diagram = JSON.parse(text) as Diagram;
          if (diagram.nodes && diagram.edges && diagram.type) {
            onDiagramImport(diagram);
            return;
          }
        } catch {
          /* not valid JSON diagram */
        }
      }

      // Mermaid diagram import (.mmd, .mermaid or detected Mermaid syntax)
      if (
        file.name.endsWith(".mmd") ||
        file.name.endsWith(".mermaid") ||
        isMermaidCode(text)
      ) {
        const diagramName = file.name.replace(/\.\w+$/, "");
        const dsl = parseMermaidToDSL(text, diagramName);
        onCodeImport(dsl);
        try {
          const { api } = await import("../services/api");
          const res = await api.compile(dsl);
          if (res.success && res.diagram) {
            onDiagramImport(res.diagram);
          }
        } catch {
          /* ignore compile error, DSL is still imported */
        }
        return;
      }

      // TypeScript/JavaScript → auto-generate class diagram
      if (
        file.name.endsWith(".ts") ||
        file.name.endsWith(".tsx") ||
        file.name.endsWith(".js") ||
        file.name.endsWith(".java")
      ) {
        const diagram = parseTypeScriptToClassDiagram(
          text,
          file.name.replace(/\.\w+$/, ""),
        );
        if (diagram.nodes.length > 0) {
          onDiagramImport(diagram);
          try {
            const { api } = await import("../services/api");
            const dsl = await api.exportDiagram(diagram, { format: "dsl" });
            if (dsl) onCodeImport(dsl);
          } catch {
            /* ignore fallback */
          }
          return;
        }
      }

      // Treat as DSL code
      onCodeImport(text);
    },
    [onCodeImport, onDiagramImport],
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer?.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer!.dropEffect = "copy";
  }, []);

  const openFilePicker = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,.uml,.txt,.ts,.tsx,.js,.java,.mmd,.mermaid";
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) handleFile(file);
    };
    input.click();
  }, [handleFile]);

  return { handleDrop, handleDragOver, openFilePicker };
}
