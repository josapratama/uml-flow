import type { Locale } from "../../../i18n";

export interface DemoTab {
  id: string;
  label: string;
  icon: string;
  badge: string;
  desc: string;
  dslCode: string;
  sampleKey: string;
}

const CLASS_DSL = `@diagram "User Authentication" class

class User {
  +id: string
  +email: string
  -passwordHash: string
  +validatePassword(pass: string): boolean
  +generateToken(): string
}

interface Authenticatable {
  +authenticate(): boolean
  +revokeSession(): void
}

abstract class BaseEntity {
  +id: string
  +createdAt: Date
  +updatedAt: Date
}

class Session {
  +token: string
  +expiresAt: Date
  +isValid(): boolean
}

User --|> BaseEntity
User ..|> Authenticatable
User "1" --> "*" Session : owns`;

const SEQUENCE_DSL = `@diagram "JWT Login Flow" sequence

participant Client as actor
participant Gateway as boundary
participant AuthService as control
participant Database as entity

Client -> Gateway: POST /api/v1/auth/login
Gateway -> AuthService: authenticate(email, password)
AuthService -> Database: findUserByEmail(email)
Database -->> AuthService: userRecord
AuthService -> AuthService: verifyPasswordHash()
AuthService -->> Gateway: 200 OK + JWT Token
Gateway -->> Client: Set-Cookie: token_id`;

const ERD_DSL = `@diagram "E-Commerce Database" erd

entity customers {
  *id: int [pk]
  email: varchar [unique]
  full_name: varchar
  created_at: timestamp
}

entity orders {
  *id: int [pk]
  customer_id: int [fk]
  total_cents: int
  order_status: varchar
}

entity order_items {
  *id: int [pk]
  order_id: int [fk]
  product_id: int [fk]
  quantity: int
}

customers ||--o{ orders : places
orders ||--|{ order_items : contains`;

const STATE_DSL = `@diagram "Order Lifecycle" state

[initial]
state PendingPayment
state Processing
state Shipped
state Delivered
state Cancelled
[final]

[*] --> PendingPayment
PendingPayment --> Processing : paymentReceived
PendingPayment --> Cancelled : paymentFailed
Processing --> Shipped : packageDispatched
Shipped --> Delivered : customerConfirmed
Delivered --> [*]`;

const FLOWCHART_DSL = `@diagram "Checkout Verification" flowchart

start "Start Checkout"
decision "Items In Stock?"
process "Reserve Inventory"
process "Calculate Tax & Total"
decision "Card Authorized?"
process "Generate Order Invoice"
process "Display Error to User"
end "Complete Checkout"`;

export function getDemoTabs(locale: Locale = "id"): DemoTab[] {
  const isId = locale === "id";
  return [
    {
      id: "class",
      label: isId ? "Diagram Class" : "Class Diagram",
      icon: "🏗️",
      badge: isId ? "Arsitektur OOP" : "OOP Architecture",
      desc: isId
        ? "Definisikan domain model, interface, pewarisan, dan relasi asosiasi dengan visibilitas dan tipe data ketat."
        : "Define domain models, interfaces, inheritance, and associations with strict visibility and typing.",
      sampleKey: "class",
      dslCode: CLASS_DSL,
    },
    {
      id: "sequence",
      label: isId ? "Alur Sequence" : "Sequence Flow",
      icon: "🔀",
      badge: isId ? "Alur Proses" : "Process Flow",
      desc: isId
        ? "Visualisasikan pemanggilan API asinkron, lifeline aktor, query database, dan pertukaran pesan antar sistem."
        : "Visualize asynchronous API calls, lifelines, database queries, and system interactions over time.",
      sampleKey: "sequence",
      dslCode: SEQUENCE_DSL,
    },
    {
      id: "erd",
      label: isId ? "Database ERD" : "Database ERD",
      icon: "🗄️",
      badge: isId ? "Skema Basis Data" : "Schema Design",
      desc: isId
        ? "Rancang skema database relasional lengkap dengan primary key, foreign key, batasan unik, dan kardinalitas."
        : "Model relational database schemas with primary keys, foreign keys, constraints, and relationships.",
      sampleKey: "erd",
      dslCode: ERD_DSL,
    },
    {
      id: "state",
      label: isId ? "State Machine" : "State Machine",
      icon: "🔁",
      badge: isId ? "Siklus Hidup" : "Lifecycle",
      desc: isId
        ? "Lacak transisi status entitas, tahapan lifecycle, dan pemicu aksi secara presisi tanpa ambiguitas."
        : "Track status transitions, lifecycle milestones, and event triggers cleanly without ambiguity.",
      sampleKey: "state",
      dslCode: STATE_DSL,
    },
    {
      id: "flowchart",
      label: "Flowchart",
      icon: "📊",
      badge: isId ? "Logika Keputusan" : "Decision Logic",
      desc: isId
        ? "Petakan alur percabangan algoritma, validasi kondisi bersyarat, dan proses bisnis bertingkat secara otomatis."
        : "Map branching algorithmic decisions, conditional paths, and validation pipelines with auto-layout.",
      sampleKey: "flowchart",
      dslCode: FLOWCHART_DSL,
    },
  ];
}

export const DEMO_TABS: DemoTab[] = getDemoTabs("id");

export interface DiagramTypeDetail {
  type: string;
  icon: string;
  badge: string;
  whenToUse: string;
  notations: string;
  codeSample: string;
  sampleKey: string;
}

export function getDiagramTypesDetails(locale: Locale = "id"): DiagramTypeDetail[] {
  const isId = locale === "id";
  return [
    {
      type: isId ? "Class Diagram" : "Class Diagram",
      icon: "🏗️",
      badge: isId ? "Struktural" : "Structural",
      whenToUse: isId
        ? "Pemodelan domain bisnis, arsitektur OOP, definisi interface kontrak, dan implementasi design pattern."
        : "Domain modeling, clean OOP architecture, interface definitions, and design patterns.",
      notations: "class, interface, abstract class, --|>, ..|>, -->, *--, o--",
      codeSample: "class User { +id: string }\nUser --|> BaseEntity",
      sampleKey: "class",
    },
    {
      type: isId ? "Sequence Diagram" : "Sequence Diagram",
      icon: "🔀",
      badge: isId ? "Perilaku" : "Behavioral",
      whenToUse: isId
        ? "Alur komunikasi antar microservice, sequence API endpoint, alur autentikasi JWT, dan siklus request-response."
        : "API sequences, microservice communications, auth flows, and request-response lifecycles.",
      notations: "participant, actor, boundary, control, ->, -->, -->>",
      codeSample: "Client -> Server: login(credentials)\nServer -->> Client: 200 OK",
      sampleKey: "sequence",
    },
    {
      type: isId ? "Database ERD" : "Database ERD",
      icon: "🗄️",
      badge: isId ? "Model Data" : "Data Model",
      whenToUse: isId
        ? "Desain skema SQL relasional, kardinalitas tabel (1-to-many, many-to-many), pemetaan foreign key."
        : "Relational SQL schemas, entity relationships, primary/foreign key mapping.",
      notations: "entity, *pk, fk, [unique], ||--o{, ||--||, }|--||",
      codeSample: "entity Users { *id: int [pk] }\nUsers ||--o{ Orders",
      sampleKey: "erd",
    },
    {
      type: isId ? "State Machine" : "State Machine",
      icon: "🔁",
      badge: isId ? "Perilaku" : "Behavioral",
      whenToUse: isId
        ? "Siklus hidup pesanan, status koneksi websocket, state machine UI, dan transisi tahapan verifikasi."
        : "Order lifecycles, connection handshakes, UI state machines, and status flags.",
      notations: "[initial], [final], state, [*] --> State, State --> Next : event",
      codeSample: "[*] --> Draft\nDraft --> Published : publishEvent",
      sampleKey: "state",
    },
    {
      type: "Flowchart",
      icon: "📊",
      badge: isId ? "Proses Alir" : "Process",
      whenToUse: isId
        ? "Langkah-langkah algoritma komputasi, alur persetujuan sistem, dan percabangan logika if-else."
        : "Step-by-step algorithms, business approval processes, and logic branching.",
      notations: "start, process, decision, end, sub-routine",
      codeSample: 'decision "Is Admin?"\nprocess "Grant Full Access"',
      sampleKey: "flowchart",
    },
    {
      type: isId ? "Activity Diagram" : "Activity Diagram",
      icon: "⚡",
      badge: isId ? "Alur Kerja" : "Workflow",
      whenToUse: isId
        ? "Alur kerja operasional, proses paralel bercabang (fork & join), dan aktivitas pengguna lintas peran."
        : "Business workflows, parallel pipeline execution, and activity lifecycle sequences.",
      notations: "[start], action, decision, [end]",
      codeSample: '[start]\naction "Receive Order"\ndecision "In Stock?"\n[end]',
      sampleKey: "activity",
    },
    {
      type: isId ? "Use Case Diagram" : "Use Case Diagram",
      icon: "👤",
      badge: isId ? "Kebutuhan Sistem" : "Requirement",
      whenToUse: isId
        ? "Analisis kebutuhan sistem, batasan hak akses aktor pengguna, dan ruang lingkup fungsional aplikasi skripsi."
        : "Stakeholder requirements, actor boundaries, and feature scope visualization.",
      notations: "actor, (usecase), system boundaries, associations",
      codeSample: 'actor Admin\nAdmin --> (Manage Users)',
      sampleKey: "usecase",
    },
  ];
}

export const DIAGRAM_TYPES_DETAILS: DiagramTypeDetail[] = getDiagramTypesDetails("id");

export interface CuratedTemplate {
  title: string;
  type: string;
  icon: string;
  desc: string;
  sampleKey: string;
}

export function getCuratedTemplates(locale: Locale = "id"): CuratedTemplate[] {
  const isId = locale === "id";
  return [
    {
      title: isId
        ? "E-Commerce Checkout & Inventory"
        : "E-Commerce Checkout & Inventory",
      type: "Sequence Diagram",
      icon: "🛒",
      desc: isId
        ? "Alur lengkap transaksi Keranjang Belanja, otorisasi Payment Gateway, hingga pengurangan stok gudang."
        : "Complete flow showing Cart checkout, Payment Gateway authorization, and Warehouse stock decrement.",
      sampleKey: "sequence",
    },
    {
      title: isId
        ? "Clean Architecture Domain Entities"
        : "Clean Architecture Domain Entities",
      type: "Class Diagram",
      icon: "🏛️",
      desc: isId
        ? "Model Domain-Driven Design (DDD) dengan Entitas, Value Object, Aggregate, dan antarmuka Repository."
        : "Domain-Driven Design (DDD) model with Entities, Value Objects, Aggregates, and Repository interfaces.",
      sampleKey: "class",
    },
    {
      title: isId
        ? "SaaS Multi-Tenant Database Schema"
        : "SaaS Multi-Tenant Database Schema",
      type: "Database ERD",
      icon: "🗄️",
      desc: isId
        ? "Database relasional lengkap dengan tabel Tenant, User, Role, Subscription, dan Invoice Penagihan."
        : "Relational database with Tenants, Users, Roles, Subscriptions, and Billing Invoice tables.",
      sampleKey: "erd",
    },
    {
      title: isId
        ? "Order Fulfillment Lifecycle"
        : "Order Fulfillment Lifecycle",
      type: "State Machine",
      icon: "📦",
      desc: isId
        ? "Transisi status pembayaran, pengemasan paket, pengiriman kurir, konfirmasi penerimaan, dan refund."
        : "Full payment, packaging, shipping, delivery, refund, and cancellation state transitions.",
      sampleKey: "state",
    },
  ];
}

export const CURATED_TEMPLATES: CuratedTemplate[] = getCuratedTemplates("id");
