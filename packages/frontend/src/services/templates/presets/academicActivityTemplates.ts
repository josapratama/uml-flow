import type { DiagramTemplate } from "./types";

export const ACADEMIC_ACTIVITY_TEMPLATES: DiagramTemplate[] = [
  {
    id: "tmpl_activity_siakad_krs_swimlane",
    name: "Activity Diagram Pengisian KRS (3 Swimlane Skripsi)",
    description:
      "Alur aktivitas mahasiswa mengisi KRS dengan pembagian partisi kolom: Mahasiswa, Portal SIAKAD, dan Dosen Penasihat Akademik.",
    category: "academic",
    tag: "Skripsi Bab 3",
    isBuiltIn: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    dsl: `@diagram "Aktivitas Pengisian KRS" activity

swimlane "Mahasiswa"
swimlane "Portal SIAKAD"
swimlane "Dosen Penasihat Akademik"

start [Mahasiswa]
action "Pilih Menu KRS & Mata Kuliah" [Mahasiswa]
action "Verifikasi Prasyarat SKS & Kuota Kelas" [Portal SIAKAD]
decision "Kuota & Prasyarat Terpenuhi?" [Portal SIAKAD]
action "Kirim Pengajuan KRS ke Dosen PA" [Portal SIAKAD]
action "Review Rencana Studi & Konsultasi" [Dosen Penasihat Akademik]
decision "Setujui KRS?" [Dosen Penasihat Akademik]
action "Status KRS Disetujui (KRS Final)" [Portal SIAKAD]
action "Beri Catatan Revisi & Notifikasi" [Dosen Penasihat Akademik]
end [Portal SIAKAD]

start --> "Pilih Menu KRS & Mata Kuliah"
"Pilih Menu KRS & Mata Kuliah" --> "Verifikasi Prasyarat SKS & Kuota Kelas"
"Verifikasi Prasyarat SKS & Kuota Kelas" --> "Kuota & Prasyarat Terpenuhi?"
"Kuota & Prasyarat Terpenuhi?" --> "Kirim Pengajuan KRS ke Dosen PA" : "[Ya]"
"Kuota & Prasyarat Terpenuhi?" --> "Pilih Menu KRS & Mata Kuliah" : "[Tidak]"
"Kirim Pengajuan KRS ke Dosen PA" --> "Review Rencana Studi & Konsultasi"
"Review Rencana Studi & Konsultasi" --> "Setujui KRS?"
"Setujui KRS?" --> "Status KRS Disetujui (KRS Final)" : "[Disetujui]"
"Setujui KRS?" --> "Beri Catatan Revisi & Notifikasi" : "[Revisi]"
"Beri Catatan Revisi & Notifikasi" --> "Pilih Menu KRS & Mata Kuliah"
"Status KRS Disetujui (KRS Final)" --> end`,
    diagram: {
      id: "diagram_activity_siakad_krs",
      name: "Aktivitas Pengisian KRS",
      type: "activity",
      swimlanes: ["Mahasiswa", "Portal SIAKAD", "Dosen Penasihat Akademik"],
      nodes: [
        {
          id: "act_start",
          name: "start",
          type: "start",
          position: { x: 120, y: 80 },
          size: { width: 32, height: 32 },
          swimlane: "Mahasiswa",
        },
        {
          id: "act_pilih",
          name: "Pilih Menu KRS & Mata Kuliah",
          type: "action",
          position: { x: 50, y: 150 },
          size: { width: 170, height: 50 },
          swimlane: "Mahasiswa",
        },
        {
          id: "act_verif",
          name: "Verifikasi Prasyarat SKS & Kuota Kelas",
          type: "action",
          position: { x: 290, y: 150 },
          size: { width: 190, height: 50 },
          swimlane: "Portal SIAKAD",
        },
        {
          id: "act_dec1",
          name: "Kuota & Prasyarat Terpenuhi?",
          type: "decision",
          position: { x: 335, y: 240 },
          size: { width: 100, height: 60 },
          swimlane: "Portal SIAKAD",
        },
        {
          id: "act_kirim",
          name: "Kirim Pengajuan KRS ke Dosen PA",
          type: "action",
          position: { x: 290, y: 340 },
          size: { width: 190, height: 50 },
          swimlane: "Portal SIAKAD",
        },
        {
          id: "act_review",
          name: "Review Rencana Studi & Konsultasi",
          type: "action",
          position: { x: 550, y: 340 },
          size: { width: 190, height: 50 },
          swimlane: "Dosen Penasihat Akademik",
        },
        {
          id: "act_dec2",
          name: "Setujui KRS?",
          type: "decision",
          position: { x: 595, y: 430 },
          size: { width: 100, height: 60 },
          swimlane: "Dosen Penasihat Akademik",
        },
        {
          id: "act_final",
          name: "Status KRS Disetujui (KRS Final)",
          type: "action",
          position: { x: 290, y: 520 },
          size: { width: 190, height: 50 },
          swimlane: "Portal SIAKAD",
        },
        {
          id: "act_revisi",
          name: "Beri Catatan Revisi & Notifikasi",
          type: "action",
          position: { x: 550, y: 520 },
          size: { width: 190, height: 50 },
          swimlane: "Dosen Penasihat Akademik",
        },
        {
          id: "act_end",
          name: "end",
          type: "end",
          position: { x: 370, y: 610 },
          size: { width: 32, height: 32 },
          swimlane: "Portal SIAKAD",
        },
      ],
      edges: [
        { id: "e1", source: "act_start", target: "act_pilih", type: "flow" },
        { id: "e2", source: "act_pilih", target: "act_verif", type: "flow" },
        { id: "e3", source: "act_verif", target: "act_dec1", type: "flow" },
        { id: "e4", source: "act_dec1", target: "act_kirim", type: "flow", label: { text: "[Ya]" } },
        { id: "e5", source: "act_dec1", target: "act_pilih", type: "flow", label: { text: "[Tidak]" } },
        { id: "e6", source: "act_kirim", target: "act_review", type: "flow" },
        { id: "e7", source: "act_review", target: "act_dec2", type: "flow" },
        { id: "e8", source: "act_dec2", target: "act_final", type: "flow", label: { text: "[Disetujui]" } },
        { id: "e9", source: "act_dec2", target: "act_revisi", type: "flow", label: { text: "[Revisi]" } },
        { id: "e10", source: "act_revisi", target: "act_pilih", type: "flow" },
        { id: "e11", source: "act_final", target: "act_end", type: "flow" },
      ],
      metadata: {
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        version: 1,
      },
    },
  },
];
