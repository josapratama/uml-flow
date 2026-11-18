import React, { useState, useEffect, useRef, useMemo } from "react";
import type { Diagram, DiagramNode } from "@uml-editor/shared";
import { useI18n } from "../../i18n";

export interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon: string;
  category: "nodes" | "layout" | "export" | "modals" | "canvas" | "actions";
  shortcut?: string;
  onSelect: () => void;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  diagram: Diagram | null;
  onSelectNode: (nodeId: string) => void;
  onFocusNode: (nodeId: string) => void;
  onLayout: (preset: string) => void;
  onExport: (format: string) => void;
  onOpenMetrics: () => void;
  onOpenSimulator?: () => void;
  onOpenAcademicMetadata?: () => void;
  onOpenThesisBundle?: () => void;
  onOpenTestCases?: () => void;
  onOpenMockData?: () => void;
  onOpenDependencyMatrix?: () => void;
  onOpenWorkspaceBackup?: () => void;
  onOpenNodeHierarchy?: () => void;
  onRepairDiagram?: () => void;
  onOpenAI: () => void;
  onOpenTemplates: () => void;
  onOpenLibrary: () => void;
  onOpenAcademicCaption: () => void;
  onOpenDiff: () => void;
  onOpenShortcuts: () => void;
  onOpenImport: () => void;
  onToggleTheme: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onNewDiagram: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export function CommandPaletteModal({
  isOpen,
  onClose,
  diagram,
  onSelectNode,
  onFocusNode,
  onLayout,
  onExport,
  onOpenMetrics,
  onOpenSimulator = () => { },
  onOpenAcademicMetadata = () => { },
  onOpenThesisBundle = () => { },
  onOpenTestCases = () => { },
  onOpenMockData = () => { },
  onOpenDependencyMatrix = () => { },
  onOpenWorkspaceBackup = () => { },
  onOpenNodeHierarchy = () => { },
  onRepairDiagram = () => { },
  onOpenAI,
  onOpenTemplates,
  onOpenLibrary,
  onOpenAcademicCaption,
  onOpenDiff,
  onOpenShortcuts,
  onOpenImport,
  onToggleTheme,
  onUndo,
  onRedo,
  onNewDiagram,
  canUndo = false,
  canRedo = false,
}: Props) {
  const { locale } = useI18n();
  const isId = locale === "id";
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Build command catalogue
  const allCommands = useMemo<CommandItem[]>(() => {
    const list: CommandItem[] = [];

    // 1. Nodes in diagram
    if (diagram && diagram.nodes) {
      for (const n of diagram.nodes) {
        const name = n.name || n.id;
        const typeStr = n.type || "node";
        let subtext = `Tipe: ${typeStr}`;
        if ("attributes" in n && Array.isArray((n as any).attributes)) {
          subtext += ` • ${(n as any).attributes.length} atribut`;
        }
        list.push({
          id: `node-${n.id}`,
          title: name,
          description: subtext,
          icon: "📍",
          category: "nodes",
          onSelect: () => {
            onSelectNode(n.id);
            onFocusNode(n.id);
          },
        });
      }
    }

    // 2. Modals & Analysis
    list.push(
      {
        id: "open-metrics",
        title: isId ? "Analisis Kompleksitas & Metrik Cyclomatic" : "Diagram Complexity & Cyclomatic Metrics",
        description: isId ? "Hitung V(G), basis path, CBO, DIT & audit refactoring" : "Compute V(G), basis paths, CBO, DIT & quality audit",
        icon: "📊",
        category: "modals",
        onSelect: onOpenMetrics,
      },
      {
        id: "open-simulator",
        title: isId ? "Simulator Alur & State Interaktif (Step-through)" : "Interactive Flow & State Simulator",
        description: isId ? "Simulasikan eksekusi alur langkah demi langkah dengan active token" : "Simulate step-by-step flow execution with active token",
        icon: "▶️",
        category: "modals",
        onSelect: onOpenSimulator,
      },
      {
        id: "open-ai",
        title: isId ? "AI Diagram Assistant" : "AI Diagram Assistant",
        description: isId ? "Generate atau modifikasi diagram via AI Prompt" : "Generate or modify diagram with AI prompt",
        icon: "✨",
        category: "modals",
        onSelect: onOpenAI,
      },
      {
        id: "open-templates",
        title: isId ? "Koleksi Template Diagram" : "Diagram Templates Library",
        description: isId ? "Gunakan template arsitektur, flow, atau skripsi" : "Load curated diagram templates",
        icon: "📂",
        category: "modals",
        onSelect: onOpenTemplates,
      },
      {
        id: "open-library",
        title: isId ? "Buka Galeri Diagram Tersimpan" : "Open Diagram Library",
        description: isId ? "Kelola dan buka diagram yang pernah disimpan" : "Manage and open saved diagrams",
        icon: "📚",
        category: "modals",
        onSelect: onOpenLibrary,
      },
      {
        id: "open-academic",
        title: isId ? "Format Naskah Skripsi & Caption Bab" : "Academic Paper Caption & Narrative",
        description: isId ? "Generate narasi bab dan caption gambar skripsi" : "Generate academic narrative & figure captions",
        icon: "🎓",
        category: "modals",
        onSelect: onOpenAcademicCaption,
      },
      {
        id: "open-academic-metadata",
        title: isId ? "Konfigurasi Watermark & Kop Naskah Skripsi" : "Academic Thesis Watermark & Metadata",
        description: isId ? "Atur nama mahasiswa, NIM, prodi, dan watermark bab" : "Configure student name, NIM, institution & live watermark",
        icon: "🏛️",
        category: "modals",
        onSelect: onOpenAcademicMetadata,
      },
      {
        id: "open-thesis-bundle",
        title: isId ? "📦 Paket Lampiran Skripsi & Dokumen Teknis" : "📦 Thesis Appendix & Technical Packager",
        description: isId ? "Kompilasi narasi, metrik cyclomatic, SQL, dan model domain ke .md" : "Package complete narrative, cyclomatic metrics, SQL & domain code",
        icon: "📦",
        category: "modals",
        onSelect: onOpenThesisBundle,
      },
      {
        id: "open-test-cases",
        title: isId ? "🧪 Matriks Pengujian Sistem (Test Cases)" : "🧪 Test Case Specification Matrix",
        description: isId ? "Analisis skenario uji white-box, basis path & fungsional" : "Generate white-box basis paths & functional test cases",
        icon: "🧪",
        category: "modals",
        onSelect: onOpenTestCases,
      },
      {
        id: "open-mock-data",
        title: isId ? "🎲 Generator Data Dummy & Database Seed" : "🎲 Mock Data & Seed Generator",
        description: isId ? "Generate JSON payload realistis atau SQL INSERT seed" : "Generate realistic mock JSON or SQL INSERT seeds",
        icon: "🎲",
        category: "modals",
        onSelect: onOpenMockData,
      },
      {
        id: "open-dsm",
        title: isId ? "🕸️ Matriks Struktur Dependensi (DSM) & Siklus Sirkular" : "🕸️ Dependency Structure Matrix (DSM) & Cycle Detector",
        description: isId ? "Analisis matriks kopling ketergantungan, deteksi siklus A→B→A, dan metrik instabilitas" : "Analyze dependency coupling matrix, circular cycle detection & instability metrics",
        icon: "🕸️",
        category: "modals",
        onSelect: onOpenDependencyMatrix,
      },
      {
        id: "open-workspace-backup",
        title: isId ? "💾 Backup & Restore Seluruh Ruang Kerja" : "💾 Workspace Backup & Restore Suite",
        description: isId ? "Ekspor/impor seluruh diagram, tab aktif, template dan konfigurasi dalam 1 berkas JSON" : "Export or import full workspace diagrams, tabs, templates & metadata snapshot",
        icon: "💾",
        category: "modals",
        onSelect: onOpenWorkspaceBackup,
      },
      {
        id: "open-node-hierarchy",
        title: isId ? "🌳 Navigator Hierarki & Lapisan Arsitektur" : "🌳 Architecture Layer & Node Hierarchy Navigator",
        description: isId ? "Jelajahi struktur node, derajat relasi in/out, dan lompat langsung ke canvas" : "Browse node structure, in/out degrees, and smoothly zoom to node on canvas",
        icon: "🌳",
        category: "modals",
        onSelect: onOpenNodeHierarchy,
      },
      {
        id: "open-diff",
        title: isId ? "Komparasi Versi Diagram (Visual Diff)" : "Diagram Version Diff",
        description: isId ? "Bandingkan perubahan node & edge antar versi" : "Compare visual changes between diagram versions",
        icon: "🔀",
        category: "modals",
        onSelect: onOpenDiff,
      },
      {
        id: "open-shortcuts",
        title: isId ? "Daftar Tombol Pintas (Shortcuts)" : "Keyboard Shortcuts Panel",
        description: isId ? "Panduan tombol keyboard lengkap" : "Complete keyboard shortcut reference",
        icon: "⌨️",
        category: "modals",
        shortcut: "?",
        onSelect: onOpenShortcuts,
      },
      {
        id: "open-import",
        title: isId ? "Import Diagram (DSL / JSON)" : "Import Diagram (DSL / JSON)",
        description: isId ? "Muat kode UML Flow DSL atau JSON AST" : "Import UML Flow DSL or JSON AST",
        icon: "📥",
        category: "modals",
        onSelect: onOpenImport,
      },
      {
        id: "repair-diagram",
        title: isId ? "🩺 Perbaiki Diagram Otomatis (Diagram Doctor)" : "🩺 Auto-Repair Diagram (Diagram Doctor)",
        description: isId ? "Heal orphan nodes, tambahkan PK, dan perbaiki alur flowchart" : "Auto-fix orphan nodes, add missing PKs, and heal flow dead-ends",
        icon: "🩺",
        category: "actions",
        onSelect: onRepairDiagram,
      }
    );

    // 3. Layouts
    list.push(
      {
        id: "layout-auto",
        title: isId ? "Tata Letak: Auto (Pintar)" : "Layout: Auto (Smart)",
        description: isId ? "Atur posisi optimal otomatis sesuai tipe diagram" : "Optimal arrangement automatically by type",
        icon: "✨",
        category: "layout",
        onSelect: () => onLayout("auto"),
      },
      {
        id: "layout-layered",
        title: isId ? "Tata Letak: Hierarkis Bertingkat (Layered)" : "Layout: Layered (Hierarchy)",
        description: isId ? "Aliran atas ke bawah berperingkat rapi" : "Top-down directed rank layout",
        icon: "📊",
        category: "layout",
        onSelect: () => onLayout("layered"),
      },
      {
        id: "layout-force",
        title: isId ? "Tata Letak: Force-directed (Pegas Elastis)" : "Layout: Force-directed Spring",
        description: isId ? "Susunan organik berbasis tarikan pegas" : "Organic spring-physics distribution",
        icon: "🌐",
        category: "layout",
        onSelect: () => onLayout("force"),
      },
      {
        id: "layout-radial",
        title: isId ? "Tata Letak: Radial Melingkar" : "Layout: Radial Rings",
        description: isId ? "Menyebar dari pusat ke cincin luar" : "Spreads concentric rings from center",
        icon: "🎯",
        category: "layout",
        onSelect: () => onLayout("radial"),
      },
      {
        id: "layout-grid",
        title: isId ? "Tata Letak: Grid Kotak Seragam" : "Layout: Uniform Grid",
        description: isId ? "Matriks baris dan kolom teratur" : "Even matrix row and column grid",
        icon: "⊞",
        category: "layout",
        onSelect: () => onLayout("grid"),
      }
    );

    // 4. Code & Export
    list.push(
      {
        id: "export-clipboard-png",
        title: isId ? "Salin PNG ke Clipboard" : "Copy PNG to Clipboard",
        description: isId ? "Salin langsung untuk dipaste di Word/Google Docs" : "Direct copy for Word/Google Docs pasting",
        icon: "📋",
        category: "export",
        onSelect: () => onExport("clipboard-png"),
      },
      {
        id: "export-png",
        title: "Export PNG Image (2x Retina)",
        description: isId ? "Unduh file raster resolusi tinggi" : "Download crisp 2x retina raster image",
        icon: "🖼️",
        category: "export",
        onSelect: () => onExport("png"),
      },
      {
        id: "export-svg",
        title: "Export SVG Vector",
        description: isId ? "Vektor tajam tak terhingga untuk percetakan" : "Scalable vector graphics file",
        icon: "📐",
        category: "export",
        onSelect: () => onExport("svg"),
      },
      {
        id: "export-pdf",
        title: isId ? "Export Dokumen PDF (A4 Siap Cetak)" : "Export PDF Document (Print Ready)",
        description: isId ? "Format naskah A4 dengan margin standar" : "A4 print-ready layout with margins",
        icon: "📄",
        category: "export",
        onSelect: () => onExport("pdf"),
      },
      {
        id: "export-python-pydantic",
        title: "Export Python (Pydantic v2 Models)",
        description: isId ? "Model validasi BaseModel Pydantic v2" : "Pydantic v2 schema with type hints",
        icon: "🐍",
        category: "export",
        onSelect: () => onExport("python-pydantic"),
      },
      {
        id: "export-python-sqlalchemy",
        title: "Export Python (SQLAlchemy 2.0 ORM)",
        description: isId ? "Declarative mapped_column ORM models" : "SQLAlchemy 2.0 declarative models",
        icon: "🐍",
        category: "export",
        onSelect: () => onExport("python-sqlalchemy"),
      },
      {
        id: "export-csharp",
        title: "Export C# (.NET 8 POCO & Entity Models)",
        description: isId ? "Kelas C# 12 dengan auto-properties & anotasi" : "C# 12 / .NET 8 POCO with auto-properties",
        icon: "🔷",
        category: "export",
        onSelect: () => onExport("csharp"),
      },
      {
        id: "export-golang",
        title: "Export Go Structs & Models",
        description: isId ? "Struct Go dengan tag json/db & methods" : "Go structs with json/db tags & methods",
        icon: "🐹",
        category: "export",
        onSelect: () => onExport("golang"),
      },
      {
        id: "export-graphql",
        title: "Export GraphQL Schema (SDL)",
        description: isId ? "Definisi type, input, query SDL" : "GraphQL SDL types, inputs & queries",
        icon: "🕸️",
        category: "export",
        onSelect: () => onExport("graphql"),
      },
      {
        id: "export-rust",
        title: "Export Rust Structs & Enums",
        description: isId ? "Struct Rust dengan serde serialize/deserialize" : "Idiomatic Rust structs with Serde",
        icon: "🦀",
        category: "export",
        onSelect: () => onExport("rust"),
      },
      {
        id: "export-openapi-yaml",
        title: "Export OpenAPI 3.1 Spec (YAML)",
        description: isId ? "Spesifikasi Swagger API RESTful standar industri" : "Industry-standard OpenAPI 3.1 / Swagger YAML",
        icon: "📜",
        category: "export",
        onSelect: () => onExport("openapi-yaml"),
      },
      {
        id: "export-openapi-json",
        title: "Export OpenAPI 3.1 Spec (JSON)",
        description: isId ? "Spesifikasi Swagger API RESTful JSON" : "Industry-standard OpenAPI 3.1 / Swagger JSON",
        icon: "📜",
        category: "export",
        onSelect: () => onExport("openapi-json"),
      },
      {
        id: "export-prisma",
        title: "Export Prisma Schema (.prisma)",
        description: isId ? "Skema ORM Prisma Next.js & Node.js" : "Prisma ORM schema definition",
        icon: "💎",
        category: "export",
        onSelect: () => onExport("prisma"),
      },
      {
        id: "export-typescript",
        title: "Export TypeScript Models",
        description: isId ? "Interface & tipe TypeScript modern" : "Modern TypeScript interfaces & types",
        icon: "🔷",
        category: "export",
        onSelect: () => onExport("typescript"),
      },
      {
        id: "export-java",
        title: "Export Java Classes",
        description: isId ? "POJO Java dengan getters/setters" : "Java POJO classes with accessors",
        icon: "☕",
        category: "export",
        onSelect: () => onExport("java"),
      },
      {
        id: "export-sql",
        title: "Export SQL DDL Schema",
        description: isId ? "Skrip CREATE TABLE DDL database" : "CREATE TABLE DDL statements",
        icon: "🗄️",
        category: "export",
        onSelect: () => onExport("sql"),
      },
      {
        id: "export-mermaid",
        title: "Export Mermaid.js Markdown (.mmd)",
        description: isId ? "Kode diagram siap pakai di GitHub / Obsidian" : "Ready-to-use diagram code for GitHub/Obsidian",
        icon: "🧜‍♀️",
        category: "export",
        onSelect: () => onExport("mermaid"),
      }
    );

    // 5. Canvas & Actions
    list.push(
      {
        id: "toggle-theme",
        title: isId ? "Ganti Tema Kanvas (Dark / Light)" : "Toggle Canvas Theme (Dark / Light)",
        description: isId ? "Beralih antara mode gelap dan terang kanvas" : "Switch between light and dark canvas",
        icon: "🌓",
        category: "canvas",
        onSelect: onToggleTheme,
      },
      {
        id: "new-diagram",
        title: isId ? "Buat Tab Diagram Baru" : "New Diagram Tab",
        description: isId ? "Buka tab diagram kosong baru" : "Create a clean blank diagram tab",
        icon: "➕",
        category: "canvas",
        shortcut: "Ctrl+N",
        onSelect: onNewDiagram,
      },
      {
        id: "action-undo",
        title: isId ? "Batalkan Perubahan (Undo)" : "Undo Last Action",
        description: isId ? "Kembalikan satu langkah sebelumnya" : "Step backward in canvas history",
        icon: "↩️",
        category: "canvas",
        shortcut: "Ctrl+Z",
        onSelect: onUndo,
      },
      {
        id: "action-redo",
        title: isId ? "Ulangi Perubahan (Redo)" : "Redo Last Action",
        description: isId ? "Terapkan kembali satu langkah" : "Step forward in canvas history",
        icon: "↪️",
        category: "canvas",
        shortcut: "Ctrl+Y",
        onSelect: onRedo,
      }
    );

    return list;
  }, [
    diagram,
    isId,
    onSelectNode,
    onFocusNode,
    onLayout,
    onExport,
    onOpenMetrics,
    onOpenAI,
    onOpenTemplates,
    onOpenLibrary,
    onOpenAcademicCaption,
    onOpenDiff,
    onOpenShortcuts,
    onOpenImport,
    onToggleTheme,
    onUndo,
    onRedo,
    onNewDiagram,
  ]);

  // Filter commands by query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return allCommands;
    const q = query.trim().toLowerCase();
    return allCommands.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [allCommands, query]);

  // Clamp selection index
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const current = filteredCommands[selectedIndex];
      if (current) {
        current.onSelect();
        onClose();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  // Ensure selected item is visible
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.children[selectedIndex] as HTMLElement | undefined;
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-100"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-surface-2 border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-surface-1">
          <span className="text-base text-text-muted">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isId
                ? "Ketik perintah, nama node, export, atau tata letak... (Ctrl+K)"
                : "Type a command, node name, export, or layout... (Ctrl+K)"
            }
            className="flex-1 bg-transparent text-sm text-text placeholder-text-muted/60 focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              className="text-xs px-1.5 py-0.5 rounded bg-surface-3 text-text-muted hover:text-text"
            >
              Clear
            </button>
          ) : (
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-surface-3 border border-border text-text-muted">
              Esc
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-text-muted text-xs">
              {isId ? `Tidak ada perintah cocok dengan "${query}"` : `No commands matching "${query}"`}
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => {
                    cmd.onSelect();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-left transition-colors ${isSelected
                    ? "bg-accent text-white"
                    : "hover:bg-surface-3 text-text"
                    }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-base shrink-0">{cmd.icon}</span>
                    <div className="min-w-0">
                      <div className={`text-xs font-semibold truncate ${isSelected ? "text-white" : "text-text"}`}>
                        {cmd.title}
                      </div>
                      {cmd.description && (
                        <div
                          className={`text-[11px] truncate ${isSelected ? "text-white/80" : "text-text-muted"
                            }`}
                        >
                          {cmd.description}
                        </div>
                      )}
                    </div>
                  </div>

                  {cmd.shortcut && (
                    <kbd
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ml-2 ${isSelected
                        ? "bg-white/20 text-white"
                        : "bg-surface-4 border border-border text-text-muted"
                        }`}
                    >
                      {cmd.shortcut}
                    </kbd>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-4 py-2 border-t border-border bg-surface-1 flex items-center justify-between text-[11px] text-text-muted">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-mono bg-surface-3 px-1 py-0.5 rounded text-[10px]">↑</kbd>{" "}
              <kbd className="font-mono bg-surface-3 px-1 py-0.5 rounded text-[10px]">↓</kbd> Navigasi
            </span>
            <span>
              <kbd className="font-mono bg-surface-3 px-1 py-0.5 rounded text-[10px]">↵</kbd> Jalankan
            </span>
          </div>
          <span>{filteredCommands.length} perintah</span>
        </div>
      </div>
    </div>
  );
}
