import React, { useState } from "react";
import type { SavedDiagram } from "../../services/storage";
import { useI18n } from "../../i18n";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  diagrams: SavedDiagram[];
  activeId: string | null;
  onOpen: (entry: SavedDiagram) => void;
  onDelete: (id: string) => void;
  onSaveCurrent: () => void;
}

export function DiagramLibrary({
  isOpen,
  onClose,
  diagrams,
  activeId,
  onOpen,
  onDelete,
  onSaveCurrent,
}: Props) {
  const { t, locale } = useI18n();
  const isId = locale === "id";
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = diagrams.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()),
  );

  const typeIcon: Record<string, string> = {
    class: "🔷",
    sequence: "↔",
    activity: "⬦",
    flowchart: "⬜",
    erd: "🗄",
    state: "⬡",
    usecase: "👤",
    component: "🧩",
    deployment: "🖥",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-surface-2 border border-border rounded-xl shadow-2xl w-[480px] max-h-[70vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-text">{t("modals.libraryTitle")}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onSaveCurrent}
              className="px-2.5 py-1 text-[11px] bg-accent hover:bg-accent-hover text-white rounded transition-colors"
            >
              + {isId ? "Simpan Saat Ini" : "Save Current"}
            </button>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-2 border-b border-border">
          <input
            type="text"
            placeholder={isId ? "Cari diagram tersimpan..." : "Search saved diagrams..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-surface-3 border border-border rounded text-text placeholder:text-text-muted outline-none focus:border-accent"
            autoFocus
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-text-muted text-xs">
              {diagrams.length === 0
                ? isId
                  ? "Belum ada diagram tersimpan.\nSimpan diagram saat ini untuk memulai."
                  : "No saved diagrams yet.\nSave current diagram to start."
                : isId
                ? "Tidak ada hasil ditemukan."
                : "No results found."}
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((d) => (
                <div
                  key={d.id}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer group transition-colors
                    ${d.id === activeId ? "bg-accent/10 border border-accent/30" : "hover:bg-surface-3"}`}
                  onClick={() => {
                    onOpen(d);
                    onClose();
                  }}
                >
                  <span className="text-base shrink-0">
                    {typeIcon[(d.diagram as any)?.type || "class"] || "📄"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-text truncate">
                      {d.name}
                    </div>
                    <div className="text-[10px] text-text-muted">
                      {(d.diagram as any)?.type || "unknown"} ·{" "}
                      {new Date(d.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  {d.id === activeId && (
                    <span className="text-[10px] text-accent font-medium">
                      {isId ? "aktif" : "current"}
                    </span>
                  )}
                  {confirmDelete === d.id ? (
                    <div
                      className="flex gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          onDelete(d.id);
                          setConfirmDelete(null);
                        }}
                        className="px-1.5 py-0.5 text-[10px] bg-error text-white rounded"
                      >
                        {t("common.delete")}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="px-1.5 py-0.5 text-[10px] bg-surface-4 text-text-muted rounded"
                      >
                        {t("common.cancel")}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDelete(d.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] text-text-muted hover:text-error px-1"
                      title={t("common.delete")}
                    >
                      🗑
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-border text-[10px] text-text-muted flex items-center justify-between">
          <span>
            {diagrams.length} {isId ? "diagram tersimpan" : "saved diagrams"}
          </span>
          <span className="text-success/90 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-success"></span>
            {isId ? "Tersinkron dengan penyimpanan" : "Synced with storage"}
          </span>
        </div>
      </div>
    </div>
  );
}
