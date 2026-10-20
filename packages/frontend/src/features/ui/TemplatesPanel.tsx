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

type CategoryFilter = "all" | "academic" | "architecture" | "custom";

export function TemplatesPanel({
  isOpen,
  onClose,
  templates,
  onLoad,
  onDelete,
  onSave,
}: Props) {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [search, setSearch] = useState("");
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
    setActiveCategory("custom");
  };

  const filtered = templates.filter((t) => {
    const matchesCategory =
      activeCategory === "all" ||
      (activeCategory === "academic" && t.category === "academic") ||
      (activeCategory === "architecture" && t.category === "architecture") ||
      (activeCategory === "custom" && (!t.isBuiltIn || t.category === "custom"));

    const matchesSearch =
      !search.trim() ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.tag?.toLowerCase().includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const getDiagramIcon = (type: string = "") => {
    switch (type) {
      case "flowchart":
        return "⚡";
      case "erd":
        return "🗄️";
      case "component":
        return "🧩";
      case "usecase":
        return "👤";
      case "class":
        return "🔷";
      case "sequence":
        return "↔️";
      default:
        return "📋";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-surface-2 border border-border rounded-2xl shadow-2xl w-[540px] max-h-[75vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-surface-2/80">
          <div className="flex items-center gap-2">
            <span className="text-base">📐</span>
            <h2 className="text-sm font-semibold text-text tracking-tight">
              Diagram Templates
            </h2>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
              {templates.length} Tersedia
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSaving(true)}
              className="px-3 py-1.5 text-xs font-medium bg-accent hover:bg-accent-hover text-white rounded-lg transition-all shadow-xs active:scale-95 flex items-center gap-1.5"
            >
              <span>+</span>
              <span>Simpan Template Baru</span>
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-surface-3 transition-colors text-base"
              title="Tutup"
            >
              ×
            </button>
          </div>
        </div>

        {/* Categories & Search */}
        <div className="px-5 py-2.5 border-b border-border bg-surface-3/50 flex flex-col gap-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {[
              { id: "all", label: "Semua", icon: "🌐" },
              { id: "academic", label: "Skripsi / Akademik", icon: "🎓" },
              { id: "architecture", label: "Arsitektur", icon: "💻" },
              { id: "custom", label: "Template Saya", icon: "👤" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as CategoryFilter)}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                  activeCategory === tab.id
                    ? "bg-accent text-white shadow-xs"
                    : "text-text-muted hover:text-text hover:bg-surface-4"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Cari nama template, topik, atau kata kunci..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-text placeholder:text-text-muted/60 outline-none focus:border-accent transition-colors"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-text-muted opacity-60">
              🔍
            </span>
          </div>
        </div>

        {/* Save Form Modal/Drawer */}
        {saving && (
          <div className="px-5 py-3 border-b border-border bg-accent/5 space-y-2.5 animate-in slide-in-from-top-2 duration-150">
            <div className="text-xs font-semibold text-text">
              Simpan Diagram Aktif Sebagai Template
            </div>
            <input
              type="text"
              placeholder="Nama template (contoh: Kerangka Analisis Skripsi)..."
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-text outline-none focus:border-accent"
              autoFocus
            />
            <input
              type="text"
              placeholder="Deskripsi singkat atau petunjuk penggunaan (opsional)..."
              value={saveDesc}
              onChange={(e) => setSaveDesc(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-text outline-none focus:border-accent"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={!saveName.trim()}
                className="flex-1 py-1.5 text-xs font-medium bg-accent hover:bg-accent-hover text-white rounded-lg disabled:opacity-40 shadow-xs"
              >
                Simpan ke Library
              </button>
              <button
                onClick={() => setSaving(false)}
                className="px-4 py-1.5 text-xs bg-surface-3 text-text-muted rounded-lg hover:text-text"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {/* List of Templates */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-text-muted text-xs space-y-1">
              <div className="text-2xl mb-2">📂</div>
              <div className="font-medium text-text">Tidak ada template ditemukan</div>
              <div className="text-[11px] text-text-muted/70">
                {activeCategory === "custom"
                  ? "Belum ada template pribadi. Buat diagram di kanvas lalu klik '+ Simpan Template Baru'."
                  : "Coba ubah filter kategori atau kata kunci pencarian Anda."}
              </div>
            </div>
          ) : (
            filtered.map((t) => (
              <div
                key={t.id}
                className="flex items-start gap-3.5 p-3 rounded-xl border border-border/60 hover:border-accent/40 bg-surface/60 hover:bg-surface-3/80 cursor-pointer group transition-all"
                onClick={() => {
                  onLoad(t.id);
                  onClose();
                }}
              >
                <div className="w-9 h-9 rounded-xl bg-surface-3 border border-border/80 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 group-hover:border-accent/40 transition-transform">
                  {getDiagramIcon(t.diagram?.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-text truncate group-hover:text-accent transition-colors">
                      {t.name}
                    </span>
                    {t.tag && (
                      <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-surface-4 text-text-muted shrink-0 border border-border/40">
                        {t.tag}
                      </span>
                    )}
                    {t.isBuiltIn && (
                      <span className="text-[9px] font-semibold tracking-wider uppercase px-1 py-0.2 rounded bg-indigo-500/10 text-indigo-400 shrink-0">
                        Bawaan
                      </span>
                    )}
                  </div>

                  {t.description && (
                    <div className="text-[11px] text-text-muted mt-1 line-clamp-2 leading-relaxed">
                      {t.description}
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-text-muted/60">
                    <span>Tipe: <strong className="text-text font-medium uppercase">{t.diagram?.type || "general"}</strong></span>
                    <span>•</span>
                    <span>{t.diagram?.nodes?.length || 0} Entitas</span>
                    <span>•</span>
                    <span>{t.diagram?.edges?.length || 0} Relasi</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="shrink-0 flex items-center gap-2 self-center">
                  <span className="text-xs font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                    Buka ➔
                  </span>

                  {!t.isBuiltIn && (
                    <>
                      {confirmDelete === t.id ? (
                        <div
                          className="flex gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              onDelete(t.id);
                              setConfirmDelete(null);
                            }}
                            className="px-2 py-0.5 text-[10px] bg-error text-white rounded font-medium"
                          >
                            Hapus
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="px-2 py-0.5 text-[10px] bg-surface-4 text-text-muted rounded"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDelete(t.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-text-muted hover:text-error p-1 rounded hover:bg-surface-4"
                          title="Hapus template kustom"
                        >
                          🗑
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
