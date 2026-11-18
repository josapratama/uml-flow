import type { Diagram } from "@uml-editor/shared";
import { getAcademicMetadata } from "./academic-metadata";
import { extractUseCaseScenarios } from "./use-case-narrative";
import { extractDataDictionary } from "./erd-dictionary";
import { calculateDiagramMetrics } from "./diagram-metrics";
import { generateTestCases } from "./test-case-generator";
import { extractCrudMatrix, exportCrudMatrixHTML } from "./crud-matrix-generator";

function escapeHtml(str: string): string {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Generates a full Academic Thesis Chapter 3 & 4 / Software Requirements Specification (SRS)
 * document compatible with Microsoft Word (.doc) and standalone printable HTML.
 */
export function generateSRSDocumentHTML(
  diagram: Diagram,
  svgMarkup?: string,
  locale: "id" | "en" = "id"
): string {
  const isId = locale === "id";
  const meta = getAcademicMetadata();
  const narratives = extractUseCaseScenarios(diagram);
  const dictTables = extractDataDictionary(diagram);
  const metrics = calculateDiagramMetrics(diagram);
  const testCases = generateTestCases(diagram);
  const crudData = extractCrudMatrix(diagram);
  const crudHtml = exportCrudMatrixHTML(crudData);

  const projectTitle =
    meta.documentTitle ||
    (diagram.name && diagram.name !== "Untitled" ? diagram.name : "Sistem Informasi");
  const author = meta.authorName || "Penulis / System Analyst";
  const studentId = meta.studentId || "-";
  const institution = `${meta.programStudy ? meta.programStudy + " - " : ""}${meta.institution || "Fakultas Ilmu Komputer"}`;
  const dateStr = new Date().toLocaleDateString(isId ? "id-ID" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const narrativeRowsHtml =
    narratives.length > 0
      ? narratives
          .map(
            (uc, idx) => `
      <h3>2.${idx + 1}. ${isId ? "Spesifikasi Use Case / Proses" : "Use Case / Process Specification"}: ${escapeHtml(uc.name)}</h3>
      <table>
        <tbody>
          <tr><th style="width:28%">Kode Use Case</th><td><strong>${escapeHtml(uc.code)}</strong></td></tr>
          <tr><th>${isId ? "Nama Use Case" : "Name"}</th><td><strong>${escapeHtml(uc.name)}</strong></td></tr>
          <tr><th>${isId ? "Aktor Terkait" : "Actors"}</th><td>${escapeHtml(uc.actors.join(", ") || "-")}</td></tr>
          <tr><th>${isId ? "Deskripsi Singkat" : "Description"}</th><td>${escapeHtml(uc.description)}</td></tr>
          <tr><th>${isId ? "Kondisi Awal (Pre-Condition)" : "Pre-Condition"}</th><td>${escapeHtml(uc.precondition)}</td></tr>
          <tr><th>${isId ? "Alur Utama (Main Flow)" : "Main Flow"}</th><td>
            <ol style="margin:4px 0;padding-left:18px">
              ${uc.mainFlow.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}
            </ol>
          </td></tr>
          <tr><th>${isId ? "Alur Alternatif / Eksepsi" : "Alternative Flow"}</th><td>
            <ul style="margin:4px 0;padding-left:18px">
              ${uc.alternativeFlows.map((a) => `<li><strong>${escapeHtml(a.condition)}:</strong> ${escapeHtml(a.action)}</li>`).join("")}
            </ul>
          </td></tr>
          <tr><th>${isId ? "Kondisi Akhir (Post-Condition)" : "Post-Condition"}</th><td>${escapeHtml(uc.postcondition)}</td></tr>
        </tbody>
      </table>`
          )
          .join("\n")
      : `<p>${
          isId
            ? `Diagram <strong>${escapeHtml(diagram.name)}</strong> terdiri atas ${metrics.totalNodes} komponen/simbol dan ${metrics.totalEdges} alur relasi sistem.`
            : `Diagram <strong>${escapeHtml(diagram.name)}</strong> consists of ${metrics.totalNodes} components and ${metrics.totalEdges} system relations.`
        }</p>`;

  const dictTablesHtml =
    dictTables.length > 0
      ? dictTables
          .map(
            (tbl, idx) => `
      <h3>3.${idx + 1}. ${isId ? "Struktur Tabel / Entitas" : "Entity / Table Structure"}: ${escapeHtml(tbl.name)}</h3>
      ${tbl.comment ? `<p><em>${escapeHtml(tbl.comment)}</em></p>` : ""}
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>${isId ? "Nama Kolom / Atribut" : "Column / Attribute"}</th>
            <th>${isId ? "Tipe Data" : "Data Type"}</th>
            <th>${isId ? "Kunci (Key)" : "Key"}</th>
            <th>Nullable</th>
            <th>${isId ? "Keterangan" : "Description"}</th>
          </tr>
        </thead>
        <tbody>
          ${tbl.fields
            .map(
              (col, cIdx) => `
            <tr>
              <td style="text-align:center">${cIdx + 1}</td>
              <td><code>${escapeHtml(col.name)}</code></td>
              <td><code>${escapeHtml(col.type)}</code></td>
              <td style="text-align:center"><strong>${col.isPrimaryKey ? "PK" : col.isForeignKey ? "FK" : "-"}</strong></td>
              <td style="text-align:center">${col.isNullable ? "YES" : "NO"}</td>
              <td>${escapeHtml(col.description)}</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>`
          )
          .join("\n")
      : `<p>${isId ? "Tidak ada entitas beratribut khusus pada diagram ini." : "No entity tables defined in this diagram."}</p>`;

  const testCasesHtml =
    testCases.length > 0
      ? `
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>${isId ? "Nama & Skenario Pengujian" : "Test Scenario"}</th>
            <th>${isId ? "Metode Uji" : "Test Type"}</th>
            <th>${isId ? "Langkah Uji" : "Test Steps"}</th>
            <th>${isId ? "Hasil yang Diharapkan (Expected Result)" : "Expected Result"}</th>
          </tr>
        </thead>
        <tbody>
          ${testCases
            .map(
              (tc) => `
            <tr>
              <td><strong>${escapeHtml(tc.id)}</strong></td>
              <td><strong>${escapeHtml(tc.name)}</strong><br/><em>${escapeHtml(tc.scenario)}</em></td>
              <td>${escapeHtml(tc.testType)}</td>
              <td>${escapeHtml(tc.steps.join(" -> "))}</td>
              <td>${escapeHtml(tc.expectedResult)}</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>`
      : `<p>-</p>`;

  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40" lang="${locale}">
<head>
  <meta charset="utf-8" />
  <title>SRS &amp; ${isId ? "Dokumentasi Skripsi" : "Technical Specification"} - ${escapeHtml(projectTitle)}</title>
  <style>
    @page { size: A4; margin: 2.54cm; }
    body {
      font-family: "Times New Roman", Times, Georgia, serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #111827;
      max-width: 21cm;
      margin: 0 auto;
      padding: 24px;
      background: #ffffff;
    }
    .cover-box {
      border: 2px solid #1e293b;
      padding: 24px;
      margin-bottom: 32px;
      text-align: center;
      background: #f8fafc;
    }
    .cover-box h1 {
      font-size: 16pt;
      margin: 0 0 8px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .cover-box h2 {
      font-size: 13pt;
      margin: 0 0 16px 0;
      font-weight: normal;
      color: #334155;
    }
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
      font-size: 11pt;
    }
    .meta-table td {
      border: 1px solid #cbd5e1;
      padding: 6px 10px;
      text-align: left;
    }
    h2.chapter-title {
      font-size: 14pt;
      text-transform: uppercase;
      border-bottom: 2px solid #1e293b;
      padding-bottom: 4px;
      margin-top: 28px;
      margin-bottom: 12px;
    }
    h3 {
      font-size: 12pt;
      margin-top: 18px;
      margin-bottom: 8px;
      color: #0f172a;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0 18px 0;
      font-size: 10.5pt;
    }
    th, td {
      border: 1px solid #475569;
      padding: 6px 10px;
      vertical-align: top;
      text-align: left;
    }
    th {
      background-color: #f1f5f9;
      font-weight: bold;
    }
    .diagram-frame {
      border: 1px solid #94a3b8;
      padding: 16px;
      margin: 16px 0;
      text-align: center;
      background: #ffffff;
    }
    .diagram-frame svg {
      max-width: 100%;
      height: auto;
      max-height: 520px;
    }
    .caption {
      font-size: 10.5pt;
      font-style: italic;
      margin-top: 8px;
      color: #334155;
    }
    code {
      font-family: "Courier New", Courier, monospace;
      font-size: 10pt;
      background: #f1f5f9;
      padding: 1px 4px;
    }
  </style>
</head>
<body>
  <div class="cover-box">
    <h1>${isId ? "DOKUMEN SPESIFIKASI KEBUTUHAN PERANGKAT LUNAK (SRS) &amp; PEMODELAN UML" : "SOFTWARE REQUIREMENTS SPECIFICATION (SRS) &amp; UML MODELING REPORT"}</h1>
    <h2>${escapeHtml(projectTitle)}</h2>
    <table class="meta-table">
      <tbody>
        <tr>
          <td><strong>${isId ? "Nama Diagram" : "Diagram Name"}:</strong> ${escapeHtml(diagram.name || "Untitled")}</td>
          <td><strong>${isId ? "Tipe Model UML" : "UML Model Type"}:</strong> ${escapeHtml(diagram.type.toUpperCase())}</td>
        </tr>
        <tr>
          <td><strong>${isId ? "Penyusun / Penulis" : "Author"}:</strong> ${escapeHtml(author)} (${escapeHtml(studentId)})</td>
          <td><strong>${isId ? "Institusi" : "Institution"}:</strong> ${escapeHtml(institution)}</td>
        </tr>
        <tr>
          <td><strong>${isId ? "Tanggal Cetak" : "Generated Date"}:</strong> ${escapeHtml(dateStr)}</td>
          <td><strong>${isId ? "Tingkat Risiko Kompleksitas" : "Complexity Risk"}:</strong> ${escapeHtml(metrics.riskLevel.toUpperCase())} (V(G) = ${metrics.cyclomaticComplexity})</td>
        </tr>
      </tbody>
    </table>
  </div>

  <h2 class="chapter-title">${isId ? "BAB I. VISUALISASI ARSITEKTUR &amp; PEMODELAN DIAGRAM" : "CHAPTER 1. ARCHITECTURAL VISUALIZATION &amp; DIAGRAM MODEL"}</h2>
  <p>
    ${
      isId
        ? `Berikut adalah pemodelan visual <strong>${escapeHtml(diagram.name)}</strong> menggunakan notasi <strong>${escapeHtml(diagram.type.toUpperCase())}</strong> yang terdiri atas <strong>${metrics.totalNodes} elemen (node)</strong> dan <strong>${metrics.totalEdges} relasi</strong>.`
        : `Below is the visual specification of <strong>${escapeHtml(diagram.name)}</strong> using <strong>${escapeHtml(diagram.type.toUpperCase())}</strong> notation, consisting of <strong>${metrics.totalNodes} nodes</strong> and <strong>${metrics.totalEdges} relations</strong>.`
    }
  </p>
  ${
    svgMarkup
      ? `<div class="diagram-frame">
          ${svgMarkup}
          <div class="caption">${isId ? "Gambar 3.1" : "Figure 3.1"}: Diagram ${escapeHtml(diagram.type.toUpperCase())} - ${escapeHtml(diagram.name || projectTitle)}</div>
        </div>`
      : ""
  }

  <h2 class="chapter-title">${isId ? "BAB II. SPESIFIKASI NARATIF &amp; SKENARIO ALUR SISTEM" : "CHAPTER 2. NARRATIVE SPECIFICATION &amp; SYSTEM FLOW SCENARIOS"}</h2>
  ${narrativeRowsHtml}

  <h3>2.${narratives.length + 1}. ${isId ? "Matriks CRUD (Proses vs Entitas Data)" : "CRUD Matrix (Process vs Data Entities)"}</h3>
  <p>${isId ? "Tabel berikut menyajikan pemetaan matriks Create, Read, Update, Delete antara setiap proses/use case dengan entitas data utama dalam arsitektur sistem:" : "The following table presents the Create, Read, Update, Delete mapping between each process/use case and the core data entities in the system architecture:"}</p>
  ${crudHtml}

  <h2 class="chapter-title">${isId ? "BAB III. KAMUS DATA &amp; STRUKTUR ENTITAS / KELAS" : "CHAPTER 3. DATA DICTIONARY &amp; ENTITY / CLASS SPECIFICATION"}</h2>
  ${dictTablesHtml}

  <h2 class="chapter-title">${isId ? "BAB IV. METRIK KOMPLEKSITAS MCCABE &amp; SKENARIO PENGUJIAN" : "CHAPTER 4. MCCABE COMPLEXITY METRICS &amp; TEST SCENARIOS"}</h2>
  <table>
    <tbody>
      <tr>
        <th style="width:35%">McCabe Cyclomatic Complexity V(G)</th>
        <td><strong>${metrics.cyclomaticComplexity}</strong> (${escapeHtml(metrics.riskLevel.toUpperCase())}) &mdash; V(G) = E - N + 2P (${metrics.totalEdges} - ${metrics.totalNodes} + 2&times;${metrics.connectedComponents})</td>
      </tr>
      <tr>
        <th>${isId ? "Jumlah Jalur Independen (Basis Paths)" : "Independent Basis Paths"}</th>
        <td>${metrics.basisPaths} ${isId ? "jalur eksekusi" : "execution paths"} (${metrics.predicateCount} titik keputusan)</td>
      </tr>
      <tr>
        <th>${isId ? "Rekomendasi Kualitas Arsitektur" : "Architecture Insights"}</th>
        <td>${metrics.recommendations.map((r) => escapeHtml(r)).join("; ")}</td>
      </tr>
    </tbody>
  </table>
  <h3>4.1. ${isId ? "Matriks Skenario Pengujian (Test Case Matrix)" : "Automated Test Case Matrix"}</h3>
  ${testCasesHtml}
</body>
</html>`;
}
