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
  dsl?: string;
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
        { id: "wf1", name: "1. Analisis Kebutuhan\n(Wawancara & Observasi)", type: "process" as any, position: { x: 60, y: 50 }, size: { width: 240, height: 65 }, style: { backgroundColor: "#ede9fe", borderColor: "#8b5cf6" } },
        { id: "wf2", name: "2. Desain Sistem\n(UML, ERD, Wireframe)", type: "process" as any, position: { x: 170, y: 145 }, size: { width: 240, height: 65 }, style: { backgroundColor: "#e0e7ff", borderColor: "#6366f1" } },
        { id: "wf3", name: "3. Implementasi Program\n(Frontend & Backend API)", type: "process" as any, position: { x: 280, y: 240 }, size: { width: 240, height: 65 }, style: { backgroundColor: "#dbeafe", borderColor: "#3b82f6" } },
        { id: "wf4", name: "4. Pengujian Sistem\n(Black Box & UAT User)", type: "process" as any, position: { x: 390, y: 335 }, size: { width: 240, height: 65 }, style: { backgroundColor: "#fef3c7", borderColor: "#f59e0b" } },
        { id: "wf5", name: "5. Pemeliharaan & Deploy\n(Evaluasi Hasil Akhir)", type: "process" as any, position: { x: 500, y: 430 }, size: { width: 240, height: 65 }, style: { backgroundColor: "#d1fae5", borderColor: "#10b981" } },
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
    dsl: `@diagram "ERD Sistem Informasi Akademik" erd

entity Mahasiswa {
  *nim: varchar(15) [unique]
  nama: varchar(100)
  prodi: varchar(50)
  dosen_nidn: varchar(15) [fk]
}

entity Dosen {
  *nidn: varchar(15) [unique]
  nama_dosen: varchar(100)
  email: varchar(100) [unique]
}

entity KRS {
  *id: int [unique]
  nim: varchar(15) [fk]
  kode_mk: varchar(10) [fk]
  semester: varchar(10)
  nilai_huruf: char(2)
}

entity MataKuliah {
  *kode_mk: varchar(10) [unique]
  nama_mk: varchar(100)
  sks: int
}

Mahasiswa ||--o{ KRS : takes
MataKuliah ||--o{ KRS : enrolled
Dosen ||--o{ Mahasiswa : advises`,
    diagram: {
      id: "diagram_erd_akademik",
      name: "ERD Sistem Akademik",
      type: "erd",
      nodes: [
        {
          id: "erd_mhs",
          name: "Mahasiswa",
          type: "entity" as any,
          position: { x: 60, y: 80 },
          size: { width: 220, height: 160 },
          attributes: [
            { name: "nim", type: "varchar(15)", isPrimaryKey: true, isNullable: false, isForeignKey: false, isUnique: true },
            { name: "nama", type: "varchar(100)", isPrimaryKey: false, isNullable: false, isForeignKey: false, isUnique: false },
            { name: "prodi", type: "varchar(50)", isPrimaryKey: false, isNullable: false, isForeignKey: false, isUnique: false },
            { name: "dosen_nidn", type: "varchar(15)", isPrimaryKey: false, isNullable: true, isForeignKey: true, isUnique: false },
          ],
        },
        {
          id: "erd_dosen",
          name: "Dosen",
          type: "entity" as any,
          position: { x: 60, y: 320 },
          size: { width: 220, height: 140 },
          attributes: [
            { name: "nidn", type: "varchar(15)", isPrimaryKey: true, isNullable: false, isForeignKey: false, isUnique: true },
            { name: "nama_dosen", type: "varchar(100)", isPrimaryKey: false, isNullable: false, isForeignKey: false, isUnique: false },
            { name: "email", type: "varchar(100)", isPrimaryKey: false, isNullable: false, isForeignKey: false, isUnique: true },
          ],
        },
        {
          id: "erd_krs",
          name: "KRS",
          type: "entity" as any,
          position: { x: 380, y: 80 },
          size: { width: 220, height: 180 },
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
          type: "entity" as any,
          position: { x: 380, y: 320 },
          size: { width: 220, height: 140 },
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
    dsl: `@diagram "Arsitektur 3-Tier" component

component "Presentation Layer\\n(React Web & Flutter Mobile)" as c_ui
component "Application Layer\\n(REST API & Auth Service)" as c_api
component "Data Layer\\n(PostgreSQL Database Server)" as c_db
component "External Services\\n(Payment & Email Gateway)" as c_ext

c_ui -> c_api : "HTTPS / JSON"
c_api -> c_db : "SQL Query"
c_api -> c_ext : "Third-party API"`,
    diagram: {
      id: "diagram_3tier",
      name: "Arsitektur 3-Tier",
      type: "component",
      nodes: [
        { id: "c_ui", name: "Presentation Layer\n(React Web & Flutter Mobile)", type: "component" as any, position: { x: 80, y: 70 }, size: { width: 280, height: 80 }, style: { backgroundColor: "#e0e7ff", borderColor: "#6366f1" } },
        { id: "c_api", name: "Application Layer\n(REST API & Auth Service)", type: "component" as any, position: { x: 80, y: 200 }, size: { width: 280, height: 80 }, style: { backgroundColor: "#fef3c7", borderColor: "#f59e0b" } },
        { id: "c_db", name: "Data Layer\n(PostgreSQL Database Server)", type: "component" as any, position: { x: 80, y: 330 }, size: { width: 280, height: 80 }, style: { backgroundColor: "#d1fae5", borderColor: "#10b981" } },
        { id: "c_ext", name: "External Services\n(Payment & Email Gateway)", type: "component" as any, position: { x: 440, y: 200 }, size: { width: 240, height: 80 }, style: { backgroundColor: "#ffe4e6", borderColor: "#f43f5e" } },
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
    dsl: `@diagram "Use Case Bimbingan Skripsi" usecase

actor Mahasiswa
actor "Dosen Pembimbing"
actor "Admin Jurusan"

system "Sistem Bimbingan Skripsi" {
  usecase "Login Akun"
  usecase "Pengajuan Bimbingan"
  usecase "Catatan Revisi & Feedback"
  usecase "ACC / Persetujuan Sidang"
  usecase "Kelola Master Data & Sidang"
}

Mahasiswa --> "Login Akun"
Mahasiswa --> "Pengajuan Bimbingan"
"Dosen Pembimbing" --> "Login Akun"
"Dosen Pembimbing" --> "Catatan Revisi & Feedback"
"Dosen Pembimbing" --> "ACC / Persetujuan Sidang"
"Admin Jurusan" --> "Login Akun"
"Admin Jurusan" --> "Kelola Master Data & Sidang"`,
    diagram: {
      id: "diagram_usecase_skripsi",
      name: "Use Case Bimbingan Skripsi",
      type: "usecase",
      nodes: [
        { id: "sys_boundary", name: "Sistem Informasi Bimbingan Skripsi", type: "system" as any, position: { x: 230, y: 30 }, size: { width: 340, height: 490 } },
        { id: "act_mhs", name: "Mahasiswa", type: "actor" as any, position: { x: 50, y: 130 }, size: { width: 90, height: 90 } },
        { id: "act_dosen", name: "Dosen Pembimbing", type: "actor" as any, position: { x: 50, y: 330 }, size: { width: 110, height: 90 } },
        { id: "act_admin", name: "Admin Jurusan", type: "actor" as any, position: { x: 640, y: 230 }, size: { width: 100, height: 90 } },
        { id: "uc_login", name: "Login Akun", type: "usecase" as any, position: { x: 300, y: 70 }, size: { width: 200, height: 55 } },
        { id: "uc_bimbingan", name: "Pengajuan Bimbingan", type: "usecase" as any, position: { x: 300, y: 160 }, size: { width: 200, height: 55 } },
        { id: "uc_revisi", name: "Catatan Revisi & Feedback", type: "usecase" as any, position: { x: 300, y: 250 }, size: { width: 200, height: 55 } },
        { id: "uc_acc", name: "ACC / Persetujuan Sidang", type: "usecase" as any, position: { x: 300, y: 340 }, size: { width: 200, height: 55 } },
        { id: "uc_master", name: "Kelola Master Data & Sidang", type: "usecase" as any, position: { x: 300, y: 430 }, size: { width: 200, height: 55 } },
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
  dsl?: string,
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
    dsl,
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

/** Get a single template by ID. */
export function getTemplateById(id: string): DiagramTemplate | null {
  const all = loadTemplates();
  return all.find((t) => t.id === id) || null;
}

/** Delete a user template by ID (built-in templates cannot be deleted). */
export function deleteTemplate(id: string): void {
  const templates = loadCustomTemplates().filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

/** Load a template and return a fresh diagram copy with new ID. */
export function loadTemplateAsDiagram(id: string): Diagram | null {
  const tmpl = getTemplateById(id);
  if (!tmpl) return null;
  const diagram = structuredClone(tmpl.diagram);
  diagram.id = `diagram_${Date.now()}`;
  diagram.metadata = {
    ...diagram.metadata,
    updatedAt: new Date().toISOString(),
  };
  return diagram;
}
