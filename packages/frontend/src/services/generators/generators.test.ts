import { describe, it, expect } from "bun:test";
import type { Diagram } from "@uml-editor/shared";
import { generatePythonPydantic, generatePythonSQLAlchemy } from "./python";
import { generateCSharp } from "./csharp";
import { generateGraphQL } from "./graphql";
import { generateGolang } from "./golang";
import { generateRust } from "./rust";
import { generateOpenAPI } from "./openapi";
import { generatePrisma } from "./prisma";
import { isPrismaCode, parsePrismaToDSL } from "../prisma-importer";
import { isJSONPayload, parseJSONToDSL } from "../json-importer";
import { generateMockData } from "../mock-generator";
import { generateTestCases, exportTestCasesMarkdown } from "../test-case-generator";
import { calculateDiagramMetrics, exportMetricsMarkdown } from "../diagram-metrics";
import { isTypeScriptCode, parseTypeScriptToDSL } from "../typescript-importer";
import { initSimulation, stepSimulation } from "../flow-simulator";
import { getAcademicMetadata, saveAcademicMetadata, formatAcademicWatermark } from "../academic-metadata";
import { repairDiagram } from "../diagram-repair";
import { generateThesisAppendixBundle } from "../thesis-bundle";
import { analyzeDependencies } from "../dependency-analyzer";
import { exportWorkspaceBackup, restoreWorkspaceBackup } from "../workspace-backup";
import { generateTikZ, escapeLaTeX } from "./tikz";
import { exportToPlantUML } from "../plantuml-exporter";
import { ENTERPRISE_ARCHITECTURE_TEMPLATES } from "../templates/presets/enterpriseArchitectureTemplates";

const sampleClassDiagram: Diagram = {
  id: "diag-1",
  name: "UserAuth",
  type: "class",
  nodes: [
    {
      id: "c1",
      name: "User",
      type: "class",
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      attributes: [
        { name: "id", type: "int", visibility: "public" },
        { name: "email", type: "string", visibility: "public" },
        { name: "isActive", type: "bool", visibility: "public" },
      ],
      methods: [
        { name: "login", returnType: "bool", parameters: [{ name: "password", type: "string" }], visibility: "public" },
      ],
    },
    {
      id: "c2",
      name: "Role",
      type: "enum",
      x: 200,
      y: 0,
      width: 80,
      height: 80,
      attributes: [
        { name: "ADMIN", type: "string", visibility: "public" },
        { name: "USER", type: "string", visibility: "public" },
      ],
      methods: [],
    },
  ],
  edges: [],
};

describe("Python Generator", () => {
  it("generates Pydantic v2 schemas with ConfigDict and Enums", () => {
    const code = generatePythonPydantic(sampleClassDiagram);
    expect(code).toContain("from pydantic import BaseModel, Field, ConfigDict");
    expect(code).toContain("class Role(str, Enum):");
    expect(code).toContain("class User(BaseModel):");
    expect(code).toContain("id: int");
    expect(code).toContain("email: str");
    expect(code).toContain("isActive: bool");
    expect(code).toContain("model_config = ConfigDict(from_attributes=True)");
  });

  it("generates SQLAlchemy 2.0 ORM models with Mapped and mapped_column", () => {
    const code = generatePythonSQLAlchemy(sampleClassDiagram);
    expect(code).toContain("from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column");
    expect(code).toContain("class User(Base):");
    expect(code).toContain('__tablename__ = "user"');
    expect(code).toContain("id: Mapped[int] = mapped_column(Integer, primary_key=True)");
    expect(code).toContain("email: Mapped[str] = mapped_column(String(255))");
  });
});

describe("C# Generator", () => {
  it("generates C# 12 / .NET 8 POCO class with auto-properties", () => {
    const code = generateCSharp(sampleClassDiagram);
    expect(code).toContain("namespace App.Domain.Entities");
    expect(code).toContain("public class User");
    expect(code).toContain("public int Id { get; set; } = 0;");
    expect(code).toContain("public string Email { get; set; } = string.Empty;");
    expect(code).toContain("public virtual bool Login(string password)");
  });
});

describe("GraphQL Generator", () => {
  it("generates GraphQL SDL types, inputs, enums and root query", () => {
    const code = generateGraphQL(sampleClassDiagram);
    expect(code).toContain("enum Role {");
    expect(code).toContain("  ADMIN");
    expect(code).toContain("  USER");
    expect(code).toContain("type User {");
    expect(code).toContain("  id: Int!");
    expect(code).toContain("  email: String!");
    expect(code).toContain("  isActive: Boolean!");
    expect(code).toContain("input CreateUserInput {");
    expect(code).toContain("type Query {");
    expect(code).toContain("  getUser(id: ID!): User");
    expect(code).toContain("type Mutation {");
    expect(code).toContain("  createUser(input: CreateUserInput!): User!");
  });
});

describe("Golang Generator", () => {
  it("generates Go structs with json/db tags and pointer receiver methods", () => {
    const code = generateGolang(sampleClassDiagram);
    expect(code).toContain("package models");
    expect(code).toContain("type Role string");
    expect(code).toContain('RoleADMIN Role = "ADMIN"');
    expect(code).toContain("type User struct {");
    expect(code).toContain('`json:"id" db:"id"`');
    expect(code).toContain('`json:"email" db:"email"`');
    expect(code).toContain("func (u *User) Login(password string) bool");
  });
});

describe("TypeScript Reverse Importer", () => {
  it("detects and parses TypeScript interfaces, enums and inheritance into UML Flow DSL", () => {
    const tsCode = `
      export interface Person {
        id: number;
        name: string;
      }

      export enum Gender {
        MALE = "MALE",
        FEMALE = "FEMALE"
      }

      export interface Employee extends Person {
        salary: number;
        department?: string;
        calculateTax(): number;
      }
    `;

    expect(isTypeScriptCode(tsCode)).toBe(true);
    const dsl = parseTypeScriptToDSL(tsCode);
    expect(dsl).toContain('@diagram(type: "class")');
    expect(dsl).toContain("interface Person {");
    expect(dsl).toContain("+id: number");
    expect(dsl).toContain("+name: string");
    expect(dsl).toContain("enum Gender {");
    expect(dsl).toContain("interface Employee {");
    expect(dsl).toContain("+salary: number");
    expect(dsl).toContain("+department?: string");
    expect(dsl).toContain("+calculateTax(): number");
    expect(dsl).toContain("Person <|-- Employee : extends");
  });
});

describe("Flow Simulator Engine", () => {
  const flowchartDiagram: Diagram = {
    id: "fc-1",
    name: "PaymentFlow",
    type: "flowchart",
    nodes: [
      { id: "s1", name: "Start", type: "start", x: 0, y: 0, width: 60, height: 40 },
      { id: "d1", name: "Has Balance?", type: "decision", x: 0, y: 80, width: 100, height: 60 },
      { id: "p1", name: "Deduct Balance", type: "process", x: -80, y: 160, width: 100, height: 50 },
      { id: "p2", name: "Show Topup Error", type: "process", x: 80, y: 160, width: 100, height: 50 },
      { id: "e1", name: "End", type: "end", x: 0, y: 240, width: 60, height: 40 },
    ],
    edges: [
      { id: "e1", source: "s1", target: "d1", label: "Mulai" },
      { id: "e2", source: "d1", target: "p1", label: "Ya" },
      { id: "e3", source: "d1", target: "p2", label: "Tidak" },
      { id: "e4", source: "p1", target: "e1" },
      { id: "e5", source: "p2", target: "e1" },
    ],
  };

  it("initializes at the start node and transitions through steps", () => {
    const s0 = initSimulation(flowchartDiagram);
    expect(s0.currentNodeId).toBe("s1");
    expect(s0.stepCount).toBe(1);
    expect(s0.availableTransitions.length).toBe(1);
    expect(s0.isCompleted).toBe(false);

    // Step to d1
    const s1 = stepSimulation(flowchartDiagram, s0, s0.availableTransitions[0]);
    expect(s1.currentNodeId).toBe("d1");
    expect(s1.stepCount).toBe(2);
    expect(s1.availableTransitions.length).toBe(2);
    expect(s1.availableTransitions.some(t => t.label === "Ya")).toBe(true);

    // Pick "Ya" branch to p1
    const yaBranch = s1.availableTransitions.find(t => t.label === "Ya")!;
    const s2 = stepSimulation(flowchartDiagram, s1, yaBranch);
    expect(s2.currentNodeId).toBe("p1");
    expect(s2.stepCount).toBe(3);

    // Step to e1 (End)
    const s3 = stepSimulation(flowchartDiagram, s2, s2.availableTransitions[0]);
    expect(s3.currentNodeId).toBe("e1");
    expect(s3.isCompleted).toBe(true);
    expect(s3.traceLog.length).toBe(4);
  });
});

describe("Diagram Metrics & Cyclomatic Complexity", () => {
  const flowchartDiagram: Diagram = {
    id: "fc-1",
    name: "PaymentFlow",
    type: "flowchart",
    nodes: [
      { id: "s1", name: "Start", type: "start", x: 0, y: 0, width: 60, height: 40 },
      { id: "d1", name: "Has Balance?", type: "decision", x: 0, y: 80, width: 100, height: 60 },
      { id: "p1", name: "Deduct Balance", type: "process", x: -80, y: 160, width: 100, height: 50 },
      { id: "p2", name: "Show Topup Error", type: "process", x: 80, y: 160, width: 100, height: 50 },
      { id: "e1", name: "End", type: "end", x: 0, y: 240, width: 60, height: 40 },
    ],
    edges: [
      { id: "e1", source: "s1", target: "d1" },
      { id: "e2", source: "d1", target: "p1" },
      { id: "e3", source: "d1", target: "p2" },
      { id: "e4", source: "p1", target: "e1" },
      { id: "e5", source: "p2", target: "e1" },
    ],
  };

  it("calculates McCabe cyclomatic complexity V(G) and basis paths correctly", () => {
    const metrics = calculateDiagramMetrics(flowchartDiagram);
    expect(metrics.cyclomaticComplexity).toBe(2);
    expect(metrics.basisPaths).toBe(2);
    expect(metrics.predicateCount).toBe(1);
    expect(metrics.riskLevel).toBe("Low");
    expect(metrics.unreachableNodes.length).toBe(0);
    expect(metrics.deadEndNodes.length).toBe(0);
  });

  it("generates markdown report ready for thesis / documentation", () => {
    const metrics = calculateDiagramMetrics(flowchartDiagram);
    const md = exportMetricsMarkdown(metrics);
    expect(md).toContain("# 📊 Diagram Metrics & Complexity Report");
    expect(md).toContain("**Diagram:** PaymentFlow");
    expect(md).toContain("McCabe Cyclomatic Complexity");
    expect(md).toContain("Basis Execution Paths");
  });
});

describe("Enterprise Architecture Templates & Sound FX", () => {
  it("loads enterprise architecture templates with GoF Observer and Clean Architecture", async () => {
    const { ENTERPRISE_ARCHITECTURE_TEMPLATES } = await import("../templates/presets/enterpriseArchitectureTemplates");
    expect(ENTERPRISE_ARCHITECTURE_TEMPLATES.length).toBeGreaterThanOrEqual(3);
    const observer = ENTERPRISE_ARCHITECTURE_TEMPLATES.find(t => t.id === "tmpl_gof_observer");
    expect(observer).toBeDefined();
    expect(observer?.dsl).toContain("Subject");
    expect(observer?.dsl).toContain("Observer");

    const cleanArch = ENTERPRISE_ARCHITECTURE_TEMPLATES.find(t => t.id === "tmpl_clean_architecture");
    expect(cleanArch).toBeDefined();
    expect(cleanArch?.diagram.nodes.length).toBeGreaterThanOrEqual(4);
  });

  it("handles sound FX configuration state correctly", async () => {
    const { isSoundEnabled, setSoundEnabled } = await import("../sound-fx");
    setSoundEnabled(false);
    expect(isSoundEnabled()).toBe(false);
    setSoundEnabled(true);
    expect(isSoundEnabled()).toBe(true);
  });
});

describe("Rust Generator", () => {
  it("generates idiomatic Rust structs, serde derives, enums, and constructors", () => {
    const code = generateRust(sampleClassDiagram);
    expect(code).toContain("use serde::{Serialize, Deserialize};");
    expect(code).toContain("#[derive(Debug, Clone, Serialize, Deserialize)]");
    expect(code).toContain("pub struct User {");
    expect(code).toContain("pub id: i32,");
    expect(code).toContain("pub email: String,");
    expect(code).toContain("pub is_active: bool,");
    expect(code).toContain("pub fn new() -> Self");
    expect(code).toContain("pub fn login(&self, password: String) -> bool");
    expect(code).toContain("pub enum Role {");
    expect(code).toContain("ADMIN,");
    expect(code).toContain("USER,");
  });
});

describe("Sequence Diagram Simulation & Academic Metadata", () => {
  const sequenceDiagram: Diagram = {
    id: "seq-1",
    name: "UserLoginSequence",
    type: "sequence",
    nodes: [],
    edges: [],
    participants: [
      { id: "p1", name: "Client", type: "actor" },
      { id: "p2", name: "AuthServer", type: "service" },
      { id: "p3", name: "Database", type: "database" },
    ],
    messages: [
      { id: "m1", from: "p1", to: "p2", label: "POST /login", type: "sync", order: 1 },
      { id: "m2", from: "p2", to: "p3", label: "findUserByEmail(email)", type: "sync", order: 2 },
      { id: "m3", from: "p3", to: "p2", label: "UserRecord", type: "return", order: 3 },
      { id: "m4", from: "p2", to: "p1", label: "200 OK + JWT", type: "return", order: 4 },
    ],
  };

  it("initializes and steps through sequence diagram messages chronologically", () => {
    const state = initSimulation(sequenceDiagram);
    expect(state.currentNodeId).toBe("p1");
    expect(state.stepCount).toBe(1);
    expect(state.traceLog.length).toBe(1);
    expect(state.availableTransitions.length).toBe(1);
    expect(state.availableTransitions[0].label).toContain("POST /login");

    // Step 2: findUserByEmail -> Database (p3)
    const step2 = stepSimulation(sequenceDiagram, state, state.availableTransitions[0]);
    expect(step2.currentNodeId).toBe("p2");
    expect(step2.stepCount).toBe(2);
    expect(step2.availableTransitions[0].label).toContain("findUserByEmail");

    // Step 3: UserRecord -> AuthServer (p2)
    const step3 = stepSimulation(sequenceDiagram, step2, step2.availableTransitions[0]);
    expect(step3.currentNodeId).toBe("p3");
    expect(step3.stepCount).toBe(3);

    // Step 4: 200 OK -> Client (p1)
    const step4 = stepSimulation(sequenceDiagram, step3, step3.availableTransitions[0]);
    expect(step4.currentNodeId).toBe("p2");

    // Step 5: Complete
    const step5 = stepSimulation(sequenceDiagram, step4, step4.availableTransitions[0]);
    expect(step5.currentNodeId).toBe("p1");
    expect(step5.isCompleted).toBe(true);
  });

  it("manages academic metadata and formats watermark string correctly", () => {
    const meta = getAcademicMetadata();
    expect(meta).toBeDefined();

    saveAcademicMetadata({
      authorName: "Ahmad Dahlan",
      studentId: "2024001928",
      institution: "Universitas Indonesia",
      programStudy: "Teknik Informatika",
      supervisorName: "Dr. Budi Santoso",
      documentChapter: "BAB IV",
      enabled: true,
    });

    const updated = getAcademicMetadata();
    expect(updated.authorName).toBe("Ahmad Dahlan");
    expect(updated.studentId).toBe("2024001928");

    const watermark = formatAcademicWatermark();
    expect(watermark).toContain("BAB IV");
    expect(watermark).toContain("Ahmad Dahlan");
    expect(watermark).toContain("2024001928");
    expect(watermark).toContain("Teknik Informatika");
  });
});

describe("OpenAPI 3.1 & Swagger Generator", () => {
  it("generates OpenAPI 3.1 YAML specification with schemas and CRUD routes", () => {
    const yaml = generateOpenAPI(sampleClassDiagram, "yaml");
    expect(yaml).toContain("openapi: 3.1.0");
    expect(yaml).toContain("User:");
    expect(yaml).toContain("type: object");
    expect(yaml).toContain("email:");
    expect(yaml).toContain("/api/v1/users:");
    expect(yaml).toContain("listUsers");
    expect(yaml).toContain("createUser");
    expect(yaml).toContain("/api/v1/users/{id}:");
  });

  it("generates OpenAPI 3.1 JSON specification with valid JSON structure", () => {
    const jsonStr = generateOpenAPI(sampleClassDiagram, "json");
    const parsed = JSON.parse(jsonStr);
    expect(parsed.openapi).toBe("3.1.0");
    expect(parsed.info.title).toBe("UserAuth");
    expect(parsed.components.schemas.User).toBeDefined();
    expect(parsed.paths["/api/v1/users"]).toBeDefined();
    expect(parsed.paths["/api/v1/users/{id}"]).toBeDefined();
  });
});

describe("Diagram Health Doctor & Auto-Repair", () => {
  it("automatically adds primary key to ERD entities missing PK and cleans broken edges", () => {
    const brokenErd: Diagram = {
      id: "erd-broken",
      name: "Ecommerce",
      type: "erd",
      nodes: [
        {
          id: "t1",
          name: "orders",
          type: "entity",
          position: { x: 0, y: 0 },
          size: { width: 140, height: 80 },
          attributes: [
            { name: "total_amount", type: "float", isPrimaryKey: false, isForeignKey: false, isNullable: false, isUnique: false },
          ],
        } as any,
      ],
      edges: [
        { id: "e_broken", source: "t1", target: "non_existent_node", type: "one-to-many" },
      ],
    };

    const result = repairDiagram(brokenErd);
    expect(result.hasChanges).toBe(true);
    expect(result.fixLogs.length).toBeGreaterThan(0);
    // Broken edge pruned
    expect(result.repairedDiagram.edges.length).toBe(0);
    // Primary key injected
    const orderNode = result.repairedDiagram.nodes[0] as any;
    expect(orderNode.attributes[0].name).toBe("id");
    expect(orderNode.attributes[0].isPrimaryKey).toBe(true);
  });

  it("automatically creates End node and links dangling flowchart leaf processes", () => {
    const danglingFlowchart: Diagram = {
      id: "fc-dangling",
      name: "OrderProcess",
      type: "flowchart",
      nodes: [
        { id: "s1", name: "Mulai", type: "start", position: { x: 0, y: 0 }, size: { width: 80, height: 40 } },
        { id: "p1", name: "Proses Pembayaran", type: "process", position: { x: 0, y: 100 }, size: { width: 120, height: 60 } },
      ],
      edges: [
        { id: "e1", source: "s1", target: "p1", type: "flow" },
      ],
    };

    const result = repairDiagram(danglingFlowchart);
    expect(result.hasChanges).toBe(true);
    // New End node created
    const hasEnd = result.repairedDiagram.nodes.some(n => n.type === "end");
    expect(hasEnd).toBe(true);
    // Process p1 now connects to the end node
    expect(result.repairedDiagram.edges.length).toBe(2);
  });
});

describe("Thesis Appendix Bundle Packager", () => {
  it("packages academic metadata, narrative, metrics, and models into thesis markdown", () => {
    const bundle = generateThesisAppendixBundle(sampleClassDiagram, {
      includeSql: true,
      includeBackendCode: true,
      backendLanguage: "rust",
    });

    expect(bundle).toContain("# LAMPIRAN DOKUMEN ARSITEKTUR & DESAIN SISTEM");
    expect(bundle).toContain("Spesifikasi Diagram");
    expect(bundle).toContain("Narasi & Penjelasan Komponen Alur");
    expect(bundle).toContain("Analisis Kompleksitas & Audit Kualitas Perangkat Lunak");
    expect(bundle).toContain("Cyclomatic Complexity");
    expect(bundle).toContain("Implementasi Model Domain Backend (Rust & Serde)");
    expect(bundle).toContain("pub struct User");
  });
});

describe("Prisma Schema Generator & Reverse Importer", () => {
  it("generates Prisma schema with datasource, models, enums and attributes", () => {
    const prisma = generatePrisma(sampleClassDiagram);
    expect(prisma).toContain('datasource db {');
    expect(prisma).toContain('provider = "postgresql"');
    expect(prisma).toContain("model User {");
    expect(prisma).toContain("id               Int");
    expect(prisma).toContain("@id");
    expect(prisma).toContain("email            String");
    expect(prisma).toContain("isActive         Boolean");
    expect(prisma).toContain("enum Role {");
    expect(prisma).toContain("ADMIN");
    expect(prisma).toContain("USER");
  });

  it("detects and parses Prisma schema definitions into UML Flow ERD DSL", () => {
    const prismaInput = `
      model Customer {
        id        Int      @id @default(autoincrement())
        email     String   @unique
        orders    Order[]
      }
      model Order {
        id         Int      @id @default(autoincrement())
        amount     Float
        customerId Int
        customer   Customer @relation(fields: [customerId], references: [id])
      }
    `;

    expect(isPrismaCode(prismaInput)).toBe(true);
    const dsl = parsePrismaToDSL(prismaInput);
    expect(dsl).toContain("@diagram erd");
    expect(dsl).toContain("entity Customer {");
    expect(dsl).toContain("id: int [PK]");
    expect(dsl).toContain("email: string [UNIQUE]");
    expect(dsl).toContain("entity Order {");
    expect(dsl).toContain("amount: float");
    expect(dsl).toContain('Customer ||--o{ Order : "has"');
  });
});

describe("JSON Payload to Diagram Importer", () => {
  it("detects valid JSON payload and parses into ERD DSL with inferred types", () => {
    const jsonInput = `[
      {
        "id": 1,
        "productName": "Keyboard Mechanical",
        "price": 850000.50,
        "isAvailable": true,
        "createdAt": "2026-11-14T08:00:00Z",
        "vendor": {
          "id": 10,
          "vendorName": "Keychron"
        }
      }
    ]`;

    expect(isJSONPayload(jsonInput)).toBe(true);
    const dsl = parseJSONToDSL(jsonInput, "erd");
    expect(dsl).toContain("@diagram erd");
    expect(dsl).toContain("entity Record {");
    expect(dsl).toContain("id: int [PK]");
    expect(dsl).toContain("productName: string");
    expect(dsl).toContain("price: float");
    expect(dsl).toContain("isAvailable: bool");
    expect(dsl).toContain("createdAt: datetime");
    expect(dsl).toContain("entity Vendor {");
    expect(dsl).toContain('Record ||--o{ Vendor : "has"');
  });
});

describe("Mock Data & Database Seed Generator", () => {
  it("generates realistic mock JSON array and SQL seed statements", () => {
    const mockJson = generateMockData(sampleClassDiagram, { count: 3, format: "json" });
    const parsed = JSON.parse(mockJson);
    expect(parsed.User).toBeDefined();
    expect(parsed.User.length).toBe(3);
    expect(parsed.User[0].id).toBe(1);
    expect(parsed.User[0].email).toContain("@example.com");

    const mockSql = generateMockData(sampleClassDiagram, { count: 3, format: "sql" });
    expect(mockSql).toContain("INSERT INTO user");
    expect(mockSql).toContain("VALUES");
  });
});

describe("Automated Test Case & Scenario Matrix Generator", () => {
  it("generates White-Box basis path and decision branch test cases from flowchart", () => {
    const flowchartDiagram: Diagram = {
      id: "fc-test",
      name: "AuthenticationFlow",
      type: "flowchart",
      nodes: [
        { id: "s1", name: "Mulai", type: "start", position: { x: 0, y: 0 }, size: { width: 80, height: 40 } },
        { id: "d1", name: "Password Valid?", type: "decision", position: { x: 0, y: 80 }, size: { width: 100, height: 60 } },
        { id: "p1", name: "Dashboard", type: "process", position: { x: -80, y: 160 }, size: { width: 100, height: 50 } },
        { id: "p2", name: "Error Msg", type: "process", position: { x: 80, y: 160 }, size: { width: 100, height: 50 } },
        { id: "e1", name: "Selesai", type: "end", position: { x: 0, y: 240 }, size: { width: 80, height: 40 } },
      ],
      edges: [
        { id: "e1", source: "s1", target: "d1" },
        { id: "e2", source: "d1", target: "p1", label: { text: "Ya" } },
        { id: "e3", source: "d1", target: "p2", label: { text: "Tidak" } },
      ],
    };

    const cases = generateTestCases(flowchartDiagram);
    expect(cases.length).toBeGreaterThanOrEqual(2);
    expect(cases.some(c => c.name.includes("Password Valid?"))).toBe(true);

    const md = exportTestCasesMarkdown(flowchartDiagram, cases);
    expect(md).toContain("# MATRIKS PENGUJIAN PERANGKAT LUNAK");
    expect(md).toContain("AuthenticationFlow");
    expect(md).toContain("TC-001");
  });
});

describe("Dependency Structure Matrix (DSM) & Circular Cycle Detector", () => {
  it("builds DSM adjacency matrix and detects circular dependency loop A -> B -> C -> A", () => {
    const cyclicDiagram: Diagram = {
      id: "diag-cycle",
      name: "CircularArchitecture",
      type: "class",
      nodes: [
        { id: "A", name: "ServiceA", type: "class", position: { x: 0, y: 0 } },
        { id: "B", name: "ServiceB", type: "class", position: { x: 100, y: 0 } },
        { id: "C", name: "ServiceC", type: "class", position: { x: 200, y: 0 } },
        { id: "D", name: "HelperD", type: "class", position: { x: 300, y: 0 } },
      ],
      edges: [
        { id: "e1", source: "A", target: "B" },
        { id: "e2", source: "B", target: "C" },
        { id: "e3", source: "C", target: "A" }, // Creates cycle A -> B -> C -> A
        { id: "e4", source: "A", target: "D" },
      ],
    };

    const analysis = analyzeDependencies(cyclicDiagram);
    expect(analysis.matrix.length).toBe(4);
    expect(analysis.cycles.length).toBeGreaterThanOrEqual(1);

    // Verify circular path includes ServiceA, ServiceB, ServiceC
    const cycleNames = analysis.cycles[0].nodeNames;
    expect(cycleNames).toContain("ServiceA");
    expect(cycleNames).toContain("ServiceB");
    expect(cycleNames).toContain("ServiceC");

    // Verify instability metrics calculation
    const statA = analysis.couplings.find((s) => s.nodeName === "ServiceA");
    expect(statA).toBeDefined();
    expect(statA!.efferentCoupling).toBe(2); // depends on B and D
    expect(statA!.afferentCoupling).toBe(1); // C depends on A
    expect(statA!.instability).toBeCloseTo(2 / 3, 2);
  });

  it("handles acyclic diagrams with zero cycles", () => {
    const acyclicDiagram: Diagram = {
      id: "diag-clean",
      name: "CleanArch",
      type: "class",
      nodes: [
        { id: "ctrl", name: "UserController", type: "class" },
        { id: "srv", name: "UserService", type: "class" },
        { id: "repo", name: "UserRepository", type: "class" },
      ],
      edges: [
        { id: "e1", source: "ctrl", target: "srv" },
        { id: "e2", source: "srv", target: "repo" },
      ],
    };

    const analysis = analyzeDependencies(acyclicDiagram);
    expect(analysis.cycles.length).toBe(0);
    expect(analysis.recommendation.length).toBeGreaterThan(0);
  });
});

describe("Full Workspace Backup & Restore Suite", () => {
  it("exports valid workspace backup snapshot JSON", () => {
    const json = exportWorkspaceBackup();
    const snapshot = JSON.parse(json);

    expect(snapshot.version).toBe("1.0");
    expect(snapshot.appName).toBe("uml-flow");
    expect(Array.isArray(snapshot.diagrams)).toBe(true);
    expect(typeof snapshot.exportedAt).toBe("string");
  });

  it("restores workspace snapshot safely in merge and replace modes", () => {
    const mockSnapshot = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      appName: "uml-flow",
      diagrams: [
        {
          id: "test-snap-1",
          name: "Snapshot Diagram 1",
          type: "class",
          code: "class Test {}",
          updatedAt: Date.now(),
        },
      ],
      openTabIds: ["test-snap-1"],
      templates: [],
      academicMetadata: { enabled: false },
    };

    // Test merge mode
    const mergeResult = restoreWorkspaceBackup(JSON.stringify(mockSnapshot), "merge");
    expect(mergeResult.restoredCount).toBeGreaterThanOrEqual(1);

    // Test replace mode
    const replaceResult = restoreWorkspaceBackup(JSON.stringify(mockSnapshot), "replace");
    expect(replaceResult.restoredCount).toBe(1);
  });
});

describe("LaTeX TikZ Code Exporter", () => {
  it("escapes LaTeX special characters properly", () => {
    expect(escapeLaTeX("user_id & count % $ # { }")).toBe(
      "user\\_id \\& count \\% \\$ \\# \\{ \\}"
    );
  });

  it("generates native LaTeX TikZ vector markup for class diagram", () => {
    const tikz = generateTikZ(sampleClassDiagram);
    expect(tikz).toContain("\\begin{tikzpicture}");
    expect(tikz).toContain("\\end{tikzpicture}");
    expect(tikz).toContain("\\node[umlbox]");
    expect(tikz).toContain("\\textbf{User}");
    expect(tikz).toContain("email");
    expect(tikz).toContain("login()");
  });

  it("generates TikZ nodes and edges for flowchart", () => {
    const flowchartDiagram: Diagram = {
      id: "fc-tikz",
      name: "SimpleFlow",
      type: "flowchart",
      nodes: [
        { id: "start", name: "Start", type: "start", position: { x: 100, y: 100 } },
        { id: "proc", name: "Compute", type: "process", position: { x: 100, y: 200 } },
      ],
      edges: [
        { id: "e1", source: "start", target: "proc", label: { text: "proceed" } },
      ],
    };

    const tikz = generateTikZ(flowchartDiagram);
    expect(tikz).toContain("flowstart");
    expect(tikz).toContain("flowproc");
    expect(tikz).toContain("\\draw[baseedge]");
    expect(tikz).toContain("proceed");
  });

  it("exports class, sequence, and ERD diagrams to valid PlantUML syntax", () => {
    const puml = exportToPlantUML(sampleClassDiagram);
    expect(puml).toContain("@startuml");
    expect(puml).toContain("@enduml");
    expect(puml).toContain("class \"User\" as c1");
    expect(puml).toContain("+login(password: string): bool");

    const seqDiagram: Diagram = {
      id: "seq-puml",
      name: "SeqTest",
      type: "sequence",
      nodes: [],
      edges: [],
      participants: [
        { id: "p1", name: "Client", position: { x: 50, y: 50 } },
        { id: "p2", name: "Server", position: { x: 250, y: 50 } },
      ],
      messages: [
        { id: "m1", from: "p1", to: "p2", text: "GET /api", type: "sync" },
        { id: "m2", from: "p2", to: "p1", text: "200 OK", type: "return" },
      ],
    };

    const seqPuml = exportToPlantUML(seqDiagram);
    expect(seqPuml).toContain("participant \"Client\" as p1");
    expect(seqPuml).toContain("p1 -> p2 : GET /api");
    expect(seqPuml).toContain("p2 --> p1 : 200 OK");
  });

  it("verifies enterprise C4 architecture model templates are present and well-formed", () => {
    const c4Context = ENTERPRISE_ARCHITECTURE_TEMPLATES.find((t) => t.id === "tmpl_c4_context");
    expect(c4Context).toBeDefined();
    expect(c4Context?.tag).toBe("C4 Model");
    expect(c4Context?.diagram.nodes.length).toBeGreaterThanOrEqual(5);

    const c4Container = ENTERPRISE_ARCHITECTURE_TEMPLATES.find((t) => t.id === "tmpl_c4_container");
    expect(c4Container).toBeDefined();
    expect(c4Container?.tag).toBe("C4 Model");
    expect(c4Container?.diagram.nodes.some((n) => n.name.includes("API Gateway"))).toBe(true);
  });
});
