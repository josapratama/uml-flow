# UML Flow Studio

> **Modern, High-Performance Browser-Based Diagramming Platform**  
> Ditenagai oleh Bun, Hono, React 19, dan Tailwind CSS 4. Ubah deskripsi teks DSL menjadi diagram UML & Flowchart elegan secara instan, edit visual di kanvas interaktif, atau generate diagram otomatis dengan AI.

[![Bun](https://img.shields.io/badge/Bun-1.3+-black?logo=bun)](https://bun.sh)
[![React](https://img.shields.io/badge/React-19.2+-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Hono](https://img.shields.io/badge/Hono-4.12+-E36002?logo=hono)](https://hono.dev)
[![Vite](https://img.shields.io/badge/Vite-8.0+-646CFF?logo=vite)](https://vitejs.dev)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com)

---

## 🌟 Fitur Utama

- **9 Tipe Diagram Lengkap**:
  - **Flowchart**: Mulai (`start`), Selesai (`end`), Proses (`process`), Percabangan (`decision`), Input/Output (`io`), Dokumen (`document`), Database (`database`), Subroutine, Konektor, dan Preparasi.
  - **Class Diagram**: Atribut, Metode, Stereotype (`«interface»`, `«abstract»`, `«enum»`), Visibilitas (`+`, `-`, `#`, `~`).
  - **Sequence Diagram**: Partisipan, Pesan Asinkron/Sinkron/Return, dan Blok Fragmen (`alt`, `loop`, `opt`).
  - **Entity Relationship Diagram (ERD)**: Entitas, Atribut, Primary Key (`*`), Foreign Key (`fk`), Tipe Data.
  - **Activity Diagram**: Action, Fork, Join, Merge, Swimlane, Decision.
  - **State Diagram**: State awal/akhir, Transisi event, dan Composite States (substate bersarang).
  - **Use Case Diagram**: Aktor, Use Case, System Boundary, `<<include>>`, `<<extend>>`.
  - **Component Diagram**: Komponen, Port, Interface Provided & Required.
  - **Deployment Diagram**: Node, Device, Artifact, dan Koneksi Jaringan.
- **Dual Editing Synchronization**:
  - Edit langsung via editor teks kode DSL dengan *live syntax highlighting*, atau drag-and-drop di kanvas grafis visual (Split / Code / Visual mode).
  - Tombol **"Sinkron dari Kanvas"** mempertahankan format multiline dan alias unik tanpa kehilangan relasi.
- **Smart Text Wrapping & Proportional Card Sizing**:
  - Teks deskripsi panjang (hingga ratusan karakter) otomatis dibungkus (*word-wrap*) secara proporsional (lebar max 320–380px) dengan tinggi yang otomatis menyesuaikan jumlah baris.
  - Dukungan baris baru `\n` dengan baris pertama otomatis dijadikan judul tebal (*bold header*).
  - Node `start` dan `end` menggunakan bentuk kapsul (*stadium pill*) yang tidak memotong teks.
- **Mesin Tata Letak Otomatis (6 Preset Layout Engine)**:
  - `Auto`: Menyesuaikan layout terbaik berdasarkan tipe diagram.
  - `Hierarkis (Layered)`: Top-down / Left-Right berbasis Sugiyama topological sort.
  - `Linear (Vertikal)`: Alur satu kolom terpusat yang ideal untuk alur flowchart dan activity.
  - `Grid`: Susunan kotak rapi adaptif terhadap dimensi kartu.
  - `Force-Directed`: Simulasi pegas fisika organik dengan algoritma anti-tumpang tindih (*bounding-box collision resolution*).
  - `Radial Rings`: Alur melingkar dari node sentral ke ring luar.
- **Tabbed Properties & Styling Panel**:
  - Panel kanan bertab **"Properti | Style"** terpadu.
  - Edit nama node (multiline), dimensi lebar & tinggi, tombol **Auto-fit ukuran**, dan tombol **"Terapkan style ke semua node sejenis"**.
  - Panel properti relasi (*edge*): balik arah, edit label/kondisi, dan ganti tipe panah langsung.
  - Border style kustom (`solid`, `dashed`, `dotted`, `none`), sudut lengkung, font, dan 1-click curated theme palettes.
- **Ekspor Fidelitas Tinggi (High-Fidelity Export)**:
  - **SVG**: Dirender dengan bentuk dan warna asli persis seperti tampilan di kanvas browser.
  - **PNG**: Ekspor gambar resolusi tinggi langsung ke file atau 1-klik salin ke clipboard.
  - **Code Generation**: Ekspor DDL SQL (PostgreSQL, MySQL, SQLite), TypeScript interface, Java classes, dan XState state machines.
- **Keamanan & Isolasi Data Multi-Tenant**:
  - API penyimpanan diagram diisolasi secara ketat per client workspace (`x-client-id`).
  - Debounced atomic disk write untuk melindungi integritas berkas data dari mati listrik/crash.
  - Perlindungan Rate Limiter dan payload limit 5 MB.
- **Multi-Bahasa (i18n)**:
  - Mendukung Bahasa Indonesia (`id`), English (`en`), dan Japanese (`ja`) dengan sinkronisasi Polyglot Hub + offline build fallback.

---

## 🚀 Quick Start (Pengembangan Lokal)

### Prasyarat
- [Bun](https://bun.sh) (v1.2+) terpasang di sistem Anda.

### Instalasi & Menjalankan

```bash
# 1. Clone repository
git clone https://github.com/josapratama/uml-flow.git
cd uml-flow

# 2. Install semua dependencies monorepo
bun install

# 3. Jalankan backend (port 3001) dan frontend (port 5173) serentak
bun run dev
```

Buka peramban di [http://localhost:5173](http://localhost:5173).

---

## 🏗️ Struktur Proyek (Monorepo)

```
uml-flow/
├── packages/
│   ├── shared/            # Tipe data TypeScript, sizing, styling & grammar bersama
│   │   ├── src/
│   │   │   ├── types.ts
│   │   │   ├── text-sizing.ts    # Smart word-wrapping & computeFlowNodeSize
│   │   │   └── styling.ts
│   ├── backend/           # Server API Bun + Hono
│   │   ├── src/
│   │   │   ├── index.ts          # Server entrypoint, CORS, rate limiter
│   │   │   ├── parser/           # Lexer & parser tokenizer untuk 9 tipe diagram
│   │   │   ├── layout/           # Mesin kalkulasi koordinat (Layered, Linear, Force, dsb)
│   │   │   ├── export/           # Generator SVG & DSL fidelitas tinggi
│   │   │   └── routes/           # REST endpoints (/api/compile, /api/diagrams, dsb)
│   └── frontend/          # Aplikasi SPA React 19 + Vite + Tailwind CSS 4
│       ├── src/
│       │   ├── features/
│       │   │   ├── canvas/       # Komponen render SVG diagram, Node, Edge & Minimap
│       │   │   ├── editor/       # Text editor DSL & syntax highlighter
│       │   │   └── toolbar/      # Kontrol navigasi, preset layout, export modal
│       │   └── hooks/            # Undo/redo history, actions, dan state management
├── docs/                  # Dokumentasi teknis & panduan lengkap
│   ├── DSL_GUIDE.md       # Panduan sintaks DSL untuk semua jenis diagram
│   └── API_REFERENCE.md   # Spesifikasi endpoint REST API
├── Dockerfile             # Multi-stage production container build
└── package.json           # Workspace manager
```

---

## 🧪 Menjalankan Pengujian (Testing)

Proyek ini dilengkapi dengan unit test menyeluruh untuk parser, layout engine, export SVG, dan keamanan API:

```bash
# Menjalankan seluruh test suite backend
bun test packages/backend

# Menjalankan type-checking TypeScript di frontend
bun run --cwd packages/frontend tsc --noEmit

# Membangun bundle produksi frontend
bun run build
```

---

## 🐳 Deployment Produksi (Docker)

Repository ini menyediakan `Dockerfile` multi-stage berbasis `oven/bun:alpine`:

```bash
# Build image Docker
docker build -t uml-flow:latest .

# Jalankan container
docker run -d \
  --name uml-flow \
  -p 3000:3000 \
  -v $(pwd)/.data:/app/.data \
  -e PORT=3000 \
  -e CORS_ORIGINS="https://uml-flow.josapratama.com" \
  uml-flow:latest
```

---

## 📚 Dokumentasi Lanjutan

- [**Panduan Sintaks DSL (DSL Guide)**](docs/DSL_GUIDE.md) — Panduan lengkap penulisan kode untuk 9 tipe diagram beserta contoh siap pakai.
- [**Referensi REST API (API Reference)**](docs/API_REFERENCE.md) — Dokumentasi endpoint API `/api/compile`, `/api/parse`, `/api/export`, dan manajemen storage diagram.

---

## 📄 Lisensi

Dilisensikan di bawah [MIT License](LICENSE).
