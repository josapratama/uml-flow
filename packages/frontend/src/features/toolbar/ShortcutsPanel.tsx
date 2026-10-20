import React from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  {
    category: "General",
    items: [
      { keys: "Ctrl + Enter", action: "Compile DSL" },
      { keys: "Ctrl + S", action: "Save to library" },
      { keys: "Ctrl + N", action: "New diagram tab" },
      { keys: "Ctrl + Z", action: "Undo" },
      { keys: "Ctrl + Shift + Z", action: "Redo" },
      { keys: "Ctrl + Y", action: "Redo" },
      { keys: "Delete", action: "Delete selected node/edge" },
      { keys: "?", action: "Toggle shortcuts panel" },
    ],
  },
  {
    category: "Canvas",
    items: [
      { keys: "Scroll", action: "Zoom in/out" },
      { keys: "Ctrl + Drag", action: "Pan canvas" },
      { keys: "Middle Mouse", action: "Pan canvas" },
      { keys: "Click node", action: "Select node" },
      { keys: "Shift + Click", action: "Multi-select" },
      { keys: "Double-click node", action: "Edit name" },
      { keys: "Click edge", action: "Select edge" },
    ],
  },
  {
    category: "Editor",
    items: [
      { keys: "Tab", action: "Indent" },
      { keys: "Ctrl + Enter", action: "Compile" },
    ],
  },
];

export function ShortcutsPanel({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-surface-2 border border-border rounded-xl shadow-2xl w-[480px] max-h-[70vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-text">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text text-lg"
          >
            ×
          </button>
        </div>
        <div className="p-5 space-y-5">
          {SHORTCUTS.map((group) => (
            <div key={group.category}>
              <h3 className="text-[10px] uppercase tracking-wider text-text-muted mb-2">
                {group.category}
              </h3>
              <div className="space-y-1.5">
                {group.items.map((item) => (
                  <div
                    key={item.keys}
                    className="flex justify-between items-center"
                  >
                    <span className="text-xs text-text-muted">
                      {item.action}
                    </span>
                    <kbd className="px-2 py-0.5 bg-surface-3 border border-border rounded text-[11px] font-mono text-text">
                      {item.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
