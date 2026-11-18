import React, { useState } from "react";
import { useI18n, type Locale } from "../../i18n";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

function getShortcuts(locale: Locale) {
  const isId = locale === "id";
  return [
    {
      category: isId ? "Navigasi & Kanvas" : "Navigation & Canvas",
      items: [
        { keys: "Space + Drag", action: isId ? "Geser kanvas (Pan)" : "Pan canvas" },
        { keys: "Mouse Wheel", action: isId ? "Zoom in / out" : "Zoom in/out" },
        { keys: "Ctrl + 0", action: isId ? "Reset zoom ke 100%" : "Reset zoom to 100%" },
        { keys: "Shift + F", action: isId ? "Pusatkan ke elemen terpilih" : "Focus on selection" },
        { keys: "Drag Kanvas Kosong", action: isId ? "Kotak seleksi banyak node (Marquee)" : "Marquee multi-select" },
        { keys: "Shift + Klik", action: isId ? "Tambah/kurang multi-seleksi node" : "Add/remove multi-select" },
      ],
    },
    {
      category: isId ? "Manipulasi & Edit" : "Editing & Elements",
      items: [
        { keys: "Ctrl + D", action: isId ? "Duplikasi node yang dipilih" : "Duplicate selected node" },
        { keys: "Ctrl + C / V", action: isId ? "Salin & tempel node" : "Copy & paste node" },
        { keys: "Arrow Keys", action: isId ? "Geser posisi node (1px / 10px)" : "Nudge node position" },
        { keys: "Delete / Backspace", action: isId ? "Hapus node / garis relasi" : "Delete node/edge" },
        { keys: "Ctrl + Z / Y", action: isId ? "Urungkan / Ulangi (Undo / Redo)" : "Undo / Redo" },
        { keys: "Klik 2x Garis", action: isId ? "Tambah titik belok (Waypoint)" : "Add line waypoint" },
        { keys: "Klik Kanan Waypoint", action: isId ? "Hapus titik belok garis" : "Delete line waypoint" },
      ],
    },
    {
      category: isId ? "Penyunting & Ekspor Cepat" : "Tools & Quick Export",
      items: [
        { keys: "Ctrl + Shift + C", action: isId ? "Salin gambar PNG ke Clipboard (1-Klik)" : "Copy PNG to clipboard" },
        { keys: "Ctrl + K", action: isId ? "Buka Quick Command & Spotlight Palette" : "Open Quick Command Palette" },
        { keys: "Ctrl + Enter", action: isId ? "Kompilasi / Sinkronkan DSL" : "Compile / Sync DSL" },
        { keys: "Ctrl + S", action: isId ? "Simpan ke pustaka lokal" : "Save to library" },
        { keys: "?", action: isId ? "Buka / tutup dialog pintasan ini" : "Toggle shortcuts dialog" },
      ],
    },
  ];
}

export function ShortcutsPanel({ isOpen, onClose }: Props) {
  const { locale } = useI18n();
  const isId = locale === "id";
  const [query, setQuery] = useState("");
  const shortcuts = getShortcuts(locale);

  if (!isOpen) return null;

  const filtered = shortcuts
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (!query) return true;
        const q = query.toLowerCase();
        return (
          item.action.toLowerCase().includes(q) ||
          item.keys.toLowerCase().includes(q)
        );
      }),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface-2 border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-border bg-surface-1/40">
          <div className="flex items-center gap-2">
            <span className="text-xl">⌨️</span>
            <div>
              <h2 className="text-sm font-bold text-text">
                {isId ? "Pintasan Keyboard (Cheat Sheet)" : "Keyboard Shortcuts"}
              </h2>
              <p className="text-xs text-muted">
                {isId ? "Navigasi cepat dan kontrol praktis kanvas" : "Fast navigation and canvas controls"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-text hover:bg-surface-3 transition"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-2.5 border-b border-border/70 bg-surface-1/20">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isId ? "Cari pintasan..." : "Search shortcuts..."}
            className="w-full bg-surface-1 border border-border rounded-xl px-3 py-1.5 text-xs text-text outline-none focus:border-accent"
          />
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted">
              {isId ? "Tidak ada pintasan yang cocok." : "No matching shortcuts found."}
            </div>
          ) : (
            filtered.map((group) => (
              <div key={group.category} className="space-y-2">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-accent">
                  {group.category}
                </h3>
                <div className="space-y-1.5">
                  {group.items.map((item) => (
                    <div
                      key={item.keys}
                      className="flex justify-between items-center py-1.5 px-2 rounded-lg hover:bg-surface-1 transition"
                    >
                      <span className="text-xs text-text font-medium">
                        {item.action}
                      </span>
                      <kbd className="px-2 py-0.5 bg-surface-3 border border-border rounded-md text-[11px] font-mono text-muted shadow-2xs">
                        {item.keys}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-6 py-3 border-t border-border flex items-center justify-between bg-surface-1/40 text-xs text-muted">
          <span>{isId ? "Tekan ? kapan saja di kanvas" : "Press ? anytime on canvas"}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-accent text-white font-medium hover:bg-accent-hover transition"
          >
            {isId ? "Tutup" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
