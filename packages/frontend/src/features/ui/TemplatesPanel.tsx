import React, { useState } from "react";
import type { DiagramTemplate } from "../../services/templates";
import { useI18n } from "../../i18n";

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
  const { t, locale } = useI18n();
  const isId = locale === "id";
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

  const filtered = templates.filter((tpl) => {
    const matchesCategory =
      activeCategory === "all" ||
      (activeCategory === "academic" && tpl.category === "academic") ||
      (activeCategory === "architecture" && tpl.category === "architecture") ||
      (activeCategory === "custom" && (!tpl.isBuiltIn || tpl.category === "custom"));

    const matchesSearch =
      !search.trim() ||
      tpl.name.toLowerCase().includes(search.toLowerCase()) ||
      tpl.description?.toLowerCase().includes(search.toLowerCase()) ||
      tpl.tag?.toLowerCase().includes(search.toLowerCase());

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
              {t("modals.templatesTitle")}
            </h2>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
              {templates.length} {isId ? "Tersedia" : "Available"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSaving(true)}
              className="px-3 py-1.5 text-xs font-medium bg-accent hover:bg-accent-hover text-white rounded-lg transition-all shadow-xs active:scale-95 flex items-center gap-1.5"
            >
              <span>+</span>
              <span>{isId ? "Simpan Template Baru" : "Save New Template"}</span>
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-surface-3 transition-colors text-base"
              title={t("common.close")}
            >
              ×
            </button>
          </div>
        </div>

        {/* Categories & Search */}
        <div className="px-5 py-2.5 border-b border-border bg-surface-3/50 flex flex-col gap-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {[
              { id: "all", label: isId ? "Semua" : "All", icon: "🌐" },
              { id: "academic", label: isId ? "Skripsi / Akademik" : "Academic / Thesis", icon: "🎓" },
              { id: "architecture", label: isId ? "Arsitektur" : "Architecture", icon: "💻" },
              { id: "custom", label: isId ? "Template Saya" : "My Templates", icon: "👤" },
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
              placeholder={isId ? "Cari nama template, topik, atau kata kunci..." : "Search templates, topics, or keywords..."}
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
              {isId ? "Simpan Diagram Aktif Sebagai Template" : "Save Active Diagram as Template"}
            </div>
            <input
              type="text"
              placeholder={isId ? "Nama template (contoh: Kerangka Analisis Skripsi)..." : "Template name (e.g. 3-Tier Clean Architecture)..."}
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-text outline-none focus:border-accent"
              autoFocus
            />
            <input
              type="text"
              placeholder={isId ? "Deskripsi singkat atau petunjuk penggunaan (opsional)..." : "Short description or usage instructions (optional)..."}
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
                {isId ? "Simpan ke Library" : "Save to Library"}
              </button>
              <button
                onClick={() => setSaving(false)}
                className="px-4 py-1.5 text-xs bg-surface-3 text-text-muted rounded-lg hover:text-text"
              >
                {t("common.cancel")}
              </button>
            </div>
          </div>
        )}

        {/* List of Templates */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-text-muted text-xs space-y-1">
              <div className="text-2xl mb-2">📂</div>
              <div className="font-medium text-text">{isId ? "Tidak ada template ditemukan" : "No templates found"}</div>
              <div className="text-[11px] text-text-muted/70">
                {activeCategory === "custom"
                  ? isId
                    ? "Belum ada template pribadi. Buat diagram di kanvas lalu klik '+ Simpan Template Baru'."
                    : "No custom templates yet. Create a diagram on canvas then click '+ Save New Template'."
                  : isId
                  ? "Coba ubah filter kategori atau kata kunci pencarian Anda."
                  : "Try changing category filters or search keywords."}
              </div>
            </div>
          ) : (
            filtered.map((tpl) => (
              <div
                key={tpl.id}
                className="flex items-start gap-3.5 p-3 rounded-xl border border-border/60 hover:border-accent/40 bg-surface/60 hover:bg-surface-3/80 cursor-pointer group transition-all"
                onClick={() => {
                  onLoad(tpl.id);
                  onClose();
                }}
              >
                <div className="w-9 h-9 rounded-xl bg-surface-3 border border-border/80 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 group-hover:border-accent/40 transition-transform">
                  {getDiagramIcon(tpl.diagram?.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-text truncate group-hover:text-accent transition-colors">
                      {tpl.name}
                    </span>
                    {tpl.tag && (
                      <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-surface-4 text-text-muted shrink-0 border border-border/40">
                        {tpl.tag}
                      </span>
                    )}
                    {tpl.isBuiltIn && (
                      <span className="text-[9px] font-semibold tracking-wider uppercase px-1 py-0.2 rounded bg-indigo-500/10 text-indigo-400 shrink-0">
                        {isId ? "Bawaan" : "Built-in"}
                      </span>
                    )}
                  </div>

                  {tpl.description && (
                    <div className="text-[11px] text-text-muted mt-1 line-clamp-2 leading-relaxed">
                      {tpl.description}
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-text-muted/60">
                    <span>
                      {t("properties.nodeType")}: <strong className="text-text font-medium uppercase">{tpl.diagram?.type || "general"}</strong>
                    </span>
                    <span>•</span>
                    <span>{tpl.diagram?.nodes?.length || 0} {isId ? "Entitas" : "Entities"}</span>
                    <span>•</span>
                    <span>{tpl.diagram?.edges?.length || 0} {isId ? "Relasi" : "Edges"}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="shrink-0 flex items-center gap-2 self-center">
                  <span className="text-xs font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                    {isId ? "Buka ➔" : "Open ➔"}
                  </span>

                  {!tpl.isBuiltIn && (
                    <>
                      {confirmDelete === tpl.id ? (
                        <div
                          className="flex gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              onDelete(tpl.id);
                              setConfirmDelete(null);
                            }}
                            className="px-2 py-0.5 text-[10px] bg-error text-white rounded font-medium"
                          >
                            {t("common.delete")}
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="px-2 py-0.5 text-[10px] bg-surface-4 text-text-muted rounded"
                          >
                            {t("common.cancel")}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDelete(tpl.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-text-muted hover:text-error p-1 rounded hover:bg-surface-4"
                          title={isId ? "Hapus template kustom" : "Delete custom template"}
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
