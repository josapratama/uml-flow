import { describe, it, expect } from "bun:test";
import type { Diagram } from "@uml-editor/shared";
import { generatePythonPydantic, generatePythonSQLAlchemy } from "./python";
import { generateCSharp } from "./csharp";
import { generateGraphQL } from "./graphql";
import { generateGolang } from "./golang";
import { calculateDiagramMetrics, exportMetricsMarkdown } from "../diagram-metrics";
import { isTypeScriptCode, parseTypeScriptToDSL } from "../typescript-importer";
import { initSimulation, stepSimulation } from "../flow-simulator";

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
