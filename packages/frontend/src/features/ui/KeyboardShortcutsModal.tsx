import React, { useState } from "react";
import { useI18n } from "../../i18n";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  descId: string;
  descEn: string;
  category: "nav" | "edit" | "diagram" | "tools";
}

const SHORTCUTS: ShortcutItem[] = [
  // Navigation
  { keys: ["Space", "Drag"], descId: "Geser / Pan Kanvas", descEn: "Pan Canvas", category: "nav" },
  { keys: ["Mouse Wheel"], descId: "Zoom In / Out", descEn: "Zoom In / Out", category: "nav" },
  { keys: ["Ctrl", "0"], descId: "Reset Zoom ke 100%", descEn: "Reset Zoom to 100%", category: "nav" },
  { keys: ["F"], descId: "Pusatkan & Sesuaikan Diagram (Fit)", descEn: "Fit View", category: "nav" },
  { keys: ["G"], descId: "Tampilkan / Sembunyikan Grid Titik", descEn: "Toggle Dot Grid", category: "nav" },
  { keys: ["M"], descId: "Tampilkan / Sembunyikan Minimap", descEn: "Toggle Minimap", category: "nav" },

  // Edit & Selection
  { keys: ["Drag Kanvas Kosong"], descId: "Kotak Seleksi Banyak Node (Marquee)", descEn: "Marquee Box Selection", category: "edit" },
  { keys: ["Shift", "Klik"], descId: "Tambah / Kurangi Seleksi Node", descEn: "Add/Remove from Multi-Select", category: "edit" },
  { keys: ["Ctrl", "D"], descId: "Duplikasi Node yang Dipilih", descEn: "Duplicate Selected Node", category: "edit" },
  { keys: ["Delete / Backspace"], descId: "Hapus Node atau Relasi", descEn: "Delete Node or Edge", category: "edit" },
  { keys: ["Ctrl", "Z"], descId: "Urungkan (Undo)", descEn: "Undo", category: "edit" },
  { keys: ["Ctrl", "Y"], descId: "Ulangi (Redo)", descEn: "Redo", category: "edit" },
  { keys: ["Klik 2x Garis"], descId: "Tambah Titik Belok (Waypoint) Garis", descEn: "Add Waypoint to Edge", category: "edit" },
  { keys: ["Klik Kanan Waypoint"], descId: "Hapus Titik Belok Garis", descEn: "Delete Edge Waypoint", category: "edit" },

  // Tools & Export
  { keys: ["Ctrl", "K"], descId: "Buka Command Palette / Pencarian Cepat", descEn: "Open Command Palette", category: "tools" },
  { keys: ["Ctrl", "Shift", "C"], descId: "Salin Gambar PNG ke Clipboard (1-Klik)", descEn: "Copy PNG to Clipboard", category: "tools" },
  { keys: ["Ctrl", "Enter"], descId: "Sinkronisasi DSL ke Kanvas Visual", descEn: "Sync DSL to Visual Canvas", category: "tools" },
  { keys: ["?"], descId: "Buka Daftar Pintasan Keyboard Ini", descEn: "Open Keyboard Shortcuts Help", category: "tools" },
];

export function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: KeyboardShortcutsModalProps) {
  const { locale } = useI18n();
  const isId = locale === "id";
  const [filter, setFilter] = useState("");

  if (!isOpen) return null;

  const categories = [
    { id: "nav", name: isId ? "Navigasi & Kanvas" : "Navigation & Canvas" },
    { id: "edit", name: isId ? "Penyuntingan & Seleksi" : "Editing & Selection" },
    { id: "tools", name: isId ? "Alat & Ekspor Cepat" : "Tools & Quick Export" },
  ];

  const filteredShortcuts = SHORTCUTS.filter((s) => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    const desc = isId ? s.descId.toLowerCase() : s.descEn.toLowerCase();
    const k = s.keys.join(" ").toLowerCase();
    return desc.includes(q) || k.includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface-2 border border-border rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-1/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">⌨️</span>
            <div>
              <h2 className="text-base font-bold text-text">
                {isId ? "Pintasan Keyboard (Shortcuts)" : "Keyboard Shortcuts"}
              </h2>
              <p className="text-xs text-muted">
                {isId ? "Navigasi cepat dan kontrol efisien di UML Flow" : "Quick navigation and efficient control in UML Flow"}
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
        <div className="px-6 py-3 border-b border-border/60 bg-surface-1/30">
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={isId ? "Cari pintasan keyboard..." : "Search shortcuts..."}
            className="w-full bg-surface-1 border border-border rounded-xl px-3 py-1.5 text-xs text-text outline-none focus:border-accent"
          />
        </div>

        {/* Shortcut Lists */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {categories.map((cat) => {
            const items = filteredShortcuts.filter((s) => s.category === cat.id);
            if (items.length === 0) return null;
            return (
              <div key={cat.id} className="space-y-2">
                <h3 className="text-xs font-bold text-accent uppercase tracking-wider">
                  {cat.name}
                </h3>
                <div className="space-y-1.5">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-1.5 px-2.5 rounded-lg hover:bg-surface-1 transition"
                    >
                      <span className="text-xs text-text font-medium">
                        {isId ? item.descId : item.descEn}
                      </span>
                      <div className="flex items-center gap-1">
                        {item.keys.map((k, kidx) => (
                          <kbd
                            key={kidx}
                            className="px-2 py-0.5 rounded-md bg-surface-3 border border-border text-[11px] font-mono text-muted shadow-2xs"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border flex items-center justify-between bg-surface-1/50 text-xs text-muted">
          <span>{isId ? "Tekan ? kapan saja untuk membuka modal ini" : "Press ? anytime to open this modal"}</span>
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
