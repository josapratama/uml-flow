import React, { useState } from "react";
import { DOCS_CATEGORIES, type TocItem } from "./docsData";
import { useI18n } from "../../../i18n";

interface DocsSidebarProps {
  activeSection: string;
  onSelectSection: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function DocsSidebar({
  activeSection,
  onSelectSection,
  isOpen,
  onClose,
}: DocsSidebarProps) {
  const { t, locale } = useI18n();
  const [query, setQuery] = useState("");

  const isId = locale === "id";

  const filteredCategories = DOCS_CATEGORIES.map((cat) => {
    const items = cat.items.filter((item) => {
      const label = isId ? item.labelId : item.labelEn;
      return (
        label.toLowerCase().includes(query.toLowerCase()) ||
        item.id.toLowerCase().includes(query.toLowerCase())
      );
    });
    return { ...cat, items };
  }).filter((cat) => cat.items.length > 0);

  const renderNavList = () => (
    <div className="space-y-6">
      {/* Search Input inside sidebar */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("docs.searchPlaceholder")}
          className="w-full px-3 py-1.5 pl-8 text-xs bg-surface-3/80 border border-border rounded-lg outline-none text-text focus:border-accent placeholder:text-text-muted transition-colors"
        />
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-text-muted">
          🔍
        </span>
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-text-muted hover:text-text"
          >
            ✕
          </button>
        )}
      </div>

      {filteredCategories.map((cat, catIdx) => (
        <div key={catIdx} className="space-y-1.5">
          <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5 mb-1 opacity-70">
            <span>{cat.icon}</span>
            <span>{isId ? cat.titleId : cat.titleEn}</span>
          </div>

          <div className="space-y-0.5">
            {cat.items.map((item) => {
              const label = isId ? item.labelId : item.labelEn;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectSection(item.id);
                    onClose();
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all flex items-center justify-between group ${
                    isActive
                      ? "bg-accent/15 text-accent font-semibold border border-accent/30 shadow-xs"
                      : "text-text-muted hover:text-text hover:bg-surface-3"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {item.icon && (
                      <span className="text-xs shrink-0">{item.icon}</span>
                    )}
                    <span className="truncate">{label}</span>
                  </div>

                  {(isId ? item.badgeId : item.badgeEn) && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-surface-4 text-text-muted border border-border/50 shrink-0">
                      {isId ? item.badgeId : item.badgeEn}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed top-14 left-0 w-72 h-[calc(100vh-3.5rem)] overflow-y-auto border-r border-border bg-surface-2/60 backdrop-blur-md p-4 custom-scrollbar z-30">
        {renderNavList()}
      </aside>

      {/* Mobile drawer overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onClose}
          />
          <aside className="absolute top-14 left-0 w-72 h-[calc(100vh-3.5rem)] bg-surface border-r border-border p-4 overflow-y-auto shadow-2xl z-10 custom-scrollbar">
            {renderNavList()}
          </aside>
        </div>
      )}
    </>
  );
}
