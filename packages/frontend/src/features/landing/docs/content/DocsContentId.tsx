import React from "react";
import {
  Section,
  H3,
  P,
  B,
  Ul,
  Ol,
  Kbd,
  DocCallout,
  DocCodeBlock,
  DocSyntaxTable,
} from "../DocTypography";

interface DocsContentIdProps {
  onOpenEditor: (code?: string) => void;
}

export function DocsContentId({ onOpenEditor }: DocsContentIdProps) {
  return (
    <>
      {/* 1. Pengenalan & Quick Start */}
      <Section
        id="getting-started"
        title="1. Pengenalan & Quick Start"
        icon="🚀"
        badge="Dasar"
      >
        <P>
          <B>UML Flow</B> adalah platform pemodelan perangkat lunak modern yang
          menggabungkan kemudahan sintaks teks deklaratif (DSL) dengan fleksibilitas
          kanvas visual dua arah (bidirectional visual canvas). Anda dapat membuat
          diagram berstandar akademik dan industri dalam hitungan detik.
        </P>

        <DocCallout type="academic" title="Standar Penulisan Skripsi & Jurnal">
          Semua diagram yang dihasilkan oleh UML Flow dirancang agar mematuhi kaidah
          notasi UML 2.5 resmi dan standar penulisan skripsi teknik informatika/sistem
          informasi di universitas Indonesia.
        </DocCallout>

        <H3>Alur Kerja Cepat (Quick Start dalam 1 Menit)</H3>
        <Ol>
          <li>
            <B>Buka Editor</B>: Klik tombol <B>Buka Editor Sekarang</B> di navigasi atas.
          </li>
          <li>
            <B>Pilih Templat atau Ketik Kode</B>: Gunakan menu dropdown <B>Templat</B> untuk
            memuat contoh seperti <i>Kerangka Berpikir Skripsi</i>, <i>SDLC Waterfall</i>, atau <i>ERD Akademik</i>.
          </li>
          <li>
            <B>Kompilasi Otomatis</B>: Diagram akan langsung dikompilasi secara real-time ke kanvas visual.
          </li>
          <li>
            <B>Edit Dua Arah</B>: Anda bisa mengedit kode teks di panel kiri ATAU menggeser elemen langsung di kanvas kanan.
          </li>
        </Ol>

        <H3>Anatomi Antarmuka Editor</H3>
        <Ul>
          <li><B>Bilah Menu Atas (Toolbar)</B>: Pemilih mode editor (Split / Visual / Kode), tombol kompilasi, undo/redo, auto-layout, palet tema warna, ekspor gambar, dan opsi kanvas.</li>
          <li><B>Editor DSL (Panel Kiri)</B>: Editor teks deklaratif dengan penyorotan sintaks (syntax highlighting) dan deteksi kesalahan baris.</li>
          <li><B>Kanvas Visual (Panel Tengah)</B>: Kanvas interaktif dengan zoom tak terbatas, pan, grid magnetik, dan mode garis siku (orthogonal).</li>
          <li><B>Palet Node (Panel Kiri pada Mode Visual)</B>: Koleksi simbol dan alat relasi yang dapat ditarik langsung ke kanvas.</li>
          <li><B>Panel Properti (Panel Kanan)</B>: Inspector untuk mengubah nama, tipe data, atribut class, kolom database, serta gaya warna kustom.</li>
        </Ul>
      </Section>

      {/* 2. Mode Editor & Two-Way Sync */}
      <Section
        id="editor-modes"
        title="2. Mode Editor & Two-Way Live Sync"
        icon="🔄"
        badge="Fitur Unggulan"
      >
        <P>
          UML Flow menyediakan 3 mode tampilan kerja yang dapat dialihkan melalui tombol di toolbar:
        </P>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
          <div className="p-3.5 rounded-xl bg-surface-2 border border-border">
            <div className="font-bold text-accent text-sm mb-1">Split (Rekomendasi)</div>
            <p className="text-xs text-text-muted">
              Tampilan berdampingan antara kode DSL di sebelah kiri dan kanvas visual interaktif di sebelah kanan.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-surface-2 border border-border">
            <div className="font-bold text-text text-sm mb-1">Visual</div>
            <p className="text-xs text-text-muted">
              Kanvas visual layar penuh dilengkapi side palette untuk menambah node dan menghubungkan garis menggunakan mouse.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-surface-2 border border-border">
            <div className="font-bold text-text text-sm mb-1">Kode</div>
            <p className="text-xs text-text-muted">
              Editor kode layar penuh bagi pengguna yang ingin fokus mengetik tanpa gangguan visual.
            </p>
          </div>
        </div>

        <H3>Kompilasi Otomatis (Live Compile)</H3>
        <P>
          Ketika fitur <B>Auto Compile</B> aktif (ikon petir hijau di toolbar), diagram akan otomatis
          terkompilasi 700 milidetik setelah Anda berhenti mengetik. Anda juga dapat menekan kombinasi tombol <Kbd>Ctrl</Kbd> + <Kbd>Enter</Kbd> kapan saja untuk kompilasi manual seketika.
        </P>

        <H3>Cara Kerja Two-Way Live Sync (Kanvas ke Kode)</H3>
        <P>
          Salah satu keunggulan terbesar UML Flow adalah kemampuan merefleksikan perubahan visual kembali ke teks kode DSL.
          Ketika Anda menggeser posisi node di kanvas atau menambah atribut melalui inspector properti, cukup klik tombol <B>Sinkron dari Kanvas</B> (ikon 🔄 di toolbar atau di atas editor DSL). Sistem akan otomatis memperbarui kode sumber DSL Anda secara akurat!
        </P>

        <DocCallout type="tip" title="Tips Produktivitas">
          Gunakan mode <b>Split</b> untuk menulis kerangka dasar secara cepat melalui kode, lalu geser posisi elemen di kanvas untuk merapikan layout, dan klik <b>Sinkron (⟳)</b> untuk mengunci posisi akhir.
        </DocCallout>
      </Section>

      {/* 3. Class Diagram */}
      <Section
        id="class-diagram"
        title="3. Class Diagram (Pemodelan Objek)"
        icon="🏗️"
        badge="UML 2.5"
      >
        <P>
          Class Diagram digunakan untuk memvisualisasikan struktur kelas, antarmuka (interface), atribut data, method/operasi, serta hubungan pewarisan dan asosiasi antar objek.
        </P>

        <DocCodeBlock
          code={`@diagram "Sistem Manajemen Pengguna" class

class User {
  +id: string
  +name: string
  -passwordHash: string
  #email: string
  +login(email: string, pass: string): boolean
  +logout(): void
}

interface Authenticatable {
  +generateToken(): string
  +verifyToken(token: string): boolean
}

abstract class BaseEntity {
  +createdAt: Date
  +updatedAt: Date
  #auditLog(): void
}

enum UserRole {
  +ADMIN
  +MAHASISWA
  +DOSEN
}

User --|> BaseEntity : mewarisi (inheritance)
User ..|> Authenticatable : implementasi
User --> UserRole : memiliki peran (association)`}
          diagramType="class"
          title="Contoh Class Diagram Lengkap"
          onOpenEditor={onOpenEditor}
        />

        <DocSyntaxTable
          title="Tabel Sintaks Relasi Class Diagram"
          rows={[
            {
              symbol: "--|>",
              keyword: "Inheritance / Pewarisan",
              example: "User --|> BaseEntity",
              description: "Garis solid dengan ujung segitiga kosong (is-a).",
            },
            {
              symbol: "..|>",
              keyword: "Realization / Implementasi",
              example: "User ..|> Authenticatable",
              description: "Garis putus-putus dengan ujung segitiga kosong.",
            },
            {
              symbol: "-->",
              keyword: "Association / Asosiasi",
              example: 'User "1" --> "*" Order',
              description: "Garis dengan panah terbuka menunjukkan hubungan langsung.",
            },
            {
              symbol: "o--",
              keyword: "Aggregation / Agregasi",
              example: "Jurusan o-- Dosen",
              description: "Garis dengan belah ketupat kosong (has-a lepas).",
            },
            {
              symbol: "*--",
              keyword: "Composition / Komposisi",
              example: "Universitas *-- Fakultas",
              description: "Garis dengan belah ketupat terisi (ikatan ketat).",
            },
            {
              symbol: "..>",
              keyword: "Dependency / Ketergantungan",
              example: "Service ..> Database",
              description: "Garis putus-putus dengan panah (membutuhkan modul lain).",
            },
          ]}
        />
      </Section>

      {/* 4. Sequence Diagram */}
      <Section
        id="sequence-diagram"
        title="4. Sequence Diagram (Alur Interaksi)"
        icon="🔀"
        badge="UML 2.5"
      >
        <P>
          Sequence Diagram menggambarkan interaksi antar objek atau layanan sistem secara kronologis berdasarkan urutan waktu. Sangat esensial untuk bab 3/4 perancangan API dan arsitektur backend skripsi.
        </P>

        <DocCodeBlock
          code={`@diagram "Autentikasi API JWT" sequence

participant Pengguna as actor
participant FrontendApp as boundary
participant ApiGateway as control
participant AuthService as control
participant Database as entity

Pengguna -> FrontendApp : Masukkan email & password
FrontendApp -> ApiGateway : POST /api/v1/auth/login
ApiGateway -> AuthService : verifikasiKredensial()
AuthService -> Database : SELECT * FROM users WHERE email=?
Database -->> AuthService : Data User Record
AuthService -> AuthService : bcrypt.compare(password)
AuthService -->> ApiGateway : 200 OK + JWT Token Bearer
ApiGateway -->> FrontendApp : Set Session Cookie
FrontendApp -->> Pengguna : Tampilkan Dashboard Utama`}
          diagramType="sequence"
          title="Contoh Sequence Diagram API Login"
          onOpenEditor={onOpenEditor}
        />

        <DocCallout type="note" title="Tipe Partisipan Simbol Standar">
          Anda dapat menambahkan stereotipe peran di sebelah nama partisipan:
          <Ul>
            <li><code>actor</code> — Aktor pengguna manusia</li>
            <li><code>boundary</code> — Antarmuka web, mobile app, atau view form</li>
            <li><code>control</code> — Layanan controller, handler proses, atau business logic</li>
            <li><code>entity</code> — Tabel database atau data store</li>
          </Ul>
        </DocCallout>
      </Section>

      {/* 5. Flowchart */}
      <Section
        id="flowchart"
        title="5. Flowchart & Kerangka Berpikir Skripsi"
        icon="📊"
        badge="Wajib Skripsi"
      >
        <P>
          Diagram alir (Flowchart) digunakan pada Bab 2 & 3 untuk menggambarkan metodologi penelitian, kerangka berpikir (Input-Proses-Output), serta algoritma logika program.
        </P>

        <DocCodeBlock
          code={`@diagram "Kerangka Berpikir Model IPO" flowchart

start "Mulai Penelitian"
process "1. INPUT: Masalah Skripsi\\n• Studi literatur & observasi lapangan\\n• Kebutuhan fungsional sistem"
process "2. PROSES: Perancangan & Pengujian\\n• Desain UML Flow & Database ERD\\n• Pengkodean sistem web & API"
decision "Uji Kelayakan Valid?"
process "3. OUTPUT: Aplikasi Terintegrasi\\n• Efisiensi pengolahan data meningkat\\n• Laporan skripsi Bab 4 selesai"
end "Selesai (Bab 5)"

"Mulai Penelitian" -> "1. INPUT: Masalah Skripsi\\n• Studi literatur & observasi lapangan\\n• Kebutuhan fungsional sistem"
"1. INPUT: Masalah Skripsi\\n• Studi literatur & observasi lapangan\\n• Kebutuhan fungsional sistem" -> "2. PROSES: Perancangan & Pengujian\\n• Desain UML Flow & Database ERD\\n• Pengkodean sistem web & API"
"2. PROSES: Perancangan & Pengujian\\n• Desain UML Flow & Database ERD\\n• Pengkodean sistem web & API" -> "Uji Kelayakan Valid?" : "Black Box"
"Uji Kelayakan Valid?" -> "3. OUTPUT: Aplikasi Terintegrasi\\n• Efisiensi pengolahan data meningkat\\n• Laporan skripsi Bab 4 selesai" : "Ya (Lolos)"
"Uji Kelayakan Valid?" -> "2. PROSES: Perancangan & Pengujian\\n• Desain UML Flow & Database ERD\\n• Pengkodean sistem web & API" : "Revisi (Gagal)"
"3. OUTPUT: Aplikasi Terintegrasi\\n• Efisiensi pengolahan data meningkat\\n• Laporan skripsi Bab 4 selesai" -> "Selesai (Bab 5)"`}
          diagramType="flowchart"
          title="Contoh Kerangka Berpikir Penelitian Skripsi"
          onOpenEditor={onOpenEditor}
        />

        <DocCallout type="academic" title="Rekomendasi Mode Garis Siku">
          Saat membuat Flowchart, pastikan untuk mengaktifkan <b>Mode Garis Siku (Orthogonal)</b> di toolbar agar garis belokan membentuk sudut siku 90 derajat yang rapi dan tidak miring.
        </DocCallout>
      </Section>

      {/* 6. Database ERD */}
      <Section
        id="erd"
        title="6. Database ERD (Entity Relationship Diagram)"
        icon="🗄️"
        badge="Basis Data"
      >
        <P>
          Entity Relationship Diagram (ERD) mendefinisikan skema tabel basis data relasional lengkap dengan Primary Key, Foreign Key, dan relasi Crow's Foot.
        </P>

        <DocCodeBlock
          code={`@diagram "ERD Sistem Akademik" erd

entity Mahasiswa {
  *nim: varchar(15) [pk]
  nama: varchar(100)
  jurusan: varchar(50)
  dosen_pembimbing_id: int [fk]
}

entity Dosen {
  *id: int [pk]
  nidn: varchar(15) [unique]
  nama_lengkap: varchar(100)
}

entity KRS {
  *id: int [pk]
  nim: varchar(15) [fk]
  kode_mata_kuliah: varchar(10) [fk]
  nilai_angka: decimal(5,2)
}

entity MataKuliah {
  *kode: varchar(10) [pk]
  nama_mk: varchar(100)
  sks: int
}

Mahasiswa ||--o{ KRS : mengambil
MataKuliah ||--o{ KRS : didaftar
Dosen ||--o{ Mahasiswa : membimbing`}
          diagramType="erd"
          title="Contoh ERD Basis Data Akademik"
          onOpenEditor={onOpenEditor}
        />
      </Section>

      {/* 7. State Machine Diagram */}
      <Section
        id="state-diagram"
        title="7. State Machine Diagram (Siklus Hidup Objek)"
        icon="🔄"
        badge="UML 2.5"
      >
        <P>
          State Machine menggambarkan berbagai kondisi status (state) yang dialami oleh entitas sepanjang siklus hidupnya beserta peristiwa pemicu (event/trigger) perpindahan status.
        </P>

        <DocCodeBlock
          code={`@diagram "Siklus Status Bimbingan Skripsi" state

state PengajuanDraft
state SedangDirevisi
state SiapDisidangkan
state LulusSidang

[*] -> PengajuanDraft : Mahasiswa Upload Judul
PengajuanDraft -> SedangDirevisi : Dosen Beri Catatan [ada revisi]
SedangDirevisi -> PengajuanDraft : Mahasiswa Kirim Perbaikan
PengajuanDraft -> SiapDisidangkan : Dosen Berikan ACC Sidang
SiapDisidangkan -> LulusSidang : Sidang Terlaksana [Nilai >= B]
LulusSidang -> [*] : Terbitkan Ijazah`}
          diagramType="state"
          title="Contoh State Diagram Skripsi"
          onOpenEditor={onOpenEditor}
        />
      </Section>

      {/* 8. Activity Diagram */}
      <Section
        id="activity-diagram"
        title="8. Activity Diagram & Swimlanes"
        icon="🏊"
        badge="UML 2.5"
      >
        <P>
          Activity Diagram memodelkan alur kerja proses bisnis bertahap. Fitur <b>Swimlanes</b> memisahkan aktivitas berdasarkan penanggung jawab (aktor/sistem).
        </P>

        <DocCodeBlock
          code={`@diagram "Peminjaman Buku Perpustakaan" activity

|Mahasiswa|
start
:Pilih Buku di Rak;
:Serahkan Kartu & Buku;

|Petugas Perpustakaan|
:Scan Barcode Buku;
if (Ada Denda Keterlambatan?) then (Ya)
  :Tampilkan Nominal Denda;
  :Terima Pembayaran Denda;
else (Tidak)
endif
:Simpan Riwayat Peminjaman;
:Serahkan Buku ke Mahasiswa;

|Mahasiswa|
:Terima Buku Pinjaman;
stop`}
          diagramType="activity"
          title="Contoh Activity Diagram dengan Swimlanes"
          onOpenEditor={onOpenEditor}
        />
      </Section>

      {/* 9. Use Case Diagram */}
      <Section
        id="usecase-diagram"
        title="9. Use Case Diagram (Kebutuhan Fungsional)"
        icon="👤"
        badge="UML 2.5"
      >
        <P>
          Use Case Diagram memetakan interaksi antara aktor luar (pengguna atau sistem eksternal) dengan fungsi-fungsi utama di dalam batas sistem perangkat lunak.
        </P>

        <DocCodeBlock
          code={`@diagram "Use Case Portal Akademik" usecase

actor Mahasiswa
actor Dosen
actor "Bagian Keuangan" as Keuangan

system "Portal Akademik Kampus" {
  usecase "Login Akun" as uc_login
  usecase "Pengisian KRS Online" as uc_krs
  usecase "Validasi Pembayaran SPP" as uc_spp
  usecase "Input Nilai Semester" as uc_nilai
  usecase "Cetak Kartu Hasil Studi" as uc_khs
}

Mahasiswa --> uc_login
Mahasiswa --> uc_krs
Mahasiswa --> uc_khs
Dosen --> uc_login
Dosen --> uc_nilai
Keuangan --> uc_spp
uc_krs ..> uc_spp : <<include>>`}
          diagramType="usecase"
          title="Contoh Use Case Diagram Portal Akademik"
          onOpenEditor={onOpenEditor}
        />
      </Section>

      {/* 10. Component Diagram */}
      <Section
        id="component-diagram"
        title="10. Component Diagram & Arsitektur 3-Tier"
        icon="🧩"
        badge="Arsitektur"
      >
        <P>
          Component Diagram menunjukkan modul fisik dan layer arsitektur perangkat lunak (seperti Web Frontend, API Gateway, Microservice, dan Database Cluster).
        </P>

        <DocCodeBlock
          code={`@diagram "Arsitektur Sistem 3-Tier" component

component "Presentation Layer\\n(React Web & Flutter Mobile)" as c_ui
component "Application Layer\\n(Node.js / Express REST API)" as c_api
component "Database Layer\\n(PostgreSQL Server Cluster)" as c_db
component "External Payment Gateway\\n(Midtrans / Stripe)" as c_gateway

c_ui -> c_api : "HTTPS / JSON Payload"
c_api -> c_db : "TCP / SQL Query"
c_api -> c_gateway : "REST Webhook"`}
          diagramType="component"
          title="Contoh Arsitektur Sistem 3-Tier"
          onOpenEditor={onOpenEditor}
        />
      </Section>

      {/* 11. Kanvas & Garis Siku */}
      <Section
        id="visual-editing"
        title="11. Manipulasi Kanvas & Mode Garis Siku (Orthogonal)"
        icon="↗️"
        badge="Interaksi Visual"
      >
        <P>
          UML Flow bukan sekadar text editor; kanvas kami dirancang dengan akselerasi grafis interaktif berkecepatan tinggi:
        </P>

        <H3>Cara Menghubungkan Garis Antar-Node</H3>
        <Ol>
          <li>Arahkan kursor ke node sumber. Titik anchor magnetik (Atas, Kanan, Bawah, Kiri) akan muncul otomatis.</li>
          <li>Klik dan tahan titik anchor tersebut, lalu tarik garis menuju node target.</li>
          <li>Lepaskan klik di atas node target untuk membuat koneksi instan.</li>
        </Ol>

        <H3>Mode Garis Siku (Orthogonal Routing 90°)</H3>
        <P>
          Di menu toolbar atas, terdapat tombol <B>Garis Siku (Orthogonal)</B>. Saat diaktifkan, semua garis relasi akan otomatis ditekuk membentuk sudut siku 90 derajat yang rapi, menghindari tabrakan dengan node lain di sekitarnya.
        </P>

        <H3>Multi-Seleksi & Perataan Elemen (Alignment)</H3>
        <P>
          Tahan tombol <Kbd>Shift</Kbd> lalu klik beberapa node, atau buat kotak seleksi (Marquee Drag). Bilah alat perataan akan muncul otomatis untuk:
        </P>
        <Ul>
          <li><B>Rata Kiri / Tengah / Kanan</B>: Menyejajarkan posisi horizontal seluruh node terpilih.</li>
          <li><B>Rata Atas / Tengah / Bawah</B>: Menyejajarkan posisi vertikal seluruh node terpilih.</li>
          <li><B>Distribusikan Jarak</B>: Meratakan spasi interval antar-node agar jaraknya presisi sama rata.</li>
        </Ul>
      </Section>

      {/* 12. Palet Tema Warna */}
      <Section
        id="styling"
        title="12. Palet 1-Klik Skripsi Formal & Gaya Elemen"
        icon="🎓"
        badge="Estetika"
      >
        <P>
          Jangan biarkan diagram Anda terlihat membosankan atau tidak sesuai pedoman kampus. UML Flow menyediakan palet warna terkurasi 1-klik di menu <b>Options ⚙️</b> dan <b>Style Panel 🎨</b>:
        </P>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-4">
          <div className="p-3 rounded-lg border border-border bg-white text-slate-900 shadow-2xs">
            <div className="font-bold text-xs flex items-center gap-1.5 mb-1">
              <span>🎓</span> Skripsi Formal
            </div>
            <p className="text-[11px] text-slate-600">Latar putih murni, border tegas slate-700. Standar dokumen kampus.</p>
          </div>
          <div className="p-3 rounded-lg border border-indigo-500/40 bg-indigo-50/80 text-indigo-950 shadow-2xs">
            <div className="font-bold text-xs flex items-center gap-1.5 mb-1">
              <span>💎</span> Modern Indigo
            </div>
            <p className="text-[11px] text-indigo-800">Aksen indigo modern untuk presentasi arsitektur profesional.</p>
          </div>
          <div className="p-3 rounded-lg border border-emerald-500/40 bg-emerald-50/80 text-emerald-950 shadow-2xs">
            <div className="font-bold text-xs flex items-center gap-1.5 mb-1">
              <span>🌿</span> Forest Emerald
            </div>
            <p className="text-[11px] text-emerald-800">Nuansa hijau elegan untuk modul data dan bisnis.</p>
          </div>
          <div className="p-3 rounded-lg border border-amber-500/40 bg-amber-50/80 text-amber-950 shadow-2xs">
            <div className="font-bold text-xs flex items-center gap-1.5 mb-1">
              <span>🌅</span> Sunset Amber
            </div>
            <p className="text-[11px] text-amber-800">Kontras hangat untuk alur proses penting dan decision warning.</p>
          </div>
          <div className="p-3 rounded-lg border border-sky-500/40 bg-sky-50/80 text-sky-950 shadow-2xs">
            <div className="font-bold text-xs flex items-center gap-1.5 mb-1">
              <span>☁️</span> Sky Cyan
            </div>
            <p className="text-[11px] text-sky-800">Nuansa biru langit bersih untuk jaringan dan komputasi awan.</p>
          </div>
          <div className="p-3 rounded-lg border border-purple-500/40 bg-slate-900 text-purple-200 shadow-2xs">
            <div className="font-bold text-xs flex items-center gap-1.5 mb-1">
              <span>🌌</span> Cyber Violet
            </div>
            <p className="text-[11px] text-purple-300">Tema gelap futuristik berdaya tarik tinggi untuk slide portofolio.</p>
          </div>
        </div>

        <H3>Mode Cetak Monokrom</H3>
        <P>
          Jika dosen pembimbing Anda mensyaratkan diagram dicetak hitam-putih tanpa gradasi warna di lembar skripsi fisik, cukup aktifkan tombol <B>Mode Cetak Monokrom</B> di menu Options. Semua node akan diubah ke kontras hitam-putih tajam bergaris tebal.
        </P>
      </Section>

      {/* 13. Ekspor HD */}
      <Section
        id="export"
        title="13. Ekspor Resolusi Tinggi (PNG 300 DPI, SVG, PDF)"
        icon="💾"
        badge="Hasil Cetak"
      >
        <P>
          Diagram dapat diekspor langsung melalui tombol <b>Export</b> di toolbar atas ke berbagai format beresolusi tinggi:
        </P>

        <Ul>
          <li><B>PNG Resolusi Tinggi (300 DPI)</B>: Gambar raster tajam berlatar transparan atau putih, sempurna untuk ditempel ke dokumen Microsoft Word atau Google Docs tanpa pecah.</li>
          <li><B>SVG Vektor Tajam</B>: Format vektor standar W3C yang tidak akan pecah berapapun perbesaran zoom dokumen Anda.</li>
          <li><B>Keterangan Format Akademik (Gambar X.X)</B>: Otomatis menghasilkan teks caption baku di bawah gambar diagram sesuai standar pedoman skripsi perguruan tinggi Indonesia.</li>
          <li><B>JSON Diagram</B>: Simpan berkas proyek diagram lengkap untuk dibuka kembali di kemudian hari.</li>
        </Ul>
      </Section>

      {/* 14. Generator Kode */}
      <Section
        id="code-generation"
        title="14. Generator Kode Program (TypeScript, Java, & SQL)"
        icon="💻"
        badge="Developer"
      >
        <P>
          Jangan biarkan diagram UML Anda hanya menjadi gambar mati. UML Flow dilengkapi engine kompilasi balik yang mampu menghasilkan kode sumber backend dan skema basis data siap pakai:
        </P>

        <div className="space-y-3 my-4">
          <div className="p-3.5 rounded-xl bg-surface-2 border border-border">
            <div className="font-bold text-accent text-xs mb-1">TypeScript Code Generator</div>
            <p className="text-xs text-text-muted">
              Mengubah Class Diagram menjadi definisi <code>interface</code>, <code>abstract class</code>, dan <code>enum</code> dengan tipe data TypeScript modern.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-surface-2 border border-border">
            <div className="font-bold text-accent text-xs mb-1">Java OOP Code Generator</div>
            <p className="text-xs text-text-muted">
              Mengubah Class Diagram menjadi file class Java berstandar OOP lengkap dengan private field, constructor, getter, dan setter.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-surface-2 border border-border">
            <div className="font-bold text-accent text-xs mb-1">SQL DDL Schema Generator</div>
            <p className="text-xs text-text-muted">
              Mengubah Entity Relationship Diagram (ERD) menjadi skrip SQL <code>CREATE TABLE</code> lengkap dengan <code>PRIMARY KEY</code>, <code>FOREIGN KEY</code>, dan <code>CONSTRAINT</code> siap eksekusi di PostgreSQL / MySQL.
            </p>
          </div>
        </div>
      </Section>

      {/* 15. Daftar Pintasan Keyboard */}
      <Section
        id="shortcuts"
        title="15. Daftar Pintasan Papan Ketik (Keyboard Shortcuts)"
        icon="⌨️"
        badge="Produktivitas"
      >
        <P>
          Kuasai tombol pintasan cepat berikut untuk mempercepat alur kerja Anda hingga 3x lipat:
        </P>

        <div className="overflow-hidden rounded-xl border border-border/80 bg-surface-2/70 my-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-surface-3/50 border-b border-border text-[11px] font-bold uppercase text-text-muted">
                <th className="py-2.5 px-4">Tombol Pintasan</th>
                <th className="py-2.5 px-4">Aksi / Fungsi</th>
                <th className="py-2.5 px-4">Kategori</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              <tr>
                <td className="py-2.5 px-4"><Kbd>Ctrl</Kbd> + <Kbd>Enter</Kbd></td>
                <td className="py-2.5 px-4 font-medium text-text">Kompilasi kode DSL ke kanvas visual</td>
                <td className="py-2.5 px-4 text-text-muted">Editor</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4"><Kbd>Ctrl</Kbd> + <Kbd>Z</Kbd></td>
                <td className="py-2.5 px-4 font-medium text-text">Urungkan perubahan (Undo)</td>
                <td className="py-2.5 px-4 text-text-muted">Histori</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4"><Kbd>Ctrl</Kbd> + <Kbd>Y</Kbd> / <Kbd>Ctrl+Shift+Z</Kbd></td>
                <td className="py-2.5 px-4 font-medium text-text">Ulangi perubahan (Redo)</td>
                <td className="py-2.5 px-4 text-text-muted">Histori</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4"><Kbd>Ctrl</Kbd> + <Kbd>F</Kbd></td>
                <td className="py-2.5 px-4 font-medium text-text">Buka bar pencarian node di kanvas</td>
                <td className="py-2.5 px-4 text-text-muted">Kanvas</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4"><Kbd>Ctrl</Kbd> + <Kbd>A</Kbd></td>
                <td className="py-2.5 px-4 font-medium text-text">Pilih semua node di kanvas</td>
                <td className="py-2.5 px-4 text-text-muted">Kanvas</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4"><Kbd>Delete</Kbd> / <Kbd>Backspace</Kbd></td>
                <td className="py-2.5 px-4 font-medium text-text">Hapus elemen yang sedang dipilih</td>
                <td className="py-2.5 px-4 text-text-muted">Kanvas</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4"><Kbd>Spasi</Kbd> + <Kbd>Drag Mouse</Kbd></td>
                <td className="py-2.5 px-4 font-medium text-text">Geser viewport kanvas (Pan mode)</td>
                <td className="py-2.5 px-4 text-text-muted">Navigasi</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4"><Kbd>Double Click</Kbd> pada Elemen</td>
                <td className="py-2.5 px-4 font-medium text-text">Ubah nama atau label secara langsung</td>
                <td className="py-2.5 px-4 text-text-muted">Kanvas</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}
