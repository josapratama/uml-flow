# Panduan Lengkap Sintaks DSL UML Flow

UML Flow menggunakan bahasa DSL (*Domain-Specific Language*) deklaratif yang ringkas dan manusiawi. Anda cukup menuliskan deklarasi diagram, elemen node/entitas, serta tanda relasi panah antar elemen.

---

## Daftar Isi
1. [Deklarasi Header Diagram](#1-deklarasi-header-diagram)
2. [Flowchart (Diagram Alir)](#2-flowchart-diagram-alir)
3. [Class Diagram](#3-class-diagram)
4. [Sequence Diagram](#4-sequence-diagram)
5. [Entity Relationship Diagram (ERD)](#5-entity-relationship-diagram-erd)
6. [Activity Diagram](#6-activity-diagram)
7. [State Diagram](#7-state-diagram)
8. [Use Case Diagram](#8-use-case-diagram)
9. [Component Diagram](#9-component-diagram)
10. [Deployment Diagram](#10-deployment-diagram)
11. [Kustomisasi Teks Multiline & Judul Tebal](#11-kustomisasi-teks-multiline--judul-tebal)

---

## 1. Deklarasi Header Diagram

Setiap kode diagram disarankan diawali dengan deklarasi tipe diagram di baris pertama:

```dsl
@diagram "<Nama Diagram>" <tipe_diagram>
```

Tipe diagram yang didukung:
- `flowchart`
- `class`
- `sequence`
- `erd`
- `activity`
- `state`
- `usecase`
- `component`
- `deployment`

> **Catatan:** Jika Anda tidak menuliskan `@diagram ...`, parser UML Flow memiliki **fitur auto-detect cerdas** yang otomatis mendeteksi diagram berdasarkan kata kunci awal (misalnya: jika ada `process` atau `[start]` maka otomatis menjadi `flowchart`).

---

## 2. Flowchart (Diagram Alir)

UML Flow mendukung dua gaya penulisan flowchart:

### A. Gaya Standar (Kanonikal)
Gunakan kata kunci bentuk (`start`, `end`, `process`, `decision`, `io`, `document`, `database`, `subroutine`, `connector`, `preparation`) diikuti teks dalam tanda kutip dan alias opsional (`as <id>`).

```dsl
@diagram "Alur Validasi Dokumen" flowchart

start "Mulai" as start
io "Upload Berkas PDF" as input
decision "Ukuran < 5MB?" as cek_ukuran
process "Ekstraksi Teks OCR" as ocr
document "Cetak Bukti Verifikasi" as cetak
database "Simpan ke PostgreSQL" as db
end "Selesai" as selesai

start --> input
input --> cek_ukuran
cek_ukuran --> ocr : Ya
cek_ukuran --> input : Tidak
ocr --> db
db --> cetak
cetak --> selesai
```

### B. Gaya Shorthand Praktis
Anda juga dapat menuliskan bentuk node menggunakan tanda kurung siku `[tipe]` dan alias di akhir baris `(id)`:

```dsl
[start] Mulai (start)
[io] Input NIK dan Nama (input)
[process] Validasi Data Kependudukan (proses)
[end] Kartu Selesai Dicetak (selesai)

start -> input
input -> proses
proses -> selesai
```

---

## 3. Class Diagram

Mendukung visibilitas, tipe data, parameter metode, dan relasi pewarisan OOP:

```dsl
@diagram "Sistem E-Commerce" class

class User {
  +id: string
  #email: string
  -passwordHash: string
  +register(): boolean
  +login(email: string, pass: string): Token
}

class Customer {
  +shippingAddress: string
  +placeOrder(cart: Cart): Order
}

interface IPayable {
  +processPayment(amount: number): boolean
}

enum OrderStatus {
  PENDING
  PAID
  SHIPPED
}

User <|-- Customer : mewarisi
Customer ..|> IPayable : implementasi
```

### Simbol Relasi Class:
- `<|--` atau `--|>` : Inheritance / Generalization
- `<|..` atau `..|>` : Realization / Interface Implementation
- `*--` atau `--*` : Composition
- `o--` atau `--o` : Aggregation
- `-->` : Association / Dependency

---

## 4. Sequence Diagram

Menjelaskan interaksi antar objek/aktor berdasarkan urutan waktu:

```dsl
@diagram "Alur Otentikasi" sequence

participant User as actor
participant Frontend
participant Backend
participant Database

User -> Frontend: Klik Login(username, pass)
Frontend -> Backend: POST /api/auth/login
Backend -> Database: SELECT * FROM users WHERE email = ?
Database -->> Backend: Data Pengguna (Hash)
Backend -->> Frontend: 200 OK (JWT Token)
Frontend -->> User: Redirect ke Dashboard
```

### Jenis Panah Sequence:
- `->` : Pesan Sinkron (*Synchronous Call*)
- `->>` : Pesan Asinkron (*Asynchronous Message*)
- `-->>` : Nilai Kembalian (*Return Message*)

---

## 5. Entity Relationship Diagram (ERD)

Untuk memodelkan skema basis data relasional. Mendukung penanda Primary Key (`*`), Foreign Key (`[fk]`), Unique (`[unique]`), dan Nullable (`[nullable]`):

```dsl
@diagram "Database Toko" erd

entity users {
  *id: uuid
  name: varchar
  email: varchar [unique]
  created_at: timestamp
}

entity orders {
  *id: uuid
  user_id: uuid [fk]
  total_amount: decimal
  status: varchar
}

users ||--o{ orders : "memiliki transaksi"
```

### Notasi Kardinalitas Crow's Foot:
- `||--||` : Tepat Satu ke Satu (1 to 1)
- `||--o{` : Satu ke Banyak (1 to N)
- `}o--o{` : Banyak ke Banyak (M to N)

---

## 6. Activity Diagram

Mendukung action, merge, fork/join paralel, dan swimlane organisasi:

```dsl
@diagram "Pengajuan Cuti" activity

swimlane "Karyawan"
[start]
action "Isi Formulir Cuti"
action "Kirim Pengajuan"

swimlane "Manager"
decision "Setujui Permohonan?"
action "Tanda Tangani Berkas"

swimlane "HRD"
action "Catat di Buku Induk"
[end]

"Isi Formulir Cuti" --> "Kirim Pengajuan"
"Kirim Pengajuan" --> "Setujui Permohonan?"
"Setujui Permohonan?" --> "Tanda Tangani Berkas" [ya]
"Setujui Permohonan?" --> "Isi Formulir Cuti" [tidak]
"Tanda Tangani Berkas" --> "Catat di Buku Induk"
"Catat di Buku Induk" --> [end]
```

---

## 7. State Diagram

Memodelkan siklus hidup (*state machine*) suatu objek:

```dsl
@diagram "Siklus Pemesanan" state

[initial]
state MenungguPembayaran
state Diproses
state Dikirim
state Selesai
[final]

[initial] --> MenungguPembayaran
MenungguPembayaran --> Diproses : Pembayaran Terkonfirmasi
Diproses --> Dikirim : Kurir Menjemput Paket
Dikirim --> Selesai : Diterima Pelanggan
Selesai --> [final]
```

### Composite State (Sub-state Bersarang):
```dsl
state "DalamPerjalanan" {
  [initial]
  state DiGudangPusat
  state DiTransitHub
  state DiantarKurir
  [initial] --> DiGudangPusat
  DiGudangPusat --> DiTransitHub
  DiTransitHub --> DiantarKurir
}
```

---

## 8. Use Case Diagram

Memetakan fungsionalitas sistem dari sudut pandang aktor:

```dsl
@diagram "Portal Akademik" usecase

actor Mahasiswa as mhs
actor Dosen as dsn

usecase "Login Akun" as uc_login
usecase "Mengisi KRS" as uc_krs
usecase "Validasi KRS" as uc_validasi
usecase "Melihat Transkrip Nilai" as uc_transkrip

mhs --> uc_login
mhs --> uc_krs
mhs --> uc_transkrip

dsn --> uc_login
dsn --> uc_validasi

uc_krs <<include>> uc_login
uc_validasi <<include>> uc_login
```

---

## 9. Component Diagram

```dsl
@diagram "Microservice Core" component

component "Frontend Client" as web
component "API Gateway" as gw <<gateway>>
component "Auth Service" as auth
component "Order Service" as order
database "PostgreSQL DB" as db

web --> gw : HTTPS
gw --> auth : gRPC
gw --> order : gRPC
order --> db : TCP/5432
```

---

## 10. Deployment Diagram

Memodelkan infrastruktur fisik/server dan kontainer Docker:

```dsl
@diagram "Cloud Infrastructure" deployment

node "Load Balancer NGINX" as lb
node "Docker Host Production" as srv {
  artifact "web-client.tar.gz"
  component "NodeJS Backend Container"
}
device "Cloud Database Cluster" as db

lb --> srv : Port 80/443
srv --> db : Port 5432
```

---

## 11. Kustomisasi Teks Multiline & Judul Tebal

Jika Anda memiliki deskripsi langkah kerja yang panjang, gunakan urutan escape `\n` di dalam string:

```dsl
[process] 1. Analisis Kebutuhan (Requirement Analysis)\nIdentifikasi kebutuhan 4 aktor pengguna, 6 kategori arsip, dan OCR (tahap1)
```

**Hasil Tampilan di Kanvas:**
- Baris pertama (`1. Analisis Kebutuhan (Requirement Analysis)`) akan otomatis dirender dengan **huruf tebal (*bold font-weight 600*)**.
- Kalimat setelah `\n` akan otomatis dibungkus (*word-wrap*) secara proporsional sesuai lebar kartu.
- Tinggi kartu otomatis bertambah vertikal sehingga tidak ada teks yang terpotong keluar dari kotak.
