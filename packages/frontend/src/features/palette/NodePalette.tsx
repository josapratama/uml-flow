import React from "react";
import type { DiagramType } from "@uml-editor/shared";

interface NodePaletteProps {
  diagramType: DiagramType;
  onAddNode: (nodeType: string) => void;
  activeEdgeTool?: string | null;
  onEdgeToolSelect?: (edgeType: string | null) => void;
}

const PALETTE: Record<string, { label: string; icon: string; type: string }[]> =
  {
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
      { label: "Entity", icon: "⊞", type: "entity" },
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
  sequence: [],
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
}: NodePaletteProps) {
  const items = PALETTE[diagramType] || PALETTE.class;
  const edgeItems = EDGE_PALETTE[diagramType] || EDGE_PALETTE.class;

  return (
    <div className="w-36 bg-surface-2 border-r border-border flex flex-col shrink-0">
      <div className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted border-b border-border">
        Palette
      </div>
      <div className="p-2 flex flex-col gap-1 overflow-y-auto">
        {/* Node items */}
        {items.map((item) => (
          <button
            key={item.type}
            className="flex items-center gap-2 px-2.5 py-2 text-left text-xs text-text-muted rounded-md border border-transparent hover:bg-surface-3 hover:border-border hover:text-text active:bg-accent active:text-white transition-all cursor-grab active:cursor-grabbing"
            onClick={() => onAddNode(item.type)}
            title={`Add ${item.label}`}
          >
            <span className="text-sm w-5 text-center">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}

        {/* Separator */}
        {edgeItems.length > 0 && onEdgeToolSelect && (
          <>
            <div className="mt-2 mb-1 px-2 text-[9px] font-semibold uppercase tracking-wider text-text-muted opacity-60">
              Connections
            </div>
            {edgeItems.map((item) => (
              <button
                key={`edge_${item.type}`}
                className={`flex items-center gap-2 px-2.5 py-1.5 text-left text-xs rounded-md border transition-all ${
                  activeEdgeTool === item.type
                    ? "bg-accent/15 border-accent text-accent font-medium"
                    : "text-text-muted border-transparent hover:bg-surface-3 hover:border-border hover:text-text"
                }`}
                onClick={() =>
                  onEdgeToolSelect(
                    activeEdgeTool === item.type ? null : item.type,
                  )
                }
                title={`${item.label} connection tool${activeEdgeTool === item.type ? " (active - click to deselect)" : ""}`}
              >
                <span className="text-sm w-5 text-center">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
