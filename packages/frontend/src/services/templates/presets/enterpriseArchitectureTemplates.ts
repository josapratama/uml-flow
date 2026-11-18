import type { DiagramTemplate } from "./types";

export const ENTERPRISE_ARCHITECTURE_TEMPLATES: DiagramTemplate[] = [
  {
    id: "tmpl_gof_observer",
    name: "GoF Observer Pattern (Publish-Subscribe)",
    description: "Pola desain Gang of Four untuk sistem event-driven decoupled: Subject, Observer interface, dan Concrete Observer.",
    category: "architecture",
    tag: "Design Pattern",
    isBuiltIn: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    dsl: `@diagram(type: "class")

interface Subject {
  +registerObserver(o: Observer): void
  +removeObserver(o: Observer): void
  +notifyObservers(): void
}

interface Observer {
  +update(eventData: string): void
}

class EventDispatcher {
  -observers: List<Observer>
  -state: string
  +registerObserver(o: Observer): void
  +removeObserver(o: Observer): void
  +notifyObservers(): void
  +setState(newState: string): void
}

class EmailNotificationService {
  +update(eventData: string): void
}

class AuditLogService {
  +update(eventData: string): void
}

Subject <|.. EventDispatcher : implements
Observer <|.. EmailNotificationService : implements
Observer <|.. AuditLogService : implements
EventDispatcher --> Observer : notifies`,
    diagram: {
      id: "diag_gof_observer",
      name: "Observer Pattern",
      type: "class",
      metadata: { createdAt: "2026-01-01", updatedAt: "2026-01-01", version: 1 },
      nodes: [
        {
          id: "if_subject",
          name: "Subject",
          type: "interface" as any,
          position: { x: 50, y: 50 },
          size: { width: 220, height: 110 },
          attributes: [],
          methods: [
            { name: "registerObserver", returnType: "void", params: [{ name: "o", type: "Observer" }], visibility: "+" },
            { name: "removeObserver", returnType: "void", params: [{ name: "o", type: "Observer" }], visibility: "+" },
            { name: "notifyObservers", returnType: "void", params: [], visibility: "+" },
          ],
        },
        {
          id: "if_observer",
          name: "Observer",
          type: "interface" as any,
          position: { x: 380, y: 50 },
          size: { width: 220, height: 80 },
          attributes: [],
          methods: [
            { name: "update", returnType: "void", params: [{ name: "eventData", type: "string" }], visibility: "+" },
          ],
        },
        {
          id: "cls_dispatcher",
          name: "EventDispatcher",
          type: "class" as any,
          position: { x: 50, y: 220 },
          size: { width: 220, height: 150 },
          attributes: [
            { name: "observers", type: "List<Observer>", visibility: "-" },
            { name: "state", type: "string", visibility: "-" },
          ],
          methods: [
            { name: "registerObserver", returnType: "void", params: [{ name: "o", type: "Observer" }], visibility: "+" },
            { name: "notifyObservers", returnType: "void", params: [], visibility: "+" },
            { name: "setState", returnType: "void", params: [{ name: "newState", type: "string" }], visibility: "+" },
          ],
        },
        {
          id: "cls_email",
          name: "EmailNotificationService",
          type: "class" as any,
          position: { x: 340, y: 220 },
          size: { width: 210, height: 90 },
          attributes: [],
          methods: [
            { name: "update", returnType: "void", params: [{ name: "eventData", type: "string" }], visibility: "+" },
          ],
        },
        {
          id: "cls_audit",
          name: "AuditLogService",
          type: "class" as any,
          position: { x: 580, y: 220 },
          size: { width: 190, height: 90 },
          attributes: [],
          methods: [
            { name: "update", returnType: "void", params: [{ name: "eventData", type: "string" }], visibility: "+" },
          ],
        },
      ],
      edges: [
        { id: "e1", source: "cls_dispatcher", target: "if_subject", type: "realization" as any, label: { text: "implements" } },
        { id: "e2", source: "cls_email", target: "if_observer", type: "realization" as any, label: { text: "implements" } },
        { id: "e3", source: "cls_audit", target: "if_observer", type: "realization" as any, label: { text: "implements" } },
        { id: "e4", source: "cls_dispatcher", target: "if_observer", type: "association" as any, label: { text: "notifies" } },
      ],
    },
  },
  {
    id: "tmpl_clean_architecture",
    name: "Clean Architecture / Hexagonal Ports & Adapters",
    description: "Struktur arsitektur enterprise decoupling independen database & framework: Domain, UseCase, Ports & Adapters.",
    category: "architecture",
    tag: "Enterprise",
    isBuiltIn: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    dsl: `@diagram(type: "class")

class OrderEntity {
  +id: string
  +totalAmount: decimal
  +calculateTax(): decimal
}

interface OrderRepositoryPort {
  +save(order: OrderEntity): void
  +findById(id: string): OrderEntity
}

class CreateOrderUseCase {
  -repo: OrderRepositoryPort
  +execute(items: List<string>): OrderEntity
}

class OrderHttpController {
  -useCase: CreateOrderUseCase
  +handlePost(req: HttpRequest): HttpResponse
}

class PostgresOrderRepository {
  +save(order: OrderEntity): void
  +findById(id: string): OrderEntity
}

OrderRepositoryPort <|.. PostgresOrderRepository : implements
CreateOrderUseCase --> OrderRepositoryPort : relies on
OrderHttpController --> CreateOrderUseCase : calls`,
    diagram: {
      id: "diag_clean_arch",
      name: "Clean Architecture",
      type: "class",
      metadata: { createdAt: "2026-01-01", updatedAt: "2026-01-01", version: 1 },
      nodes: [
        {
          id: "c_domain",
          name: "OrderEntity",
          type: "class" as any,
          position: { x: 60, y: 60 },
          size: { width: 200, height: 110 },
          attributes: [
            { name: "id", type: "string", visibility: "+" },
            { name: "totalAmount", type: "decimal", visibility: "+" },
          ],
          methods: [
            { name: "calculateTax", returnType: "decimal", params: [], visibility: "+" },
          ],
        },
        {
          id: "if_repo",
          name: "OrderRepositoryPort",
          type: "interface" as any,
          position: { x: 320, y: 60 },
          size: { width: 240, height: 100 },
          attributes: [],
          methods: [
            { name: "save", returnType: "void", params: [{ name: "order", type: "OrderEntity" }], visibility: "+" },
            { name: "findById", returnType: "OrderEntity", params: [{ name: "id", type: "string" }], visibility: "+" },
          ],
        },
        {
          id: "c_usecase",
          name: "CreateOrderUseCase",
          type: "class" as any,
          position: { x: 60, y: 240 },
          size: { width: 220, height: 110 },
          attributes: [
            { name: "repo", type: "OrderRepositoryPort", visibility: "-" },
          ],
          methods: [
            { name: "execute", returnType: "OrderEntity", params: [{ name: "items", type: "List<string>" }], visibility: "+" },
          ],
        },
        {
          id: "c_ctrl",
          name: "OrderHttpController",
          type: "class" as any,
          position: { x: 60, y: 400 },
          size: { width: 220, height: 100 },
          attributes: [
            { name: "useCase", type: "CreateOrderUseCase", visibility: "-" },
          ],
          methods: [
            { name: "handlePost", returnType: "HttpResponse", params: [{ name: "req", type: "HttpRequest" }], visibility: "+" },
          ],
        },
        {
          id: "c_db",
          name: "PostgresOrderRepository",
          type: "class" as any,
          position: { x: 320, y: 240 },
          size: { width: 240, height: 100 },
          attributes: [],
          methods: [
            { name: "save", returnType: "void", params: [{ name: "order", type: "OrderEntity" }], visibility: "+" },
            { name: "findById", returnType: "OrderEntity", params: [{ name: "id", type: "string" }], visibility: "+" },
          ],
        },
      ],
      edges: [
        { id: "e1", source: "c_db", target: "if_repo", type: "realization" as any, label: { text: "implements" } },
        { id: "e2", source: "c_usecase", target: "if_repo", type: "association" as any, label: { text: "relies on" } },
        { id: "e3", source: "c_ctrl", target: "c_usecase", type: "association" as any, label: { text: "calls" } },
      ],
    },
  },
  {
    id: "tmpl_microservices_eventbus",
    name: "Microservices Event-Driven with API Gateway & Kafka",
    description: "Arsitektur cloud microservices decoupled berbasis event asynchronous (Kafka/RabbitMQ) dengan API Gateway terpusat.",
    category: "architecture",
    tag: "Cloud",
    isBuiltIn: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    dsl: `@diagram "Cloud Microservices" component

component "Client Apps\\n(Web, iOS, Android)" as c_client
component "API Gateway\\n(Envoy / Kong)" as c_gw
component "Auth Service\\n(OAuth2 & JWT)" as c_auth
component "Order Service\\n(NestJS Microservice)" as c_order
component "Payment Service\\n(Go Worker)" as c_pay
component "Event Bus\\n(Apache Kafka Cluster)" as c_kafka

c_client -> c_gw : "HTTPS"
c_gw -> c_auth : "Validate Token"
c_gw -> c_order : "gRPC / REST"
c_order -> c_kafka : "OrderCreatedEvent"
c_kafka -> c_pay : "Consume Event"`,
    diagram: {
      id: "diag_micro_event",
      name: "Microservices Event-Driven",
      type: "component",
      metadata: { createdAt: "2026-01-01", updatedAt: "2026-01-01", version: 1 },
      nodes: [
        {
          id: "c_client",
          name: "Client Apps\n(Web, iOS, Android)",
          type: "component" as any,
          position: { x: 50, y: 60 },
          size: { width: 220, height: 75 },
          style: { backgroundColor: "#e0e7ff", borderColor: "#6366f1" },
        },
        {
          id: "c_gw",
          name: "API Gateway\n(Envoy / Kong)",
          type: "component" as any,
          position: { x: 330, y: 60 },
          size: { width: 200, height: 75 },
          style: { backgroundColor: "#fef3c7", borderColor: "#f59e0b" },
        },
        {
          id: "c_auth",
          name: "Auth Service\n(OAuth2 & JWT)",
          type: "component" as any,
          position: { x: 600, y: 60 },
          size: { width: 190, height: 75 },
          style: { backgroundColor: "#ffe4e6", borderColor: "#f43f5e" },
        },
        {
          id: "c_order",
          name: "Order Service\n(NestJS Microservice)",
          type: "component" as any,
          position: { x: 330, y: 200 },
          size: { width: 200, height: 75 },
          style: { backgroundColor: "#d1fae5", borderColor: "#10b981" },
        },
        {
          id: "c_kafka",
          name: "Event Bus\n(Apache Kafka Cluster)",
          type: "component" as any,
          position: { x: 330, y: 340 },
          size: { width: 200, height: 75 },
          style: { backgroundColor: "#f3e8ff", borderColor: "#a855f7" },
        },
        {
          id: "c_pay",
          name: "Payment Service\n(Go Worker)",
          type: "component" as any,
          position: { x: 600, y: 340 },
          size: { width: 190, height: 75 },
          style: { backgroundColor: "#dbeafe", borderColor: "#3b82f6" },
        },
      ],
      edges: [
        { id: "e1", source: "c_client", target: "c_gw", type: "communication" as any, label: { text: "HTTPS" } },
        { id: "e2", source: "c_gw", target: "c_auth", type: "communication" as any, label: { text: "Validate Token" } },
        { id: "e3", source: "c_gw", target: "c_order", type: "communication" as any, label: { text: "gRPC" } },
        { id: "e4", source: "c_order", target: "c_kafka", type: "communication" as any, label: { text: "OrderCreatedEvent" } },
        { id: "e5", source: "c_kafka", target: "c_pay", type: "communication" as any, label: { text: "Consume Event" } },
      ],
    },
  },
  {
    id: "tmpl_c4_context",
    name: "C4 Model - System Context (E-Commerce Platform)",
    description: "Diagram C4 Tingkat 1: Menampilkan sistem inti platform E-Commerce, peran pengguna, dan integrasi sistem perbankan/logistik eksternal.",
    category: "architecture",
    tag: "C4 Model",
    isBuiltIn: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    dsl: `@diagram(type: "component")

component "Pelanggan / Customer\\n[Person]" as c4_cust
component "Admin Backoffice\\n[Person]" as c4_admin
component "E-Commerce Core Platform\\n[Software System]" as c4_core
component "Payment Gateway Banking\\n[External System]" as c4_bank
component "Logistics Partner API\\n[External System]" as c4_courier
component "Notification Service SMS/Email\\n[External System]" as c4_notif

c4_cust -> c4_core : "Cari produk & checkout [HTTPS]"
c4_admin -> c4_core : "Kelola katalog & laporan [HTTPS]"
c4_core -> c4_bank : "Proses pembayaran VA & QRIS [REST]"
c4_core -> c4_courier : "Cek ongkir & buat resi [REST API]"
c4_core -> c4_notif : "Kirim OTP & konfirmasi order [Webhook]"`,
    diagram: {
      id: "diag_c4_context",
      name: "C4 System Context - E-Commerce",
      type: "component",
      metadata: { createdAt: "2026-01-01", updatedAt: "2026-01-01", version: 1 },
      nodes: [
        {
          id: "c4_cust",
          name: "Pelanggan / Customer\n[Person]",
          type: "component" as any,
          position: { x: 50, y: 70 },
          size: { width: 220, height: 80 },
          style: { backgroundColor: "#08427b", borderColor: "#052e56", fontColor: "#ffffff" },
        },
        {
          id: "c4_admin",
          name: "Admin Backoffice\n[Person]",
          type: "component" as any,
          position: { x: 50, y: 220 },
          size: { width: 220, height: 80 },
          style: { backgroundColor: "#08427b", borderColor: "#052e56", fontColor: "#ffffff" },
        },
        {
          id: "c4_core",
          name: "E-Commerce Core Platform\n[Software System]",
          type: "component" as any,
          position: { x: 370, y: 130 },
          size: { width: 250, height: 110 },
          style: { backgroundColor: "#1168bd", borderColor: "#0b4884", fontColor: "#ffffff" },
        },
        {
          id: "c4_bank",
          name: "Payment Gateway Banking\n[External System]",
          type: "component" as any,
          position: { x: 730, y: 40 },
          size: { width: 230, height: 75 },
          style: { backgroundColor: "#999999", borderColor: "#666666", fontColor: "#ffffff" },
        },
        {
          id: "c4_courier",
          name: "Logistics Partner API\n[External System]",
          type: "component" as any,
          position: { x: 730, y: 150 },
          size: { width: 230, height: 75 },
          style: { backgroundColor: "#999999", borderColor: "#666666", fontColor: "#ffffff" },
        },
        {
          id: "c4_notif",
          name: "Notification Service SMS/Email\n[External System]",
          type: "component" as any,
          position: { x: 730, y: 260 },
          size: { width: 230, height: 75 },
          style: { backgroundColor: "#999999", borderColor: "#666666", fontColor: "#ffffff" },
        },
      ],
      edges: [
        { id: "e_c4_1", source: "c4_cust", target: "c4_core", type: "communication" as any, label: { text: "Cari produk & checkout [HTTPS]" } },
        { id: "e_c4_2", source: "c4_admin", target: "c4_core", type: "communication" as any, label: { text: "Kelola katalog & laporan [HTTPS]" } },
        { id: "e_c4_3", source: "c4_core", target: "c4_bank", type: "communication" as any, label: { text: "Proses bayar VA/QRIS [REST]" } },
        { id: "e_c4_4", source: "c4_core", target: "c4_courier", type: "communication" as any, label: { text: "Cek ongkir & resi [REST API]" } },
        { id: "e_c4_5", source: "c4_core", target: "c4_notif", type: "communication" as any, label: { text: "Kirim OTP & notifikasi [Webhook]" } },
      ],
    },
  },
  {
    id: "tmpl_c4_container",
    name: "C4 Model - Container Architecture (Cloud Native)",
    description: "Diagram C4 Tingkat 2: Dekomposisi platform modern menjadi SPA Web, Mobile App, API Gateway, Microservices, Database, dan Cache.",
    category: "architecture",
    tag: "C4 Model",
    isBuiltIn: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    dsl: `@diagram(type: "component")

component "Web App (SPA)\\n[React 19, TypeScript]" as c4_spa
component "Mobile App\\n[Flutter / iOS & Android]" as c4_mobile
component "API Gateway\\n[Kong / Envoy Ingress]" as c4_gateway
component "Auth Service\\n[Go / JWT & OAuth2]" as c4_auth_svc
component "Order Service\\n[Node.js / Express / gRPC]" as c4_order_svc
component "Catalog Service\\n[Python / FastAPI]" as c4_catalog_svc
component "Primary Relational DB\\n[PostgreSQL 16 Multi-AZ]" as c4_pg
component "Distributed Cache\\n[Redis Cluster]" as c4_redis

c4_spa -> c4_gateway : "REST / HTTPS"
c4_mobile -> c4_gateway : "REST / HTTPS"
c4_gateway -> c4_auth_svc : "Validasi token"
c4_gateway -> c4_order_svc : "Route request order"
c4_gateway -> c4_catalog_svc : "Route request katalog"
c4_order_svc -> c4_pg : "Read/Write SQL"
c4_catalog_svc -> c4_redis : "Cache hit / invalidation"`,
    diagram: {
      id: "diag_c4_container",
      name: "C4 Container - Cloud Native",
      type: "component",
      metadata: { createdAt: "2026-01-01", updatedAt: "2026-01-01", version: 1 },
      nodes: [
        {
          id: "c4_spa",
          name: "Web App (SPA)\n[React 19, TypeScript]",
          type: "component" as any,
          position: { x: 50, y: 60 },
          size: { width: 200, height: 75 },
          style: { backgroundColor: "#438dd5", borderColor: "#2e6295", fontColor: "#ffffff" },
        },
        {
          id: "c4_mobile",
          name: "Mobile App\n[Flutter / iOS & Android]",
          type: "component" as any,
          position: { x: 50, y: 180 },
          size: { width: 200, height: 75 },
          style: { backgroundColor: "#438dd5", borderColor: "#2e6295", fontColor: "#ffffff" },
        },
        {
          id: "c4_gateway",
          name: "API Gateway\n[Kong / Envoy Ingress]",
          type: "component" as any,
          position: { x: 310, y: 120 },
          size: { width: 190, height: 75 },
          style: { backgroundColor: "#2b78c5", borderColor: "#1e5388", fontColor: "#ffffff" },
        },
        {
          id: "c4_auth_svc",
          name: "Auth Service\n[Go / JWT OAuth2]",
          type: "component" as any,
          position: { x: 560, y: 40 },
          size: { width: 180, height: 70 },
          style: { backgroundColor: "#438dd5", borderColor: "#2e6295", fontColor: "#ffffff" },
        },
        {
          id: "c4_order_svc",
          name: "Order Service\n[Node.js / gRPC]",
          type: "component" as any,
          position: { x: 560, y: 130 },
          size: { width: 180, height: 70 },
          style: { backgroundColor: "#438dd5", borderColor: "#2e6295", fontColor: "#ffffff" },
        },
        {
          id: "c4_catalog_svc",
          name: "Catalog Service\n[Python / FastAPI]",
          type: "component" as any,
          position: { x: 560, y: 220 },
          size: { width: 180, height: 70 },
          style: { backgroundColor: "#438dd5", borderColor: "#2e6295", fontColor: "#ffffff" },
        },
        {
          id: "c4_pg",
          name: "Primary Database\n[PostgreSQL 16 Multi-AZ]",
          type: "component" as any,
          position: { x: 800, y: 130 },
          size: { width: 200, height: 70 },
          style: { backgroundColor: "#2b78c5", borderColor: "#1e5388", fontColor: "#ffffff" },
        },
        {
          id: "c4_redis",
          name: "Distributed Cache\n[Redis Cluster]",
          type: "component" as any,
          position: { x: 800, y: 220 },
          size: { width: 200, height: 70 },
          style: { backgroundColor: "#2b78c5", borderColor: "#1e5388", fontColor: "#ffffff" },
        },
      ],
      edges: [
        { id: "e_c4c_1", source: "c4_spa", target: "c4_gateway", type: "communication" as any, label: { text: "REST / HTTPS" } },
        { id: "e_c4c_2", source: "c4_mobile", target: "c4_gateway", type: "communication" as any, label: { text: "REST / HTTPS" } },
        { id: "e_c4c_3", source: "c4_gateway", target: "c4_auth_svc", type: "communication" as any, label: { text: "Validasi token" } },
        { id: "e_c4c_4", source: "c4_gateway", target: "c4_order_svc", type: "communication" as any, label: { text: "Order route" } },
        { id: "e_c4c_5", source: "c4_gateway", target: "c4_catalog_svc", type: "communication" as any, label: { text: "Catalog route" } },
        { id: "e_c4c_6", source: "c4_order_svc", target: "c4_pg", type: "communication" as any, label: { text: "SQL CRUD" } },
        { id: "e_c4c_7", source: "c4_catalog_svc", target: "c4_redis", type: "communication" as any, label: { text: "Cache hit / get" } },
      ],
    },
  },
];
