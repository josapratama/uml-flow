import type { DiagramTemplate } from "./types";

export const ACADEMIC_USECASE_TEMPLATES: DiagramTemplate[] = [
  {
    id: "tmpl_academic_usecase",
    name: "Use Case Diagram Bimbingan Skripsi",
    description:
      "Interaksi aktor Mahasiswa, Dosen Pembimbing, dan Admin Jurusan dalam sistem tugas akhir.",
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
        {
          id: "sys_boundary",
          name: "Sistem Informasi Bimbingan Skripsi",
          type: "system" as any,
          position: { x: 230, y: 30 },
          size: { width: 340, height: 490 },
        },
        {
          id: "act_mhs",
          name: "Mahasiswa",
          type: "actor" as any,
          position: { x: 50, y: 130 },
          size: { width: 90, height: 90 },
        },
        {
          id: "act_dosen",
          name: "Dosen Pembimbing",
          type: "actor" as any,
          position: { x: 50, y: 330 },
          size: { width: 110, height: 90 },
        },
        {
          id: "act_admin",
          name: "Admin Jurusan",
          type: "actor" as any,
          position: { x: 640, y: 230 },
          size: { width: 100, height: 90 },
        },
        {
          id: "uc_login",
          name: "Login Akun",
          type: "usecase" as any,
          position: { x: 300, y: 70 },
          size: { width: 200, height: 55 },
        },
        {
          id: "uc_bimbingan",
          name: "Pengajuan Bimbingan",
          type: "usecase" as any,
          position: { x: 300, y: 160 },
          size: { width: 200, height: 55 },
        },
        {
          id: "uc_revisi",
          name: "Catatan Revisi & Feedback",
          type: "usecase" as any,
          position: { x: 300, y: 250 },
          size: { width: 200, height: 55 },
        },
        {
          id: "uc_acc",
          name: "ACC / Persetujuan Sidang",
          type: "usecase" as any,
          position: { x: 300, y: 340 },
          size: { width: 200, height: 55 },
        },
        {
          id: "uc_master",
          name: "Kelola Master Data & Sidang",
          type: "usecase" as any,
          position: { x: 300, y: 430 },
          size: { width: 200, height: 55 },
        },
      ],
      edges: [
        {
          id: "ue1",
          source: "act_mhs",
          target: "uc_login",
          type: "association",
        },
        {
          id: "ue2",
          source: "act_mhs",
          target: "uc_bimbingan",
          type: "association",
        },
        {
          id: "ue3",
          source: "act_dosen",
          target: "uc_login",
          type: "association",
        },
        {
          id: "ue4",
          source: "act_dosen",
          target: "uc_revisi",
          type: "association",
        },
        {
          id: "ue5",
          source: "act_dosen",
          target: "uc_acc",
          type: "association",
        },
        {
          id: "ue6",
          source: "act_admin",
          target: "uc_login",
          type: "association",
        },
        {
          id: "ue7",
          source: "act_admin",
          target: "uc_master",
          type: "association",
        },
      ],
      metadata: {
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        version: 1,
      },
    },
  },
];
