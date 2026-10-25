import React, { useState } from "react";
import type { SavedDiagram } from "../../services/storage";
import { useI18n } from "../../i18n";

interface Props {
  tabs: SavedDiagram[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onClose: (id: string) => void;
  onRename: (id: string, name: string) => void;
}

function getTabIcon(tab: SavedDiagram): string {
  if (tab.diagram?.type) {
    const map: Record<string, string> = {
      class: "📋",
      sequence: "🔄",
      flowchart: "📊",
      erd: "🗄️",
      state: "⚡",
      usecase: "🎯",
      activity: "🏃",
      component: "🧩",
      deployment: "☁️",
      package: "📦",
    };
    if (map[tab.diagram.type]) return map[tab.diagram.type];
  }
  const match = tab.code?.match(/@diagram\s+(?:"[^"]*"\s+)?([a-zA-Z0-9_-]+)/i);
  if (match) {
    const type = match[1].toLowerCase();
    const map: Record<string, string> = {
      class: "📋",
      sequence: "🔄",
      flowchart: "📊",
      erd: "🗄️",
      state: "⚡",
      usecase: "🎯",
      activity: "🏃",
      component: "🧩",
      deployment: "☁️",
      package: "📦",
    };
    if (map[type]) return map[type];
  }
  return "📄";
}

export function DiagramTabs({
  tabs,
  activeId,
  onSelect,
  onNew,
  onClose,
  onRename,
}: Props) {
  const { locale } = useI18n();
  const isId = locale === "id";
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const startRename = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditValue(name);
  };

  const commitRename = (id: string) => {
    if (editValue.trim()) onRename(id, editValue.trim());
    setEditingId(null);
  };

  return (
    <div className="flex items-center bg-surface-2 border-b border-border overflow-x-auto no-scrollbar shrink-0 h-8 px-1">
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        const icon = getTabIcon(tab);
        return (
          <div
            key={tab.id}
            className={`flex items-center gap-1.5 px-3 h-full cursor-pointer border-r border-border shrink-0 group transition-all select-none
              ${
                isActive
                  ? "bg-surface-3/80 text-accent font-semibold border-b-2 border-b-accent shadow-xs"
                  : "text-text-muted hover:bg-surface-3 hover:text-text"
              }`}
            onClick={() => onSelect(tab.id)}
            title={`${tab.name}\n${isId ? "Klik untuk memilih • Klik ganda untuk mengubah nama" : "Click to select • Double click to rename"}`}
          >
            <span className="text-xs shrink-0">{icon}</span>
            {editingId === tab.id ? (
              <input
                type="text"
                value={editValue}
                className="w-24 text-[11px] bg-surface-2 border border-accent rounded px-1.5 py-0.5 outline-none font-normal text-text"
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename(tab.id);
                  if (e.key === "Escape") setEditingId(null);
                }}
                onBlur={() => commitRename(tab.id)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            ) : (
              <span
                className="text-[11px] max-w-[130px] truncate"
                onDoubleClick={(e) => startRename(tab.id, tab.name, e)}
              >
                {tab.name}
              </span>
            )}
            <button
              className="opacity-0 group-hover:opacity-100 transition-opacity w-3.5 h-3.5 flex items-center justify-center rounded text-text-muted hover:text-error hover:bg-error/15 text-[11px] ml-1"
              onClick={(e) => {
                e.stopPropagation();
                onClose(tab.id);
              }}
              title={isId ? "Tutup tab" : "Close tab"}
            >
              ×
            </button>
          </div>
        );
      })}
      <button
        className="px-2.5 h-full text-text-muted hover:text-accent hover:bg-surface-3 transition-colors text-sm shrink-0 flex items-center justify-center gap-1 font-semibold"
        onClick={onNew}
        title={isId ? "Buka tab diagram baru (Ctrl+N)" : "Open new diagram tab (Ctrl+N)"}
      >
        <span>+</span>
        <span className="text-[10px] hidden sm:inline">{isId ? "Tab Baru" : "New Tab"}</span>
      </button>
    </div>
  );
}
