export interface TocCategory {
  titleId: string;
  titleEn: string;
  icon: string;
  items: TocItem[];
}

export interface TocItem {
  id: string;
  labelId: string;
  labelEn: string;
  icon?: string;
  badgeId?: string;
  badgeEn?: string;
}

export const DOCS_CATEGORIES: TocCategory[] = [
  {
    titleId: "Panduan Dasar",
    titleEn: "Getting Started",
    icon: "🚀",
    items: [
      {
        id: "getting-started",
        labelId: "1. Pengenalan & Quick Start",
        labelEn: "1. Overview & Quick Start",
        icon: "⚡",
      },
      {
        id: "editor-modes",
        labelId: "2. Mode Editor & Two-Way Sync",
        labelEn: "2. Editor Modes & Two-Way Sync",
        icon: "🔄",
      },
    ],
  },
  {
    titleId: "Sintaks Diagram Lengkap",
    titleEn: "Diagram Syntax",
    icon: "📐",
    items: [
      {
        id: "class-diagram",
        labelId: "3. Class Diagram (OOP)",
        labelEn: "3. Class Diagram (OOP)",
        icon: "🏗️",
        badgeId: "Populer",
        badgeEn: "Popular",
      },
      {
        id: "sequence-diagram",
        labelId: "4. Sequence Diagram (API)",
        labelEn: "4. Sequence Diagram (API)",
        icon: "🔀",
      },
      {
        id: "flowchart",
        labelId: "5. Flowchart & Alur Skripsi",
        labelEn: "5. Flowchart & Research Flow",
        icon: "📊",
        badgeId: "Akademik",
        badgeEn: "Academic",
      },
      {
        id: "erd",
        labelId: "6. Database ERD",
        labelEn: "6. Database ERD",
        icon: "🗄️",
      },
      {
        id: "state-diagram",
        labelId: "7. State Machine Diagram",
        labelEn: "7. State Machine Diagram",
        icon: "🔄",
      },
      {
        id: "activity-diagram",
        labelId: "8. Activity Diagram & Swimlanes",
        labelEn: "8. Activity Diagram & Swimlanes",
        icon: "🏊",
      },
      {
        id: "usecase-diagram",
        labelId: "9. Use Case Diagram",
        labelEn: "9. Use Case Diagram",
        icon: "👤",
      },
      {
        id: "component-diagram",
        labelId: "10. Component & 3-Tier",
        labelEn: "10. Component & 3-Tier",
        icon: "🧩",
      },
    ],
  },
  {
    titleId: "Kanvas Visual & Pengaturan",
    titleEn: "Visual Canvas & Styling",
    icon: "🎨",
    items: [
      {
        id: "visual-editing",
        labelId: "11. Kanvas & Garis Siku (Orthogonal)",
        labelEn: "11. Canvas & Orthogonal Routing",
        icon: "↗️",
      },
      {
        id: "styling",
        labelId: "12. Palet 1-Klik Skripsi Formal",
        labelEn: "12. 1-Click Academic Palettes",
        icon: "🎓",
      },
    ],
  },
  {
    titleId: "Ekspor & Kode Program",
    titleEn: "Export & Code Generation",
    icon: "⚡",
    items: [
      {
        id: "export",
        labelId: "13. Ekspor HD (PNG 300 DPI, SVG, PDF)",
        labelEn: "13. HD Export (PNG 300 DPI, SVG, PDF)",
        icon: "💾",
      },
      {
        id: "code-generation",
        labelId: "14. Generator TypeScript, Java, & SQL",
        labelEn: "14. TypeScript, Java, & SQL Generator",
        icon: "💻",
      },
      {
        id: "shortcuts",
        labelId: "15. Daftar Pintasan Papan Ketik",
        labelEn: "15. Keyboard Shortcuts Cheatsheet",
        icon: "⌨️",
      },
    ],
  },
];

export const DOCS_TOC: TocItem[] = DOCS_CATEGORIES.flatMap((cat) => cat.items);
