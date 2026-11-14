import { useCallback } from "react";
import type { Diagram } from "@uml-editor/shared";
import { api } from "../../services/api";
import { showToast } from "../ui/Toast";
import { useI18n } from "../../i18n";

export function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

interface UseAppExportOptions {
  diagram: Diagram | null;
  onOpenAcademicCaption: () => void;
  onOpenThesisBundle?: () => void;
  onOpenTestCases?: () => void;
  onOpenMockData?: () => void;
  onOpenSQLExport?: () => void;
}

export function useAppExport({
  diagram,
  onOpenAcademicCaption,
  onOpenThesisBundle,
  onOpenTestCases,
  onOpenMockData,
  onOpenSQLExport,
}: UseAppExportOptions) {
  const { locale } = useI18n();
  const isId = locale === "id";

  const handleExport = useCallback(
    async (format: string) => {
      if (!diagram) return;
      try {
        switch (format) {
          case "svg": {
            const svg = await api.exportDiagram(diagram, { format: "svg" });
            downloadFile(svg, `${diagram.name}.svg`, "image/svg+xml");
            showToast(isId ? "SVG berhasil diekspor" : "SVG exported", "success");
            break;
          }
          case "json": {
            downloadFile(
              JSON.stringify(diagram, null, 2),
              `${diagram.name}.json`,
              "application/json"
            );
            showToast(isId ? "JSON berhasil diekspor" : "JSON exported", "success");
            break;
          }
          case "dsl": {
            const dsl = await api.exportDiagram(diagram, { format: "dsl" });
            downloadFile(dsl, `${diagram.name}.uml`, "text/plain");
            showToast(isId ? "DSL berhasil diekspor" : "DSL exported", "success");
            break;
          }
          case "mermaid": {
            const { exportToMermaid } = await import("../../services/mermaid-exporter");
            const mmd = exportToMermaid(diagram);
            downloadFile(mmd, `${diagram.name}.mmd`, "text/plain");
            try {
              await navigator.clipboard.writeText(mmd);
              showToast(isId ? "Kode Mermaid diunduh & disalin ke clipboard" : "Mermaid code downloaded & copied to clipboard", "success");
            } catch {
              showToast(isId ? "File Mermaid (.mmd) berhasil diekspor" : "Mermaid (.mmd) exported", "success");
            }
            break;
          }
          case "png": {
            const el = document.querySelector(
              ".canvas-svg-element"
            ) as SVGSVGElement | null;
            if (el) {
              const { exportAsPNG } = await import("../../services/export-png");
              await exportAsPNG(el, `${diagram.name}.png`);
              showToast(isId ? "PNG berhasil diekspor" : "PNG exported", "success");
            } else {
              showToast(isId ? "Tidak ada diagram untuk diekspor" : "No diagram to export", "error");
            }
            break;
          }
          case "pdf": {
            const el = document.querySelector(
              ".canvas-svg-element"
            ) as SVGSVGElement | null;
            if (el) {
              const { exportAsPDF } = await import("../../services/export-png");
              await exportAsPDF(el, diagram.name);
              showToast(isId ? "Membuka dialog cetak / simpan PDF A4..." : "Opening print / save A4 PDF dialog...", "info");
            } else {
              showToast(isId ? "Diagram tidak ditemukan untuk diekspor" : "No diagram found to export", "error");
            }
            break;
          }
          case "academic-caption": {
            onOpenAcademicCaption();
            break;
          }
          case "thesis-bundle": {
            if (onOpenThesisBundle) {
              onOpenThesisBundle();
            }
            break;
          }
          case "test-cases": {
            if (onOpenTestCases) {
              onOpenTestCases();
            }
            break;
          }
          case "mock-data": {
            if (diagram.type !== "class" && diagram.type !== "erd") {
              showToast(
                isId
                  ? "Generator Mock Data hanya didukung untuk Diagram Class dan ERD"
                  : "Mock Data generator only works for Class and ERD diagrams",
                "error"
              );
              break;
            }
            if (onOpenMockData) {
              onOpenMockData();
            }
            break;
          }
          case "clipboard-svg": {
            const svg = await api.exportDiagram(diagram, { format: "svg" });
            await navigator.clipboard.writeText(svg);
            showToast(isId ? "SVG berhasil disalin ke clipboard" : "SVG copied to clipboard", "success");
            break;
          }
          case "clipboard-png": {
            const el = document.querySelector(
              ".canvas-svg-element"
            ) as SVGSVGElement | null;
            if (!el) {
              showToast(isId ? "Tidak ada diagram untuk disalin" : "No diagram to copy", "error");
              break;
            }
            const { getFullDiagramSVG } = await import(
              "../../services/export-png"
            );
            const svgData = getFullDiagramSVG(el);
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d")!;
            const img = new Image();
            await new Promise<void>((resolve, reject) => {
              img.onload = () => {
                canvas.width = img.width * 2;
                canvas.height = img.height * 2;
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.scale(2, 2);
                ctx.drawImage(img, 0, 0);
                canvas.toBlob(async (blob) => {
                  if (blob) {
                    try {
                      await navigator.clipboard.write([
                        new ClipboardItem({ "image/png": blob }),
                      ]);
                      showToast(isId ? "PNG berhasil disalin ke clipboard" : "PNG copied to clipboard", "success");
                    } catch {
                      showToast(isId ? "Akses clipboard ditolak" : "Clipboard access denied", "error");
                    }
                  }
                  resolve();
                }, "image/png");
              };
              img.onerror = () => {
                reject(new Error("Image load failed"));
              };
              const svgBlob = new Blob([svgData], {
                type: "image/svg+xml;charset=utf-8",
              });
              img.src = URL.createObjectURL(svgBlob);
            });
            break;
          }
          case "typescript": {
            if (diagram.type !== "class") {
              showToast(
                isId ? "Ekspor TypeScript hanya didukung untuk Diagram Class" : "TypeScript export only works for Class diagrams",
                "error"
              );
              break;
            }
            const { generateTypeScript } = await import(
              "../../services/code-generator"
            );
            const code = generateTypeScript(diagram);
            if (!code || code.startsWith("// Only class")) {
              showToast(isId ? "Tidak ada class yang ditemukan untuk diekspor" : "No classes found to export", "error");
              break;
            }
            downloadFile(code, `${diagram.name}.ts`, "text/typescript");
            showToast(isId ? "TypeScript berhasil diekspor" : "TypeScript exported", "success");
            break;
          }
          case "java": {
            if (diagram.type !== "class") {
              showToast(isId ? "Ekspor Java hanya didukung untuk Diagram Class" : "Java export only works for Class diagrams", "error");
              break;
            }
            const { generateJava } = await import(
              "../../services/code-generator"
            );
            const code = generateJava(diagram);
            if (!code || code.startsWith("// Only class")) {
              showToast(isId ? "Tidak ada class yang ditemukan untuk diekspor" : "No classes found to export", "error");
              break;
            }
            downloadFile(code, `${diagram.name}.java`, "text/java");
            showToast(isId ? "Java berhasil diekspor" : "Java exported", "success");
            break;
          }
          case "python-pydantic": {
            if (diagram.type !== "class" && diagram.type !== "erd") {
              showToast(
                isId
                  ? "Ekspor Pydantic hanya didukung untuk Diagram Class dan ERD"
                  : "Pydantic export only works for Class and ERD diagrams",
                "error"
              );
              break;
            }
            const { generatePythonPydantic } = await import(
              "../../services/code-generator"
            );
            const code = generatePythonPydantic(diagram);
            downloadFile(code, `${diagram.name}_models.py`, "text/x-python");
            showToast(
              isId ? "Python (Pydantic v2) berhasil diekspor" : "Python (Pydantic v2) exported",
              "success"
            );
            break;
          }
          case "python-sqlalchemy": {
            if (diagram.type !== "class" && diagram.type !== "erd") {
              showToast(
                isId
                  ? "Ekspor SQLAlchemy hanya didukung untuk Diagram Class dan ERD"
                  : "SQLAlchemy export only works for Class and ERD diagrams",
                "error"
              );
              break;
            }
            const { generatePythonSQLAlchemy } = await import(
              "../../services/code-generator"
            );
            const code = generatePythonSQLAlchemy(diagram);
            downloadFile(code, `${diagram.name}_orm.py`, "text/x-python");
            showToast(
              isId ? "Python (SQLAlchemy 2.0) berhasil diekspor" : "Python (SQLAlchemy 2.0) exported",
              "success"
            );
            break;
          }
          case "csharp": {
            if (diagram.type !== "class" && diagram.type !== "erd") {
              showToast(
                isId
                  ? "Ekspor C# hanya didukung untuk Diagram Class dan ERD"
                  : "C# export only works for Class and ERD diagrams",
                "error"
              );
              break;
            }
            const { generateCSharp } = await import(
              "../../services/code-generator"
            );
            const code = generateCSharp(diagram);
            downloadFile(code, `${diagram.name}Entities.cs`, "text/plain");
            showToast(
              isId ? "C# (.NET 8 POCO) berhasil diekspor" : "C# (.NET 8 POCO) exported",
              "success"
            );
            break;
          }
          case "golang": {
            if (diagram.type !== "class" && diagram.type !== "erd") {
              showToast(
                isId
                  ? "Ekspor Go hanya didukung untuk Diagram Class dan ERD"
                  : "Go export only works for Class and ERD diagrams",
                "error"
              );
              break;
            }
            const { generateGolang } = await import(
              "../../services/code-generator"
            );
            const code = generateGolang(diagram);
            downloadFile(code, `${diagram.name.toLowerCase()}_models.go`, "text/plain");
            showToast(
              isId ? "Go Structs berhasil diekspor" : "Go Structs exported",
              "success"
            );
            break;
          }
          case "graphql": {
            if (diagram.type !== "class" && diagram.type !== "erd") {
              showToast(
                isId
                  ? "Ekspor GraphQL hanya didukung untuk Diagram Class dan ERD"
                  : "GraphQL export only works for Class and ERD diagrams",
                "error"
              );
              break;
            }
            const { generateGraphQL } = await import(
              "../../services/code-generator"
            );
            const code = generateGraphQL(diagram);
            downloadFile(code, `${diagram.name.toLowerCase()}_schema.graphql`, "text/plain");
            showToast(
              isId ? "GraphQL Schema (SDL) berhasil diekspor" : "GraphQL Schema (SDL) exported",
              "success"
            );
            break;
          }
          case "rust": {
            if (diagram.type !== "class" && diagram.type !== "erd") {
              showToast(
                isId
                  ? "Ekspor Rust hanya didukung untuk Diagram Class dan ERD"
                  : "Rust export only works for Class and ERD diagrams",
                "error"
              );
              break;
            }
            const { generateRust } = await import(
              "../../services/code-generator"
            );
            const code = generateRust(diagram);
            downloadFile(code, `${diagram.name.toLowerCase()}_models.rs`, "text/plain");
            showToast(
              isId ? "Rust Structs & Enums berhasil diekspor" : "Rust Structs & Enums exported",
              "success"
            );
            break;
          }
          case "openapi-yaml":
          case "openapi-json": {
            if (diagram.type !== "class" && diagram.type !== "erd") {
              showToast(
                isId
                  ? "Ekspor OpenAPI hanya didukung untuk Diagram Class dan ERD"
                  : "OpenAPI export only works for Class and ERD diagrams",
                "error"
              );
              break;
            }
            const isJson = format === "openapi-json";
            const { generateOpenAPI } = await import(
              "../../services/code-generator"
            );
            const content = generateOpenAPI(diagram, isJson ? "json" : "yaml");
            const ext = isJson ? "json" : "yaml";
            const mime = isJson ? "application/json" : "text/yaml";
            downloadFile(content, `${diagram.name.toLowerCase()}_openapi.${ext}`, mime);
            showToast(
              isId ? `OpenAPI 3.1 (${ext.toUpperCase()}) berhasil diekspor` : `OpenAPI 3.1 (${ext.toUpperCase()}) exported`,
              "success"
            );
            break;
          }
          case "prisma": {
            if (diagram.type !== "class" && diagram.type !== "erd") {
              showToast(
                isId
                  ? "Ekspor Prisma hanya didukung untuk Diagram Class dan ERD"
                  : "Prisma export only works for Class and ERD diagrams",
                "error"
              );
              break;
            }
            const { generatePrisma } = await import(
              "../../services/code-generator"
            );
            const schema = generatePrisma(diagram);
            downloadFile(schema, "schema.prisma", "text/plain");
            showToast(
              isId ? "Prisma Schema (schema.prisma) berhasil diekspor" : "Prisma Schema (schema.prisma) exported",
              "success"
            );
            break;
          }
          case "sql": {
            if (diagram.type !== "erd") {
              showToast(isId ? "Ekspor SQL hanya didukung untuk Diagram ERD" : "SQL export only works for ERD diagrams", "error");
              break;
            }
            if (onOpenSQLExport) {
              onOpenSQLExport();
              break;
            }
            const { generateSQL } = await import(
              "../../services/code-generator"
            );
            const sql = generateSQL(diagram);
            if (!sql || sql.startsWith("-- No entities")) {
              showToast(isId ? "Tidak ada entitas yang ditemukan untuk diekspor" : "No entities found to export", "error");
              break;
            }
            downloadFile(sql, `${diagram.name}.sql`, "application/sql");
            showToast(isId ? "SQL DDL berhasil diekspor" : "SQL DDL exported", "success");
            break;
          }
          case "tikz": {
            const { generateTikZ } = await import(
              "../../services/code-generator"
            );
            const tikzCode = generateTikZ(diagram);
            downloadFile(
              tikzCode,
              `${diagram.name.toLowerCase().replace(/[^a-z0-9_]/g, "_")}.tex`,
              "text/x-tex"
            );
            try {
              await navigator.clipboard.writeText(tikzCode);
              showToast(
                isId
                  ? "Kode LaTeX TikZ (.tex) diekspor & disalin ke clipboard"
                  : "LaTeX TikZ code (.tex) exported & copied to clipboard",
                "success"
              );
            } catch {
              showToast(
                isId
                  ? "Kode LaTeX TikZ (.tex) berhasil diunduh"
                  : "LaTeX TikZ code (.tex) exported",
                "success"
              );
            }
            break;
          }
          case "xstate": {
            if (diagram.type !== "state") {
              showToast(isId ? "Ekspor XState hanya didukung untuk Diagram State" : "XState export only works for State diagrams", "error");
              break;
            }
            const { generateXState } = await import(
              "../../services/code-generator"
            );
            const xstateCode = generateXState(diagram);
            if (!xstateCode || xstateCode.startsWith("// Only state")) {
              showToast(isId ? "Tidak ada state yang ditemukan untuk diekspor" : "No states found to export", "error");
              break;
            }
            downloadFile(
              xstateCode,
              `${diagram.name}.machine.ts`,
              "text/typescript"
            );
            showToast(isId ? "XState Machine berhasil diekspor" : "XState Machine exported", "success");
            break;
          }
          default:
            showToast(isId ? `Format tidak dikenal: ${format}` : `Unknown format: ${format}`, "error");
        }
      } catch (err) {
        showToast(
          isId
            ? `Ekspor gagal: ${err instanceof Error ? err.message : "Kesalahan tak terduga"}`
            : `Export failed: ${err instanceof Error ? err.message : "Unknown error"}`,
          "error"
        );
      }
    },
    [diagram, onOpenAcademicCaption, isId]
  );

  return { handleExport, downloadFile };
}
