import { useState, useCallback, useEffect, useRef } from "react";
import type { Diagram, DiagramType } from "@uml-editor/shared";
import { Toolbar } from "./features/toolbar/Toolbar";
import { useHistory } from "./hooks/useHistory";
import { ToastContainer, showToast } from "./features/ui/Toast";
import { StatusBar } from "./features/ui/StatusBar";
import { useDebounce } from "./hooks/useDebounce";
import { useFileImport } from "./hooks/useFileImport";
import { useTheme } from "./hooks/useTheme";
import { useClipboard } from "./hooks/useClipboard";
import { useDiagramActions } from "./hooks/useDiagramActions";
import { api } from "./services/api";
import { storage } from "./services/storage";
import type { SavedDiagram } from "./services/storage";
import { SAMPLES, RICH_SAMPLES } from "./data/samples";
import { STARTER_DSL, DIAGRAM_TYPES } from "./data/starter-diagrams";
import { createDefaultNode } from "./data/node-factory";
import { getVisualSize } from "./features/canvas/nodes/getVisualSize";
import { DiagramTabs } from "./features/ui/DiagramTabs";
import {
  useAppExport,
  useAppKeyboardShortcuts,
  useCanvasContextMenuItems,
  AppModals,
  AppWorkspace,
} from "./features/app";
import {
  loadTemplates,
  saveTemplate,
  deleteTemplate,
  loadTemplateAsDiagram,
  getTemplateById,
  type DiagramTemplate,
} from "./services/templates";
import { useI18n } from "./i18n";

interface AppProps {
  initialCode?: string;
  onNavigateHome?: () => void;
}

type EditorMode = "visual" | "code" | "split";

export default function App(props: AppProps = {}) {
  const { t, locale } = useI18n();
  const isId = locale === "id";

  // --- Core state ---
  const [mode, setMode] = useState<EditorMode>("split");
  const [code, setCode] = useState(
    () => props.initialCode || storage.loadCode() || SAMPLES.class
  );
  const diagramHistory = useHistory<Diagram | null>(storage.loadCurrent());
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [selectedEdgeIds, setSelectedEdgeIds] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<any[]>([]);
  const [isCompiling, setIsCompiling] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showSQLExport, setShowSQLExport] = useState(false);
  const [showStylePanel, setShowStylePanel] = useState<
    "node" | "global" | "edge" | null
  >(null);
  const [globalStyle, setGlobalStyle] = useState<Record<string, any>>({});
  const [autoCompile, setAutoCompile] = useState(true);
  const [autoSyncCanvas, setAutoSyncCanvas] = useState(false);
  const [snapEnabled, setSnapEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem("uml_snap_enabled");
      if (saved !== null) return saved === "true";
    } catch {}
    return true;
  });
  const [edgeRouting, setEdgeRouting] = useState<"straight" | "orthogonal">(
    () => {
      try {
        const saved = localStorage.getItem("uml_edge_routing");
        if (saved === "orthogonal" || saved === "straight") return saved;
      } catch {}
      return "straight";
    }
  );
  const [activeEdgeTool, setActiveEdgeTool] = useState<string | null>(null);
  const [isMonochrome, setIsMonochrome] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    items: any[];
  } | null>(null);

  const { canvasTheme, toggleCanvasTheme } = useTheme();
  const { copy, paste, hasContent: hasClipboard } = useClipboard();
  const appRef = useRef<HTMLDivElement>(null);

  // --- Multi-diagram tabs ---
  const [tabs, setTabs] = useState<SavedDiagram[]>(() => {
    const list = storage.list();
    if (list.length > 0) return list;
    const initialCode = storage.loadCode() || SAMPLES.class;
    const initialDiagram = storage.loadCurrent();
    const entry: SavedDiagram = {
      id: "diagram_main",
      name: initialDiagram?.name || "Class Diagram",
      code: initialCode,
      diagram: initialDiagram,
      updatedAt: new Date().toISOString(),
    };
    storage.save(entry);
    return [entry];
  });
  const [activeTabId, setActiveTabId] = useState<string | null>(() => {
    const list = storage.list();
    return list.length > 0 ? list[0].id : "diagram_main";
  });

  // --- UI panels ---
  const [showLibrary, setShowLibrary] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showPresentation, setShowPresentation] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [showAcademicCaption, setShowAcademicCaption] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [templates, setTemplates] = useState<DiagramTemplate[]>(() =>
    loadTemplates()
  );

  const diagram = diagramHistory.state;

  // --- Diagram actions ---
  const actions = useDiagramActions(diagram, diagramHistory, snapEnabled);

  // --- Persist ---
  useEffect(() => {
    storage.saveCode(code);
  }, [code]);
  useEffect(() => {
    storage.saveCurrent(diagram);
  }, [diagram]);

  // --- Tab helpers ---
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
                (n) => n.name === node.name || n.id === node.id
              );
              if (oldNode && (oldNode as any).style)
                (node as any).style = (oldNode as any).style;
            }
            for (const edge of newDiagram.edges) {
              const oldEdge = old.edges.find(
                (e) => e.source === edge.source && e.target === edge.target
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
        } else {
          setErrors(result.errors || []);
        }
      } catch {
        setErrors([
          {
            line: 0,
            column: 0,
            message: isId ? "Gagal terhubung ke server" : "Server connection failed",
            severity: "error",
          },
        ]);
      } finally {
        setIsCompiling(false);
      }
    },
    [code, diagramHistory, isId]
  );

  // --- Tab helpers ---
  const refreshTabs = useCallback(() => setTabs(storage.list()), []);

  const handleOpenTab = useCallback(
    async (entry: SavedDiagram) => {
      // Auto-save current active tab before switching so work is not lost
      if (activeTabId && (diagram || code)) {
        const current = storage.list().find((d) => d.id === activeTabId);
        if (current) {
          storage.save({
            ...current,
            code,
            diagram: diagram || null,
            updatedAt: new Date().toISOString(),
          });
        }
      }

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
      lastCompiledCode.current = currentCode;
      if (entry.diagram) {
        diagramHistory.set(entry.diagram);
      } else if (currentCode) {
        handleCompile(currentCode);
      }
      setActiveTabId(entry.id);
      refreshTabs();
      setErrors([]);
      showToast(
        isId
          ? `Beralih ke tab: ${entry.name}`
          : `Switched to tab: ${entry.name}`,
        "info"
      );
    },
    [activeTabId, diagram, code, diagramHistory, handleCompile, isId, refreshTabs]
  );

  const handleNewTab = useCallback(() => {
    // Auto-save current active tab before creating new one
    if (activeTabId && (diagram || code)) {
      const current = storage.list().find((d) => d.id === activeTabId);
      if (current) {
        storage.save({
          ...current,
          code,
          diagram: diagram || null,
          updatedAt: new Date().toISOString(),
        });
      }
    }
    const newId = `diagram_${Date.now()}`;
    const newCode = SAMPLES.class;
    const newEntry: SavedDiagram = {
      id: newId,
      name: "Class Diagram",
      code: newCode,
      diagram: null,
      updatedAt: new Date().toISOString(),
    };
    storage.save(newEntry);
    refreshTabs();
    setActiveTabId(newId);
    setCode(newCode);
    lastCompiledCode.current = newCode;
    diagramHistory.set(null);
    setErrors([]);
    handleCompile(newCode);
    showToast(isId ? "Tab diagram baru berhasil dibuat" : "New diagram created", "success");
  }, [activeTabId, diagram, code, diagramHistory, handleCompile, isId, refreshTabs]);

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
    [activeTabId, refreshTabs, handleOpenTab, handleNewTab]
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
    [activeTabId, diagram, diagramHistory, refreshTabs]
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
    showToast(isId ? "Diagram berhasil disimpan ke pustaka" : "Diagram saved to library", "success");
  }, [diagram, code, activeTabId, refreshTabs, isId]);

  const handleSnapToggle = useCallback(() => {
    setSnapEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("uml_snap_enabled", String(next));
      } catch {}
      showToast(
        next
          ? isId
            ? "Snap ke Grid: Aktif (20px)"
            : "Snap to Grid: Enabled (20px)"
          : isId
            ? "Snap ke Grid: Nonaktif (Bebas)"
            : "Snap to Grid: Disabled (Free)",
        "info"
      );
      return next;
    });
  }, [isId]);

  const handleShareLink = useCallback(async () => {
    if (!code) {
      showToast(isId ? "Tidak ada kode diagram untuk dibagikan" : "No diagram code to share", "error");
      return;
    }
    try {
      const { createShareUrl, copyTextToClipboard } = await import("./services/share-link");
      const url = await createShareUrl(code);
      setShareUrl(url);
      setShowShareModal(true);
      await copyTextToClipboard(url);
      showToast(
        isId
          ? "Tautan berbagi berhasil dibuat & disalin ke clipboard!"
          : "Shareable link created & copied to clipboard!",
        "success"
      );
    } catch {
      showToast(isId ? "Gagal membuat tautan berbagi" : "Failed to create share link", "error");
    }
  }, [code, isId]);

  // Sync with backend on startup & check for shared link
  const startupHandled = useRef(false);
  useEffect(() => {
    if (startupHandled.current) return;
    startupHandled.current = true;

    storage.syncFromServer().then((list) => {
      setTabs(list);
    });

    if (props.initialCode) {
      setCode(props.initialCode);
      lastCompiledCode.current = props.initialCode;
      handleCompile(props.initialCode);
      showToast(isId ? "Diagram berhasil dimuat" : "Diagram loaded", "success");
      return;
    }

    import("./services/share-link").then(({ getSharedCodeFromLocation }) => {
      getSharedCodeFromLocation().then((sharedCode) => {
        if (sharedCode) {
          setCode(sharedCode);
          lastCompiledCode.current = sharedCode;
          handleCompile(sharedCode);
          showToast(
            isId
              ? "Diagram bersama berhasil dimuat dari tautan"
              : "Shared diagram loaded from link",
            "success"
          );
          try {
            window.history.replaceState(null, "", `${window.location.pathname}#editor`);
          } catch {}
        }
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Templates ---
  const handleSaveTemplate = useCallback(
    (name: string, description: string) => {
      if (!diagram) {
        showToast(isId ? "Tidak ada diagram untuk disimpan sebagai template" : "No diagram to save as template", "error");
        return;
      }
      saveTemplate(name, description, diagram, code);
      setTemplates(loadTemplates());
      showToast(isId ? `Template "${name}" berhasil disimpan` : `Template "${name}" saved`, "success");
    },
    [diagram, code, isId]
  );

  const handleLoadTemplate = useCallback(
    (id: string) => {
      const tmpl = getTemplateById(id);
      if (!tmpl) {
        showToast(isId ? "Template tidak ditemukan" : "Template not found", "error");
        return;
      }
      const d = structuredClone(tmpl.diagram);
      d.id = `diagram_${Date.now()}`;
      d.metadata = { ...d.metadata, updatedAt: new Date().toISOString() };
      diagramHistory.set(d);
      if (tmpl.dsl) {
        lastCompiledCode.current = tmpl.dsl;
        setCode(tmpl.dsl);
      }
      setErrors([]);
      showToast(isId ? `Template "${tmpl.name}" berhasil dimuat` : `Template "${tmpl.name}" loaded`, "success");
    },
    [diagramHistory, isId]
  );

  const handleDeleteTemplate = useCallback((id: string) => {
    deleteTemplate(id);
    setTemplates(loadTemplates());
  }, []);

  // --- Auto-compile debounce ---
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
    [code]
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
          const dsl = await api.exportDiagram(exportableDiagram, {
            format: "dsl",
          });
          if (dsl && dsl !== code) {
            lastCompiledCode.current = dsl;
            setCode(dsl);
          }
        } catch {}
      }
    },
    800,
    [diagram, autoSyncCanvas, isInteracting]
  );

  // --- Initial auto-compile ---
  const initialCompiled = useRef(false);
  useEffect(() => {
    if (
      !initialCompiled.current &&
      !diagramHistory.state &&
      code.trim().length > 10
    ) {
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

  const handleGlobalStyleChange = useCallback(
    (style: any) => {
      actions.globalStyleChange(style, setGlobalStyle);
    },
    [actions]
  );

  // --- Export hook ---
  const { handleExport } = useAppExport({
    diagram,
    onOpenAcademicCaption: () => setShowAcademicCaption(true),
    onOpenSQLExport: () => setShowSQLExport(true),
  });

  const handleCopyPNG = useCallback(() => {
    handleExport("clipboard-png");
  }, [handleExport]);

  const handleApplyPalette = useCallback(
    (palette: { bg: string; border: string; font: string; name: string }) => {
      actions.globalStyleChange(
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          fontColor: palette.font,
        },
        setGlobalStyle
      );
      showToast(isId ? `Tema diterapkan: ${palette.name}` : `Theme applied: ${palette.name}`, "success");
    },
    [actions, isId]
  );

  // --- Layout & Validate ---
  const handleLayout = useCallback(
    async (preset: string) => {
      if (!diagram) return;
      try {
        const r = await api.relayout(diagram, preset);
        if (r.diagram) {
          diagramHistory.set(r.diagram);
          showToast(
            isId
              ? `Tata letak diterapkan: ${preset.charAt(0).toUpperCase() + preset.slice(1)}`
              : `Layout applied: ${preset.charAt(0).toUpperCase() + preset.slice(1)}`,
            "success"
          );
        }
      } catch {
        showToast(isId ? "Gagal menghitung tata letak otomatis" : "Layout calculation failed", "error");
      }
    },
    [diagram, diagramHistory, isId]
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
                message: isId ? "✓ Valid — tidak ada masalah sintaks/struktur" : "✓ Valid — no issues",
                severity: "info",
              },
            ]
          : r.issues.map((i: any) => ({
              line: 0,
              column: 0,
              message: `[${i.rule}] ${i.message}`,
              severity: i.severity,
            }))
      );
    } catch {}
  }, [diagram, isId]);

  // --- Samples ---
  const handleSampleChange = useCallback(
    (key: string, inNewTab?: boolean) => {
      const sampleItem = RICH_SAMPLES.find((s) => s.id === key);
      const sampleCode = sampleItem?.dsl || SAMPLES[key];
      if (!sampleCode) return;

      const title = sampleItem
        ? `${sampleItem.title}`
        : `Sample: ${key}`;

      // Save current active tab before switching/creating
      if (activeTabId && (diagram || code)) {
        const current = storage.list().find((d) => d.id === activeTabId);
        if (current) {
          storage.save({
            ...current,
            code,
            diagram: diagram || null,
            updatedAt: new Date().toISOString(),
          });
        }
      }

      if (inNewTab) {
        const newId = `diagram_${Date.now()}`;
        const entry: SavedDiagram = {
          id: newId,
          name: title,
          code: sampleCode,
          diagram: null,
          updatedAt: new Date().toISOString(),
        };
        storage.save(entry);
        refreshTabs();
        setActiveTabId(newId);
        setCode(sampleCode);
        lastCompiledCode.current = sampleCode;
        diagramHistory.set(null);
        setErrors([]);
        handleCompile(sampleCode);
        showToast(
          isId
            ? `Contoh "${title}" dibuka di tab baru!`
            : `Sample "${title}" opened in a new tab!`,
          "success"
        );
      } else {
        if (activeTabId) {
          const current = storage.list().find((d) => d.id === activeTabId);
          if (current) {
            storage.save({
              ...current,
              name: title,
              code: sampleCode,
              diagram: null,
              updatedAt: new Date().toISOString(),
            });
            refreshTabs();
          }
        }
        setCode(sampleCode);
        lastCompiledCode.current = sampleCode;
        diagramHistory.set(null);
        setErrors([]);
        handleCompile(sampleCode);
        showToast(
          isId
            ? `Memuat contoh diagram: ${title}`
            : `Loaded sample diagram: ${title}`,
          "info"
        );
      }
    },
    [activeTabId, diagram, code, diagramHistory, handleCompile, isId, refreshTabs]
  );

  // --- Create Diagram by Type (Direct Visual or DSL) ---
  const handleCreateNewDiagram = useCallback(
    async (type: DiagramType, inNewTab?: boolean) => {
      const dsl = STARTER_DSL[type] || STARTER_DSL.class;
      const typeInfo = DIAGRAM_TYPES.find((t) => t.id === type);
      const name = typeInfo?.label || type;

      // Save current active tab before switching/creating
      if (activeTabId && (diagram || code)) {
        const current = storage.list().find((d) => d.id === activeTabId);
        if (current) {
          storage.save({
            ...current,
            code,
            diagram: diagram || null,
            updatedAt: new Date().toISOString(),
          });
        }
      }

      if (inNewTab) {
        const newId = `diagram_${Date.now()}`;
        const entry: SavedDiagram = {
          id: newId,
          name: `${name}`,
          code: dsl,
          diagram: null,
          updatedAt: new Date().toISOString(),
        };
        storage.save(entry);
        refreshTabs();
        setActiveTabId(newId);
        setCode(dsl);
        lastCompiledCode.current = dsl;
        diagramHistory.set(null);
        setErrors([]);
        await handleCompile(dsl);
        showToast(
          isId
            ? `Diagram ${name} baru dibuka di tab baru!`
            : `New ${name} diagram opened in new tab!`,
          "success"
        );
      } else {
        if (activeTabId) {
          const current = storage.list().find((d) => d.id === activeTabId);
          if (current) {
            storage.save({
              ...current,
              name: `${name}`,
              code: dsl,
              diagram: null,
              updatedAt: new Date().toISOString(),
            });
            refreshTabs();
          }
        }
        setCode(dsl);
        lastCompiledCode.current = dsl;
        await handleCompile(dsl);
        showToast(
          isId
            ? `Diagram ${name} baru siap digunakan!`
            : `New ${name} diagram ready!`,
          "success"
        );
      }
    },
    [activeTabId, diagram, code, handleCompile, isId, refreshTabs]
  );

  const handleEdgeRoutingToggle = useCallback(() => {
    setEdgeRouting((prev) => {
      const next = prev === "straight" ? "orthogonal" : "straight";
      try {
        localStorage.setItem("uml_edge_routing", next);
      } catch {}
      showToast(
        next === "orthogonal"
          ? isId
            ? "Mode Garis Siku (Orthogonal) Aktif"
            : "Orthogonal Routing Enabled"
          : isId
            ? "Mode Garis Lurus (Straight) Aktif"
            : "Straight Routing Enabled",
        "info"
      );
      return next;
    });
  }, [isId]);

  const handleAddNode = useCallback(
    (nodeType: string) => {
      if (!diagram) return;
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
        createDefaultNode(nodeType, diagram.type, diagram.nodes.length)
      );
    },
    [diagram, actions, diagramHistory]
  );

  const handleQuickAddNode = useCallback(
    (sourceNodeId: string) => {
      if (!diagram) return;
      const sourceNode = diagram.nodes.find((n) => n.id === sourceNodeId);
      if (!sourceNode) return;

      const sourceWidth = sourceNode.size?.width || 160;
      const targetType =
        sourceNode.type || (diagram.type === "class" ? "class" : "process");
      const newNode = createDefaultNode(
        targetType,
        diagram.type,
        diagram.nodes.length
      );
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
      showToast(isId ? "Node berhasil ditambahkan dan dihubungkan" : "Node added and connected", "success");
    },
    [diagram, diagramHistory, isId]
  );

  const handleSyncToCode = useCallback(async () => {
    if (!diagram) return;
    try {
      const exportableDiagram = {
        ...diagram,
        nodes: diagram.nodes.filter((n) => (n.type as string) !== "note"),
      };
      const dsl = await api.exportDiagram(exportableDiagram, { format: "dsl" });
      lastCompiledCode.current = dsl;
      setCode(dsl);
      showToast(isId ? "Diagram berhasil disinkronkan ke kode DSL" : "Diagram synced to code", "success");
    } catch {
      showToast(isId ? "Gagal sinkron — coba kompilasi terlebih dahulu" : "Failed to sync — try compiling first", "error");
    }
  }, [diagram, isId]);

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

  // --- Context menu hook ---
  const { handleCanvasContextMenu } = useCanvasContextMenuItems({
    diagram,
    diagramHistory,
    actions,
    copy,
    paste,
    hasClipboard,
    canvasTheme,
    toggleCanvasTheme,
    snapEnabled,
    setSnapEnabled: handleSnapToggle,
    edgeRouting,
    handleEdgeRoutingToggle,
    handleLayout,
    handleQuickAddNode,
    setSelectedNodeId,
    setSelectedEdgeId,
    setShowStylePanel,
    setContextMenu,
  });

  // --- Keyboard shortcuts hook ---
  useAppKeyboardShortcuts({
    diagram,
    selectedNodeId,
    setSelectedNodeId,
    selectedEdgeId,
    setSelectedEdgeId,
    selectedEdgeIds,
    setSelectedEdgeIds,
    onUndo: diagramHistory.undo,
    onRedo: diagramHistory.redo,
    onDeleteNode: actions.deleteNode,
    onDeleteEdge: actions.deleteEdge,
    onDeleteMultiEdges: (ids) => {
      if (diagram) {
        diagramHistory.set({
          ...diagram,
          edges: diagram.edges.filter((ed) => !ids.has(ed.id)),
        });
      }
    },
    onDuplicateNode: actions.duplicateNode,
    onCopy: copy,
    onPaste: () => {
      const pasted = paste();
      if (pasted && diagram) {
        diagramHistory.set({
          ...diagram,
          nodes: [...diagram.nodes, ...pasted.nodes],
          edges: [...diagram.edges, ...pasted.edges],
        });
      }
      return pasted;
    },
    onNewTab: handleNewTab,
    onSaveCurrent: handleSaveCurrent,
    showPresentation,
    setShowPresentation,
    onToggleShortcuts: () => setShowShortcuts((v) => !v),
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const selectedNode =
    diagram?.nodes.find((n) => n.id === selectedNodeId) || null;

  return (
    <div ref={appRef} className="fixed inset-0 flex flex-col w-full h-full overflow-hidden">
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
        onSelectDiagramType={handleCreateNewDiagram}
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
        onSnapToggle={handleSnapToggle}
        edgeRouting={edgeRouting}
        onEdgeRoutingToggle={handleEdgeRoutingToggle}
        canvasTheme={canvasTheme}
        onThemeToggle={toggleCanvasTheme}
        onMonochromeToggle={() => {
          const newVal = !isMonochrome;
          setIsMonochrome(newVal);
          if (newVal) {
            actions.globalStyleChange(
              { backgroundColor: "#ffffff" },
              setGlobalStyle
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
        tabs={tabs}
        activeTabId={activeTabId}
        onOpenTab={handleOpenTab}
      />

      {/* Diagram Tabs: Always visible so users can seamlessly switch & manage multiple diagrams */}
      {tabs.length > 0 && (
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

      <AppWorkspace
        mode={mode}
        showHistory={showHistory}
        onCloseHistory={() => setShowHistory(false)}
        undoCount={diagramHistory.historyLength || 0}
        redoCount={diagramHistory.redoLength || 0}
        onUndo={diagramHistory.undo}
        onRedo={diagramHistory.redo}
        code={code}
        onCodeChange={setCode}
        onCompile={handleCompile}
        errors={errors}
        onSyncToCode={handleSyncToCode}
        diagram={diagram}
        onCreateNewDiagram={handleCreateNewDiagram}
        onAddNode={handleAddNode}
        activeEdgeTool={activeEdgeTool}
        onEdgeToolSelect={setActiveEdgeTool}
        actions={actions}
        selectedNodeId={selectedNodeId}
        onNodeSelect={setSelectedNodeId}
        selectedEdgeId={selectedEdgeId}
        onEdgeSelect={(id) => {
          setSelectedEdgeId(id);
          if (id) setSelectedEdgeIds(new Set());
        }}
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
        onEdgeRoutingToggle={handleEdgeRoutingToggle}
        onQuickAddNode={handleQuickAddNode}
        onCanvasContextMenu={handleCanvasContextMenu}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        selectedNode={selectedNode}
        showStylePanel={showStylePanel}
        onOpenStylePanel={setShowStylePanel}
        globalStyle={globalStyle}
        onGlobalStyleChange={handleGlobalStyleChange}
        onCopyPNG={handleCopyPNG}
      />

      <StatusBar
        diagram={diagram}
        undoCount={diagramHistory.historyLength || 0}
        redoCount={diagramHistory.redoLength || 0}
        snapEnabled={snapEnabled}
        onSnapToggle={handleSnapToggle}
      />

      <AppModals
        showShortcuts={showShortcuts}
        onCloseShortcuts={() => setShowShortcuts(false)}
        contextMenu={contextMenu}
        onCloseContextMenu={() => setContextMenu(null)}
        showLibrary={showLibrary}
        onCloseLibrary={() => setShowLibrary(false)}
        tabs={tabs}
        activeTabId={activeTabId}
        onOpenTab={handleOpenTab}
        onDeleteSavedDiagram={(id) => {
          storage.remove(id);
          refreshTabs();
        }}
        onSaveCurrent={handleSaveCurrent}
        showTemplates={showTemplates}
        onCloseTemplates={() => setShowTemplates(false)}
        templates={templates}
        onLoadTemplate={handleLoadTemplate}
        onDeleteTemplate={handleDeleteTemplate}
        onSaveTemplate={handleSaveTemplate}
        showAI={showAI}
        onCloseAI={() => setShowAI(false)}
        onAIGenerate={(dsl) => {
          setCode(dsl);
          handleCompile(dsl);
        }}
        showPresentation={showPresentation}
        onExitPresentation={() => setShowPresentation(false)}
        showDiff={showDiff}
        onCloseDiff={() => setShowDiff(false)}
        diagram={diagram}
        onLoadDiffVersion={(d) => {
          diagramHistory.set(d);
          showToast(isId ? "Versi diagram berhasil dipulihkan" : "Version restored", "success");
        }}
        showAcademicCaption={showAcademicCaption}
        onCloseAcademicCaption={() => setShowAcademicCaption(false)}
        showSQLExport={showSQLExport}
        onCloseSQLExport={() => setShowSQLExport(false)}
        showImportModal={showImportModal}
        onCloseImportModal={() => setShowImportModal(false)}
        onImportDSL={(dsl) => {
          setCode(dsl);
          handleCompile(dsl);
        }}
        showShareModal={showShareModal}
        onCloseShareModal={() => setShowShareModal(false)}
        shareUrl={shareUrl}
      />

      <ToastContainer />
    </div>
  );
}
