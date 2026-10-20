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
    <div className="flex items-center bg-surface-2 border-b border-border overflow-x-auto shrink-0 h-8">
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <div
            key={tab.id}
            className={`flex items-center gap-1 px-3 h-full cursor-pointer border-r border-border shrink-0 group transition-colors select-none
              ${
                isActive
                  ? "bg-surface text-text border-b-2 border-b-accent"
                  : "text-text-muted hover:bg-surface-3 hover:text-text"
              }`}
            onClick={() => onSelect(tab.id)}
          >
            {editingId === tab.id ? (
              <input
                type="text"
                value={editValue}
                className="w-20 text-[11px] bg-surface-3 border border-accent rounded px-1 outline-none"
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
                className="text-[11px] max-w-[120px] truncate"
                onDoubleClick={(e) => startRename(tab.id, tab.name, e)}
                title={`${tab.name}\n${isId ? "Klik ganda untuk mengubah nama" : "Double-click to rename"}`}
              >
                {tab.name}
              </span>
            )}
            <button
              className="opacity-0 group-hover:opacity-100 transition-opacity w-3.5 h-3.5 flex items-center justify-center rounded text-text-muted hover:text-error hover:bg-error/10 text-[10px] ml-0.5"
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
        className="px-2.5 h-full text-text-muted hover:text-text hover:bg-surface-3 transition-colors text-sm shrink-0"
        onClick={onNew}
        title={isId ? "Diagram baru (Ctrl+N)" : "New diagram (Ctrl+N)"}
      >
        +
      </button>
    </div>
  );
}
