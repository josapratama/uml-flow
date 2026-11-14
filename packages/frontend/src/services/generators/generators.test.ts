import { describe, it, expect } from "bun:test";
import type { Diagram } from "@uml-editor/shared";
import { generatePythonPydantic, generatePythonSQLAlchemy } from "./python";
import { generateCSharp } from "./csharp";
import { calculateDiagramMetrics, exportMetricsMarkdown } from "../diagram-metrics";

describe("Python Generator", () => {
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
  const sampleClassDiagram: Diagram = {
    id: "diag-cs",
    name: "BillingSystem",
    type: "class",
    nodes: [
      {
        id: "c1",
        name: "Invoice",
        type: "class",
        x: 0,
        y: 0,
        width: 120,
        height: 120,
        attributes: [
          { name: "id", type: "guid", visibility: "public" },
          { name: "amount", type: "decimal", visibility: "public" },
          { name: "paidAt", type: "datetime?", visibility: "public" },
        ],
        methods: [
          { name: "MarkPaid", returnType: "void", parameters: [], visibility: "public" },
        ],
      },
    ],
    edges: [],
  };

  it("generates C# 12 / .NET 8 POCO class with auto-properties", () => {
    const code = generateCSharp(sampleClassDiagram);
    expect(code).toContain("namespace App.Domain.Entities");
    expect(code).toContain("public class Invoice");
    expect(code).toContain("public Guid Id { get; set; } = Guid.NewGuid();");
    expect(code).toContain("public decimal Amount { get; set; } = 0;");
    expect(code).toContain("public DateTime? PaidAt { get; set; } = null;");
    expect(code).toContain("public virtual void MarkPaid()");
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
    // V(G) = 5 edges - 5 nodes + 2(1) = 2. Decision nodes = 1. Basis paths = 2.
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
