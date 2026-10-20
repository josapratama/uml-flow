import type { Diagram } from "@uml-editor/shared";

const STORAGE_KEY = "uml-editor-templates";

export interface DiagramTemplate {
  id: string;
  name: string;
  description: string;
  category?: "academic" | "architecture" | "custom";
  tag?: string;
  isBuiltIn?: boolean;
  diagram: Diagram;
  createdAt: string;
}

export const BUILT_IN_TEMPLATES: DiagramTemplate[] = [
  {
    id: "tmpl_academic_kerangka_berpikir",
    name: "Kerangka Berpikir Skripsi (Model IPO)",
    description: "Alur konseptual penelitian Bab 2 & 3: Input (Masalah), Proses (Metodologi/Pengembangan), dan Output (Hasil).",
    category: "academic",
    tag: "Skripsi Bab 2/3",
    isBuiltIn: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    diagram: {
      id: "diagram_kerangka_berpikir",
      name: "Kerangka Berpikir Penelitian",
      type: "flowchart",
      nodes: [
        {
          id: "node_start",
          name: "Mulai Penelitian",
          type: "start" as any,
          position: { x: 300, y: 40 },
          size: { width: 150, height: 48 },
        },
        {
          id: "node_input",
          name: "1. INPUT: Masalah & Kebutuhan Sistem\n• Analisis pencatatan manual\n• Studi literatur & teori pendukung",
          type: "process" as any,
          position: { x: 200, y: 130 },
          size: { width: 350, height: 75 },
          style: { backgroundColor: "#e0e7ff", borderColor: "#6366f1" },
        },
        {
          id: "node_process",
          name: "2. PROSES: Pengembangan & Perancangan\n• Desain UI/UX & Database ERD\n• Pembuatan sistem & pengkodean",
          type: "process" as any,
          position: { x: 200, y: 250 },
          size: { width: 350, height: 75 },
          style: { backgroundColor: "#fef3c7", borderColor: "#f59e0b" },
        },
        {
          id: "node_decision",
          name: "Pengujian Valid?",
          type: "decision" as any,
          position: { x: 285, y: 370 },
          size: { width: 180, height: 80 },
        },
        {
          id: "node_output",
          name: "3. OUTPUT: Sistem Terkomputerisasi\n• Aplikasi terintegrasi siap pakai\n• Peningkatan efisiensi waktu 80%",
          type: "process" as any,
          position: { x: 200, y: 490 },
          size: { width: 350, height: 75 },
          style: { backgroundColor: "#d1fae5", borderColor: "#10b981" },
        },
        {
          id: "node_end",
          name: "Selesai (Bab 5 Kesimpulan)",
          type: "end" as any,
          position: { x: 290, y: 610 },
          size: { width: 170, height: 48 },
        },
      ],
      edges: [
        { id: "e1", source: "node_start", target: "node_input", type: "flow" },
        { id: "e2", source: "node_input", target: "node_process", type: "flow", label: { text: "Dasar Teori" } },
        { id: "e3", source: "node_process", target: "node_decision", type: "flow", label: { text: "Black Box / UAT" } },
        { id: "e4", source: "node_decision", target: "node_output", type: "flow", label: { text: "Ya (Lolos)" } },
        { id: "e5", source: "node_output", target: "node_end", type: "flow" },
      ],
      metadata: { createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", version: 1 },
    },
  },
  {
    id: "tmpl_academic_waterfall",
    name: "Metodologi Waterfall (SDLC Skripsi)",
    description: "Tahapan alur penelitian sekuensial: Requirement, Design, Implementation, Testing, Maintenance.",
    category: "academic",
    tag: "Metodologi",
    isBuiltIn: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    diagram: {
      id: "diagram_waterfall",
      name: "Metodologi Waterfall",
      type: "flowchart",
      nodes: [
        { id: "wf1", name: "1. Analisis Kebutuhan\n(Wawancara & Observasi)", type: "process" as any, position: { x: 60, y: 50 }, size: { width: 200, height: 60 }, style: { backgroundColor: "#ede9fe", borderColor: "#8b5cf6" } },
        { id: "wf2", name: "2. Desain Sistem\n(UML, ERD, Wireframe)", type: "process" as any, position: { x: 180, y: 150 }, size: { width: 200, height: 60 }, style: { backgroundColor: "#e0e7ff", borderColor: "#6366f1" } },
        { id: "wf3", name: "3. Implementasi Program\n(Frontend & Backend API)", type: "process" as any, position: { x: 300, y: 250 }, size: { width: 200, height: 60 }, style: { backgroundColor: "#dbeafe", borderColor: "#3b82f6" } },
        { id: "wf4", name: "4. Pengujian Sistem\n(Black Box & UAT User)", type: "process" as any, position: { x: 420, y: 350 }, size: { width: 200, height: 60 }, style: { backgroundColor: "#fef3c7", borderColor: "#f59e0b" } },
        { id: "wf5", name: "5. Pemeliharaan & Deploy\n(Evaluasi Hasil Akhir)", type: "process" as any, position: { x: 540, y: 450 }, size: { width: 200, height: 60 }, style: { backgroundColor: "#d1fae5", borderColor: "#10b981" } },
      ],
      edges: [
        { id: "we1", source: "wf1", target: "wf2", type: "flow" },
        { id: "we2", source: "wf2", target: "wf3", type: "flow" },
        { id: "we3", source: "wf3", target: "wf4", type: "flow" },
        { id: "we4", source: "wf4", target: "wf5", type: "flow" },
      ],
      metadata: { createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", version: 1 },
    },
  },
  {
    id: "tmpl_academic_erd_akademik",
    name: "ERD Sistem Informasi Akademik",
    description: "Database skripsi standar universitas: Mahasiswa, Dosen, Mata Kuliah, KRS, dan Nilai.",
    category: "academic",
    tag: "Database",
    isBuiltIn: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    diagram: {
      id: "diagram_erd_akademik",
      name: "ERD Sistem Akademik",
      type: "erd",
      nodes: [
        {
          id: "erd_mhs",
          name: "Mahasiswa",
          type: "erd" as any,
          position: { x: 80, y: 120 },
          size: { width: 200, height: 160 },
          attributes: [
            { name: "nim", type: "varchar(15)", isPrimaryKey: true, isNullable: false, isForeignKey: false, isUnique: true },
            { name: "nama", type: "varchar(100)", isPrimaryKey: false, isNullable: false, isForeignKey: false, isUnique: false },
            { name: "prodi", type: "varchar(50)", isPrimaryKey: false, isNullable: false, isForeignKey: false, isUnique: false },
            { name: "dosen_pa_id", type: "int", isPrimaryKey: false, isNullable: true, isForeignKey: true, isUnique: false },
          ],
        },
        {
          id: "erd_dosen",
          name: "Dosen",
          type: "erd" as any,
          position: { x: 80, y: 360 },
          size: { width: 200, height: 140 },
          attributes: [
            { name: "nidn", type: "varchar(15)", isPrimaryKey: true, isNullable: false, isForeignKey: false, isUnique: true },
            { name: "nama_dosen", type: "varchar(100)", isPrimaryKey: false, isNullable: false, isForeignKey: false, isUnique: false },
            { name: "email", type: "varchar(100)", isPrimaryKey: false, isNullable: false, isForeignKey: false, isUnique: true },
          ],
        },
        {
          id: "erd_krs",
          name: "KRS",
          type: "erd" as any,
          position: { x: 380, y: 120 },
          size: { width: 200, height: 170 },
          attributes: [
            { name: "id", type: "int", isPrimaryKey: true, isNullable: false, isForeignKey: false, isUnique: true },
            { name: "nim", type: "varchar(15)", isPrimaryKey: false, isNullable: false, isForeignKey: true, isUnique: false },
            { name: "kode_mk", type: "varchar(10)", isPrimaryKey: false, isNullable: false, isForeignKey: true, isUnique: false },
            { name: "semester", type: "varchar(10)", isPrimaryKey: false, isNullable: false, isForeignKey: false, isUnique: false },
            { name: "nilai_huruf", type: "char(2)", isPrimaryKey: false, isNullable: true, isForeignKey: false, isUnique: false },
          ],
        },
        {
          id: "erd_mk",
          name: "MataKuliah",
          type: "erd" as any,
          position: { x: 380, y: 360 },
          size: { width: 200, height: 140 },
          attributes: [
            { name: "kode_mk", type: "varchar(10)", isPrimaryKey: true, isNullable: false, isForeignKey: false, isUnique: true },
            { name: "nama_mk", type: "varchar(100)", isPrimaryKey: false, isNullable: false, isForeignKey: false, isUnique: false },
            { name: "sks", type: "int", isPrimaryKey: false, isNullable: false, isForeignKey: false, isUnique: false },
          ],
        },
      ],
      edges: [
        { id: "e_mhs_krs", source: "erd_mhs", target: "erd_krs", type: "one-to-many" },
        { id: "e_mk_krs", source: "erd_mk", target: "erd_krs", type: "one-to-many" },
        { id: "e_dosen_mhs", source: "erd_dosen", target: "erd_mhs", type: "one-to-many" },
      ],
      metadata: { createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", version: 1 },
    },
  },
  {
    id: "tmpl_architecture_3tier",
    name: "Arsitektur Sistem 3-Tier (Web & Mobile)",
    description: "Struktur arsitektur perangkat lunak skripsi: Presentation Layer, Application Layer, dan Data Layer.",
    category: "architecture",
    tag: "Arsitektur",
    isBuiltIn: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    diagram: {
      id: "diagram_3tier",
      name: "Arsitektur 3-Tier",
      type: "component",
      nodes: [
        { id: "c_ui", name: "Presentation Layer\n(React Web & Flutter Mobile)", type: "component" as any, position: { x: 80, y: 80 }, size: { width: 260, height: 75 }, style: { backgroundColor: "#e0e7ff", borderColor: "#6366f1" } },
        { id: "c_api", name: "Application Layer\n(REST API & Auth Service)", type: "component" as any, position: { x: 80, y: 220 }, size: { width: 260, height: 75 }, style: { backgroundColor: "#fef3c7", borderColor: "#f59e0b" } },
        { id: "c_db", name: "Data Layer\n(PostgreSQL Database Server)", type: "component" as any, position: { x: 80, y: 360 }, size: { width: 260, height: 75 }, style: { backgroundColor: "#d1fae5", borderColor: "#10b981" } },
        { id: "c_ext", name: "External Services\n(Payment & Email Gateway)", type: "component" as any, position: { x: 420, y: 220 }, size: { width: 220, height: 75 }, style: { backgroundColor: "#ffe4e6", borderColor: "#f43f5e" } },
      ],
      edges: [
        { id: "e_c1", source: "c_ui", target: "c_api", type: "flow", label: { text: "HTTPS / JSON" } },
        { id: "e_c2", source: "c_api", target: "c_db", type: "flow", label: { text: "SQL Query" } },
        { id: "e_c3", source: "c_api", target: "c_ext", type: "flow", label: { text: "Third-party API" } },
      ],
      metadata: { createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", version: 1 },
    },
  },
  {
    id: "tmpl_academic_usecase",
    name: "Use Case Diagram Bimbingan Skripsi",
    description: "Interaksi aktor Mahasiswa, Dosen Pembimbing, dan Admin Jurusan dalam sistem tugas akhir.",
    category: "academic",
    tag: "UML Skripsi",
    isBuiltIn: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    diagram: {
      id: "diagram_usecase_skripsi",
      name: "Use Case Bimbingan Skripsi",
      type: "usecase",
      nodes: [
        { id: "act_mhs", name: "Mahasiswa", type: "actor" as any, position: { x: 60, y: 140 }, size: { width: 90, height: 90 } },
        { id: "act_dosen", name: "Dosen Pembimbing", type: "actor" as any, position: { x: 60, y: 340 }, size: { width: 110, height: 90 } },
        { id: "act_admin", name: "Admin Jurusan", type: "actor" as any, position: { x: 620, y: 240 }, size: { width: 100, height: 90 } },
        { id: "uc_login", name: "Login Akun", type: "usecase" as any, position: { x: 260, y: 70 }, size: { width: 160, height: 55 } },
        { id: "uc_bimbingan", name: "Pengajuan Bimbingan", type: "usecase" as any, position: { x: 260, y: 160 }, size: { width: 180, height: 55 } },
        { id: "uc_revisi", name: "Catatan Revisi & Feedback", type: "usecase" as any, position: { x: 260, y: 260 }, size: { width: 190, height: 55 } },
        { id: "uc_acc", name: "ACC / Persetujuan Sidang", type: "usecase" as any, position: { x: 260, y: 360 }, size: { width: 180, height: 55 } },
        { id: "uc_master", name: "Kelola Master Data & Sidang", type: "usecase" as any, position: { x: 380, y: 460 }, size: { width: 200, height: 55 } },
      ],
      edges: [
        { id: "ue1", source: "act_mhs", target: "uc_login", type: "association" },
        { id: "ue2", source: "act_mhs", target: "uc_bimbingan", type: "association" },
        { id: "ue3", source: "act_dosen", target: "uc_login", type: "association" },
        { id: "ue4", source: "act_dosen", target: "uc_revisi", type: "association" },
        { id: "ue5", source: "act_dosen", target: "uc_acc", type: "association" },
        { id: "ue6", source: "act_admin", target: "uc_login", type: "association" },
        { id: "ue7", source: "act_admin", target: "uc_master", type: "association" },
      ],
      metadata: { createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", version: 1 },
    },
  },
];

/** Save current diagram as a user template. */
export function saveTemplate(
  name: string,
  description: string,
  diagram: Diagram,
): DiagramTemplate {
  const customTemplates = loadCustomTemplates();
  const template: DiagramTemplate = {
    id: `tmpl_user_${Date.now()}`,
    name,
    description,
    category: "custom",
    tag: "Custom",
    isBuiltIn: false,
    diagram: structuredClone(diagram),
    createdAt: new Date().toISOString(),
  };
  customTemplates.unshift(template);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customTemplates));
  return template;
}

/** Load only user-created templates from localStorage. */
function loadCustomTemplates(): DiagramTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Load all templates (built-in templates + user saved templates). */
export function loadTemplates(): DiagramTemplate[] {
  const custom = loadCustomTemplates();
  return [...BUILT_IN_TEMPLATES, ...custom];
}

/** Delete a user template by ID (built-in templates cannot be deleted). */
export function deleteTemplate(id: string): void {
  const templates = loadCustomTemplates().filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

/** Load a template and return a fresh diagram copy with new ID. */
export function loadTemplateAsDiagram(id: string): Diagram | null {
  const all = loadTemplates();
  const tmpl = all.find((t) => t.id === id);
  if (!tmpl) return null;
  const diagram = structuredClone(tmpl.diagram);
  diagram.id = `diagram_${Date.now()}`;
  diagram.metadata = {
    ...diagram.metadata,
    updatedAt: new Date().toISOString(),
  };
  return diagram;
}
