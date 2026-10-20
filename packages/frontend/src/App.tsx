import { useState, useCallback, useEffect, useRef } from "react";
import type { Diagram } from "@uml-editor/shared";
import { Toolbar } from "./features/toolbar/Toolbar";
import { DSLEditor } from "./features/editor/DSLEditor";
import { Canvas } from "./features/canvas/Canvas";
import { PropertyPanel } from "./features/canvas/PropertyPanel";
import { StylePanel } from "./features/canvas/StylePanel";
import { NodePalette } from "./features/palette/NodePalette";
import { ShortcutsPanel } from "./features/toolbar/ShortcutsPanel";
import {
  ContextMenu,
  type ContextMenuItem,
} from "./features/canvas/ContextMenu";
import { useHistory } from "./hooks/useHistory";
import { ToastContainer, showToast } from "./features/ui/Toast";
import { StatusBar } from "./features/ui/StatusBar";
import { useDebounce } from "./hooks/useDebounce";
import { useFileImport } from "./hooks/useFileImport";
import { useTheme } from "./hooks/useTheme";
import { useClipboard } from "./hooks/useClipboard";
import { useDiagramActions } from "./hooks/useDiagramActions";
import { api } from "./services/api";
import { getVisualSize } from "./features/canvas/nodes/getVisualSize";
import { storage } from "./services/storage";
import type { SavedDiagram } from "./services/storage";
import { SAMPLES } from "./data/samples";
import { createDefaultNode } from "./data/node-factory";
import { DiagramTabs } from "./features/ui/DiagramTabs";
import { DiagramLibrary } from "./features/ui/DiagramLibrary";
import { TemplatesPanel } from "./features/ui/TemplatesPanel";
import { AIAssistant } from "./features/ui/AIAssistant";
import { PresentationMode } from "./features/ui/PresentationMode";
import { UndoHistoryPanel } from "./features/ui/UndoHistoryPanel";
import { DiagramDiffPanel } from "./features/ui/DiagramDiffPanel";
import { AcademicCaptionModal } from "./features/ui/AcademicCaptionModal";
import { ImportModal } from "./features/ui/ImportModal";
import {
  loadTemplates,
  saveTemplate,
  deleteTemplate,
  loadTemplateAsDiagram,
} from "./services/templates";
import type { DiagramTemplate } from "./services/templates";

interface AppProps {
  initialCode?: string;
  onNavigateHome?: () => void;
}

type EditorMode = "visual" | "code" | "split";

export default function App(props: AppProps = {}) {
  // --- Core state ---
  const [mode, setMode] = useState<EditorMode>("split");
  const [code, setCode] = useState(() => props.initialCode || storage.loadCode() || SAMPLES.class);
  const diagramHistory = useHistory<Diagram | null>(storage.loadCurrent());
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [selectedEdgeIds, setSelectedEdgeIds] = useState<Set<string>>(
    new Set(),
  );
  const [errors, setErrors] = useState<any[]>([]);
  const [isCompiling, setIsCompiling] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showStylePanel, setShowStylePanel] = useState<
    "node" | "global" | "edge" | null
  >(null);
  const [globalStyle, setGlobalStyle] = useState<Record<string, any>>({});
  const [autoCompile, setAutoCompile] = useState(true);
  const [autoSyncCanvas, setAutoSyncCanvas] = useState(false);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [edgeRouting, setEdgeRouting] = useState<"straight" | "orthogonal">(
    "straight",
  );
  const [activeEdgeTool, setActiveEdgeTool] = useState<string | null>(null);
  const [isMonochrome, setIsMonochrome] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    items: ContextMenuItem[];
  } | null>(null);
  const { canvasTheme, toggleCanvasTheme } = useTheme();
  const { copy, paste, hasContent: hasClipboard } = useClipboard();
  const appRef = useRef<HTMLDivElement>(null);

  // --- Multi-diagram tabs ---
  const [tabs, setTabs] = useState<SavedDiagram[]>(() => storage.list());
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  // --- UI panels ---
  const [showLibrary, setShowLibrary] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showPresentation, setShowPresentation] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [showAcademicCaption, setShowAcademicCaption] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [templates, setTemplates] = useState<DiagramTemplate[]>(() =>
    loadTemplates(),
  );

  const diagram = diagramHistory.state;

  // --- Diagram actions (extracted hook) ---
  const actions = useDiagramActions(diagram, diagramHistory, snapEnabled);

  // --- Persist ---
  useEffect(() => {
    storage.saveCode(code);
  }, [code]);
  useEffect(() => {
    storage.saveCurrent(diagram);
  }, [diagram]);

  // --- Tab helpers ---
  const refreshTabs = useCallback(() => setTabs(storage.list()), []);

  // Sync with backend on startup & check for shared link
  useEffect(() => {
    storage.syncFromServer().then((list) => {
      setTabs(list);
    });

    import("./services/share-link").then(({ getSharedCodeFromLocation }) => {
      getSharedCodeFromLocation().then((sharedCode) => {
        if (sharedCode) {
          setCode(sharedCode);
          handleCompile(sharedCode);
          showToast("Shared diagram loaded from link", "success");
        }
      });
    });
  }, []);

  // --- Compile ---
  const handleCompile = useCallback(
    async (dslCode?: string) => {
      setIsCompiling(true);
      try {
        const result = await api.compile(dslCode ?? code);
        if (result.success && result.diagram) {
          const newDiagram = result.diagram;
          const old = diagramHistory.state;
          if (old) {
            for (const node of newDiagram.nodes) {
              const oldNode = old.nodes.find(
                (n) => n.name === node.name || n.id === node.id,
              );
              if (oldNode && (oldNode as any).style)
                (node as any).style = (oldNode as any).style;
            }
            for (const edge of newDiagram.edges) {
              const oldEdge = old.edges.find(
                (e) => e.source === edge.source && e.target === edge.target,
              );
              if (oldEdge?.style) edge.style = oldEdge.style;
            }
          }
          // Recalculate node sizes using getVisualSize for all node types
          for (const node of newDiagram.nodes) {
            const vs = getVisualSize(node);
            node.size = vs;
          }
          diagramHistory.set(newDiagram);
          setErrors([]);
        } else setErrors(result.errors || []);
      } catch {
        setErrors([
          {
            line: 0,
            column: 0,
            message: "Server connection failed",
            severity: "error",
          },
        ]);
      }
      setIsCompiling(false);
    },
    [code, diagramHistory],
  );

  const handleNewTab = useCallback(() => {
    const newCode = SAMPLES.class;
    setCode(newCode);
    diagramHistory.set(null);
    setActiveTabId(null);
    setErrors([]);
    showToast("New diagram created", "success");
  }, [diagramHistory]);

  const handleOpenTab = useCallback(
    async (entry: SavedDiagram) => {
      let currentCode = entry.code;
      if (!currentCode && entry.diagram) {
        try {
          currentCode = await api.exportDiagram(entry.diagram, {
            format: "dsl",
          });
        } catch {
          currentCode = "";
        }
      }
      setCode(currentCode);
      if (entry.diagram) {
        diagramHistory.set(entry.diagram);
      } else if (currentCode) {
        handleCompile(currentCode);
      }
      setActiveTabId(entry.id);
      setErrors([]);
    },
    [diagramHistory, handleCompile],
  );

  const handleCloseTab = useCallback(
    (id: string) => {
      storage.remove(id);
      refreshTabs();
      if (activeTabId === id) {
        const remaining = storage.list();
        if (remaining.length > 0) handleOpenTab(remaining[0]);
        else handleNewTab();
      }
    },
    [activeTabId, refreshTabs, handleOpenTab, handleNewTab],
  );

  const handleRenameTab = useCallback(
    (id: string, name: string) => {
      const list = storage.list();
      const entry = list.find((d) => d.id === id);
      if (entry) {
        storage.save({ ...entry, name });
        refreshTabs();
        if (diagram && activeTabId === id) {
          diagramHistory.set({ ...diagram, name });
        }
      }
    },
    [activeTabId, diagram, diagramHistory, refreshTabs],
  );

  const handleSaveCurrent = useCallback(() => {
    if (!diagram && !code) return;
    const entry: SavedDiagram = {
      id: activeTabId || `diagram_${Date.now()}`,
      name: diagram?.name || "Untitled",
      code,
      diagram: diagram || null,
      updatedAt: new Date().toISOString(),
    };
    storage.save(entry);
    setActiveTabId(entry.id);
    refreshTabs();
    showToast("Diagram saved to library", "success");
  }, [diagram, code, activeTabId, refreshTabs]);

  const handleShareLink = useCallback(async () => {
    if (!code) {
      showToast("No diagram code to share", "error");
      return;
    }
    try {
      const { createShareUrl } = await import("./services/share-link");
      const url = await createShareUrl(code);
      await navigator.clipboard.writeText(url);
      showToast("Shareable link copied to clipboard!", "success");
    } catch {
      showToast("Failed to copy share link", "error");
    }
  }, [code]);

  // --- Template helpers ---
  const handleSaveTemplate = useCallback(
    (name: string, description: string) => {
      if (!diagram) {
        showToast("No diagram to save as template", "error");
        return;
      }
      saveTemplate(name, description, diagram);
      setTemplates(loadTemplates());
      showToast(`Template "${name}" saved`, "success");
    },
    [diagram],
  );

  const handleLoadTemplate = useCallback(
    (id: string) => {
      const d = loadTemplateAsDiagram(id);
      if (!d) {
        showToast("Template not found", "error");
        return;
      }
      diagramHistory.set(d);
      setErrors([]);
      showToast("Template loaded", "success");
    },
    [diagramHistory],
  );

  const handleDeleteTemplate = useCallback((id: string) => {
    deleteTemplate(id);
    setTemplates(loadTemplates());
  }, []);

  // --- Keyboard shortcut: Ctrl+N new tab, Ctrl+S save, Esc exit presentation ---
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "n") {
        e.preventDefault();
        handleNewTab();
      }
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        handleSaveCurrent();
      }
      if (e.key === "Escape" && showPresentation) setShowPresentation(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleNewTab, handleSaveCurrent, showPresentation]);

  // --- Auto-compile (only on code change) ---
  const lastCompiledCode = useRef(code);
  useDebounce(
    () => {
      if (
        autoCompile &&
        !isInteracting &&
        code.trim().length > 10 &&
        code !== lastCompiledCode.current
      ) {
        lastCompiledCode.current = code;
        handleCompile(code);
      }
    },
    700,
    [code],
  );



  // --- Two-Way Live Auto-Sync (Canvas -> DSL) ---
  const lastSyncedDiagram = useRef<Diagram | null>(null);
  useDebounce(
    async () => {
      if (
        autoSyncCanvas &&
        diagram &&
        !isCompiling &&
        !isInteracting &&
        diagram !== lastSyncedDiagram.current
      ) {
        lastSyncedDiagram.current = diagram;
        try {
          const exportableDiagram = {
            ...diagram,
            nodes: diagram.nodes.filter((n) => (n.type as string) !== "note"),
          };
          const dsl = await api.exportDiagram(exportableDiagram, { format: "dsl" });
          if (dsl && dsl !== code) {
            lastCompiledCode.current = dsl;
            setCode(dsl);
          }
        } catch {}
      }
    },
    800,
    [diagram, autoSyncCanvas, isInteracting],
  );

  // --- Initial auto-compile on first visit ---
  const initialCompiled = useRef(false);
  useEffect(() => {
    if (!initialCompiled.current && !diagramHistory.state && code.trim().length > 10) {
      initialCompiled.current = true;
      handleCompile(code);
    }
  }, [code, diagramHistory.state, handleCompile]);

  // --- Drag lifecycle ---
  const handleDragStart = useCallback(() => {
    setIsInteracting(true);
    diagramHistory.snapshot();
  }, [diagramHistory]);
  const handleDragEnd = useCallback(() => {
    setIsInteracting(false);
    diagramHistory.commit();
  }, [diagramHistory]);

  // --- Global style wrapper ---
  const handleGlobalStyleChange = useCallback(
    (style: any) => {
      actions.globalStyleChange(style, setGlobalStyle);
    },
    [actions],
  );

  // --- Export ---
  const handleExport = useCallback(
    async (format: string) => {
      if (!diagram) return;
      try {
        switch (format) {
          case "svg": {
            const svg = await api.exportDiagram(diagram, { format: "svg" });
            download(svg, `${diagram.name}.svg`, "image/svg+xml");
            showToast("SVG exported", "success");
            break;
          }
          case "json": {
            download(
              JSON.stringify(diagram, null, 2),
              `${diagram.name}.json`,
              "application/json",
            );
            showToast("JSON exported", "success");
            break;
          }
          case "dsl": {
            const dsl = await api.exportDiagram(diagram, { format: "dsl" });
            download(dsl, `${diagram.name}.uml`, "text/plain");
            showToast("DSL exported", "success");
            break;
          }
          case "png": {
            const el = document.querySelector(
              ".canvas-svg-element",
            ) as SVGSVGElement | null;
            if (el) {
              const { exportAsPNG } = await import("./services/export-png");
              await exportAsPNG(el, `${diagram.name}.png`);
              showToast("PNG exported", "success");
            } else {
              showToast("No diagram to export", "error");
            }
            break;
          }
          case "pdf": {
            const el = document.querySelector(
              ".canvas-svg-element",
            ) as SVGSVGElement | null;
            if (el) {
              const { exportAsPDF } = await import("./services/export-png");
              await exportAsPDF(el, diagram.name);
              showToast("Membuka dialog cetak / simpan PDF A4...", "info");
            } else {
              showToast("Diagram tidak ditemukan untuk diekspor", "error");
            }
            break;
          }
          case "academic-caption": {
            setShowAcademicCaption(true);
            break;
          }
          case "clipboard-svg": {
            const svg = await api.exportDiagram(diagram, { format: "svg" });
            await navigator.clipboard.writeText(svg);
            showToast("SVG copied to clipboard", "success");
            break;
          }
          case "clipboard-png": {
            const el = document.querySelector(
              ".canvas-svg-element",
            ) as SVGSVGElement | null;
            if (!el) {
              showToast("No diagram to copy", "error");
              break;
            }
            const { getFullDiagramSVG } = await import("./services/export-png");
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
                      showToast("PNG copied to clipboard", "success");
                    } catch {
                      showToast("Clipboard access denied", "error");
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
                "TypeScript export only works for Class diagrams",
                "error",
              );
              break;
            }
            const { generateTypeScript } =
              await import("./services/code-generator");
            const code = generateTypeScript(diagram);
            if (!code || code.startsWith("// Only class")) {
              showToast("No classes found to export", "error");
              break;
            }
            download(code, `${diagram.name}.ts`, "text/typescript");
            showToast("TypeScript exported", "success");
            break;
          }
          case "java": {
            if (diagram.type !== "class") {
              showToast("Java export only works for Class diagrams", "error");
              break;
            }
            const { generateJava } = await import("./services/code-generator");
            const code = generateJava(diagram);
            if (!code || code.startsWith("// Only class")) {
              showToast("No classes found to export", "error");
              break;
            }
            download(code, `${diagram.name}.java`, "text/java");
            showToast("Java exported", "success");
            break;
          }
          case "sql": {
            if (diagram.type !== "erd") {
              showToast("SQL export only works for ERD diagrams", "error");
              break;
            }
            const { generateSQL } = await import("./services/code-generator");
            const sql = generateSQL(diagram);
            if (!sql || sql.startsWith("-- Only ERD")) {
              showToast("No entities found to export", "error");
              break;
            }
            download(sql, `${diagram.name}.sql`, "application/sql");
            showToast("SQL DDL exported", "success");
            break;
          }
          case "xstate": {
            if (diagram.type !== "state") {
              showToast("XState export only works for State diagrams", "error");
              break;
            }
            const { generateXState } = await import("./services/code-generator");
            const xstateCode = generateXState(diagram);
            if (!xstateCode || xstateCode.startsWith("// Only state")) {
              showToast("No states found to export", "error");
              break;
            }
            download(xstateCode, `${diagram.name}.machine.ts`, "text/typescript");
            showToast("XState Machine exported", "success");
            break;
          }
          default:
            showToast(`Unknown format: ${format}`, "error");
        }
      } catch (err) {
        showToast(
          `Export failed: ${err instanceof Error ? err.message : "Unknown error"}`,
          "error",
        );
      }
    },
    [diagram],
  );

  const handleApplyPalette = useCallback(
    (palette: { bg: string; border: string; font: string; name: string }) => {
      actions.globalStyleChange(
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          fontColor: palette.font,
        },
        setGlobalStyle,
      );
      showToast(`Tema diterapkan: ${palette.name}`, "success");
    },
    [actions],
  );

  // --- Layout & Validate ---
  const handleLayout = useCallback(
    async (preset: string) => {
      if (!diagram) return;
      try {
        const r = await api.relayout(diagram, preset);
        if (r.diagram) {
          diagramHistory.set(r.diagram);
          showToast(`Layout applied: ${preset.charAt(0).toUpperCase() + preset.slice(1)}`, "success");
        }
      } catch {
        showToast("Layout calculation failed", "error");
      }
    },
    [diagram, diagramHistory],
  );

  const handleValidate = useCallback(async () => {
    if (!diagram) return;
    try {
      const r = await api.validate(diagram);
      setErrors(
        r.issues.length === 0
          ? [
              {
                line: 0,
                column: 0,
                message: "✓ Valid — no issues",
                severity: "info",
              },
            ]
          : r.issues.map((i: any) => ({
              line: 0,
              column: 0,
              message: `[${i.rule}] ${i.message}`,
              severity: i.severity,
            })),
      );
    } catch {}
  }, [diagram]);

  // --- Samples ---
  const handleSampleChange = useCallback(
    (key: string) => {
      if (SAMPLES[key]) {
        setCode(SAMPLES[key]);
        diagramHistory.set(null);
        setErrors([]);
      }
    },
    [diagramHistory],
  );

  const handleAddNode = useCallback(
    (nodeType: string) => {
      if (!diagram) return;
      // Sequence diagrams use participants, not nodes
      if (diagram.type === "sequence") {
        const participants = diagram.participants || [];
        const spacing = 150;
        const newParticipant = {
          id: `participant_${Date.now()}`,
          name: `New${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)}`,
          type: nodeType as any,
          position: { x: 100 + participants.length * spacing, y: 60 },
        };
        diagramHistory.set({
          ...diagram,
          participants: [...participants, newParticipant],
        });
        return;
      }
      actions.addNode(
        createDefaultNode(nodeType, diagram.type, diagram.nodes.length),
      );
    },
    [diagram, actions, diagramHistory],
  );

  const handleQuickAddNode = useCallback(
    (sourceNodeId: string) => {
      if (!diagram) return;
      const sourceNode = diagram.nodes.find((n) => n.id === sourceNodeId);
      if (!sourceNode) return;

      const sourceWidth = sourceNode.size?.width || 160;
      const targetType = sourceNode.type || (diagram.type === "class" ? "class" : "process");
      const newNode = createDefaultNode(targetType, diagram.type, diagram.nodes.length);
      newNode.position = {
        x: sourceNode.position.x + sourceWidth + 80,
        y: sourceNode.position.y,
      };

      const newEdge: any = {
        id: `edge_${Date.now()}`,
        source: sourceNode.id,
        target: newNode.id,
        type:
          diagram.type === "class"
            ? "association"
            : diagram.type === "erd"
              ? "one-to-many"
              : "flow",
      };

      diagramHistory.set({
        ...diagram,
        nodes: [...diagram.nodes, newNode],
        edges: [...diagram.edges, newEdge],
      });
      setSelectedNodeId(newNode.id);
      showToast("Node added and connected", "success");
    },
    [diagram, diagramHistory],
  );

  const handleSyncToCode = useCallback(async () => {
    if (!diagram) return;
    try {
      // Filter out node types that the DSL generator doesn't support (e.g., "note")
      const exportableDiagram = {
        ...diagram,
        nodes: diagram.nodes.filter((n) => (n.type as string) !== "note"),
      };
      const dsl = await api.exportDiagram(exportableDiagram, { format: "dsl" });
      // Update lastCompiledCode to prevent auto-compile from immediately re-compiling
      lastCompiledCode.current = dsl;
      setCode(dsl);
      showToast("Diagram synced to code", "success");
    } catch {
      showToast("Failed to sync — try compiling first", "error");
    }
  }, [diagram]);

  // --- File import ---
  const { handleDrop, handleDragOver, openFilePicker } = useFileImport({
    onCodeImport: setCode,
    onDiagramImport: (d) => diagramHistory.set(d),
  });
  useEffect(() => {
    const el = appRef.current;
    if (!el) return;
    el.addEventListener("drop", handleDrop);
    el.addEventListener("dragover", handleDragOver);
    return () => {
      el.removeEventListener("drop", handleDrop);
      el.removeEventListener("dragover", handleDragOver);
    };
  }, [handleDrop, handleDragOver]);

  // --- Keyboard shortcuts ---
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      // If user is typing in code editor or an input field, let native browser Ctrl+Z / Ctrl+Y handle text undo/redo
      if (isInput) return;

      if (e.ctrlKey && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        diagramHistory.undo();
      }
      if (e.ctrlKey && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        diagramHistory.redo();
      }
      if (e.key === "?" && !e.ctrlKey) {
        setShowShortcuts((v) => !v);
      }
      if (e.key === "Delete") {
        if (selectedNodeId) {
          actions.deleteNode(selectedNodeId);
          setSelectedNodeId(null);
        } else if (selectedEdgeIds.size > 0) {
          // Bulk delete multiple selected edges
          if (diagram) {
            diagramHistory.set({
              ...diagram,
              edges: diagram.edges.filter((ed) => !selectedEdgeIds.has(ed.id)),
            });
          }
          setSelectedEdgeIds(new Set());
          setSelectedEdgeId(null);
        } else if (selectedEdgeId) {
          actions.deleteEdge(selectedEdgeId);
          setSelectedEdgeId(null);
        }
      }
      if (e.ctrlKey && e.key === "c" && diagram && selectedNodeId) {
        copy(
          diagram.nodes.filter((n) => n.id === selectedNodeId),
          diagram.edges,
        );
      }
      if (e.ctrlKey && e.key === "v" && diagram) {
        const pasted = paste();
        if (pasted) {
          diagramHistory.set({
            ...diagram,
            nodes: [...diagram.nodes, ...pasted.nodes],
            edges: [...diagram.edges, ...pasted.edges],
          });
          if (pasted.nodes[0]) setSelectedNodeId(pasted.nodes[0].id);
        }
      }
      if (e.ctrlKey && e.key === "d" && selectedNodeId) {
        e.preventDefault();
        const newId = actions.duplicateNode(selectedNodeId);
        if (newId) setSelectedNodeId(newId);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    diagramHistory,
    selectedNodeId,
    selectedEdgeId,
    diagram,
    actions,
    copy,
    paste,
  ]);

  // --- Context menu ---
  const handleCanvasContextMenu = useCallback(
    (
      e: React.MouseEvent,
      target: {
        type: "canvas" | "node" | "edge";
        id?: string;
        worldPos: { x: number; y: number };
        multiNodeIds?: string[];
      },
    ) => {
      e.preventDefault();
      const items: ContextMenuItem[] = [];

      // TARGET: NODE (Single or Multi)
      if (target.type === "node" && diagram) {
        const isMulti = target.multiNodeIds && target.multiNodeIds.length > 1;

        if (isMulti) {
          const multiIds = target.multiNodeIds!;
          const selectedNodes = diagram.nodes.filter((n) =>
            multiIds.includes(n.id),
          );

          items.push({
            label: "Align Nodes",
            icon: "📏",
            children: [
              {
                label: "Align Left",
                icon: "⇤",
                action: () => actions.alignNodes?.(multiIds, "left"),
              },
              {
                label: "Align Center",
                icon: "⇥⇤",
                action: () => actions.alignNodes?.(multiIds, "center"),
              },
              {
                label: "Align Right",
                icon: "⇥",
                action: () => actions.alignNodes?.(multiIds, "right"),
              },
              { separator: true, label: "", action: () => {} },
              {
                label: "Align Top",
                icon: "⤒",
                action: () => actions.alignNodes?.(multiIds, "top"),
              },
              {
                label: "Align Middle",
                icon: "⇕",
                action: () => actions.alignNodes?.(multiIds, "middle"),
              },
              {
                label: "Align Bottom",
                icon: "⤓",
                action: () => actions.alignNodes?.(multiIds, "bottom"),
              },
            ],
          });

          items.push({
            label: "Distribute",
            icon: "↔",
            children: [
              {
                label: "Distribute Horizontally",
                icon: "↔",
                action: () => actions.distributeNodes?.(multiIds, "horizontal"),
              },
              {
                label: "Distribute Vertically",
                icon: "↕",
                action: () => actions.distributeNodes?.(multiIds, "vertical"),
              },
            ],
          });

          items.push({ separator: true, label: "", action: () => {} });

          items.push({
            label: `Copy All (${multiIds.length} nodes)`,
            icon: "📋",
            shortcut: "Ctrl+C",
            action: () => copy(selectedNodes, diagram.edges),
          });

          items.push({
            label: `Delete All (${multiIds.length} nodes)`,
            icon: "🗑",
            shortcut: "Del",
            danger: true,
            action: () => {
              if (diagram) {
                diagramHistory.set({
                  ...diagram,
                  nodes: diagram.nodes.filter((n) => !multiIds.includes(n.id)),
                  edges: diagram.edges.filter(
                    (e) =>
                      !multiIds.includes(e.source) &&
                      !multiIds.includes(e.target),
                  ),
                });
              }
              setSelectedNodeId(null);
            },
          });
        } else {
          const node = diagram.nodes.find((n) => n.id === target.id);
          if (!node) return;

          items.push({
            label: "Rename",
            icon: "✏️",
            shortcut: "F2",
            action: () => {
              const newName = window.prompt("Rename entity/node:", node.name);
              if (newName && newName.trim()) {
                actions.nodeRename(node.id, newName.trim());
              }
            },
          });

          // Add Field / Attribute based on diagram type
          if (
            diagram.type === "erd" ||
            ("attributes" in node && !("methods" in node))
          ) {
            items.push({
              label: "Add Column",
              icon: "➕",
              action: () => {
                const colName = window.prompt("New Column Name:", "new_column");
                if (colName && colName.trim()) {
                  actions.addERDColumn(
                    node.id,
                    colName.trim(),
                    "varchar",
                    false,
                    false,
                    true,
                  );
                }
              },
            });
          } else if (diagram.type === "class" || "methods" in node) {
            items.push({
              label: "Add Property",
              icon: "➕",
              action: () => {
                const prop = window.prompt(
                  "New Property (name: type):",
                  "property: string",
                );
                if (prop && prop.trim()) {
                  const parts = prop.trim().split(":");
                  const name = parts[0]?.trim().replace(/^[+\-#~]/, "") || "property";
                  const type = parts[1]?.trim() || "string";
                  actions.addAttribute(node.id, name, type, "public");
                }
              },
            });
            items.push({
              label: "Add Method",
              icon: "ƒ",
              action: () => {
                const method = window.prompt(
                  "New Method (name(): returnType):",
                  "execute(): void",
                );
                if (method && method.trim()) {
                  const parts = method.trim().split(":");
                  const name = parts[0]?.trim().replace(/^[+\-#~]/, "").replace("()", "") || "execute";
                  const returnType = parts[1]?.trim() || "void";
                  actions.addMethod(node.id, name, returnType, "public");
                }
              },
            });
          }

          // Color & Styling Submenu
          items.push({
            label: "Color & Style",
            icon: "🎨",
            children: [
              {
                label: "Default",
                icon: "⚪",
                action: () =>
                  actions.nodeStyleChange(node.id, {
                    backgroundColor: undefined,
                    borderColor: undefined,
                  }),
              },
              {
                label: "Indigo",
                icon: "🔵",
                action: () =>
                  actions.nodeStyleChange(node.id, {
                    backgroundColor:
                      canvasTheme === "dark" ? "#1e1e38" : "#e0e7ff",
                    borderColor: "#6366f1",
                  }),
              },
              {
                label: "Violet",
                icon: "🟣",
                action: () =>
                  actions.nodeStyleChange(node.id, {
                    backgroundColor:
                      canvasTheme === "dark" ? "#261938" : "#ede9fe",
                    borderColor: "#8b5cf6",
                  }),
              },
              {
                label: "Emerald",
                icon: "🟢",
                action: () =>
                  actions.nodeStyleChange(node.id, {
                    backgroundColor:
                      canvasTheme === "dark" ? "#122822" : "#d1fae5",
                    borderColor: "#10b981",
                  }),
              },
              {
                label: "Amber",
                icon: "🟡",
                action: () =>
                  actions.nodeStyleChange(node.id, {
                    backgroundColor:
                      canvasTheme === "dark" ? "#2d2315" : "#fef3c7",
                    borderColor: "#f59e0b",
                  }),
              },
              {
                label: "Rose",
                icon: "🔴",
                action: () =>
                  actions.nodeStyleChange(node.id, {
                    backgroundColor:
                      canvasTheme === "dark" ? "#2d161d" : "#ffe4e6",
                    borderColor: "#f43f5e",
                  }),
              },
              {
                label: "Slate",
                icon: "⚫",
                action: () =>
                  actions.nodeStyleChange(node.id, {
                    backgroundColor:
                      canvasTheme === "dark" ? "#0f172a" : "#f1f5f9",
                    borderColor: "#64748b",
                  }),
              },
            ],
          });

          // Quick relationship connection
          items.push({
            label: "Connect Relationship...",
            icon: "🔗",
            action: () => handleQuickAddNode(node.id),
          });

          // Add Review / Advisor Feedback Pin
          items.push({
            label: "Add Review / Feedback Note...",
            icon: "📌",
            action: () => {
              const noteId = `note_review_${Date.now()}`;
              const noteNode = {
                id: noteId,
                type: "note",
                name: `Revisi untuk ${node.name}:\n• Catatan review dosen...`,
                position: {
                  x: node.position.x + (node.size?.width || 160) + 30,
                  y: node.position.y,
                },
                size: { width: 190, height: 90 },
                style: { backgroundColor: "#fef9c3", borderColor: "#eab308" },
              };
              diagramHistory.set({
                ...diagram,
                nodes: [...diagram.nodes, noteNode as any],
              });
              setSelectedNodeId(noteId);
            },
          });

          items.push({ separator: true, label: "", action: () => {} });

          items.push({
            label: "Copy",
            icon: "📋",
            shortcut: "Ctrl+C",
            action: () => copy([node], diagram.edges),
          });

          items.push({
            label: "Duplicate",
            icon: "⧉",
            shortcut: "Ctrl+D",
            action: () => {
              const id = actions.duplicateNode(node.id);
              if (id) setSelectedNodeId(id);
            },
          });

          items.push({
            label: "Bring to Front",
            icon: "⬆",
            action: () => {
              const others = diagram.nodes.filter((n) => n.id !== node.id);
              diagramHistory.set({ ...diagram, nodes: [...others, node] });
            },
          });

          items.push({
            label: "Send to Back",
            icon: "⬇",
            action: () => {
              const others = diagram.nodes.filter((n) => n.id !== node.id);
              diagramHistory.set({ ...diagram, nodes: [node, ...others] });
            },
          });

          items.push({ separator: true, label: "", action: () => {} });

          items.push({
            label: "Delete",
            icon: "🗑",
            shortcut: "Del",
            danger: true,
            action: () => {
              actions.deleteNode(node.id);
              setSelectedNodeId(null);
            },
          });
        }
      }

      // TARGET: EDGE / RELATIONSHIP
      else if (target.type === "edge" && diagram) {
        const currentEdge = diagram.edges.find((e) => e.id === target.id);
        if (!currentEdge) return;

        items.push({
          label: "Edit Label",
          icon: "🏷️",
          action: () => {
            const newLabel = window.prompt(
              "Relationship label:",
              currentEdge.label?.text || "",
            );
            if (newLabel !== null) {
              actions.edgeLabelEdit(currentEdge.id, newLabel.trim());
            }
          },
        });

        items.push({
          label: "Add Waypoint Here",
          icon: "📍",
          action: () => {
            actions.edgeWaypointAdd(currentEdge.id, 0, target.worldPos);
          },
        });

        const edgeTypes = [
          { label: "Association", type: "association" },
          { label: "Inheritance", type: "inheritance" },
          { label: "Composition", type: "composition" },
          { label: "Aggregation", type: "aggregation" },
          { label: "Dependency", type: "dependency" },
          { label: "Realization", type: "realization" },
        ];

        items.push({
          label: "Change Type",
          icon: "🔀",
          children: edgeTypes.map((et) => ({
            label: et.label,
            icon: currentEdge.type === et.type ? "✓" : undefined,
            action: () => actions.edgeTypeChange(currentEdge.id, et.type),
          })),
        });

        items.push({
          label: "Reverse Direction",
          icon: "⇄",
          action: () => actions.edgeReverse(currentEdge.id),
        });

        items.push({
          label: "Style Edge...",
          icon: "🎨",
          action: () => setShowStylePanel("edge"),
        });

        items.push({ separator: true, label: "", action: () => {} });

        items.push({
          label: "Delete Relationship",
          icon: "🗑",
          shortcut: "Del",
          danger: true,
          action: () => {
            actions.deleteEdge(currentEdge.id);
            setSelectedEdgeId(null);
          },
        });
      }

      // TARGET: BLANK CANVAS
      else if (target.type === "canvas" && diagram) {
        const typeLabelMap: Record<string, string> = {
          erd: "Entity",
          class: "Class",
          state: "State",
          flowchart: "Step",
          usecase: "Use Case",
          component: "Component",
          deployment: "Node",
        };
        const entityLabel = typeLabelMap[diagram.type] || "Node";

        items.push({
          label: `Add ${entityLabel} Here`,
          icon: "➕",
          action: () => {
            const count = diagram.nodes.length + 1;
            const name = `${entityLabel}${count}`;
            const id = `node_${Date.now()}`;
            const vs = getVisualSize({
              name,
              type: diagram.type,
              position: target.worldPos,
            } as any);
            const newNode = {
              id,
              name,
              type: diagram.type,
              position: target.worldPos,
              size: vs,
              attributes:
                diagram.type === "erd"
                  ? [
                      {
                        name: "id",
                        type: "int",
                        isPrimaryKey: true,
                        isNullable: false,
                        isForeignKey: false,
                        isUnique: true,
                      },
                    ]
                  : [],
            };
            diagramHistory.set({
              ...diagram,
              nodes: [...diagram.nodes, newNode as any],
            });
            setSelectedNodeId(id);
          },
        });

        items.push({
          label: "Add Sticky Note Here",
          icon: "📝",
          action: () => {
            const id = `note_${Date.now()}`;
            const newNote = {
              id,
              type: "note",
              name: "Note",
              content: "Sticky Note",
              position: target.worldPos,
              size: { width: 150, height: 90 },
              style: { backgroundColor: "#fef9c3", borderColor: "#facc15" },
            };
            diagramHistory.set({
              ...diagram,
              nodes: [...diagram.nodes, newNote as any],
            });
            setSelectedNodeId(id);
          },
        });

        items.push({
          label: "Add System Boundary Here",
          icon: "▢",
          action: () => {
            const id = `boundary_${Date.now()}`;
            const newBoundary = {
              id,
              type: "system",
              name: "System Boundary",
              position: target.worldPos,
              size: { width: 340, height: 240 },
              style: {
                borderStyle: "dashed",
                borderWidth: 1.5,
                borderColor: "#94a3b8",
                backgroundColor: "transparent",
              },
            };
            diagramHistory.set({
              ...diagram,
              nodes: [...diagram.nodes, newBoundary as any],
            });
            setSelectedNodeId(id);
          },
        });

        items.push({ separator: true, label: "", action: () => {} });

        items.push({
          label: "Paste at Cursor",
          icon: "📋",
          shortcut: "Ctrl+V",
          disabled: !hasClipboard,
          action: () => {
            const p = paste(
              target.worldPos.x - (diagram.nodes[0]?.position.x ?? 0),
              target.worldPos.y - (diagram.nodes[0]?.position.y ?? 0),
            );
            if (p) {
              diagramHistory.set({
                ...diagram,
                nodes: [...diagram.nodes, ...p.nodes],
                edges: [...diagram.edges, ...p.edges],
              });
            }
          },
        });

        items.push({ separator: true, label: "", action: () => {} });

        // Auto Layout Submenu
        items.push({
          label: "Auto Layout",
          icon: "📐",
          children: [
            {
              label: "Hierarchical / Layered",
              icon: "🌲",
              action: () => handleLayout("layered"),
            },
            {
              label: "Force-Directed",
              icon: "🌐",
              action: () => handleLayout("force"),
            },
            {
              label: "Radial Rings",
              icon: "🎯",
              action: () => handleLayout("radial"),
            },
            {
              label: "Grid Arrangement",
              icon: "⊞",
              action: () => handleLayout("grid"),
            },
            {
              label: "Linear Stack",
              icon: "📋",
              action: () => handleLayout("linear"),
            },
          ],
        });

        // View Controls Submenu
        items.push({
          label: "View Controls",
          icon: "🔍",
          children: [
            {
              label: "Zoom to Fit",
              icon: "⊡",
              action: () =>
                document
                  .querySelector<HTMLButtonElement>(
                    '[title="Zoom to fit diagram"]',
                  )
                  ?.click(),
            },
            {
              label: "Reset Zoom (100%)",
              icon: "⟲",
              action: () =>
                document
                  .querySelector<HTMLButtonElement>(
                    '[title="Reset zoom to 100%"]',
                  )
                  ?.click(),
            },
            {
              label:
                canvasTheme === "dark"
                  ? "Switch to Light Theme"
                  : "Switch to Dark Theme",
              icon: canvasTheme === "dark" ? "☀️" : "🌙",
              action: () => toggleCanvasTheme(),
            },
            {
              label: snapEnabled ? "Disable Grid Snap" : "Enable Grid Snap",
              icon: "🔲",
              action: () => setSnapEnabled((v) => !v),
            },
            {
              label:
                edgeRouting === "orthogonal"
                  ? "Switch to Straight Routing"
                  : "Switch to Orthogonal Routing",
              icon: "🔀",
              action: () =>
                setEdgeRouting((v) =>
                  v === "straight" ? "orthogonal" : "straight",
                ),
            },
          ],
        });

        items.push({ separator: true, label: "", action: () => {} });

        items.push({
          label: "Select All Nodes",
          icon: "🗂️",
          shortcut: "Ctrl+A",
          action: () => {
            if (diagram.nodes.length > 0) {
              setSelectedNodeId(diagram.nodes[0].id);
            }
          },
        });
      }

      setContextMenu({ x: e.clientX, y: e.clientY, items });
    },
    [
      diagram,
      diagramHistory,
      actions,
      copy,
      paste,
      hasClipboard,
      canvasTheme,
      toggleCanvasTheme,
      snapEnabled,
      edgeRouting,
      handleLayout,
      handleQuickAddNode,
    ],
  );

  const selectedNode =
    diagram?.nodes.find((n) => n.id === selectedNodeId) || null;

  // --- Render ---
  return (
    <div
      ref={appRef}
      className="flex flex-col h-screen overflow-hidden"
    >
      <Toolbar
        mode={mode}
        onModeChange={setMode}
        onCompile={() => handleCompile()}
        onExport={handleExport}
        onLayout={handleLayout}
        onValidate={handleValidate}
        isCompiling={isCompiling}
        hasDiagram={!!diagram}
        diagramType={diagram?.type}
        onSampleChange={handleSampleChange}
        onUndo={diagramHistory.undo}
        onRedo={diagramHistory.redo}
        canUndo={diagramHistory.canUndo}
        canRedo={diagramHistory.canRedo}
        autoCompile={autoCompile}
        onAutoCompileToggle={() => setAutoCompile((v) => !v)}
        autoSyncCanvas={autoSyncCanvas}
        onAutoSyncCanvasToggle={() => setAutoSyncCanvas((v) => !v)}
        snapEnabled={snapEnabled}
        onSnapToggle={() => setSnapEnabled((v) => !v)}
        edgeRouting={edgeRouting}
        onEdgeRoutingToggle={() =>
          setEdgeRouting((v) => (v === "straight" ? "orthogonal" : "straight"))
        }
        canvasTheme={canvasTheme}
        onThemeToggle={toggleCanvasTheme}
        onMonochromeToggle={() => {
          const newVal = !isMonochrome;
          setIsMonochrome(newVal);
          if (newVal) {
            actions.globalStyleChange(
              { backgroundColor: "#ffffff" },
              setGlobalStyle,
            );
          } else {
            actions.globalStyleChange({}, setGlobalStyle);
          }
        }}
        isMonochrome={isMonochrome}
        onImport={openFilePicker}
        onUniversalImport={() => setShowImportModal(true)}
        onSyncToCode={handleSyncToCode}
        onShowShortcuts={() => setShowShortcuts(true)}
        onShowLibrary={() => setShowLibrary(true)}
        onShowTemplates={() => setShowTemplates(true)}
        onShowAI={() => setShowAI(true)}
        onShowHistory={() => setShowHistory((v) => !v)}
        onPresentationMode={() => setShowPresentation(true)}
        onShowDiff={() => setShowDiff(true)}
        onSaveCurrent={handleSaveCurrent}
        onShareLink={handleShareLink}
        onNewDiagram={handleNewTab}
        onNavigateHome={props.onNavigateHome}
        onApplyPalette={handleApplyPalette}
        diagramName={diagram?.name || "Untitled"}
      />

      {/* Diagram Tabs: Only render when 2+ tabs are open to eliminate empty bar */}
      {tabs.length > 1 && (
        <DiagramTabs
          tabs={tabs}
          activeId={activeTabId}
          onSelect={(id) => {
            const entry = storage.list().find((d) => d.id === id);
            if (entry) handleOpenTab(entry);
          }}
          onNew={handleNewTab}
          onClose={handleCloseTab}
          onRename={handleRenameTab}
        />
      )}

      <div className="flex flex-1 overflow-hidden relative">
        {/* Undo History side panel */}
        {showHistory && (
          <UndoHistoryPanel
            isOpen={showHistory}
            onClose={() => setShowHistory(false)}
            undoCount={diagramHistory.historyLength || 0}
            redoCount={diagramHistory.redoLength || 0}
            onUndo={diagramHistory.undo}
            onRedo={diagramHistory.redo}
          />
        )}

        {(mode === "code" || mode === "split") && (
          <div
            className={`${mode === "code" ? "flex-1" : "w-[420px] min-w-[300px]"} border-r border-border flex flex-col`}
          >
            <DSLEditor
              code={code}
              onChange={setCode}
              onCompile={handleCompile}
              errors={errors}
              onSyncToCode={handleSyncToCode}
            />
          </div>
        )}
        {mode === "visual" && diagram && (
          <NodePalette
            diagramType={diagram.type}
            onAddNode={handleAddNode}
            activeEdgeTool={activeEdgeTool}
            onEdgeToolSelect={setActiveEdgeTool}
          />
        )}
        {(mode === "visual" || mode === "split") && (
          <div className="flex-1 relative overflow-hidden">
            <Canvas
              diagram={diagram}
              onNodeMove={actions.nodeMove}
              onNodeResize={actions.nodeResize}
              onNodeSelect={setSelectedNodeId}
              onEdgeSelect={(id) => {
                setSelectedEdgeId(id);
                if (id) setSelectedEdgeIds(new Set());
              }}
              onEdgeWaypointMove={actions.edgeWaypointMove}
              onEdgeWaypointAdd={actions.edgeWaypointAdd}
              onEdgeWaypointDelete={actions.edgeWaypointDelete}
              onEdgeEndpointDrag={actions.edgeEndpointDrag}
              onEdgeReconnect={actions.edgeReconnect}
              onMultiNodeMove={actions.multiNodeMove}
              onNodeRename={actions.nodeRename}
              onParticipantMove={actions.participantMove}
              onParticipantRename={actions.participantRename}
              onMessageEdit={actions.messageEdit}
              onMessageDelete={actions.messageDelete}
              onMessageReorder={actions.messageReorder}
              onAddMessage={actions.addMessage}
              onAddEdge={actions.addEdge}
              onEdgeLabelEdit={actions.edgeLabelEdit}
              onAlignNodes={actions.alignNodes}
              onDistributeNodes={actions.distributeNodes}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              selectedNodeId={selectedNodeId}
              selectedEdgeId={selectedEdgeId}
              selectedEdgeIds={selectedEdgeIds}
              onEdgeShiftSelect={(edgeId) => {
                setSelectedEdgeIds((prev) => {
                  const next = new Set(prev);
                  if (next.has(edgeId)) next.delete(edgeId);
                  else next.add(edgeId);
                  return next;
                });
                setSelectedEdgeId(edgeId);
              }}
              canvasTheme={canvasTheme}
              snapEnabled={snapEnabled}
              edgeRouting={edgeRouting}
              activeEdgeTool={activeEdgeTool}
              onQuickAddNode={handleQuickAddNode}
              onContextMenu={handleCanvasContextMenu}
            />
          </div>
        )}
        {selectedNode && (
          <PropertyPanel
            node={selectedNode}
            onClose={() => setSelectedNodeId(null)}
            onOpenStyle={() => setShowStylePanel("node")}
            onOpenGlobalStyle={() => setShowStylePanel("global")}
            onAddAttribute={actions.addAttribute}
            onAddMethod={actions.addMethod}
            onDeleteAttribute={actions.deleteAttribute}
            onDeleteMethod={actions.deleteMethod}
            onAddERDColumn={actions.addERDColumn}
            onDeleteERDColumn={actions.deleteERDColumn}
          />
        )}
        {showStylePanel === "node" && selectedNode && (
          <StylePanel
            type="node"
            style={(selectedNode as any).style || {}}
            onChange={(s) => actions.nodeStyleChange(selectedNode.id, s)}
            onClose={() => setShowStylePanel(null)}
          />
        )}
        {showStylePanel === "global" && (
          <StylePanel
            type="node"
            style={globalStyle}
            onChange={handleGlobalStyleChange}
            onClose={() => setShowStylePanel(null)}
            title="Global Style (All Nodes)"
          />
        )}
        {showStylePanel === "edge" && selectedEdgeId && diagram && (
          <StylePanel
            type="edge"
            style={
              diagram.edges.find((e) => e.id === selectedEdgeId)?.style || {}
            }
            onChange={(s) => actions.edgeStyleChange(selectedEdgeId, s)}
            onClose={() => setShowStylePanel(null)}
          />
        )}
      </div>

      {errors.length > 0 && (
        <div className="bg-surface-2 border-t border-border px-4 py-2 max-h-28 overflow-y-auto shrink-0">
          {errors.map((err, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 py-1 text-xs ${err.severity === "error" ? "text-error" : "text-warning"}`}
            >
              <span className="font-mono opacity-70 min-w-[70px]">
                Ln {err.line}:{err.column}
              </span>
              <span>{err.message}</span>
            </div>
          ))}
        </div>
      )}

      <ShortcutsPanel
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.items}
          onClose={() => setContextMenu(null)}
        />
      )}
      <StatusBar
        diagram={diagram}
        undoCount={diagramHistory.historyLength || 0}
        redoCount={diagramHistory.redoLength || 0}
      />

      {/* Floating panels */}
      <DiagramLibrary
        isOpen={showLibrary}
        onClose={() => setShowLibrary(false)}
        diagrams={tabs}
        activeId={activeTabId}
        onOpen={handleOpenTab}
        onDelete={(id) => {
          storage.remove(id);
          refreshTabs();
        }}
        onSaveCurrent={handleSaveCurrent}
      />
      <TemplatesPanel
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        templates={templates}
        onLoad={handleLoadTemplate}
        onDelete={handleDeleteTemplate}
        onSave={handleSaveTemplate}
      />
      <AIAssistant
        isOpen={showAI}
        onClose={() => setShowAI(false)}
        onGenerate={(dsl) => {
          setCode(dsl);
          handleCompile(dsl);
        }}
      />
      {showPresentation && (
        <PresentationMode onExit={() => setShowPresentation(false)} />
      )}
      <DiagramDiffPanel
        isOpen={showDiff}
        onClose={() => setShowDiff(false)}
        currentDiagram={diagram}
        savedDiagrams={tabs}
        onLoadVersion={(d) => {
          diagramHistory.set(d);
          showToast("Version restored", "success");
        }}
      />
      <AcademicCaptionModal
        isOpen={showAcademicCaption}
        onClose={() => setShowAcademicCaption(false)}
        diagram={diagram}
      />
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportDSL={(dsl) => {
          setCode(dsl);
          handleCompile(dsl);
        }}
      />

      <ToastContainer />
    </div>
  );
}

function download(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
