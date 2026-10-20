import React from "react";
import type { Diagram, Position } from "@uml-editor/shared";
import type { ContextMenuItem } from "../../canvas/ContextMenu";
import type { CanvasTheme } from "../../../hooks/useTheme";
import { getVisualSize } from "../../canvas/nodes/getVisualSize";
import type { Locale } from "../../../i18n";

interface CanvasContextMenuParams {
  diagram: Diagram;
  worldPos: Position;
  diagramHistory: any;
  setSelectedNodeId: (id: string | null) => void;
  hasClipboard: boolean;
  paste: (dx?: number, dy?: number) => { nodes: any[]; edges: any[] } | null;
  handleLayout: (preset: string) => void;
  canvasTheme: CanvasTheme;
  toggleCanvasTheme: () => void;
  snapEnabled: boolean;
  setSnapEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  edgeRouting: "straight" | "orthogonal";
  handleEdgeRoutingToggle: () => void;
  locale?: Locale;
}

export function buildCanvasContextMenuItems({
  diagram,
  worldPos,
  diagramHistory,
  setSelectedNodeId,
  hasClipboard,
  paste,
  handleLayout,
  canvasTheme,
  toggleCanvasTheme,
  snapEnabled,
  setSnapEnabled,
  edgeRouting,
  handleEdgeRoutingToggle,
  locale = "id",
}: CanvasContextMenuParams): ContextMenuItem[] {
  const isId = locale === "id";
  const items: ContextMenuItem[] = [];

  const typeLabelMapId: Record<string, string> = {
    erd: "Entitas",
    class: "Class",
    state: "State",
    flowchart: "Langkah",
    usecase: "Use Case",
    component: "Komponen",
    deployment: "Node",
  };
  const typeLabelMapEn: Record<string, string> = {
    erd: "Entity",
    class: "Class",
    state: "State",
    flowchart: "Step",
    usecase: "Use Case",
    component: "Component",
    deployment: "Node",
  };
  const entityLabel = (isId ? typeLabelMapId[diagram.type] : typeLabelMapEn[diagram.type]) || (isId ? "Simbol" : "Node");

  items.push({
    label: isId ? `Tambah ${entityLabel} di Sini` : `Add ${entityLabel} Here`,
    icon: "➕",
    action: () => {
      const count = diagram.nodes.length + 1;
      const name = `${entityLabel}${count}`;
      const id = `node_${Date.now()}`;
      const vs = getVisualSize({
        name,
        type: diagram.type,
        position: worldPos,
      } as any);
      const newNode = {
        id,
        name,
        type: diagram.type,
        position: worldPos,
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
    label: isId ? "Tambah Catatan Tempel di Sini" : "Add Sticky Note Here",
    icon: "📝",
    action: () => {
      const id = `note_${Date.now()}`;
      const newNote = {
        id,
        type: "note",
        name: isId ? "Catatan" : "Note",
        content: isId ? "Catatan Tempel" : "Sticky Note",
        position: worldPos,
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
    label: isId ? "Tambah Batas Sistem di Sini" : "Add System Boundary Here",
    icon: "▢",
    action: () => {
      const id = `boundary_${Date.now()}`;
      const newBoundary = {
        id,
        type: "system",
        name: isId ? "Batas Sistem" : "System Boundary",
        position: worldPos,
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
    label: isId ? "Tempel di Posisi Kursor" : "Paste at Cursor",
    icon: "📋",
    shortcut: "Ctrl+V",
    disabled: !hasClipboard,
    action: () => {
      const p = paste(
        worldPos.x - (diagram.nodes[0]?.position.x ?? 0),
        worldPos.y - (diagram.nodes[0]?.position.y ?? 0)
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
    label: isId ? "Tata Letak Otomatis" : "Auto Layout",
    icon: "📐",
    children: [
      {
        label: isId ? "Hirarkis / Bertingkat" : "Hierarchical / Layered",
        icon: "🌲",
        action: () => handleLayout("layered"),
      },
      {
        label: isId ? "Gaya Pegas (Force-Directed)" : "Force-Directed",
        icon: "🌐",
        action: () => handleLayout("force"),
      },
      {
        label: isId ? "Lingkaran Radial" : "Radial Rings",
        icon: "🎯",
        action: () => handleLayout("radial"),
      },
      {
        label: isId ? "Susunan Kisi (Grid)" : "Grid Arrangement",
        icon: "⊞",
        action: () => handleLayout("grid"),
      },
      {
        label: isId ? "Tumpukan Linier" : "Linear Stack",
        icon: "📋",
        action: () => handleLayout("linear"),
      },
    ],
  });

  // View Controls Submenu
  items.push({
    label: isId ? "Kontrol Tampilan Kanvas" : "View Controls",
    icon: "🔍",
    children: [
      {
        label: isId ? "Paskan ke Layar" : "Zoom to Fit",
        icon: "⊡",
        action: () =>
          document
            .querySelector<HTMLButtonElement>('[title="Zoom to fit diagram"]')
            ?.click(),
      },
      {
        label: "Reset Zoom (100%)",
        icon: "⟲",
        action: () =>
          document
            .querySelector<HTMLButtonElement>('[title="Reset zoom to 100%"]')
            ?.click(),
      },
      {
        label:
          canvasTheme === "dark"
            ? (isId ? "Beralih ke Tema Terang" : "Switch to Light Theme")
            : (isId ? "Beralih ke Tema Gelap" : "Switch to Dark Theme"),
        icon: canvasTheme === "dark" ? "☀️" : "🌙",
        action: () => toggleCanvasTheme(),
      },
      {
        label: snapEnabled
          ? (isId ? "Nonaktifkan Snap Kisi" : "Disable Grid Snap")
          : (isId ? "Aktifkan Snap Kisi" : "Enable Grid Snap"),
        icon: "🔲",
        action: () => setSnapEnabled((v) => !v),
      },
      {
        label:
          edgeRouting === "orthogonal"
            ? (isId ? "Gunakan Garis Lurus" : "Switch to Straight Routing")
            : (isId ? "Gunakan Garis Siku (Orthogonal)" : "Switch to Orthogonal Routing"),
        icon: "🔀",
        action: handleEdgeRoutingToggle,
      },
    ],
  });

  items.push({ separator: true, label: "", action: () => {} });

  items.push({
    label: isId ? "Pilih Semua Node" : "Select All Nodes",
    icon: "🗂️",
    shortcut: "Ctrl+A",
    action: () => {
      if (diagram.nodes.length > 0) {
        setSelectedNodeId(diagram.nodes[0].id);
      }
    },
  });

  return items;
}
