import React, { useState } from "react";
import type { DiagramTemplate } from "../../services/templates";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  templates: DiagramTemplate[];
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onSave: (name: string, description: string) => void;
}

export function TemplatesPanel({
  isOpen,
  onClose,
  templates,
  onLoad,
  onDelete,
  onSave,
}: Props) {
  const [saving, setSaving] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveDesc, setSaveDesc] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!saveName.trim()) return;
    onSave(saveName.trim(), saveDesc.trim());
    setSaving(false);
    setSaveName("");
    setSaveDesc("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-surface-2 border border-border rounded-xl shadow-2xl w-[440px] max-h-[65vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-text">Templates</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSaving(true)}
              className="px-2.5 py-1 text-[11px] bg-accent hover:bg-accent-hover text-white rounded transition-colors"
            >
              + Save as Template
            </button>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Save form */}
        {saving && (
          <div className="px-4 py-3 border-b border-border bg-surface-3 space-y-2">
            <input
              type="text"
              placeholder="Template name…"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-surface border border-border rounded text-text outline-none focus:border-accent"
              autoFocus
            />
            <input
              type="text"
              placeholder="Description (optional)…"
              value={saveDesc}
              onChange={(e) => setSaveDesc(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-surface border border-border rounded text-text outline-none focus:border-accent"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={!saveName.trim()}
                className="flex-1 py-1.5 text-xs bg-accent hover:bg-accent-hover text-white rounded disabled:opacity-40"
              >
                Save
              </button>
              <button
                onClick={() => setSaving(false)}
                className="flex-1 py-1.5 text-xs bg-surface-4 text-text-muted rounded hover:text-text"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2">
          {templates.length === 0 ? (
            <div className="text-center py-8 text-text-muted text-xs">
              No templates saved yet.{"\n"}Compile a diagram and save it as a
              template.
            </div>
          ) : (
            <div className="space-y-1">
              {templates.map((t) => (
                <div
                  key={t.id}
                  className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-3 cursor-pointer group transition-colors"
                  onClick={() => {
                    onLoad(t.id);
                    onClose();
                  }}
                >
                  <span className="text-lg shrink-0">📋</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-text">
                      {t.name}
                    </div>
                    {t.description && (
                      <div className="text-[10px] text-text-muted mt-0.5 line-clamp-2">
                        {t.description}
                      </div>
                    )}
                    <div className="text-[10px] text-text-muted/60 mt-0.5">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {confirmDelete === t.id ? (
                    <div
                      className="flex gap-1 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          onDelete(t.id);
                          setConfirmDelete(null);
                        }}
                        className="px-1.5 py-0.5 text-[10px] bg-error text-white rounded"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="px-1.5 py-0.5 text-[10px] bg-surface-4 text-text-muted rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDelete(t.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] text-text-muted hover:text-error shrink-0"
                      title="Delete"
                    >
                      🗑
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
