import type { DiagramTemplate } from "./types";

export const ACADEMIC_FLOWCHART_TEMPLATES: DiagramTemplate[] = [
  {
    id: "tmpl_academic_kerangka_berpikir",
    name: "Kerangka Berpikir Skripsi (Model IPO)",
    description:
      "Alur konseptual penelitian Bab 2 & 3: Input (Masalah), Proses (Metodologi/Pengembangan), dan Output (Hasil).",
    category: "academic",
    tag: "Skripsi Bab 2/3",
    isBuiltIn: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    dsl: `@diagram "Kerangka Berpikir Penelitian" flowchart

start "Mulai Penelitian"
process "1. INPUT: Masalah & Kebutuhan Sistem\\n• Analisis pencatatan manual\\n• Studi literatur & teori pendukung"
process "2. PROSES: Pengembangan & Perancangan\\n• Desain UI/UX & Database ERD\\n• Pembuatan sistem & pengkodean"
decision "Pengujian Valid?"
process "3. OUTPUT: Sistem Terkomputerisasi\\n• Aplikasi terintegrasi siap pakai\\n• Peningkatan efisiensi waktu 80%"
end "Selesai (Bab 5 Kesimpulan)"

"Mulai Penelitian" -> "1. INPUT: Masalah & Kebutuhan Sistem\\n• Analisis pencatatan manual\\n• Studi literatur & teori pendukung"
"1. INPUT: Masalah & Kebutuhan Sistem\\n• Analisis pencatatan manual\\n• Studi literatur & teori pendukung" -> "2. PROSES: Pengembangan & Perancangan\\n• Desain UI/UX & Database ERD\\n• Pembuatan sistem & pengkodean" : "Dasar Teori"
"2. PROSES: Pengembangan & Perancangan\\n• Desain UI/UX & Database ERD\\n• Pembuatan sistem & pengkodean" -> "Pengujian Valid?" : "Black Box / UAT"
"Pengujian Valid?" -> "3. OUTPUT: Sistem Terkomputerisasi\\n• Aplikasi terintegrasi siap pakai\\n• Peningkatan efisiensi waktu 80%" : "Ya (Lolos)"
"3. OUTPUT: Sistem Terkomputerisasi\\n• Aplikasi terintegrasi siap pakai\\n• Peningkatan efisiensi waktu 80%" -> "Selesai (Bab 5 Kesimpulan)"`,
    diagram: {
      id: "diagram_kerangka_berpikir",
      name: "Kerangka Berpikir Penelitian",
      type: "flowchart",
      nodes: [
        {
          id: "node_start",
          name: "Mulai Penelitian",
          type: "start" as any,
          position: { x: 260, y: 40 },
          size: { width: 180, height: 48 },
        },
        {
          id: "node_input",
          name: "1. INPUT: Masalah & Kebutuhan Sistem\n• Analisis pencatatan manual\n• Studi literatur & teori pendukung",
          type: "process" as any,
          position: { x: 140, y: 130 },
          size: { width: 420, height: 85 },
          style: { backgroundColor: "#eef2ff", borderColor: "#6366f1" },
        },
        {
          id: "node_process",
          name: "2. PROSES: Pengembangan & Perancangan\n• Desain UI/UX & Database ERD\n• Pembuatan sistem & pengkodean",
          type: "process" as any,
          position: { x: 140, y: 255 },
          size: { width: 420, height: 85 },
          style: { backgroundColor: "#fffbeb", borderColor: "#f59e0b" },
        },
        {
          id: "node_decision",
          name: "Pengujian Valid?",
          type: "decision" as any,
          position: { x: 250, y: 380 },
          size: { width: 200, height: 80 },
        },
        {
          id: "node_output",
          name: "3. OUTPUT: Sistem Terkomputerisasi\n• Aplikasi terintegrasi siap pakai\n• Peningkatan efisiensi waktu 80%",
          type: "process" as any,
          position: { x: 140, y: 500 },
          size: { width: 420, height: 85 },
          style: { backgroundColor: "#ecfdf5", borderColor: "#10b981" },
        },
        {
          id: "node_end",
          name: "Selesai (Bab 5 Kesimpulan)",
          type: "end" as any,
          position: { x: 260, y: 625 },
          size: { width: 180, height: 48 },
        },
      ],
      edges: [
        { id: "e1", source: "node_start", target: "node_input", type: "flow" },
        {
          id: "e2",
          source: "node_input",
          target: "node_process",
          type: "flow",
          label: { text: "Dasar Teori" },
        },
        {
          id: "e3",
          source: "node_process",
          target: "node_decision",
          type: "flow",
          label: { text: "Black Box / UAT" },
        },
        {
          id: "e4",
          source: "node_decision",
          target: "node_output",
          type: "flow",
          label: { text: "Ya (Lolos)" },
        },
        { id: "e5", source: "node_output", target: "node_end", type: "flow" },
      ],
      metadata: {
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        version: 1,
      },
    },
  },
  {
    id: "tmpl_academic_waterfall",
    name: "Metodologi Waterfall (SDLC Skripsi)",
    description:
      "Tahapan alur penelitian sekuensial: Requirement, Design, Implementation, Testing, Maintenance.",
    category: "academic",
    tag: "Metodologi",
    isBuiltIn: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    dsl: `@diagram "Metodologi Waterfall" flowchart

process "1. Analisis Kebutuhan\\n(Wawancara & Observasi)"
process "2. Desain Sistem\\n(UML, ERD, Wireframe)"
process "3. Implementasi Program\\n(Frontend & Backend API)"
process "4. Pengujian Sistem\\n(Black Box & UAT User)"
process "5. Pemeliharaan & Deploy\\n(Evaluasi Hasil Akhir)"

"1. Analisis Kebutuhan\\n(Wawancara & Observasi)" -> "2. Desain Sistem\\n(UML, ERD, Wireframe)"
"2. Desain Sistem\\n(UML, ERD, Wireframe)" -> "3. Implementasi Program\\n(Frontend & Backend API)"
"3. Implementasi Program\\n(Frontend & Backend API)" -> "4. Pengujian Sistem\\n(Black Box & UAT User)"
"4. Pengujian Sistem\\n(Black Box & UAT User)" -> "5. Pemeliharaan & Deploy\\n(Evaluasi Hasil Akhir)"`,
    diagram: {
      id: "diagram_waterfall",
      name: "Metodologi Waterfall",
      type: "flowchart",
      nodes: [
        {
          id: "wf1",
          name: "1. Analisis Kebutuhan\n(Wawancara & Observasi)",
          type: "process" as any,
          position: { x: 60, y: 50 },
          size: { width: 240, height: 65 },
          style: { backgroundColor: "#ede9fe", borderColor: "#8b5cf6" },
        },
        {
          id: "wf2",
          name: "2. Desain Sistem\n(UML, ERD, Wireframe)",
          type: "process" as any,
          position: { x: 170, y: 145 },
          size: { width: 240, height: 65 },
          style: { backgroundColor: "#e0e7ff", borderColor: "#6366f1" },
        },
        {
          id: "wf3",
          name: "3. Implementasi Program\n(Frontend & Backend API)",
          type: "process" as any,
          position: { x: 280, y: 240 },
          size: { width: 240, height: 65 },
          style: { backgroundColor: "#dbeafe", borderColor: "#3b82f6" },
        },
        {
          id: "wf4",
          name: "4. Pengujian Sistem\n(Black Box & UAT User)",
          type: "process" as any,
          position: { x: 390, y: 335 },
          size: { width: 240, height: 65 },
          style: { backgroundColor: "#fef3c7", borderColor: "#f59e0b" },
        },
        {
          id: "wf5",
          name: "5. Pemeliharaan & Deploy\n(Evaluasi Hasil Akhir)",
          type: "process" as any,
          position: { x: 500, y: 430 },
          size: { width: 240, height: 65 },
          style: { backgroundColor: "#d1fae5", borderColor: "#10b981" },
        },
      ],
      edges: [
        { id: "we1", source: "wf1", target: "wf2", type: "flow" },
        { id: "we2", source: "wf2", target: "wf3", type: "flow" },
        { id: "we3", source: "wf3", target: "wf4", type: "flow" },
        { id: "we4", source: "wf4", target: "wf5", type: "flow" },
      ],
      metadata: {
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        version: 1,
      },
    },
  },
];
