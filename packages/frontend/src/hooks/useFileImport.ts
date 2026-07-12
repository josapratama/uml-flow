import { useCallback } from "react";
import type { Diagram } from "@uml-editor/shared";
import { parseTypeScriptToClassDiagram } from "../services/code-parser";

interface UseFileImportOptions {
  onCodeImport: (code: string) => void;
  onDiagramImport: (diagram: Diagram) => void;
}

/**
 * Handles file import via drag-and-drop or file picker.
 * Supports .json (diagram), .uml/.txt (DSL code), .ts/.js/.java (auto-generate class diagram).
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
    input.accept = ".json,.uml,.txt,.ts,.tsx,.js,.java";
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) handleFile(file);
    };
    input.click();
  }, [handleFile]);

  return { handleDrop, handleDragOver, openFilePicker };
}
