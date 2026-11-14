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
        { id: "e1", source: "cls_dispatcher", target: "if_subject", type: "realization" as any, label: "implements" },
        { id: "e2", source: "cls_email", target: "if_observer", type: "realization" as any, label: "implements" },
        { id: "e3", source: "cls_audit", target: "if_observer", type: "realization" as any, label: "implements" },
        { id: "e4", source: "cls_dispatcher", target: "if_observer", type: "association" as any, label: "notifies" },
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
        { id: "e1", source: "c_db", target: "if_repo", type: "realization" as any, label: "implements" },
        { id: "e2", source: "c_usecase", target: "if_repo", type: "association" as any, label: "relies on" },
        { id: "e3", source: "c_ctrl", target: "c_usecase", type: "association" as any, label: "calls" },
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
        { id: "e1", source: "c_client", target: "c_gw", label: "HTTPS" },
        { id: "e2", source: "c_gw", target: "c_auth", label: "Validate Token" },
        { id: "e3", source: "c_gw", target: "c_order", label: "gRPC" },
        { id: "e4", source: "c_order", target: "c_kafka", label: "OrderCreatedEvent" },
        { id: "e5", source: "c_kafka", target: "c_pay", label: "Consume Event" },
      ],
    },
  },
];
