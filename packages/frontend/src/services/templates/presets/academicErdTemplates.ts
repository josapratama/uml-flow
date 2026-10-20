import type { DiagramTemplate } from "./types";

export const ACADEMIC_ERD_TEMPLATES: DiagramTemplate[] = [
  {
    id: "tmpl_academic_erd_akademik",
    name: "ERD Sistem Informasi Akademik",
    description:
      "Database skripsi standar universitas: Mahasiswa, Dosen, Mata Kuliah, KRS, dan Nilai.",
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
            {
              name: "nim",
              type: "varchar(15)",
              isPrimaryKey: true,
              isNullable: false,
              isForeignKey: false,
              isUnique: true,
            },
            {
              name: "nama",
              type: "varchar(100)",
              isPrimaryKey: false,
              isNullable: false,
              isForeignKey: false,
              isUnique: false,
            },
            {
              name: "prodi",
              type: "varchar(50)",
              isPrimaryKey: false,
              isNullable: false,
              isForeignKey: false,
              isUnique: false,
            },
            {
              name: "dosen_nidn",
              type: "varchar(15)",
              isPrimaryKey: false,
              isNullable: true,
              isForeignKey: true,
              isUnique: false,
            },
          ],
        },
        {
          id: "erd_dosen",
          name: "Dosen",
          type: "entity" as any,
          position: { x: 60, y: 320 },
          size: { width: 220, height: 140 },
          attributes: [
            {
              name: "nidn",
              type: "varchar(15)",
              isPrimaryKey: true,
              isNullable: false,
              isForeignKey: false,
              isUnique: true,
            },
            {
              name: "nama_dosen",
              type: "varchar(100)",
              isPrimaryKey: false,
              isNullable: false,
              isForeignKey: false,
              isUnique: false,
            },
            {
              name: "email",
              type: "varchar(100)",
              isPrimaryKey: false,
              isNullable: false,
              isForeignKey: false,
              isUnique: true,
            },
          ],
        },
        {
          id: "erd_krs",
          name: "KRS",
          type: "entity" as any,
          position: { x: 380, y: 80 },
          size: { width: 220, height: 180 },
          attributes: [
            {
              name: "id",
              type: "int",
              isPrimaryKey: true,
              isNullable: false,
              isForeignKey: false,
              isUnique: true,
            },
            {
              name: "nim",
              type: "varchar(15)",
              isPrimaryKey: false,
              isNullable: false,
              isForeignKey: true,
              isUnique: false,
            },
            {
              name: "kode_mk",
              type: "varchar(10)",
              isPrimaryKey: false,
              isNullable: false,
              isForeignKey: true,
              isUnique: false,
            },
            {
              name: "semester",
              type: "varchar(10)",
              isPrimaryKey: false,
              isNullable: false,
              isForeignKey: false,
              isUnique: false,
            },
            {
              name: "nilai_huruf",
              type: "char(2)",
              isPrimaryKey: false,
              isNullable: true,
              isForeignKey: false,
              isUnique: false,
            },
          ],
        },
        {
          id: "erd_mk",
          name: "MataKuliah",
          type: "entity" as any,
          position: { x: 380, y: 320 },
          size: { width: 220, height: 140 },
          attributes: [
            {
              name: "kode_mk",
              type: "varchar(10)",
              isPrimaryKey: true,
              isNullable: false,
              isForeignKey: false,
              isUnique: true,
            },
            {
              name: "nama_mk",
              type: "varchar(100)",
              isPrimaryKey: false,
              isNullable: false,
              isForeignKey: false,
              isUnique: false,
            },
            {
              name: "sks",
              type: "int",
              isPrimaryKey: false,
              isNullable: false,
              isForeignKey: false,
              isUnique: false,
            },
          ],
        },
      ],
      edges: [
        {
          id: "e_mhs_krs",
          source: "erd_mhs",
          target: "erd_krs",
          type: "one-to-many",
        },
        {
          id: "e_mk_krs",
          source: "erd_mk",
          target: "erd_krs",
          type: "one-to-many",
        },
        {
          id: "e_dosen_mhs",
          source: "erd_dosen",
          target: "erd_mhs",
          type: "one-to-many",
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
