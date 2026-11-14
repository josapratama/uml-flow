import type { Diagram } from "@uml-editor/shared";
import { getAcademicMetadata, type AcademicMetadata } from "./academic-metadata";
import { calculateDiagramMetrics } from "./diagram-metrics";
import { generateSQL } from "./generators/sql";
import { generateTypeScript } from "./generators/typescript";
import { generateRust } from "./generators/rust";

export interface ThesisBundleOptions {
  includeSql?: boolean;
  includeBackendCode?: boolean;
  backendLanguage?: "rust" | "typescript";
}

/**
 * Generate a complete, publication-ready Academic Thesis Appendix Markdown document
 */
export function generateThesisAppendixBundle(
  diagram: Diagram,
  options: ThesisBundleOptions = { includeSql: true, includeBackendCode: true, backendLanguage: "rust" }
): string {
  const meta: AcademicMetadata = getAcademicMetadata();
  const metrics = calculateDiagramMetrics(diagram);
  const now = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const chapter = meta.documentChapter || "BAB III";
  const author = meta.authorName ? `${meta.authorName} (${meta.studentId || "NIM"})` : "Penulis / Mahasiswa";
  const prodi = meta.programStudy || "Teknik Informatika";
  const institution = meta.institution || "Fakultas Ilmu Komputer";
  const supervisor = meta.supervisorName ? `Dosen Pembimbing: ${meta.supervisorName}` : "";

  let md = "";

  // 1. Academic Header & Document Identity
  md += `# LAMPIRAN DOKUMEN ARSITEKTUR & DESAIN SISTEM\n`;
  md += `## ${chapter}: ${meta.documentTitle || diagram.name || "Perancangan Sistem Perangkat Lunak"}\n\n`;
  md += `| Data Akademis | Keterangan |\n`;
  md += `| :--- | :--- |\n`;
  md += `| **Penyusun** | ${author} |\n`;
  md += `| **Program Studi** | ${prodi} |\n`;
  md += `| **Institusi / Kampus** | ${institution} |\n`;
  if (supervisor) {
    md += `| **Pembimbing** | ${meta.supervisorName} |\n`;
  }
  md += `| **Nama Diagram** | ${diagram.name} (${diagram.type.toUpperCase()}) |\n`;
  md += `| **Waktu Penyusunan** | ${now} |\n\n`;

  md += `---\n\n`;

  // 2. Figure Representation & Formal Thesis Caption
  const figNumber = chapter.includes("IV") ? "4.1" : chapter.includes("V") ? "5.1" : "3.1";
  md += `### ${chapter}.1 Spesifikasi Diagram\n\n`;
  md += `> **Gambar ${figNumber}:** Diagram Arsitektur *${diagram.name}* (${diagram.type})\n`;
  md += `> *(Sumber: Hasil Perancangan Mandiri Menggunakan UML Flow, ${new Date().getFullYear()})*\n\n`;

  // 3. Structured Narrative Analysis
  md += `### ${chapter}.2 Narasi & Penjelasan Komponen Alur\n\n`;

  if (diagram.type === "flowchart" || diagram.type === "activity") {
    md += `Diagram alir ini mendefinisikan langkah-langkah prosedural dari sistem dengan rincian node eksekusi berikut:\n\n`;
    for (let i = 0; i < (diagram.nodes || []).length; i++) {
      const n = diagram.nodes[i];
      md += `${i + 1}. **${n.name || n.id}** (*Tipe: ${n.type}*): Berfungsi dalam tahap operasi alur kerja.\n`;
    }
  } else if (diagram.type === "sequence") {
    md += `Diagram sekuensial ini memetakan interaksi berurutan antara aktor, layanan, dan repositori data:\n\n`;
    const msgs = [...(diagram.messages || [])].sort((a, b) => a.order - b.order);
    for (const m of msgs) {
      md += `- **Langkah ${m.order}:** \`${m.from}\` ➔ \`${m.to}\` melalui operasi pesan **"${m.label || "invokasi"}"** (${m.type}).\n`;
    }
  } else {
    md += `Struktur entitas dalam diagram mencakup komponen berikut:\n\n`;
    for (const n of diagram.nodes || []) {
      const attrs = (n as any).attributes || [];
      const methods = (n as any).methods || [];
      md += `#### Komponen: ${n.name} (${n.type})\n`;
      if (attrs.length > 0) {
        md += `- **Atribut/Kolom Data:** ` + attrs.map((a: any) => `${a.name}: ${a.type}${a.isPrimaryKey ? " [PK]" : ""}`).join(", ") + `\n`;
      }
      if (methods.length > 0) {
        md += `- **Fungsi/Metode Operasi:** ` + methods.map((m: any) => `${m.name}(): ${m.returnType || "void"}`).join(", ") + `\n`;
      }
      md += `\n`;
    }
  }

  md += `\n---\n\n`;

  // 4. Cyclomatic Complexity Metrics Table
  md += `### ${chapter}.3 Analisis Kompleksitas & Audit Kualitas Perangkat Lunak\n\n`;
  md += `Berdasarkan metode metrik perangkat lunak terstandarisasi (*McCabe Cyclomatic Complexity*):\n\n`;
  md += `| Parameter Metrik | Nilai Pengukuran | Evaluasi Skripsi |\n`;
  md += `| :--- | :--- | :--- |\n`;
  md += `| **Jumlah Node Simpul ($N$)** | ${metrics.totalNodes} | Terpetakan secara eksplisit |\n`;
  md += `| **Jumlah Relasi Garis ($E$)** | ${metrics.totalEdges} | Jalur transisi terhubung |\n`;
  md += `| **Cyclomatic Complexity ($V(G)$)** | **${metrics.cyclomaticComplexity}** | Indeks Jalur Independen Basis |\n`;
  md += `| **Kategori Risiko Arsitektur** | **${metrics.riskLevel} Risk** | Sesuai kaidah rekayasa perangkat lunak |\n`;
  md += `| **Jalur Basis Eksekusi Minimum** | ${metrics.basisPaths} Jalur Uji | Kebutuhan White-box Test Cases |\n\n`;

  // 5. Optional SQL DDL Database
  if (options.includeSql && (diagram.type === "erd" || diagram.type === "class")) {
    const sql = generateSQL(diagram);
    if (sql && !sql.startsWith("-- No entities")) {
      md += `---\n\n`;
      md += `### ${chapter}.4 Skema Definisi Basis Data Relasional (SQL DDL)\n\n`;
      md += `Skrip *Data Definition Language* (DDL) untuk inisialisasi tabel basis data pada DBMS relasional:\n\n`;
      md += `\`\`\`sql\n${sql.trim()}\n\`\`\`\n\n`;
    }
  }

  // 6. Optional Backend Code Model
  if (options.includeBackendCode && (diagram.type === "class" || diagram.type === "erd")) {
    const lang = options.backendLanguage || "rust";
    md += `---\n\n`;
    if (lang === "rust") {
      const code = generateRust(diagram);
      md += `### ${chapter}.5 Implementasi Model Domain Backend (Rust & Serde)\n\n`;
      md += `Struktur entitas domain yang menerapkan kaidah type-safe dan serialisasi data:\n\n`;
      md += `\`\`\`rust\n${code.trim()}\n\`\`\`\n\n`;
    } else {
      const code = generateTypeScript(diagram);
      md += `### ${chapter}.5 Implementasi Model Domain Backend (TypeScript)\n\n`;
      md += `Definisi antarmuka dan tipe data untuk integrasi frontend/backend:\n\n`;
      md += `\`\`\`typescript\n${code.trim()}\n\`\`\`\n\n`;
    }
  }

  md += `---\n`;
  md += `*Dokumen ini digenerate secara otomatis oleh UML Flow Architecture Suite.*\n`;

  return md;
}
