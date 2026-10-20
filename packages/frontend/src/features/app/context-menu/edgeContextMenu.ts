import type { Diagram, Position } from "@uml-editor/shared";
import type { ContextMenuItem } from "../../canvas/ContextMenu";
import type { Locale } from "../../../i18n";

interface EdgeContextMenuParams {
  diagram: Diagram;
  edgeId?: string;
  worldPos: Position;
  actions: any;
  setSelectedEdgeId: (id: string | null) => void;
  setShowStylePanel: (type: "node" | "global" | "edge" | null) => void;
  locale?: Locale;
}

export function buildEdgeContextMenuItems({
  diagram,
  edgeId,
  worldPos,
  actions,
  setSelectedEdgeId,
  setShowStylePanel,
  locale = "id",
}: EdgeContextMenuParams): ContextMenuItem[] {
  const isId = locale === "id";
  const items: ContextMenuItem[] = [];
  const currentEdge = diagram.edges.find((e) => e.id === edgeId);
  if (!currentEdge) return [];

  items.push({
    label: isId ? "Ubah Label Relasi" : "Edit Label",
    icon: "🏷️",
    action: () => {
      const promptText = isId ? "Teks label relasi:" : "Relationship label:";
      const newLabel = window.prompt(promptText, currentEdge.label?.text || "");
      if (newLabel !== null) {
        actions.edgeLabelEdit(currentEdge.id, newLabel.trim());
      }
    },
  });

  items.push({
    label: isId ? "Tambah Titik Belok di Sini" : "Add Waypoint Here",
    icon: "📍",
    action: () => {
      actions.edgeWaypointAdd(currentEdge.id, 0, worldPos);
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
    label: isId ? "Ubah Tipe Relasi" : "Change Type",
    icon: "🔀",
    children: edgeTypes.map((et) => ({
      label: et.label,
      icon: currentEdge.type === et.type ? "✓" : undefined,
      action: () => actions.edgeTypeChange(currentEdge.id, et.type),
    })),
  });

  items.push({
    label: isId ? "Balik Arah Panah" : "Reverse Direction",
    icon: "⇄",
    action: () => actions.edgeReverse(currentEdge.id),
  });

  items.push({
    label: isId ? "Kustomisasi Garis..." : "Style Edge...",
    icon: "🎨",
    action: () => setShowStylePanel("edge"),
  });

  items.push({ separator: true, label: "", action: () => {} });

  items.push({
    label: isId ? "Hapus Relasi Ini" : "Delete Relationship",
    icon: "🗑",
    shortcut: "Del",
    danger: true,
    action: () => {
      actions.deleteEdge(currentEdge.id);
      setSelectedEdgeId(null);
    },
  });

  return items;
}
