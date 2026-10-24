import React, { useState, useEffect } from "react";
import type { DiagramType } from "@uml-editor/shared";
import { DiagramTypeMenu } from "../toolbar/DiagramTypeMenu";
import { useI18n } from "../../i18n";

interface NodePaletteProps {
  diagramType: DiagramType;
  onAddNode: (nodeType: string) => void;
  activeEdgeTool?: string | null;
  onEdgeToolSelect?: (edgeType: string | null) => void;
  onCreateNewDiagram?: (type: DiagramType) => void;
}

const PALETTE: Record<string, { label: string; icon: string; type: string }[]> = {
  class: [
    { label: "Class", icon: "▭", type: "class" },
    { label: "Interface", icon: "◻", type: "interface" },
    { label: "Abstract", icon: "▨", type: "abstract" },
    { label: "Enum", icon: "▤", type: "enum" },
    { label: "Boundary", icon: "▢", type: "system" },
    { label: "Note", icon: "📝", type: "note" },
  ],
  sequence: [
    { label: "Actor", icon: "🧑", type: "actor" },
    { label: "Object", icon: "▭", type: "object" },
    { label: "Boundary", icon: "◯", type: "boundary" },
    { label: "Entity", icon: "⊥", type: "entity" },
    { label: "Note", icon: "📝", type: "note" },
  ],
  activity: [
    { label: "Start", icon: "●", type: "start" },
    { label: "End", icon: "◉", type: "end" },
    { label: "Action", icon: "▭", type: "action" },
    { label: "Decision", icon: "◇", type: "decision" },
    { label: "Fork", icon: "═", type: "fork" },
    { label: "Note", icon: "📝", type: "note" },
  ],
  flowchart: [
    { label: "Start", icon: "⬭", type: "start" },
    { label: "End", icon: "⬭", type: "end" },
    { label: "Process", icon: "▭", type: "process" },
    { label: "Decision", icon: "◇", type: "decision" },
    { label: "I/O", icon: "▱", type: "io" },
    { label: "Database", icon: "🗄", type: "database" },
    { label: "Document", icon: "📄", type: "document" },
    { label: "Boundary", icon: "▢", type: "system" },
    { label: "Note", icon: "📝", type: "note" },
  ],
  erd: [
    { label: "Entity (Tabel)", icon: "⊞", type: "entity" },
    { label: "Boundary", icon: "▢", type: "system" },
    { label: "Note", icon: "📝", type: "note" },
  ],
  state: [
    { label: "Initial", icon: "●", type: "initial" },
    { label: "Final", icon: "◉", type: "final" },
    { label: "State", icon: "▭", type: "state" },
    { label: "Composite", icon: "⊞", type: "composite" },
    { label: "Note", icon: "📝", type: "note" },
  ],
  usecase: [
    { label: "Actor", icon: "🧑", type: "actor" },
    { label: "Use Case", icon: "⬭", type: "usecase" },
    { label: "System", icon: "▭", type: "system" },
    { label: "Note", icon: "📝", type: "note" },
  ],
  component: [
    { label: "Component", icon: "🧩", type: "component" },
    { label: "Provided ○", icon: "○", type: "interface-provided" },
    { label: "Required ◗", icon: "◗", type: "interface-required" },
    { label: "Boundary", icon: "▢", type: "system" },
    { label: "Note", icon: "📝", type: "note" },
  ],
  deployment: [
    { label: "Node", icon: "🖥", type: "node" },
    { label: "Device", icon: "📦", type: "device" },
    { label: "Artifact", icon: "📄", type: "artifact" },
    { label: "Component", icon: "🧩", type: "component" },
    { label: "Boundary", icon: "▢", type: "system" },
    { label: "Note", icon: "📝", type: "note" },
  ],
};

const EDGE_PALETTE: Record<
  string,
  { label: string; icon: string; type: string }[]
> = {
  class: [
    { label: "Association", icon: "→", type: "association" },
    { label: "Inheritance", icon: "△", type: "inheritance" },
    { label: "Composition", icon: "◆", type: "composition" },
    { label: "Aggregation", icon: "◇", type: "aggregation" },
    { label: "Dependency", icon: "⇢", type: "dependency" },
    { label: "Realization", icon: "⇠", type: "realization" },
  ],
  usecase: [
    { label: "Association", icon: "—", type: "association" },
    { label: "Include", icon: "⇢", type: "include" },
    { label: "Extend", icon: "⇠", type: "extend" },
    { label: "Inheritance", icon: "△", type: "inheritance" },
  ],
  activity: [{ label: "Flow", icon: "→", type: "flow" }],
  flowchart: [{ label: "Flow", icon: "→", type: "flow" }],
  state: [{ label: "Transition", icon: "→", type: "transition" }],
  erd: [
    { label: "1:1", icon: "—", type: "one-to-one" },
    { label: "1:N", icon: "→", type: "one-to-many" },
    { label: "N:M", icon: "⇔", type: "many-to-many" },
  ],
  sequence: [
    { label: "Call (->)", icon: "➔", type: "sync" },
    { label: "Async (-->)", icon: "⇢", type: "async" },
    { label: "Reply (-->>)", icon: "⇠", type: "reply" },
  ],
  component: [
    { label: "Usage", icon: "→", type: "association" },
    { label: "Dependency", icon: "⇢", type: "dependency" },
    { label: "Realization", icon: "⇠", type: "realization" },
  ],
  deployment: [
    { label: "Deploy", icon: "→", type: "deploy" },
    { label: "Manifest", icon: "⇢", type: "manifest" },
    { label: "Association", icon: "—", type: "association" },
  ],
};

export function NodePalette({
  diagramType,
  onAddNode,
  activeEdgeTool,
  onEdgeToolSelect,
  onCreateNewDiagram,
}: NodePaletteProps) {
  const { t, locale } = useI18n();
  const isId = locale === "id";
  const [selectedPaletteType, setSelectedPaletteType] = useState<DiagramType>(
    diagramType || "class"
  );

  useEffect(() => {
    if (diagramType) {
      setSelectedPaletteType(diagramType);
    }
  }, [diagramType]);

  const items = PALETTE[selectedPaletteType] || PALETTE.class;
  const edgeItems = EDGE_PALETTE[selectedPaletteType] || EDGE_PALETTE.class;

  const handleSelectType = (newType: DiagramType) => {
    setSelectedPaletteType(newType);
    if (onCreateNewDiagram) {
      onCreateNewDiagram(newType);
    }
  };

  return (
    <div className="w-48 bg-surface-2 border-r border-border flex flex-col shrink-0">
      {/* Palette Header with Diagram Type Switcher */}
      <div className="p-2 border-b border-border bg-surface-1/40 space-y-1.5">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
            {t("palette.title")}
          </span>
          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold bg-accent/15 text-accent uppercase">
            {selectedPaletteType}
          </span>
        </div>

        {/* Diagram Type Selector in Palette */}
        <DiagramTypeMenu
          currentType={selectedPaletteType}
          onSelectType={handleSelectType}
          variant="palette"
        />

        {/* 1-Click Action to switch active canvas if different type */}
        {selectedPaletteType !== diagramType && onCreateNewDiagram && (
          <button
            onClick={() => onCreateNewDiagram(selectedPaletteType)}
            className="w-full py-1.5 px-2 rounded-md bg-linear-to-r from-accent to-indigo-500 text-white text-[10px] font-semibold flex items-center justify-center gap-1.5 shadow-xs hover:from-accent-hover hover:to-indigo-400 transition-all cursor-pointer"
            title={
              isId
                ? `Mulai kanvas baru untuk diagram ${selectedPaletteType}`
                : `Start new canvas for ${selectedPaletteType} diagram`
            }
          >
            <span>✨</span>
            <span>
              {isId
                ? `Buat ${selectedPaletteType.toUpperCase()} Baru`
                : `New ${selectedPaletteType.toUpperCase()}`}
            </span>
          </button>
        )}
      </div>

      <div className="p-2 flex flex-col gap-1 overflow-y-auto custom-scrollbar flex-1">
        {/* Node items */}
        {items.map((item) => (
          <button
            key={item.type}
            className="flex items-center gap-2 px-2.5 py-2 text-left text-xs text-text-muted rounded-md border border-transparent hover:bg-surface-3 hover:border-border hover:text-text active:bg-accent active:text-white transition-all cursor-pointer group"
            onClick={() => {
              if (selectedPaletteType !== diagramType && onCreateNewDiagram) {
                onCreateNewDiagram(selectedPaletteType);
              } else {
                onAddNode(item.type);
              }
            }}
            title={`${t("palette.addNode")} ${item.label}`}
          >
            <span className="text-sm w-5 text-center shrink-0 group-hover:scale-110 transition-transform">
              {item.icon}
            </span>
            <span className="truncate">{item.label}</span>
          </button>
        ))}

        {/* Connections separator */}
        {edgeItems.length > 0 && onEdgeToolSelect && (
          <>
            <div className="mt-2.5 mb-1 px-2 text-[9px] font-semibold uppercase tracking-wider text-text-muted opacity-70">
              {t("palette.connections")}
            </div>
            {edgeItems.map((item) => (
              <button
                key={`edge_${item.type}`}
                className={`flex items-center gap-2 px-2.5 py-1.5 text-left text-xs rounded-md border transition-all cursor-pointer ${
                  activeEdgeTool === item.type
                    ? "bg-accent/15 border-accent text-accent font-medium shadow-2xs"
                    : "text-text-muted border-transparent hover:bg-surface-3 hover:border-border hover:text-text"
                }`}
                onClick={() =>
                  onEdgeToolSelect(
                    activeEdgeTool === item.type ? null : item.type
                  )
                }
                title={`${item.label} ${t("palette.connectionTool")}${
                  activeEdgeTool === item.type
                    ? ` ${t("palette.activeHint")}`
                    : ""
                }`}
              >
                <span className="text-sm w-5 text-center shrink-0">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
