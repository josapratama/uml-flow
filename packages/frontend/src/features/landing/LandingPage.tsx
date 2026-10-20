import React, { useState, useEffect } from "react";
import { SAMPLES } from "../../data/samples";

interface Props {
  onOpenEditor: (code?: string) => void;
  onOpenDocs?: () => void;
}

interface DemoTab {
  id: string;
  label: string;
  icon: string;
  badge: string;
  desc: string;
  dslCode: string;
  sampleKey: string;
}

const DEMO_TABS: DemoTab[] = [
  {
    id: "class",
    label: "Class Diagram",
    icon: "🏗️",
    badge: "OOP Architecture",
    desc: "Define domain models, interfaces, inheritance, and associations with strict visibility and typing.",
    sampleKey: "class",
    dslCode: `@diagram "User Authentication" class

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
User "1" --> "*" Session : owns`,
  },
  {
    id: "sequence",
    label: "Sequence Flow",
    icon: "🔀",
    badge: "Process Flow",
    desc: "Visualize asynchronous API calls, lifelines, database queries, and system interactions over time.",
    sampleKey: "sequence",
    dslCode: `@diagram "JWT Login Flow" sequence

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
Gateway -->> Client: Set-Cookie: token_id`,
  },
  {
    id: "erd",
    label: "Database ERD",
    icon: "🗄️",
    badge: "Schema Design",
    desc: "Model relational database schemas with primary keys, foreign keys, constraints, and relationships.",
    sampleKey: "erd",
    dslCode: `@diagram "E-Commerce Database" erd

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
orders ||--|{ order_items : contains`,
  },
  {
    id: "state",
    label: "State Machine",
    icon: "🔁",
    badge: "Lifecycle",
    desc: "Track status transitions, lifecycle milestones, and event triggers cleanly without ambiguity.",
    sampleKey: "state",
    dslCode: `@diagram "Order Lifecycle" state

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
Delivered --> [*]`,
  },
  {
    id: "flowchart",
    label: "Flowchart",
    icon: "📊",
    badge: "Decision Logic",
    desc: "Map branching algorithmic decisions, conditional paths, and validation pipelines with auto-layout.",
    sampleKey: "flowchart",
    dslCode: `@diagram "Checkout Verification" flowchart

start "Start Checkout"
decision "Items In Stock?"
process "Reserve Inventory"
process "Calculate Tax & Total"
decision "Card Authorized?"
process "Generate Order Invoice"
process "Display Error to User"
end "Complete Checkout"`,
  },
];

const DIAGRAM_TYPES_DETAILS = [
  {
    type: "Class Diagram",
    icon: "🏗️",
    badge: "Structural",
    whenToUse: "Domain modeling, clean OOP architecture, interface definitions, and design patterns.",
    notations: "class, interface, abstract class, --|>, ..|>, -->, *--, o--",
    codeSample: "class User { +id: string }\nUser --|> BaseEntity",
    sampleKey: "class",
  },
  {
    type: "Sequence Diagram",
    icon: "🔀",
    badge: "Behavioral",
    whenToUse: "API sequences, microservice communications, auth flows, and request-response lifecycles.",
    notations: "participant, actor, boundary, control, ->, -->, -->>",
    codeSample: "Client -> Server: login(credentials)\nServer -->> Client: 200 OK",
    sampleKey: "sequence",
  },
  {
    type: "Database ERD",
    icon: "🗄️",
    badge: "Data Model",
    whenToUse: "Relational SQL schemas, entity relationships, primary/foreign key mapping.",
    notations: "entity, *pk, fk, [unique], ||--o{, ||--||, }|--||",
    codeSample: "entity Users { *id: int [pk] }\nUsers ||--o{ Orders",
    sampleKey: "erd",
  },
  {
    type: "State Machine",
    icon: "🔁",
    badge: "Behavioral",
    whenToUse: "Order lifecycles, connection handshakes, UI state machines, and status flags.",
    notations: "[initial], [final], state, [*] --> State, State --> Next : event",
    codeSample: "[*] --> Draft\nDraft --> Published : publishEvent",
    sampleKey: "state",
  },
  {
    type: "Flowchart",
    icon: "📊",
    badge: "Process",
    whenToUse: "Step-by-step algorithms, business approval processes, and logic branching.",
    notations: "start, process, decision, end, sub-routine",
    codeSample: 'decision "Is Admin?"\nprocess "Grant Full Access"',
    sampleKey: "flowchart",
  },
  {
    type: "Activity Diagram",
    icon: "⚡",
    badge: "Workflow",
    whenToUse: "Business workflows, parallel pipeline execution, and activity lifecycle sequences.",
    notations: "[start], action, decision, [end]",
    codeSample: '[start]\naction "Receive Order"\ndecision "In Stock?"\n[end]',
    sampleKey: "activity",
  },
  {
    type: "Use Case Diagram",
    icon: "👤",
    badge: "Requirement",
    whenToUse: "Stakeholder requirements, actor boundaries, and feature scope visualization.",
    notations: "actor, (usecase), system boundaries, associations",
    codeSample: 'actor Admin\nAdmin --> (Manage Users)',
    sampleKey: "usecase",
  },
];

const CURATED_TEMPLATES = [
  {
    title: "E-Commerce Checkout & Inventory",
    type: "Sequence Diagram",
    icon: "🛒",
    desc: "Complete flow showing Cart checkout, Payment Gateway authorization, and Warehouse stock decrement.",
    sampleKey: "sequence",
  },
  {
    title: "Clean Architecture Domain Entities",
    type: "Class Diagram",
    icon: "🏛️",
    desc: "Domain-Driven Design (DDD) model with Entities, Value Objects, Aggregates, and Repository interfaces.",
    sampleKey: "class",
  },
  {
    title: "SaaS Multi-Tenant Database Schema",
    type: "Database ERD",
    icon: "🗄️",
    desc: "Relational database with Tenants, Users, Roles, Subscriptions, and Billing Invoice tables.",
    sampleKey: "erd",
  },
  {
    title: "Order Fulfillment Lifecycle",
    type: "State Machine",
    icon: "📦",
    desc: "Full payment, packaging, shipping, delivery, refund, and cancellation state transitions.",
    sampleKey: "state",
  },
];

export function LandingPage({ onOpenEditor, onOpenDocs }: Props) {
  const [activeDemoTab, setActiveDemoTab] = useState<string>("class");
  const [copiedCode, setCopiedCode] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentTab = DEMO_TABS.find((t) => t.id === activeDemoTab) || DEMO_TABS[0];

  const handleCopyDemoCode = () => {
    navigator.clipboard.writeText(currentTab.dslCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleLaunchWithTab = (tab: DemoTab) => {
    onOpenEditor(tab.dslCode);
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-surface text-text overflow-y-auto selection:bg-accent/30 selection:text-white">
      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-linear-to-b from-accent/20 via-purple-600/10 to-transparent blur-[120px] rounded-full" />
        <div className="absolute top-[600px] -left-40 w-[500px] h-[500px] bg-indigo-600/10 blur-[130px] rounded-full" />
        <div className="absolute top-[1200px] -right-40 w-[600px] h-[600px] bg-purple-600/10 blur-[140px] rounded-full" />
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(99,102,241,0.4) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* --- Sticky Top Navigation --- */}
      <nav
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-surface-2/90 backdrop-blur-xl border-b border-border shadow-xl shadow-black/25"
            : "bg-surface/50 backdrop-blur-md border-b border-border/40"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-accent via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-accent/25">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="8" y="14" width="7" height="7" rx="1.5" />
                </svg>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-linear-to-r from-white via-text to-text-muted bg-clip-text text-transparent">
                  UML Flow
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/25">
                  v2.0
                </span>
              </div>
            </div>

            {/* Nav Links (Desktop) */}
            <div className="hidden md:flex items-center gap-7">
              <button
                onClick={() => scrollToSection("interactive-demo")}
                className="text-xs font-medium text-text-muted hover:text-text transition-colors"
              >
                Live Playground
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className="text-xs font-medium text-text-muted hover:text-text transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("diagrams")}
                className="text-xs font-medium text-text-muted hover:text-text transition-colors"
              >
                Diagram Types
              </button>
              <button
                onClick={() => scrollToSection("templates")}
                className="text-xs font-medium text-text-muted hover:text-text transition-colors"
              >
                Templates
              </button>
              <button
                onClick={onOpenDocs || (() => scrollToSection("quick-reference"))}
                className="text-xs font-medium text-text-muted hover:text-text transition-colors"
              >
                Documentation
              </button>
            </div>

            {/* Launch CTA */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => onOpenEditor()}
                className="px-4 py-2 bg-linear-to-r from-accent to-purple-600 hover:from-accent-hover hover:to-purple-500 text-white rounded-lg text-xs font-semibold transition-all hover:shadow-lg hover:shadow-accent/25 active:scale-95 flex items-center gap-1.5"
              >
                <span>Launch Editor</span>
                <span>🚀</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative z-10 pt-16 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Release Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-2/90 border border-accent/30 text-xs text-text-muted mb-6 shadow-sm backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-accent font-medium">New in 2.0:</span>
          <span>AI Diagram Generator & TypeScript/Java Code Export</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
          <span className="text-text">Design System Architecture</span>
          <br />
          <span className="bg-linear-to-r from-accent via-purple-400 to-pink-400 bg-clip-text text-transparent">
            with Code & Interactive Canvas
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-text-muted max-w-3xl mx-auto mb-10 leading-relaxed">
          The developer-first diagramming suite with bi-directional synchronization.
          Write intuitive text DSL, edit visually with drag-and-drop, export directly
          to TypeScript/Java, or let our AI generate schemas for you in seconds.
        </p>

        {/* Hero Actions */}
        <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-center mb-14">
          <button
            onClick={() => onOpenEditor()}
            className="w-full sm:w-auto px-7 py-3.5 bg-linear-to-r from-accent via-indigo-600 to-purple-600 hover:from-accent-hover hover:to-purple-500 text-white rounded-xl font-semibold text-sm shadow-xl shadow-accent/25 hover:shadow-accent/40 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="text-base">🚀</span>
            <span>Open Web Editor</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-mono ml-1">
              No Sign-up
            </span>
          </button>
          <button
            onClick={() => scrollToSection("interactive-demo")}
            className="w-full sm:w-auto px-6 py-3.5 bg-surface-2/80 hover:bg-surface-3 border border-border hover:border-accent/60 text-text rounded-xl font-medium text-sm transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <span>⚡</span>
            <span>Try Interactive Demo</span>
          </button>
          <button
            onClick={onOpenDocs || (() => scrollToSection("features"))}
            className="w-full sm:w-auto px-5 py-3.5 text-text-muted hover:text-text font-medium text-sm transition-colors flex items-center justify-center gap-1.5"
          >
            <span>📖</span>
            <span>View Documentation</span>
          </button>
        </div>

        {/* Key Highlights Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto pt-6 border-t border-border/40">
          <div className="p-4 rounded-xl bg-surface-2/40 border border-border/50 backdrop-blur-xs">
            <div className="text-2xl font-black bg-linear-to-r from-accent to-purple-400 bg-clip-text text-transparent">
              7 Types
            </div>
            <div className="text-xs text-text-muted mt-1">UML & Architecture Diagrams</div>
          </div>
          <div className="p-4 rounded-xl bg-surface-2/40 border border-border/50 backdrop-blur-xs">
            <div className="text-2xl font-black bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              2-Way Sync
            </div>
            <div className="text-xs text-text-muted mt-1">Text DSL ⟷ Visual Canvas</div>
          </div>
          <div className="p-4 rounded-xl bg-surface-2/40 border border-border/50 backdrop-blur-xs">
            <div className="text-2xl font-black bg-linear-to-r from-indigo-400 to-accent bg-clip-text text-transparent">
              6 Algorithms
            </div>
            <div className="text-xs text-text-muted mt-1">Automated Graph Layouts</div>
          </div>
          <div className="p-4 rounded-xl bg-surface-2/40 border border-border/50 backdrop-blur-xs">
            <div className="text-2xl font-black bg-linear-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
              TS & Java
            </div>
            <div className="text-xs text-text-muted mt-1">Direct Code Generation</div>
          </div>
        </div>
      </section>

      {/* --- Interactive Demo & Live Playground Section --- */}
      <section
        id="interactive-demo"
        className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium mb-3">
            <span>✨ Live Playground Preview</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            See the Text-to-UML Engine in Action
          </h2>
          <p className="text-sm text-text-muted mt-2 max-w-xl mx-auto">
            Switch diagram types below to inspect the readable DSL code on the left
            and its rendered architecture model on the right.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          {DEMO_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveDemoTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border ${
                activeDemoTab === tab.id
                  ? "bg-accent/15 border-accent text-white shadow-sm shadow-accent/20"
                  : "bg-surface-2/60 border-border text-text-muted hover:text-text hover:bg-surface-3"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface-3 text-text-muted font-normal">
                {tab.badge}
              </span>
            </button>
          ))}
        </div>

        {/* Demo Window Frame */}
        <div className="bg-surface-2/80 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Window Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-3/60">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs font-mono text-text-muted">
                {currentTab.id}-sample.uml
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyDemoCode}
                className="px-2.5 py-1 text-xs text-text-muted hover:text-text rounded-md bg-surface-3 border border-border transition-colors flex items-center gap-1"
                title="Copy DSL code"
              >
                <span>{copiedCode ? "✓" : "📋"}</span>
                <span>{copiedCode ? "Copied" : "Copy Code"}</span>
              </button>
              <button
                onClick={() => handleLaunchWithTab(currentTab)}
                className="px-3 py-1 bg-accent hover:bg-accent-hover text-white text-xs font-medium rounded-md transition-all shadow-xs active:scale-95 flex items-center gap-1.5"
              >
                <span>Open in Editor</span>
                <span>➔</span>
              </button>
            </div>
          </div>

          {/* Window Body: Split DSL & Mock Visual Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
            {/* Left: Code DSL */}
            <div className="p-5 font-mono text-xs leading-relaxed overflow-x-auto bg-surface/50 max-h-[460px]">
              <pre className="text-text space-y-1">
                {currentTab.dslCode.split("\n").map((line, idx) => {
                  let styledLine: React.ReactNode = line;

                  if (line.startsWith("@diagram")) {
                    const parts = line.split(" ");
                    styledLine = (
                      <span>
                        <span className="text-amber-400 font-semibold">{parts[0]}</span>{" "}
                        <span className="text-emerald-400">{parts[1]}</span>{" "}
                        <span className="text-sky-400 font-bold">{parts[2]}</span>
                      </span>
                    );
                  } else if (line.startsWith("class ") || line.startsWith("interface ") || line.startsWith("abstract class ") || line.startsWith("entity ") || line.startsWith("participant ") || line.startsWith("state ")) {
                    styledLine = <span className="text-purple-400 font-semibold">{line}</span>;
                  } else if (line.includes("--|>") || line.includes("..|>") || line.includes("-->") || line.includes("->") || line.includes("||--o{")) {
                    styledLine = <span className="text-rose-400 font-medium">{line}</span>;
                  } else if (line.trim().startsWith("+") || line.trim().startsWith("-") || line.trim().startsWith("*")) {
                    styledLine = (
                      <span>
                        <span className="text-sky-400 font-bold">{line.substring(0, line.indexOf(line.trim()[0]) + 1)}</span>
                        <span>{line.substring(line.indexOf(line.trim()[0]) + 1)}</span>
                      </span>
                    );
                  }

                  return (
                    <div key={idx} className="flex gap-4">
                      <span className="text-text-muted/40 text-[10px] w-6 select-none text-right">
                        {idx + 1}
                      </span>
                      <div className="flex-1">{styledLine}</div>
                    </div>
                  );
                })}
              </pre>
            </div>

            {/* Right: Rich Interactive Visual Representation */}
            <div className="p-6 bg-surface-2/30 flex flex-col justify-between overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-xs font-semibold text-text uppercase tracking-wider">
                      Compiled Model Visualizer
                    </span>
                  </div>
                  <span className="text-[11px] text-text-muted bg-surface-3 px-2 py-0.5 rounded-md border border-border">
                    {currentTab.badge}
                  </span>
                </div>

                <p className="text-xs text-text-muted mb-6 leading-relaxed">
                  {currentTab.desc}
                </p>
              </div>

              {/* Diagram-Specific Schematic Preview Card */}
              {activeDemoTab === "class" && (
                <div className="space-y-4 my-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-surface-3/80 border border-accent/40 rounded-xl p-3 shadow-sm">
                      <div className="text-[11px] font-bold text-accent pb-1 border-b border-border flex items-center justify-between">
                        <span>«class» User</span>
                        <span className="text-[9px] text-emerald-400">entity</span>
                      </div>
                      <div className="py-1.5 text-[10px] space-y-0.5 font-mono text-text-muted border-b border-border">
                        <div><span className="text-sky-400">+</span> id: string</div>
                        <div><span className="text-sky-400">+</span> email: string</div>
                        <div><span className="text-rose-400">-</span> passwordHash: string</div>
                      </div>
                      <div className="pt-1.5 text-[10px] space-y-0.5 font-mono text-text-muted">
                        <div><span className="text-sky-400">+</span> validatePassword(): boolean</div>
                        <div><span className="text-sky-400">+</span> generateToken(): string</div>
                      </div>
                    </div>

                    <div className="bg-surface-3/80 border border-purple-500/40 rounded-xl p-3 shadow-sm">
                      <div className="text-[11px] font-bold text-purple-400 pb-1 border-b border-border flex items-center justify-between">
                        <span>«interface» Authenticatable</span>
                      </div>
                      <div className="py-2 text-[10px] space-y-1 font-mono text-text-muted">
                        <div><span className="text-sky-400">+</span> authenticate(): boolean</div>
                        <div><span className="text-sky-400">+</span> revokeSession(): void</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-[11px] text-text-muted py-1 bg-surface-3/40 rounded-lg border border-border/50">
                    <span className="text-rose-400 font-mono">User</span>
                    <span>implements</span>
                    <span className="text-purple-400 font-mono">Authenticatable</span>
                    <span className="text-text-muted/60">and owns</span>
                    <span className="text-emerald-400 font-mono">Session (*)</span>
                  </div>
                </div>
              )}

              {activeDemoTab === "sequence" && (
                <div className="space-y-3 my-2 font-mono text-xs">
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                    <div className="p-1.5 bg-surface-3 rounded-lg border border-border text-sky-400">Client</div>
                    <div className="p-1.5 bg-surface-3 rounded-lg border border-border text-purple-400">Gateway</div>
                    <div className="p-1.5 bg-surface-3 rounded-lg border border-border text-accent">AuthService</div>
                    <div className="p-1.5 bg-surface-3 rounded-lg border border-border text-emerald-400">Database</div>
                  </div>
                  <div className="p-3 bg-surface-3/50 rounded-xl border border-border/60 text-[11px] space-y-2">
                    <div className="flex items-center justify-between text-text">
                      <span>1. POST /login</span>
                      <span className="text-sky-400">Client ➔ Gateway</span>
                    </div>
                    <div className="flex items-center justify-between text-text-muted">
                      <span>2. findUserByEmail()</span>
                      <span className="text-accent">Auth ➔ DB</span>
                    </div>
                    <div className="flex items-center justify-between text-emerald-400">
                      <span>3. 200 OK + JWT</span>
                      <span>Gateway ➔ Client</span>
                    </div>
                  </div>
                </div>
              )}

              {activeDemoTab === "erd" && (
                <div className="grid grid-cols-2 gap-3 my-2 text-xs">
                  <div className="bg-surface-3/90 border border-border rounded-xl p-3">
                    <div className="font-bold text-accent text-xs pb-1 border-b border-border">customers</div>
                    <div className="pt-2 text-[10px] font-mono space-y-0.5 text-text-muted">
                      <div><span className="text-amber-400 font-bold">*id</span>: int [PK]</div>
                      <div>email: varchar [unique]</div>
                      <div>full_name: varchar</div>
                    </div>
                  </div>
                  <div className="bg-surface-3/90 border border-border rounded-xl p-3">
                    <div className="font-bold text-purple-400 text-xs pb-1 border-b border-border">orders</div>
                    <div className="pt-2 text-[10px] font-mono space-y-0.5 text-text-muted">
                      <div><span className="text-amber-400 font-bold">*id</span>: int [PK]</div>
                      <div><span className="text-sky-400">customer_id</span>: int [FK]</div>
                      <div>order_status: varchar</div>
                    </div>
                  </div>
                </div>
              )}

              {activeDemoTab === "state" && (
                <div className="flex items-center justify-between gap-1 my-3 text-[11px]">
                  <span className="px-2.5 py-1 rounded-full bg-surface-3 border border-border text-text">Pending</span>
                  <span className="text-accent text-xs">➔</span>
                  <span className="px-2.5 py-1 rounded-full bg-accent/20 border border-accent text-accent font-semibold">Processing</span>
                  <span className="text-accent text-xs">➔</span>
                  <span className="px-2.5 py-1 rounded-full bg-surface-3 border border-border text-text">Shipped</span>
                  <span className="text-accent text-xs">➔</span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 font-semibold">Delivered</span>
                </div>
              )}

              {activeDemoTab === "flowchart" && (
                <div className="space-y-2 my-2 text-[11px]">
                  <div className="p-2 bg-surface-3 rounded-lg border border-border flex items-center justify-between">
                    <span className="font-medium">1. Start Checkout</span>
                    <span className="text-emerald-400">Entry</span>
                  </div>
                  <div className="p-2 bg-accent/15 border border-accent/40 rounded-lg flex items-center justify-between">
                    <span className="font-semibold text-accent">2. Valid Cart?</span>
                    <span className="text-xs">Yes ➔ Reserve Stock</span>
                  </div>
                  <div className="p-2 bg-surface-3 rounded-lg border border-border flex items-center justify-between">
                    <span className="font-medium">3. Complete Order</span>
                    <span className="text-sky-400">Exit</span>
                  </div>
                </div>
              )}

              {/* Bottom Quick Launch Bar */}
              <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-text-muted">
                <span>Real-time AST parser with sub-second compilation</span>
                <button
                  onClick={() => handleLaunchWithTab(currentTab)}
                  className="text-accent hover:text-accent-hover font-semibold transition-colors flex items-center gap-1"
                >
                  <span>Edit in canvas</span>
                  <span>➔</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Core Features Grid --- */}
      <section
        id="features"
        className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium mb-3">
            <span>Engineering Excellence</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Engineered for Software Architects & Developers
          </h2>
          <p className="text-sm text-text-muted mt-2 max-w-2xl mx-auto">
            Everything you need to design, validate, and document enterprise systems
            without the bloat of traditional diagramming software.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="group relative bg-surface-2/70 backdrop-blur-md border border-border rounded-2xl p-7 hover:border-accent/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/5">
            <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-xl mb-5 group-hover:scale-105 transition-transform">
              📝
            </div>
            <h3 className="text-base font-bold text-text mb-2">Declarative Text DSL</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Forget slow drag-and-drop alignment. Write schemas in clean, human-readable
              DSL with real-time linting, instant error line indicators, and auto-complete.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group relative bg-surface-2/70 backdrop-blur-md border border-border rounded-2xl p-7 hover:border-accent/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/5">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xl mb-5 group-hover:scale-105 transition-transform">
              ✨
            </div>
            <h3 className="text-base font-bold text-text mb-2">AI Architecture Assistant</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Describe your software workflow or database requirements in natural English
              or Indonesian. The AI assistant generates complete UML DSL code instantly.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group relative bg-surface-2/70 backdrop-blur-md border border-border rounded-2xl p-7 hover:border-accent/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/5">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-xl mb-5 group-hover:scale-105 transition-transform">
              🔄
            </div>
            <h3 className="text-base font-bold text-text mb-2">Bi-directional 2-Way Sync</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Move nodes, modify properties, or connect ports on the visual canvas, then
              click Sync Code to generate the matching DSL back seamlessly.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="group relative bg-surface-2/70 backdrop-blur-md border border-border rounded-2xl p-7 hover:border-accent/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl mb-5 group-hover:scale-105 transition-transform">
              🔷
            </div>
            <h3 className="text-base font-bold text-text mb-2">TypeScript & Java Code Gen</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Turn your class diagrams into production TypeScript interfaces or Java class
              skeletons with one click. Reverse-engineer existing code by importing files.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="group relative bg-surface-2/70 backdrop-blur-md border border-border rounded-2xl p-7 hover:border-accent/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl mb-5 group-hover:scale-105 transition-transform">
              📐
            </div>
            <h3 className="text-base font-bold text-text mb-2">6 Layout Algorithms</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Untangle complex diagrams with a single click: Hierarchical Sugiyama,
              Force-directed, Radial rings, Grid layout, Linear, or Smart Auto.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="group relative bg-surface-2/70 backdrop-blur-md border border-border rounded-2xl p-7 hover:border-accent/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/5">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-xl mb-5 group-hover:scale-105 transition-transform">
              💾
            </div>
            <h3 className="text-base font-bold text-text mb-2">Version Diff & Library</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Manage multi-tab diagrams with local storage and backend sync. Compare
              modifications with visual side-by-side diffing before finalizing changes.
            </p>
          </div>
        </div>
      </section>

      {/* --- Diagram Types Matrix --- */}
      <section
        id="diagrams"
        className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-3">
            <span>Complete UML Standard Support</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            7 Specialized Diagram Specifications
          </h2>
          <p className="text-sm text-text-muted mt-2 max-w-xl mx-auto">
            Choose the right notation for your system. Each diagram type comes with dedicated
            parsers, semantic validators, and visual shape renderers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {DIAGRAM_TYPES_DETAILS.map((diag) => (
            <div
              key={diag.type}
              className="bg-surface-2/70 border border-border rounded-2xl p-6 flex flex-col justify-between hover:border-accent/50 transition-all hover:shadow-lg hover:shadow-accent/5 group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{diag.icon}</span>
                    <h3 className="font-bold text-sm text-text">{diag.type}</h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-3 text-text-muted border border-border">
                    {diag.badge}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="text-[11px] font-semibold text-text-muted mb-1">When to use:</div>
                  <p className="text-xs text-text leading-relaxed">{diag.whenToUse}</p>
                </div>

                <div className="mb-4 bg-surface-3/50 p-2.5 rounded-xl border border-border/60">
                  <div className="text-[10px] uppercase font-mono text-text-muted mb-1">
                    Key Notations:
                  </div>
                  <div className="text-[11px] font-mono text-accent truncate">
                    {diag.notations}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  const sampleCode = SAMPLES[diag.sampleKey] || "";
                  onOpenEditor(sampleCode);
                }}
                className="w-full py-2 bg-surface-3 hover:bg-accent hover:text-white text-text text-xs font-medium rounded-xl border border-border hover:border-accent transition-all flex items-center justify-center gap-1.5"
              >
                <span>Open {diag.type} Template</span>
                <span>➔</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* --- Curated Templates Showcase --- */}
      <section
        id="templates"
        className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium mb-3">
            <span>Pre-built Architectures</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Jumpstart with Real-World Templates
          </h2>
          <p className="text-sm text-text-muted mt-2 max-w-xl mx-auto">
            Don't start from a blank screen. Load production-grade architectures and customize
            them in your browser with a single click.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto">
          {CURATED_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.title}
              className="bg-surface-2/80 border border-border rounded-2xl p-6 flex items-start gap-4 hover:border-accent/60 transition-all hover:shadow-xl hover:shadow-accent/5 group"
            >
              <div className="text-3xl p-3 bg-surface-3 rounded-xl border border-border group-hover:scale-105 transition-transform">
                {tmpl.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-sm text-text">{tmpl.title}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/25">
                    {tmpl.type}
                  </span>
                </div>
                <p className="text-xs text-text-muted mb-4 leading-relaxed">
                  {tmpl.desc}
                </p>
                <button
                  onClick={() => {
                    const sampleCode = SAMPLES[tmpl.sampleKey] || "";
                    onOpenEditor(sampleCode);
                  }}
                  className="px-3.5 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-lg transition-all shadow-xs active:scale-95 flex items-center gap-1.5"
                >
                  <span>Use Template in Editor</span>
                  <span>➔</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- High Impact Call to Action --- */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-accent/20 via-purple-600/20 to-pink-600/20 border border-accent/40 p-10 sm:p-16 text-center shadow-2xl backdrop-blur-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0%,transparent_70%)]" />
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Ready to Upgrade Your Architecture Workflow?
            </h2>
            <p className="text-sm sm:text-base text-text-muted max-w-xl mx-auto mb-8 leading-relaxed">
              Build diagrams faster, keep documentation synced with code, and export clean
              vector graphics. 100% free, private, and runs directly in your browser.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onOpenEditor()}
                className="px-8 py-4 bg-linear-to-r from-accent via-indigo-600 to-purple-600 hover:from-accent-hover hover:to-purple-500 text-white rounded-xl font-bold text-sm shadow-xl shadow-accent/30 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Launch UML Flow Studio</span>
                <span>🚀</span>
              </button>
              <button
                onClick={onOpenDocs || (() => scrollToSection("interactive-demo"))}
                className="px-6 py-4 bg-surface-2/90 hover:bg-surface-3 border border-border text-text rounded-xl font-semibold text-sm transition-all"
              >
                View Syntax Reference
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- Polished Informative Footer --- */}
      <footer className="relative z-10 border-t border-border mt-12 bg-surface-2/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Col 1 */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-accent to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                  U
                </div>
                <span className="font-extrabold text-base text-text tracking-tight">
                  UML Flow Studio
                </span>
              </div>
              <p className="text-xs text-text-muted max-w-sm leading-relaxed mb-4">
                A modern web-based UML diagramming tool combining expressive text DSL,
                interactive visual canvas, AI generation, and multi-language code export.
              </p>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
                <span>Local-first architecture & privacy focused</span>
              </div>
            </div>

            {/* Col 2 */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-text mb-3">
                Supported Diagrams
              </h4>
              <ul className="space-y-1.5 text-xs text-text-muted">
                <li><button onClick={() => onOpenEditor(SAMPLES.class)} className="hover:text-text transition-colors">Class Diagram</button></li>
                <li><button onClick={() => onOpenEditor(SAMPLES.sequence)} className="hover:text-text transition-colors">Sequence Diagram</button></li>
                <li><button onClick={() => onOpenEditor(SAMPLES.erd)} className="hover:text-text transition-colors">Database ERD</button></li>
                <li><button onClick={() => onOpenEditor(SAMPLES.state)} className="hover:text-text transition-colors">State Machine</button></li>
                <li><button onClick={() => onOpenEditor(SAMPLES.flowchart)} className="hover:text-text transition-colors">Flowchart</button></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-text mb-3">
                Tech Stack & Core
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {["Bun", "Hono", "React 19", "Vite", "TypeScript", "Tailwind CSS", "SVG", "AST Parser"].map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 rounded-md bg-surface-3 border border-border text-[10px] text-text-muted"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-3">
            <div>
              © 2026 UML Flow. Engineered with Bun, Hono, React & TypeScript.
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => scrollToSection("interactive-demo")} className="hover:text-text transition-colors">Demo</button>
              <button onClick={() => onOpenEditor()} className="hover:text-text transition-colors">Editor</button>
              <button onClick={onOpenDocs || (() => scrollToSection("features"))} className="hover:text-text transition-colors">Documentation</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
