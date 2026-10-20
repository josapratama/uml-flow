import React from "react";
import { useI18n, type Locale } from "../../i18n";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

function getShortcuts(locale: Locale) {
  const isId = locale === "id";
  return [
    {
      category: isId ? "Umum" : "General",
      items: [
        { keys: "Ctrl + Enter", action: isId ? "Kompilasi kode DSL" : "Compile DSL" },
        { keys: "Ctrl + S", action: isId ? "Simpan ke pustaka lokal" : "Save to library" },
        { keys: "Ctrl + N", action: isId ? "Buat tab diagram baru" : "New diagram tab" },
        { keys: "Ctrl + Z", action: isId ? "Urungkan perubahan (Undo)" : "Undo" },
        { keys: "Ctrl + Shift + Z", action: isId ? "Ulangi perubahan (Redo)" : "Redo" },
        { keys: "Ctrl + Y", action: isId ? "Ulangi perubahan (Redo)" : "Redo" },
        { keys: "Delete", action: isId ? "Hapus node/garis terpilih" : "Delete selected node/edge" },
        { keys: "?", action: isId ? "Buka/tutup panel pintasan ini" : "Toggle shortcuts panel" },
      ],
    },
    {
      category: isId ? "Kanvas Visual" : "Canvas",
      items: [
        { keys: "Scroll", action: isId ? "Perbesar / Perkecil zoom" : "Zoom in/out" },
        { keys: "Ctrl + Drag", action: isId ? "Geser kanvas (Pan)" : "Pan canvas" },
        { keys: "Middle Mouse", action: isId ? "Geser kanvas (Pan)" : "Pan canvas" },
        { keys: isId ? "Klik node" : "Click node", action: isId ? "Pilih elemen node" : "Select node" },
        { keys: "Shift + Click", action: isId ? "Pilih banyak node (Multi-select)" : "Multi-select" },
        { keys: isId ? "Klik ganda node" : "Double-click node", action: isId ? "Ubah nama / label" : "Edit name" },
        { keys: isId ? "Klik garis" : "Click edge", action: isId ? "Pilih garis hubung" : "Select edge" },
      ],
    },
    {
      category: "Editor DSL",
      items: [
        { keys: "Tab", action: isId ? "Indentasi teks" : "Indent" },
        { keys: "Ctrl + Enter", action: isId ? "Kompilasi diagram" : "Compile" },
      ],
    },
  ];
}

export function ShortcutsPanel({ isOpen, onClose }: Props) {
  const { t, locale } = useI18n();
  const shortcuts = getShortcuts(locale);

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
            {t("modals.shortcutsTitle")}
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text text-lg"
          >
            ×
          </button>
        </div>
        <div className="p-5 space-y-5">
          {shortcuts.map((group) => (
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
