/**
 * Rich Sample Templates & Presets for UML Flow.
 * Menyediakan variasi studi kasus nyata per kategori diagram.
 */

export interface SampleItem {
  id: string;
  type: string;
  category: "database" | "api" | "architecture" | "workflow" | "lifecycle" | "system";
  categoryLabel: string;
  title: string;
  titleId: string;
  icon: string;
  description: string;
  descriptionId: string;
  dsl: string;
}

export const RICH_SAMPLES: SampleItem[] = [
  // ─── Database ERD ──────────────────────────────────────────
  {
    id: "erd_ecommerce",
    type: "erd",
    category: "database",
    categoryLabel: "Database ERD",
    title: "E-Commerce & Toko Online",
    titleId: "E-Commerce & Toko Online",
    icon: "🛒",
    description: "Multi-table schema: users, products, categories, orders, order_items, payments",
    descriptionId: "Skema lengkap toko online: user, produk, kategori, pesanan, item, dan pembayaran",
    dsl: `@diagram "E-Commerce Database" erd

entity User {
  *id: int [pk]
  name: varchar(100)
  email: varchar(100) [unique]
  phone: varchar(20)
  address: text [nullable]
  created_at: timestamp
}

entity Category {
  *id: int [pk]
  name: varchar(50)
  slug: varchar(50) [unique]
}

entity Product {
  *id: int [pk]
  category_id: int [fk]
  name: varchar(150)
  price: decimal(10,2)
  stock: int
  sku: varchar(50) [unique]
}

entity Order {
  *id: int [pk]
  user_id: int [fk]
  order_number: varchar(30) [unique]
  total_amount: decimal(12,2)
  status: varchar(20)
  created_at: timestamp
}

entity OrderItem {
  *id: int [pk]
  order_id: int [fk]
  product_id: int [fk]
  quantity: int
  unit_price: decimal(10,2)
  subtotal: decimal(10,2)
}

entity Payment {
  *id: int [pk]
  order_id: int [fk, unique]
  amount: decimal(12,2)
  payment_method: varchar(30)
  payment_status: varchar(20)
  paid_at: timestamp [nullable]
}

Category ||--o{ Product : contains
User ||--o{ Order : places
Order ||--|{ OrderItem : details
Product ||--o{ OrderItem : purchased
Order ||--|| Payment : settles
`,
  },
  {
    id: "erd_hospital",
    type: "erd",
    category: "database",
    categoryLabel: "Database ERD",
    title: "Sistem Rekam Medis Rumah Sakit",
    titleId: "Sistem Rekam Medis Rumah Sakit",
    icon: "🏥",
    description: "Clinical schema: patients, doctors, departments, medical_records, prescriptions",
    descriptionId: "Skema klinik: pasien, dokter, poliklinik, rekam medis, dan resep obat",
    dsl: `@diagram "Hospital Clinical Database" erd

entity Patient {
  *id: int [pk]
  nik: varchar(16) [unique]
  full_name: varchar(100)
  birth_date: date
  blood_type: varchar(3)
  address: text
}

entity Doctor {
  *id: int [pk]
  sip_number: varchar(50) [unique]
  full_name: varchar(100)
  specialization: varchar(50)
  department_id: int [fk]
}

entity Department {
  *id: int [pk]
  name: varchar(50)
  building_floor: varchar(10)
}

entity MedicalRecord {
  *id: int [pk]
  patient_id: int [fk]
  doctor_id: int [fk]
  visit_date: timestamp
  diagnosis: text
  notes: text [nullable]
}

entity Prescription {
  *id: int [pk]
  record_id: int [fk]
  medicine_name: varchar(100)
  dosage: varchar(50)
  quantity: int
}

Department ||--o{ Doctor : employs
Patient ||--o{ MedicalRecord : consults
Doctor ||--o{ MedicalRecord : examines
MedicalRecord ||--o{ Prescription : orders
`,
  },
  {
    id: "erd_blog",
    type: "erd",
    category: "database",
    categoryLabel: "Database ERD",
    title: "Blog & Media Publikasi",
    titleId: "Blog & Media Publikasi",
    icon: "📰",
    description: "Publishing schema: users, posts, categories, comments, tags",
    descriptionId: "Skema portal berita & artikel: penulis, artikel, komentar, dan tag",
    dsl: `@diagram "Blog Media Database" erd

entity User {
  *id: int [pk]
  username: varchar(50) [unique]
  email: varchar(100) [unique]
  role: varchar(20)
}

entity Post {
  *id: int [pk]
  author_id: int [fk]
  title: varchar(200)
  slug: varchar(200) [unique]
  content: text
  status: varchar(20)
  published_at: timestamp [nullable]
}

entity Comment {
  *id: int [pk]
  post_id: int [fk]
  user_id: int [fk]
  body: text
  created_at: timestamp
}

entity Tag {
  *id: int [pk]
  name: varchar(50) [unique]
}

User ||--o{ Post : writes
Post ||--o{ Comment : receives
User ||--o{ Comment : comments
Post }o--o{ Tag : categorizes
`,
  },

  // ─── Sequence Diagram ──────────────────────────────────────
  {
    id: "seq_payment",
    type: "sequence",
    category: "api",
    categoryLabel: "Sequence Diagram",
    title: "Payment Gateway Checkout",
    titleId: "Payment Gateway Checkout",
    icon: "💳",
    description: "Checkout flow with Midtrans / Stripe webhook & bank confirmation",
    descriptionId: "Alur checkout pembayaran online dengan webhook payment gateway",
    dsl: `@diagram "Payment Gateway Flow" sequence

participant Customer as actor
participant FrontendApp as boundary
participant BackendAPI as control
participant PaymentGateway as control
participant CoreBank as entity

Customer -> FrontendApp: klikBayar(orderId)
FrontendApp -> BackendAPI: POST /api/checkout {orderId}
BackendAPI -> PaymentGateway: createTransaction(token, amount)
PaymentGateway -->> BackendAPI: paymentUrl & snapToken
BackendAPI -->> FrontendApp: 200 OK (paymentUrl)
FrontendApp -> Customer: tampilkanDialogPembayaran()

Customer -> CoreBank: transferVA / scanQRIS()
CoreBank -->> PaymentGateway: transferNotification(success)
PaymentGateway -> BackendAPI: POST /webhook/notification (paid)
BackendAPI -> BackendAPI: verifySignature()
BackendAPI -> CoreBank: updateOrderStatus(PAID)
BackendAPI -->> PaymentGateway: 200 OK (received)
BackendAPI -->> FrontendApp: SSE: orderStatusChanged(PAID)
FrontendApp -> Customer: tampilkanHalamanSukses()
`,
  },
  {
    id: "seq_auth",
    type: "sequence",
    category: "api",
    categoryLabel: "Sequence Diagram",
    title: "Autentikasi OAuth2 / JWT Login",
    titleId: "Autentikasi OAuth2 / JWT Login",
    icon: "🔐",
    description: "Secure login flow with access token, refresh token & password hash",
    descriptionId: "Alur login aman dengan verifikasi password hash & penerbitan JWT",
    dsl: `@diagram "OAuth2 JWT Authentication" sequence

participant User as actor
participant Client as boundary
participant AuthServer as control
participant Database as entity
participant ResourceAPI as control

User -> Client: input(username, password)
Client -> AuthServer: POST /auth/login {user, pass}
AuthServer -> Database: findByUsername(user)
Database -->> AuthServer: userRecordWithHash
AuthServer -> AuthServer: bcrypt.compare(pass, hash)
AuthServer -> AuthServer: generateTokens(payload)
AuthServer -->> Client: 200 OK {accessToken, refreshToken}

Client -> ResourceAPI: GET /api/v1/profile [Bearer Token]
ResourceAPI -> ResourceAPI: verifyJwtSignature()
ResourceAPI -->> Client: 200 OK {profileData}
Client -> User: renderDashboard()
`,
  },

  // ─── Class Diagram ─────────────────────────────────────────
  {
    id: "class_clean_arch",
    type: "class",
    category: "architecture",
    categoryLabel: "Class Diagram",
    title: "Clean Architecture / Repository Pattern",
    titleId: "Clean Architecture / Repository Pattern",
    icon: "🏛️",
    description: "OOP layered architecture: Controller, Service, Repository, Entity, DTO",
    descriptionId: "Arsitektur berlapis OOP: Controller, Service, Repository, dan Entity",
    dsl: `@diagram "Clean Architecture Pattern" class

class UserController {
  -userService: UserService
  +getProfile(req: Request): Response
  +updateProfile(dto: UpdateUserDto): Response
}

interface IUserRepository {
  +findById(id: string): User
  +findByEmail(email: string): User
  +save(user: User): boolean
  +delete(id: string): boolean
}

class UserService {
  -userRepo: IUserRepository
  -logger: Logger
  +getProfile(id: string): UserDto
  +register(dto: CreateUserDto): UserDto
}

class PostgresUserRepository {
  -dbPool: Pool
  +findById(id: string): User
  +save(user: User): boolean
}

class User {
  +id: string
  +email: string
  -passwordHash: string
  +createdAt: Date
  +verifyPassword(plain: string): boolean
}

UserController --> UserService : delegates
UserService --> IUserRepository : depends on
PostgresUserRepository ..|> IUserRepository : implements
PostgresUserRepository --> User : persists
`,
  },
  {
    id: "class_payment_system",
    type: "class",
    category: "architecture",
    categoryLabel: "Class Diagram",
    title: "Sistem Pembayaran OOP Polimorfisme",
    titleId: "Sistem Pembayaran OOP Polimorfisme",
    icon: "💳",
    description: "Polymorphism design: abstract PaymentMethod with Card, EWallet, and Transfer",
    descriptionId: "Pola desain polimorfisme: PaymentMethod dengan implementasi Kartu, E-Wallet, dan Transfer",
    dsl: `@diagram "Payment Methods Polymorphism" class

abstract class PaymentMethod {
  #transactionId: string
  #amount: double
  +processPayment(): boolean
  +getReceipt(): Receipt
}

class CreditCardPayment {
  -cardNumber: string
  -cvv: string
  -expiryMonth: int
  +processPayment(): boolean
}

class EWalletPayment {
  -walletProvider: string
  -phoneNumber: string
  +processPayment(): boolean
}

class BankTransferPayment {
  -virtualAccountNo: string
  -bankCode: string
  +processPayment(): boolean
}

class OrderProcessor {
  +checkout(order: Order, payment: PaymentMethod): boolean
}

CreditCardPayment --|> PaymentMethod
EWalletPayment --|> PaymentMethod
BankTransferPayment --|> PaymentMethod
OrderProcessor --> PaymentMethod : uses
`,
  },

  // ─── Flowchart ─────────────────────────────────────────────
  {
    id: "flow_checkout",
    type: "flowchart",
    category: "workflow",
    categoryLabel: "Flowchart",
    title: "Alur Checkout & Validasi Stok",
    titleId: "Alur Checkout & Validasi Stok",
    icon: "🛍️",
    description: "Business workflow: cart review, stock reservation, voucher discount, payment",
    descriptionId: "Alur bisnis: periksa keranjang, kunci stok produk, kalkulasi diskon, dan bayar",
    dsl: `@diagram "Checkout & Stock Validation" flowchart

start "Mulai Checkout"
process "Validasi Item Keranjang"
decision "Stok Tersedia?"
process "Kunci Stok Sementara"
process "Hitung Diskon Voucher"
decision "Kupon Valid?"
process "Terapkan Potongan Harga"
process "Lanjut Tanpa Diskon"
process "Buat Tagihan Pembayaran"
end "Selesai"
end "Tampilkan Notifikasi Stok Habis"

"Mulai Checkout" -> "Validasi Item Keranjang"
"Validasi Item Keranjang" -> "Stok Tersedia?"
"Stok Tersedia?" -> "Kunci Stok Sementara" : ya
"Stok Tersedia?" -> "Tampilkan Notifikasi Stok Habis" : tidak
"Kunci Stok Sementara" -> "Hitung Diskon Voucher"
"Hitung Diskon Voucher" -> "Kupon Valid?"
"Kupon Valid?" -> "Terapkan Potongan Harga" : ya
"Kupon Valid?" -> "Lanjut Tanpa Diskon" : tidak
"Terapkan Potongan Harga" -> "Buat Tagihan Pembayaran"
"Lanjut Tanpa Diskon" -> "Buat Tagihan Pembayaran"
"Buat Tagihan Pembayaran" -> "Selesai"
`,
  },
  {
    id: "flow_leave_approval",
    type: "flowchart",
    category: "workflow",
    categoryLabel: "Flowchart",
    title: "Alur Persetujuan Cuti Karyawan",
    titleId: "Alur Persetujuan Cuti Karyawan",
    icon: "📅",
    description: "HR approval process: submit request, manager review, HR quota check, decision",
    descriptionId: "Proses HR: pengajuan cuti, review manajer, verifikasi kuota HR, dan notifikasi",
    dsl: `@diagram "Leave Approval Workflow" flowchart

start "Ajukan Permohonan Cuti"
process "Verifikasi Sisa Kuota Cuti"
decision "Sisa Kuota Cukup?"
end "Ditolak: Kuota Tidak Cukup"
process "Kirim Notifikasi ke Manajer"
decision "Disetujui Manajer?"
end "Ditolak oleh Manajer"
process "Pencatatan Sistem HR"
process "Kirim Email Konfirmasi ke Karyawan"
end "Cuti Disetujui"

"Ajukan Permohonan Cuti" -> "Verifikasi Sisa Kuota Cuti"
"Verifikasi Sisa Kuota Cuti" -> "Sisa Kuota Cukup?"
"Sisa Kuota Cukup?" -> "Ditolak: Kuota Tidak Cukup" : tidak
"Sisa Kuota Cukup?" -> "Kirim Notifikasi ke Manajer" : ya
"Kirim Notifikasi ke Manajer" -> "Disetujui Manajer?"
"Disetujui Manajer?" -> "Ditolak oleh Manajer" : tidak
"Disetujui Manajer?" -> "Pencatatan Sistem HR" : ya
"Pencatatan Sistem HR" -> "Kirim Email Konfirmasi ke Karyawan"
"Kirim Email Konfirmasi ke Karyawan" -> "Cuti Disetujui"
`,
  },

  // ─── State Machine ─────────────────────────────────────────
  {
    id: "state_order_lifecycle",
    type: "state",
    category: "lifecycle",
    categoryLabel: "State Machine",
    title: "Siklus Hidup Pesanan (Order Fulfillment)",
    titleId: "Siklus Hidup Pesanan (Order Fulfillment)",
    icon: "📦",
    description: "E-commerce state machine: Created, Paid, Processing, Shipped, Delivered, Cancelled",
    descriptionId: "State transisi pesanan: Dibuat, Dibayar, Diproses, Dikirim, Selesai, atau Batal",
    dsl: `@diagram "Order Fulfillment Lifecycle" state

[initial]
state "Pending Payment"
state "Processing"
state "Shipped"
state "Delivered"
state "Cancelled"
[final]

[initial] --> "Pending Payment"
"Pending Payment" --> "Processing" : payment_success
"Pending Payment" --> "Cancelled" : payment_expired
"Processing" --> "Shipped" : courier_picked_up
"Processing" --> "Cancelled" : item_out_of_stock
"Shipped" --> "Delivered" : customer_received
"Delivered" --> [final] : completed
"Cancelled" --> [final] : refund_issued
`,
  },

  // ─── Use Case Diagram ──────────────────────────────────────
  {
    id: "usecase_siakad",
    type: "usecase",
    category: "system",
    categoryLabel: "Use Case Diagram",
    title: "Sistem Informasi Akademik (SIAKAD)",
    titleId: "Sistem Informasi Akademik (SIAKAD)",
    icon: "🎓",
    description: "Role boundaries: Mahasiswa, Dosen, Admin Akademik with KRS and Nilai",
    descriptionId: "Batasan aktor akademik: Mahasiswa, Dosen, dan Admin untuk pengisian KRS & nilai",
    dsl: `@diagram "SIAKAD System Boundary" usecase

actor Mahasiswa
actor Dosen
actor "Bagian Akademik" as Admin

usecase "Login Akun"
usecase "Pengisian KRS"
usecase "Lihat Jadwal Kuliah"
usecase "Input Nilai Semester"
usecase "Validasi KRS Mahasiswa"
usecase "Manajemen Mata Kuliah"
usecase "Cetak Transkrip Akademik"

Mahasiswa --> "Login Akun"
Mahasiswa --> "Pengisian KRS"
Mahasiswa --> "Lihat Jadwal Kuliah"
Mahasiswa --> "Cetak Transkrip Akademik"

Dosen --> "Login Akun"
Dosen --> "Validasi KRS Mahasiswa"
Dosen --> "Input Nilai Semester"
Dosen --> "Lihat Jadwal Kuliah"

Admin --> "Login Akun"
Admin --> "Manajemen Mata Kuliah"
Admin --> "Cetak Transkrip Akademik"

"Pengisian KRS" <<include>> "Login Akun"
"Input Nilai Semester" <<include>> "Login Akun"
`,
  },

  // ─── Activity Diagram ──────────────────────────────────────
  {
    id: "activity_registration",
    type: "activity",
    category: "workflow",
    categoryLabel: "Activity Diagram",
    title: "Pendaftaran Akun & Verifikasi Email",
    titleId: "Pendaftaran Akun & Verifikasi Email",
    icon: "🏃",
    description: "Concurrent tasks: create database record, send email, generate activation token",
    descriptionId: "Alur konkuren: simpan user di DB dan kirim email token aktivasi secara paralel",
    dsl: `@diagram "User Registration Activity" activity

[start]
action "Isi Formulir Pendaftaran"
decision "Data Valid?"
action "Tampilkan Pesan Error"
action "Enkripsi Password"
action "Simpan Akun ke Database"
action "Kirim Email Verifikasi"
action "Klik Tautan Verifikasi"
action "Aktivasi Status Pengguna"
[end]

[start] --> "Isi Formulir Pendaftaran"
"Isi Formulir Pendaftaran" --> "Data Valid?"
"Data Valid?" --> "Tampilkan Pesan Error" : tidak
"Tampilkan Pesan Error" --> "Isi Formulir Pendaftaran"
"Data Valid?" --> "Enkripsi Password" : ya
"Enkripsi Password" --> "Simpan Akun ke Database"
"Simpan Akun ke Database" --> "Kirim Email Verifikasi"
"Kirim Email Verifikasi" --> "Klik Tautan Verifikasi"
"Klik Tautan Verifikasi" --> "Aktivasi Status Pengguna"
"Aktivasi Status Pengguna" --> [end]
`,
  },

  // ─── Component Diagram ─────────────────────────────────────
  {
    id: "component_microservices",
    type: "component",
    category: "architecture",
    categoryLabel: "Component Diagram",
    title: "Arsitektur Microservices E-Commerce",
    titleId: "Arsitektur Microservices E-Commerce",
    icon: "🧩",
    description: "Distributed components: SPA Frontend, API Gateway, Auth, Order, Payment, Message Broker",
    descriptionId: "Komponen layanan terdistribusi: Web Client, API Gateway, Services, dan Broker",
    dsl: `@diagram "Microservices Architecture" component

component "Web React App" <<client>>
component "Mobile Flutter App" <<client>>
component "Nginx API Gateway" <<gateway>>
component "Auth Service" <<service>>
component "Order Service" <<service>>
component "Product Service" <<service>>
component "Payment Service" <<service>>
component "RabbitMQ / Kafka" <<broker>>
component "PostgreSQL Cluster" <<database>>
component "Redis Cache" <<cache>>

"Web React App" --> "Nginx API Gateway"
"Mobile Flutter App" --> "Nginx API Gateway"
"Nginx API Gateway" --> "Auth Service"
"Nginx API Gateway" --> "Order Service"
"Nginx API Gateway" --> "Product Service"
"Order Service" --> "RabbitMQ / Kafka"
"Payment Service" --> "RabbitMQ / Kafka"
"Product Service" --> "Redis Cache"
"Order Service" --> "PostgreSQL Cluster"
"Auth Service" --> "Redis Cache"
`,
  },

  // ─── Deployment Diagram ────────────────────────────────────
  {
    id: "deployment_cloud_vps",
    type: "deployment",
    category: "system",
    categoryLabel: "Deployment Diagram",
    title: "Infrastruktur Cloud & VPS",
    titleId: "Infrastruktur Cloud & VPS",
    icon: "☁️",
    description: "Physical & virtual infrastructure: Cloudflare, VPS Linux, Docker Container, Postgres, Caddy",
    descriptionId: "Infrastruktur server: Cloudflare, Host VPS Ubuntu, Container Docker, dan Database",
    dsl: `@diagram "Cloud VPS Infrastructure" deployment

node "Cloudflare Edge" <<CDN & DNS>>
node "Ubuntu Linux Host (VPS)" <<Server>> {
  node "Caddy Reverse Proxy" <<Web Server>>
  node "Docker Engine" <<Container Runtime>> {
    node "Frontend Container" <<Next.js / Node 22>>
    node "Backend API Container" <<FastAPI / Python 3.12>>
    node "PostgreSQL Container" <<Postgres 16>>
    artifact "minivps-panel.tar.gz"
  }
}

device "Client Browser"
"Client Browser" --> "Cloudflare Edge" : HTTPS :443
"Cloudflare Edge" --> "Caddy Reverse Proxy" : Reverse Proxy :80
"Caddy Reverse Proxy" --> "Frontend Container" : HTTP :3001
"Caddy Reverse Proxy" --> "Backend API Container" : HTTP :8000
"Backend API Container" --> "PostgreSQL Container" : TCP :5432
`,
  },
];

/**
 * Standard SAMPLES map (kompatibel dengan key tipe lama dan key sample baru).
 */
export const SAMPLES: Record<string, string> = {
  // Legacy / Direct diagram type keys
  class: RICH_SAMPLES.find((s) => s.id === "class_clean_arch")!.dsl,
  sequence: RICH_SAMPLES.find((s) => s.id === "seq_payment")!.dsl,
  erd: RICH_SAMPLES.find((s) => s.id === "erd_ecommerce")!.dsl,
  flowchart: RICH_SAMPLES.find((s) => s.id === "flow_checkout")!.dsl,
  state: RICH_SAMPLES.find((s) => s.id === "state_order_lifecycle")!.dsl,
  usecase: RICH_SAMPLES.find((s) => s.id === "usecase_siakad")!.dsl,
  activity: RICH_SAMPLES.find((s) => s.id === "activity_registration")!.dsl,
  component: RICH_SAMPLES.find((s) => s.id === "component_microservices")!.dsl,
  deployment: RICH_SAMPLES.find((s) => s.id === "deployment_cloud_vps")!.dsl,
};

// Daftarkan semua item ke SAMPLES map
for (const item of RICH_SAMPLES) {
  SAMPLES[item.id] = item.dsl;
}
