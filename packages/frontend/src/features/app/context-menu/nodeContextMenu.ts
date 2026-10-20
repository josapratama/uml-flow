import type { Diagram, DiagramNode } from "@uml-editor/shared";
import type { ContextMenuItem } from "../../canvas/ContextMenu";
import type { CanvasTheme } from "../../../hooks/useTheme";
import type { Locale } from "../../../i18n";

interface NodeContextMenuParams {
  diagram: Diagram;
  nodeId?: string;
  multiNodeIds?: string[];
  canvasTheme: CanvasTheme;
  actions: any;
  copy: (nodes: any[], edges: any[]) => void;
  diagramHistory: any;
  setSelectedNodeId: (id: string | null) => void;
  handleQuickAddNode: (nodeId: string) => void;
  locale?: Locale;
}

export function buildNodeContextMenuItems({
  diagram,
  nodeId,
  multiNodeIds,
  canvasTheme,
  actions,
  copy,
  diagramHistory,
  setSelectedNodeId,
  handleQuickAddNode,
  locale = "id",
}: NodeContextMenuParams): ContextMenuItem[] {
  const isId = locale === "id";
  const items: ContextMenuItem[] = [];
  const isMulti = multiNodeIds && multiNodeIds.length > 1;

  if (isMulti) {
    const selectedNodes = diagram.nodes.filter((n) =>
      multiNodeIds.includes(n.id)
    );

    items.push({
      label: isId ? "Ratakan Posisi Node" : "Align Nodes",
      icon: "📏",
      children: [
        {
          label: isId ? "Rata Kiri" : "Align Left",
          icon: "⇤",
          action: () => actions.alignNodes?.(multiNodeIds, "left"),
        },
        {
          label: isId ? "Rata Tengah" : "Align Center",
          icon: "⇥⇤",
          action: () => actions.alignNodes?.(multiNodeIds, "center"),
        },
        {
          label: isId ? "Rata Kanan" : "Align Right",
          icon: "⇥",
          action: () => actions.alignNodes?.(multiNodeIds, "right"),
        },
        { separator: true, label: "", action: () => {} },
        {
          label: isId ? "Rata Atas" : "Align Top",
          icon: "⤒",
          action: () => actions.alignNodes?.(multiNodeIds, "top"),
        },
        {
          label: isId ? "Rata Tengah Vertikal" : "Align Middle",
          icon: "⇕",
          action: () => actions.alignNodes?.(multiNodeIds, "middle"),
        },
        {
          label: isId ? "Rata Bawah" : "Align Bottom",
          icon: "⤓",
          action: () => actions.alignNodes?.(multiNodeIds, "bottom"),
        },
      ],
    });

    items.push({
      label: isId ? "Distribusikan Jarak" : "Distribute",
      icon: "↔",
      children: [
        {
          label: isId ? "Distribusikan Horizontal" : "Distribute Horizontally",
          icon: "↔",
          action: () => actions.distributeNodes?.(multiNodeIds, "horizontal"),
        },
        {
          label: isId ? "Distribusikan Vertikal" : "Distribute Vertically",
          icon: "↕",
          action: () => actions.distributeNodes?.(multiNodeIds, "vertical"),
        },
      ],
    });

    items.push({ separator: true, label: "", action: () => {} });

    items.push({
      label: isId
        ? `Salin Semua (${multiNodeIds.length} node)`
        : `Copy All (${multiNodeIds.length} nodes)`,
      icon: "📋",
      shortcut: "Ctrl+C",
      action: () => copy(selectedNodes, diagram.edges),
    });

    items.push({
      label: isId
        ? `Hapus Semua (${multiNodeIds.length} node)`
        : `Delete All (${multiNodeIds.length} nodes)`,
      icon: "🗑",
      shortcut: "Del",
      danger: true,
      action: () => {
        diagramHistory.set({
          ...diagram,
          nodes: diagram.nodes.filter((n) => !multiNodeIds.includes(n.id)),
          edges: diagram.edges.filter(
            (e) =>
              !multiNodeIds.includes(e.source) &&
              !multiNodeIds.includes(e.target)
          ),
        });
        setSelectedNodeId(null);
      },
    });
  } else {
    const node = diagram.nodes.find((n) => n.id === nodeId);
    if (!node) return [];

    items.push({
      label: isId ? "Ubah Nama" : "Rename",
      icon: "✏️",
      shortcut: "F2",
      action: () => {
        const promptText = isId ? "Ubah nama entitas/node:" : "Rename entity/node:";
        const newName = window.prompt(promptText, node.name);
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
        label: isId ? "Tambah Kolom" : "Add Column",
        icon: "➕",
        action: () => {
          const promptText = isId ? "Nama Kolom Baru:" : "New Column Name:";
          const colName = window.prompt(promptText, "new_column");
          if (colName && colName.trim()) {
            actions.addERDColumn(
              node.id,
              colName.trim(),
              "varchar",
              false,
              false,
              true
            );
          }
        },
      });
    } else if (diagram.type === "class" || "methods" in node) {
      items.push({
        label: isId ? "Tambah Properti" : "Add Property",
        icon: "➕",
        action: () => {
          const promptText = isId
            ? "Properti Baru (nama: tipe):"
            : "New Property (name: type):";
          const prop = window.prompt(promptText, "property: string");
          if (prop && prop.trim()) {
            const parts = prop.trim().split(":");
            const name = parts[0]?.trim().replace(/^[+\-#~]/, "") || "property";
            const type = parts[1]?.trim() || "string";
            actions.addAttribute(node.id, name, type, "public");
          }
        },
      });
      items.push({
        label: isId ? "Tambah Method" : "Add Method",
        icon: "ƒ",
        action: () => {
          const promptText = isId
            ? "Method Baru (nama(): tipeReturn):"
            : "New Method (name(): returnType):";
          const method = window.prompt(promptText, "execute(): void");
          if (method && method.trim()) {
            const parts = method.trim().split(":");
            const name =
              parts[0]?.trim().replace(/^[+\-#~]/, "").replace("()", "") ||
              "execute";
            const returnType = parts[1]?.trim() || "void";
            actions.addMethod(node.id, name, returnType, "public");
          }
        },
      });
    }

    // Color & Styling Submenu
    items.push({
      label: isId ? "Warna & Gaya" : "Color & Style",
      icon: "🎨",
      children: [
        {
          label: isId ? "Bawaan" : "Default",
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
              backgroundColor: canvasTheme === "dark" ? "#1e1e38" : "#e0e7ff",
              borderColor: "#6366f1",
            }),
        },
        {
          label: "Violet",
          icon: "🟣",
          action: () =>
            actions.nodeStyleChange(node.id, {
              backgroundColor: canvasTheme === "dark" ? "#261938" : "#ede9fe",
              borderColor: "#8b5cf6",
            }),
        },
        {
          label: "Emerald",
          icon: "🟢",
          action: () =>
            actions.nodeStyleChange(node.id, {
              backgroundColor: canvasTheme === "dark" ? "#122822" : "#d1fae5",
              borderColor: "#10b981",
            }),
        },
        {
          label: "Amber",
          icon: "🟡",
          action: () =>
            actions.nodeStyleChange(node.id, {
              backgroundColor: canvasTheme === "dark" ? "#2d2315" : "#fef3c7",
              borderColor: "#f59e0b",
            }),
        },
        {
          label: "Rose",
          icon: "🔴",
          action: () =>
            actions.nodeStyleChange(node.id, {
              backgroundColor: canvasTheme === "dark" ? "#2d161d" : "#ffe4e6",
              borderColor: "#f43f5e",
            }),
        },
        {
          label: "Slate",
          icon: "⚫",
          action: () =>
            actions.nodeStyleChange(node.id, {
              backgroundColor: canvasTheme === "dark" ? "#0f172a" : "#f1f5f9",
              borderColor: "#64748b",
            }),
        },
      ],
    });

    // Quick relationship connection
    items.push({
      label: isId ? "Hubungkan Relasi..." : "Connect Relationship...",
      icon: "🔗",
      action: () => handleQuickAddNode(node.id),
    });

    // Add Review / Advisor Feedback Pin
    items.push({
      label: isId
        ? "Tambah Catatan Revisi Dosen..."
        : "Add Review / Feedback Note...",
      icon: "📌",
      action: () => {
        const noteId = `note_review_${Date.now()}`;
        const noteText = isId
          ? `Revisi untuk ${node.name}:\n• Catatan review dosen...`
          : `Feedback for ${node.name}:\n• Advisor review notes...`;
        const noteNode = {
          id: noteId,
          type: "note",
          name: noteText,
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
      label: isId ? "Salin" : "Copy",
      icon: "📋",
      shortcut: "Ctrl+C",
      action: () => copy([node], diagram.edges),
    });

    items.push({
      label: isId ? "Gandakan" : "Duplicate",
      icon: "⧉",
      shortcut: "Ctrl+D",
      action: () => {
        const id = actions.duplicateNode(node.id);
        if (id) setSelectedNodeId(id);
      },
    });

    items.push({
      label: isId ? "Bawa ke Depan" : "Bring to Front",
      icon: "⬆",
      action: () => {
        const others = diagram.nodes.filter((n) => n.id !== node.id);
        diagramHistory.set({ ...diagram, nodes: [...others, node] });
      },
    });

    items.push({
      label: isId ? "Kirim ke Belakang" : "Send to Back",
      icon: "⬇",
      action: () => {
        const others = diagram.nodes.filter((n) => n.id !== node.id);
        diagramHistory.set({ ...diagram, nodes: [node, ...others] });
      },
    });

    items.push({ separator: true, label: "", action: () => {} });

    items.push({
      label: isId ? "Hapus" : "Delete",
      icon: "🗑",
      shortcut: "Del",
      danger: true,
      action: () => {
        actions.deleteNode(node.id);
        setSelectedNodeId(null);
      },
    });
  }

  return items;
}
