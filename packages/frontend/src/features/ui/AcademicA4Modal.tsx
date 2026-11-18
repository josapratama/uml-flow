import React, { useState } from "react";
import type { Diagram } from "@uml-editor/shared";
import { getFullDiagramSVG } from "../../services/export-png";
import { showToast } from "./Toast";
import { useI18n } from "../../i18n";

interface AcademicA4ModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagram: Diagram | null;
}

export function AcademicA4Modal({
  isOpen,
  onClose,
  diagram,
}: AcademicA4ModalProps) {
  const { locale } = useI18n();
  const isId = locale === "id";

  const [orientation, setOrientation] = useState<"portrait" | "landscape">("landscape");
  const [docNumber, setDocNumber] = useState("Lampiran 3.1");
  const [diagramTitle, setDiagramTitle] = useState(
    diagram?.name ? `Diagram ${diagram.name}` : "Diagram Alir Sistem"
  );
  const [systemName, setSystemName] = useState("Sistem Informasi Akademik Terintegrasi (SIAKAD)");
  const [authorName, setAuthorName] = useState("Josa Pratama");
  const [studentId, setStudentId] = useState("2024101001");
  const [advisorName, setAdvisorName] = useState("Dr. Ir. Budi Santoso, M.Kom.");
  const [dateStr, setDateStr] = useState(new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }));

  if (!isOpen || !diagram) return null;

  const handlePrint = () => {
    const el = document.querySelector(".canvas-svg-element") as SVGSVGElement | null;
    if (!el) {
      showToast(isId ? "Gagal menemukan SVG diagram" : "SVG not found", "error");
      return;
    }

    const svgString = getFullDiagramSVG(el);
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      showToast(isId ? "Popup terblokir oleh browser" : "Popup blocked", "error");
      return;
    }

    const pageSize = orientation === "portrait" ? "A4 portrait" : "A4 landscape";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${diagramTitle} - ${docNumber}</title>
        <style>
          @page {
            size: ${pageSize};
            margin: 0;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: "Times New Roman", Times, serif;
          }
          body {
            background: #fff;
            color: #000;
            width: ${orientation === "portrait" ? "210mm" : "297mm"};
            height: ${orientation === "portrait" ? "297mm" : "210mm"};
            padding: 20mm 15mm 15mm 20mm; /* Standard university margin: Top 20, Right 15, Bottom 15, Left 20 */
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .outer-border {
            border: 2px solid #000;
            height: 100%;
            display: flex;
            flex-direction: column;
            padding: 8mm;
            position: relative;
          }
          .header-label {
            font-size: 11pt;
            font-weight: bold;
            text-align: right;
            margin-bottom: 4mm;
            text-transform: uppercase;
          }
          .svg-wrapper {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            padding: 4mm;
          }
          .svg-wrapper svg {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
          }
          .title-block {
            margin-top: 6mm;
            border: 1.5px solid #000;
            border-collapse: collapse;
            width: 100%;
            font-size: 9pt;
          }
          .title-block td, .title-block th {
            border: 1px solid #000;
            padding: 4px 8px;
            vertical-align: middle;
          }
          .title-block th {
            font-weight: bold;
            text-align: left;
            background: #f8f8f8;
          }
          .diagram-title-text {
            font-size: 11pt;
            font-weight: bold;
            text-align: center;
          }
          @media print {
            body { -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="outer-border">
          <div class="header-label">${docNumber}</div>
          <div class="svg-wrapper">
            ${svgString}
          </div>
          <table class="title-block">
            <tr>
              <th style="width: 18%;">Sistem / Proyek</th>
              <td style="width: 42%; font-weight: 600;">${systemName}</td>
              <th style="width: 15%;">Mahasiswa / NIM</th>
              <td style="width: 25%;">${authorName} (${studentId})</td>
            </tr>
            <tr>
              <th>Judul Diagram</th>
              <td class="diagram-title-text">${diagramTitle}</td>
              <th>Dosen Pembimbing</th>
              <td>${advisorName}</td>
            </tr>
            <tr>
              <th>Tipe Diagram</th>
              <td style="text-transform: uppercase; font-weight: bold;">${diagram.type} DIAGRAM</td>
              <th>Tanggal / Versi</th>
              <td>${dateStr} (v${diagram.metadata.version || 1}.0)</td>
            </tr>
          </table>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
    showToast(isId ? "Membuka dialog cetak PDF A4..." : "Opening A4 print dialog...", "info");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface-2 border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-1/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">📄</span>
            <div>
              <h2 className="text-base font-bold text-text">
                {isId ? "Ekspor Lembar Lampiran Skripsi A4" : "Export Thesis Academic A4 Sheet"}
              </h2>
              <p className="text-xs text-muted">
                {isId
                  ? "Format formal siap cetak / PDF dengan bingkai, margin standar, dan Kop Diagram"
                  : "Print-ready formal PDF with academic border, standard margins, and title block"}
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

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto text-xs text-text">
          {/* Orientation */}
          <div>
            <label className="block font-semibold mb-1 text-muted">
              {isId ? "Orientasi Kertas A4" : "Page Orientation"}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOrientation("landscape")}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-medium transition ${
                  orientation === "landscape"
                    ? "bg-accent/15 border-accent text-accent shadow-2xs"
                    : "border-border bg-surface-1 text-muted hover:border-text/30"
                }`}
              >
                <span>🖥️ Landscape (Lebar - Rekomendasi)</span>
              </button>
              <button
                type="button"
                onClick={() => setOrientation("portrait")}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-medium transition ${
                  orientation === "portrait"
                    ? "bg-accent/15 border-accent text-accent shadow-2xs"
                    : "border-border bg-surface-1 text-muted hover:border-text/30"
                }`}
              >
                <span>📄 Portrait (Tinggi)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1 text-muted">
                {isId ? "Nomor Lampiran / Bab" : "Appendix / Chapter Label"}
              </label>
              <input
                type="text"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                placeholder="Contoh: Lampiran 3.1"
                className="w-full bg-surface-1 border border-border rounded-xl px-3 py-2 text-text outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-muted">
                {isId ? "Judul Gambar / Diagram" : "Diagram Caption / Title"}
              </label>
              <input
                type="text"
                value={diagramTitle}
                onChange={(e) => setDiagramTitle(e.target.value)}
                placeholder="Contoh: Diagram Use Case Sistem SIAKAD"
                className="w-full bg-surface-1 border border-border rounded-xl px-3 py-2 text-text outline-none focus:border-accent font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-muted">
              {isId ? "Nama Sistem / Judul Tugas Akhir" : "System / Thesis Title"}
            </label>
            <input
              type="text"
              value={systemName}
              onChange={(e) => setSystemName(e.target.value)}
              placeholder="Contoh: Rancang Bangun Sistem Informasi Akademik..."
              className="w-full bg-surface-1 border border-border rounded-xl px-3 py-2 text-text outline-none focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1 text-muted">
                {isId ? "Nama Mahasiswa / Peneliti" : "Author Name"}
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full bg-surface-1 border border-border rounded-xl px-3 py-2 text-text outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-muted">NIM / ID</label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full bg-surface-1 border border-border rounded-xl px-3 py-2 text-text outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1 text-muted">
                {isId ? "Dosen Pembimbing" : "Advisor Name"}
              </label>
              <input
                type="text"
                value={advisorName}
                onChange={(e) => setAdvisorName(e.target.value)}
                className="w-full bg-surface-1 border border-border rounded-xl px-3 py-2 text-text outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-muted">
                {isId ? "Tanggal Dokumen" : "Document Date"}
              </label>
              <input
                type="text"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full bg-surface-1 border border-border rounded-xl px-3 py-2 text-text outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Preview Box Note */}
          <div className="p-3 bg-surface-1 rounded-xl border border-border/70 flex items-start gap-2.5 text-muted">
            <span className="text-base text-accent">ℹ️</span>
            <p className="leading-relaxed">
              {isId
                ? "Format ini menggunakan rasio cetak A4 dengan batas garis ganda dan Kop Formal Teknik Komputer & Informatika. Pada jendela pratinjau cetak browser, pilih 'Save as PDF' dan centang 'Background Graphics'."
                : "This layout uses standard academic A4 double-borders and formal Engineering title blocks. In the print dialog, select 'Save as PDF' and enable 'Background Graphics'."}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 bg-surface-1/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border text-muted hover:text-text hover:bg-surface-2 transition font-medium"
          >
            {isId ? "Batal" : "Cancel"}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold transition flex items-center gap-2 shadow-sm"
          >
            <span>🖨️</span>
            <span>{isId ? "Cetak / Simpan Lembar A4 PDF" : "Print / Save Academic A4 PDF"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
