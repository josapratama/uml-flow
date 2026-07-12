import { useState, useEffect, useCallback } from "react";

interface Props {
  onBack: () => void;
  onOpenEditor: () => void;
}

const TOC = [
  { id: "getting-started", label: "Getting Started" },
  { id: "editor-modes", label: "Editor Modes" },
  { id: "class-diagram", label: "Class Diagram" },
  { id: "sequence-diagram", label: "Sequence Diagram" },
  { id: "activity-diagram", label: "Activity Diagram" },
  { id: "flowchart", label: "Flowchart" },
  { id: "erd", label: "ERD" },
  { id: "state-diagram", label: "State Diagram" },
  { id: "usecase-diagram", label: "Use Case Diagram" },
  { id: "visual-editing", label: "Visual Editing" },
  { id: "styling", label: "Styling & Customization" },
  { id: "export", label: "Export & Code Generation" },
  { id: "shortcuts", label: "Keyboard Shortcuts" },
  { id: "tips", label: "Tips & Tricks" },
];

export function DocsPage({ onBack, onOpenEditor }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("getting-started");
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 },
    );
    TOC.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollToSection = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setSidebarOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-surface text-text scroll-smooth">
      {/* Sticky Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="text-sm text-text-muted hover:text-text transition-colors flex items-center gap-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </button>
            <span className="text-border">|</span>
            {/* Breadcrumb */}
            <nav className="hidden sm:flex items-center gap-1 text-xs text-text-muted">
              <span>Home</span>
              <span>/</span>
              <span className="text-text">Documentation</span>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-text-muted hover:text-text rounded-lg hover:bg-surface-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <button
              onClick={onOpenEditor}
              className="px-4 py-1.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors"
            >
              Open Editor
            </button>
          </div>
        </div>
      </header>

      <div className="pt-14 flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block fixed top-14 left-0 w-64 h-[calc(100vh-3.5rem)] overflow-y-auto border-r border-border bg-surface-2/50 p-4">
          <nav className="space-y-0.5">
            {TOC.map(({ id, label }, i) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeSection === id
                    ? "bg-accent/10 text-accent font-medium border-l-2 border-accent"
                    : "text-text-muted hover:text-text hover:bg-surface-3"
                }`}
              >
                <span className="text-xs text-text-muted mr-2">{i + 1}.</span>
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Sidebar - Mobile overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="absolute top-14 left-0 w-72 h-[calc(100vh-3.5rem)] overflow-y-auto bg-surface-2 border-r border-border p-4 shadow-xl">
              <nav className="space-y-0.5">
                {TOC.map(({ id, label }, i) => (
                  <button
                    key={id}
                    onClick={() => scrollToSection(id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeSection === id
                        ? "bg-accent/10 text-accent font-medium"
                        : "text-text-muted hover:text-text hover:bg-surface-3"
                    }`}
                  >
                    <span className="text-xs text-text-muted mr-2">
                      {i + 1}.
                    </span>
                    {label}
                  </button>
                ))}
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 max-w-4xl mx-auto px-4 sm:px-8 py-10">
          <h1 className="text-4xl font-bold mb-2">Documentation</h1>
          <p className="text-text-muted mb-12">
            Complete guide to using UML Editor — DSL syntax, visual editing, and
            export.
          </p>

          {/* 1. Getting Started */}
          <Section id="getting-started" title="Getting Started">
            <P>
              UML Editor is a web-based tool for creating UML diagrams. You can
              write diagrams using a simple text-based DSL (Domain Specific
              Language) or use the visual drag-and-drop editor.
            </P>
            <H3>First Steps</H3>
            <Ol>
              <li>Open the editor by clicking "Open Editor"</li>
              <li>
                Choose a template from the "Templates" dropdown (top-left)
              </li>
              <li>
                The diagram compiles automatically and appears on the canvas
              </li>
              <li>
                Edit the DSL code on the left, or interact with the visual
                canvas on the right
              </li>
            </Ol>
            <H3>Interface Overview</H3>
            <Ul>
              <li>
                <B>Toolbar</B> (top) — Mode switch, compile, export, layout,
                settings
              </li>
              <li>
                <B>Editor</B> (left) — DSL code editor with syntax highlighting
              </li>
              <li>
                <B>Canvas</B> (right) — Visual diagram with interactive nodes
                and edges
              </li>
              <li>
                <B>Palette</B> (left, Visual mode) — Drag-and-drop node/edge
                tools
              </li>
              <li>
                <B>Properties</B> (right) — Node details, add attributes/methods
              </li>
            </Ul>
          </Section>

          {/* 2. Editor Modes */}
          <Section id="editor-modes" title="Editor Modes">
            <P>Switch between modes using the toolbar buttons:</P>
            <Ul>
              <li>
                <B>Code</B> — Full-screen DSL editor for focused writing
              </li>
              <li>
                <B>Split</B> — Side-by-side code + canvas (default, recommended)
              </li>
              <li>
                <B>Visual</B> — Full-screen canvas with palette sidebar for
                drag-and-drop
              </li>
            </Ul>
            <H3>Auto-Compile</H3>
            <P>
              When "Auto" is enabled (green in toolbar), the diagram
              automatically recompiles 700ms after you stop typing. Disable it
              for manual control — then press Ctrl+Enter to compile.
            </P>
            <H3>Bi-directional Sync</H3>
            <P>
              Click the ⟳ button in the toolbar to generate DSL code from the
              current visual diagram. This lets you make visual changes and then
              continue editing in code.
            </P>
          </Section>

          {/* 3. Class Diagram */}
          <Section id="class-diagram" title="Class Diagram">
            <P>
              Class diagrams show the structure of a system: classes,
              interfaces, attributes, methods, and relationships.
            </P>
            <Code>{`@diagram "My Project" class

class User {
  +id: string
  +name: string
  -password: string
  #email: string
  +login(username: string, password: string): boolean
  +logout(): void
}

interface Serializable {
  +serialize(): string
  +deserialize(data: string): void
}

abstract BaseEntity {
  +id: string
  +createdAt: Date
  #validate(): boolean
}

enum Role {
  +ADMIN
  +USER
  +GUEST
}

User --|> BaseEntity : inheritance
User ..|> Serializable : realization
User --> Role : association
User o-- Profile : aggregation
User *-- Session : composition
User ..> Logger : dependency`}</Code>
            <H3>Node Types</H3>
            <Ul>
              <li>
                <B>class</B> — Standard class with attributes and methods
              </li>
              <li>
                <B>interface</B> — Interface definition (dashed border)
              </li>
              <li>
                <B>abstract</B> — Abstract class (italic name)
              </li>
              <li>
                <B>enum</B> — Enumeration type
              </li>
            </Ul>
            <H3>Visibility Modifiers</H3>
            <Ul>
              <li>
                <B>+</B> public
              </li>
              <li>
                <B>-</B> private
              </li>
              <li>
                <B>#</B> protected
              </li>
              <li>
                <B>~</B> package
              </li>
            </Ul>
            <H3>Relationship Types</H3>
            <Ul>
              <li>
                <B>--|&gt;</B> Inheritance (solid line, hollow triangle)
              </li>
              <li>
                <B>..|&gt;</B> Realization (dashed line, hollow triangle)
              </li>
              <li>
                <B>--&gt;</B> Association (solid line, open arrow)
              </li>
              <li>
                <B>o--</B> Aggregation (hollow diamond)
              </li>
              <li>
                <B>*--</B> Composition (filled diamond)
              </li>
              <li>
                <B>..&gt;</B> Dependency (dashed line, open arrow)
              </li>
            </Ul>
            <H3>Visual Editing</H3>
            <Ol>
              <li>Click a class node to select it</li>
              <li>
                In the Properties panel (right), click "+ Add" under Attributes
                or Methods
              </li>
              <li>Type name and type, press Enter</li>
              <li>Hover an attribute/method and click ✕ to delete</li>
            </Ol>
          </Section>

          {/* 4. Sequence Diagram */}
          <Section id="sequence-diagram" title="Sequence Diagram">
            <P>
              Sequence diagrams show interactions between objects over time.
            </P>
            <Code>{`@diagram "Login Flow" sequence

participant Client as actor
participant Server as object
participant DB as entity

Client -> Server: login(user, pass)
Server -> DB: findUser(user)
DB --> Server: userData
Server -> Server: validatePassword()
Server --> Client: authToken`}</Code>
            <H3>Participant Types</H3>
            <Ul>
              <li>
                <B>actor</B> — Stick figure (user/external system)
              </li>
              <li>
                <B>object</B> — Rectangle box (default)
              </li>
              <li>
                <B>boundary</B> — Circle with vertical line (UI/API boundary)
              </li>
              <li>
                <B>entity</B> — Circle with underline (database/persistent data)
              </li>
            </Ul>
            <H3>Message Types</H3>
            <Ul>
              <li>
                <B>-&gt;</B> Synchronous message (solid arrow)
              </li>
              <li>
                <B>--&gt;</B> Return/async message (dashed arrow)
              </li>
              <li>
                <B>Self message</B> — Same source and target (loop back)
              </li>
            </Ul>
            <H3>Visual Editing</H3>
            <Ul>
              <li>Double-click message label to edit inline</li>
              <li>Double-click participant name to rename</li>
              <li>Drag participants horizontally to reorder</li>
              <li>Right-click message to delete</li>
              <li>Add participants via Palette (Visual mode)</li>
            </Ul>
          </Section>

          {/* 5. Activity Diagram */}
          <Section id="activity-diagram" title="Activity Diagram">
            <P>Activity diagrams show workflows and business processes.</P>
            <Code>{`@diagram "Order Process" activity

[start]
action "Receive Order"
decision "In Stock?"
action "Ship Order"
action "Back Order"
action "Close Order"
[end]

[start] --> "Receive Order"
"Receive Order" --> "In Stock?"
"In Stock?" --> "Ship Order" : yes
"In Stock?" --> "Back Order" : no
"Ship Order" --> "Close Order"
"Back Order" --> "Close Order"
"Close Order" --> [end]`}</Code>
            <H3>Node Types</H3>
            <Ul>
              <li>
                <B>[start]</B> — Filled circle (initial node)
              </li>
              <li>
                <B>[end]</B> — Bull's eye (final node)
              </li>
              <li>
                <B>action "Name"</B> — Rounded rectangle
              </li>
              <li>
                <B>decision "Name?"</B> — Diamond shape
              </li>
              <li>
                <B>fork</B> — Horizontal bar (parallel split)
              </li>
              <li>
                <B>join</B> — Horizontal bar (parallel merge)
              </li>
            </Ul>
            <H3>Visual Editing</H3>
            <Ul>
              <li>Drag nodes from the Palette in Visual mode</li>
              <li>Connect nodes by dragging from anchor dots</li>
              <li>Double-click to rename actions and decisions</li>
              <li>Add edge labels for decision branches</li>
            </Ul>
          </Section>

          {/* 6. Flowchart */}
          <Section id="flowchart" title="Flowchart">
            <P>Flowcharts show step-by-step processes with decision points.</P>
            <Code>{`@diagram "Login Process" flowchart

[start] "Begin"
process "Enter Credentials"
decision "Valid?"
process "Grant Access"
process "Show Error"
[end] "Done"

"Begin" --> "Enter Credentials"
"Enter Credentials" --> "Valid?"
"Valid?" --> "Grant Access" : yes
"Valid?" --> "Show Error" : no
"Grant Access" --> "Done"
"Show Error" --> "Enter Credentials"`}</Code>
            <H3>Node Types</H3>
            <Ul>
              <li>
                <B>process</B> — Rectangle
              </li>
              <li>
                <B>decision</B> — Diamond
              </li>
              <li>
                <B>io</B> — Parallelogram (input/output)
              </li>
              <li>
                <B>document</B> — Document shape
              </li>
              <li>
                <B>database</B> — Cylinder
              </li>
              <li>
                <B>subroutine</B> — Double-bordered rectangle
              </li>
            </Ul>
            <H3>Visual Editing</H3>
            <Ul>
              <li>
                Use the Palette to drag specific node shapes onto the canvas
              </li>
              <li>Connect nodes by dragging from anchor points</li>
              <li>Add labels to edges by double-clicking them</li>
            </Ul>
          </Section>

          {/* 7. ERD */}
          <Section id="erd" title="ERD (Entity-Relationship Diagram)">
            <P>
              ERDs show database structure: entities, attributes, and
              relationships.
            </P>
            <Code>{`@diagram "Blog" erd

entity User {
  *id: int
  name: varchar
  email: varchar [unique]
}

entity Post {
  *id: int
  title: varchar
  content: text
  user_id: int [fk]
}

entity Comment {
  *id: int
  body: text
  post_id: int [fk]
  user_id: int [fk]
}

User ||--o{ Post : writes
Post ||--o{ Comment : has
User ||--o{ Comment : writes`}</Code>
            <H3>Attribute Modifiers</H3>
            <Ul>
              <li>
                <B>*name</B> — Primary Key (🔑)
              </li>
              <li>
                <B>[fk]</B> — Foreign Key (🔗)
              </li>
              <li>
                <B>[unique]</B> — Unique constraint
              </li>
              <li>All attributes are nullable by default</li>
            </Ul>
            <H3>Relationship Cardinality</H3>
            <Ul>
              <li>
                <B>||--||</B> One-to-One
              </li>
              <li>
                <B>||--o{"{"}</B> One-to-Many
              </li>
              <li>
                <B>
                  {"}"}o--o{"{"}
                </B>{" "}
                Many-to-Many
              </li>
            </Ul>
            <H3>Visual Editing</H3>
            <Ol>
              <li>Click an entity to select it</li>
              <li>In Properties panel, click "+ Add" under Columns</li>
              <li>Enter name, type, and check PK/FK/Nullable</li>
              <li>Click "Add" or press Enter</li>
            </Ol>
          </Section>

          {/* 8. State Diagram */}
          <Section id="state-diagram" title="State Diagram">
            <P>
              State diagrams show the lifecycle of an object through different
              states.
            </P>
            <Code>{`@diagram "Door" state

[initial]
state Closed
state Open
state Locked

[initial] --> Closed
Closed --> Open : open
Open --> Closed : close
Closed --> Locked : lock
Locked --> Closed : unlock`}</Code>
            <H3>Node Types</H3>
            <Ul>
              <li>
                <B>[initial]</B> — Filled circle (start state)
              </li>
              <li>
                <B>[final]</B> — Bull's eye (end state)
              </li>
              <li>
                <B>state Name</B> — Rounded rectangle
              </li>
            </Ul>
            <H3>Visual Editing</H3>
            <Ul>
              <li>Drag state nodes from the Palette</li>
              <li>Connect states by dragging from anchor dots</li>
              <li>Double-click edges to add transition labels</li>
              <li>Double-click state names to rename</li>
            </Ul>
          </Section>

          {/* 9. Use Case Diagram */}
          <Section id="usecase-diagram" title="Use Case Diagram">
            <P>
              Use case diagrams show system functionality from the user's
              perspective.
            </P>
            <Code>{`@diagram "Library" usecase

actor User
actor Admin
usecase "Borrow Book"
usecase "Return Book"
usecase "Manage Users"
system "Library System"

User --> "Borrow Book"
User --> "Return Book"
Admin --> "Manage Users"
Admin --|> User : inheritance`}</Code>
            <H3>Elements</H3>
            <Ul>
              <li>
                <B>actor Name</B> — Stick figure
              </li>
              <li>
                <B>usecase "Name"</B> — Ellipse
              </li>
              <li>
                <B>system "Name"</B> — Dashed rectangle (boundary)
              </li>
            </Ul>
            <H3>Relationships</H3>
            <Ul>
              <li>
                <B>--&gt;</B> Association (actor uses use case)
              </li>
              <li>
                <B>..&gt; : include</B> — Include relationship
              </li>
              <li>
                <B>..&gt; : extend</B> — Extend relationship
              </li>
              <li>
                <B>--|&gt;</B> — Inheritance (actor generalization)
              </li>
            </Ul>
            <H3>Visual Editing</H3>
            <Ul>
              <li>Drag actors and use cases from the Palette</li>
              <li>Draw connections between actors and use cases</li>
              <li>Use the system boundary to group related use cases</li>
            </Ul>
          </Section>

          {/* 10. Visual Editing */}
          <Section id="visual-editing" title="Visual Editing">
            <H3>Canvas Navigation</H3>
            <Ul>
              <li>
                <B>Scroll wheel</B> — Zoom in/out
              </li>
              <li>
                <B>Middle-click drag</B> or <B>Ctrl+click drag</B> — Pan canvas
              </li>
              <li>
                <B>Zoom controls</B> (top-right) — +, -, reset, fit-to-view
              </li>
              <li>
                <B>Minimap</B> (bottom-right) — Overview of entire diagram
              </li>
            </Ul>
            <H3>Node Interactions</H3>
            <Ul>
              <li>
                <B>Click</B> — Select node
              </li>
              <li>
                <B>Drag</B> — Move node
              </li>
              <li>
                <B>Double-click</B> — Inline rename
              </li>
              <li>
                <B>Shift+click</B> — Multi-select
              </li>
              <li>
                <B>Drag on empty area</B> — Marquee select
              </li>
              <li>
                <B>Corner/edge handles</B> — Resize node
              </li>
            </Ul>
            <H3>Creating Connections</H3>
            <Ol>
              <li>Hover a node — anchor dots appear on 4 sides</li>
              <li>Drag from an anchor dot to another node</li>
              <li>Release on target node — edge created</li>
            </Ol>
            <P>Hold modifier keys while dragging for specific edge types:</P>
            <Ul>
              <li>
                <B>Shift</B> — Inheritance
              </li>
              <li>
                <B>Alt</B> — Composition
              </li>
              <li>
                <B>Ctrl+Shift</B> — Realization
              </li>
            </Ul>
            <P>
              Or select an edge type from the Palette "Connections" section
              first.
            </P>
            <H3>Edge Editing</H3>
            <Ul>
              <li>
                <B>Click edge</B> — Select (shows waypoint handles)
              </li>
              <li>
                <B>Double-click edge</B> — Edit label
              </li>
              <li>
                <B>Drag "+" dots</B> — Add waypoints (bend points)
              </li>
              <li>
                <B>Drag green/red squares</B> — Reconnect endpoints to different
                nodes
              </li>
              <li>
                <B>Right-click edge</B> — Change type, reverse direction, delete
              </li>
            </Ul>
          </Section>

          {/* 11. Styling & Customization */}
          <Section id="styling" title="Styling & Customization">
            <H3>Per-Node Styling</H3>
            <Ol>
              <li>Select a node</li>
              <li>Click "🎨 This" in Properties panel</li>
              <li>Adjust: font size, colors, border width, opacity</li>
            </Ol>
            <H3>Global Styling</H3>
            <Ol>
              <li>Select any node</li>
              <li>Click "🌐 All" in Properties panel</li>
              <li>Changes apply to ALL nodes in the diagram</li>
              <li>"Reset to Default" clears all custom styles</li>
            </Ol>
            <H3>Available Style Options</H3>
            <Ul>
              <li>
                <B>Font size</B> — Adjust text size for readability
              </li>
              <li>
                <B>Background color</B> — Node fill color
              </li>
              <li>
                <B>Border color</B> — Node outline color
              </li>
              <li>
                <B>Border style</B> — solid, dashed, dotted, none
              </li>
              <li>
                <B>Border width</B> — Thickness of the outline
              </li>
              <li>
                <B>Opacity</B> — Transparency level
              </li>
            </Ul>
            <H3>Edge Styling</H3>
            <Ol>
              <li>Right-click an edge and select "Style Edge"</li>
              <li>Adjust stroke color, width, and dash pattern</li>
            </Ol>
          </Section>

          {/* 12. Export & Code Generation */}
          <Section id="export" title="Export & Code Generation">
            <H3>Export Formats</H3>
            <Ul>
              <li>
                <B>PNG</B> — High-resolution raster image (2x scale)
              </li>
              <li>
                <B>SVG</B> — Scalable vector graphic
              </li>
              <li>
                <B>JSON</B> — Diagram data (re-importable)
              </li>
              <li>
                <B>DSL</B> — Source text file
              </li>
              <li>
                <B>TypeScript</B> — Generated interfaces/classes
              </li>
              <li>
                <B>Java</B> — Generated Java classes
              </li>
              <li>
                <B>Clipboard</B> — Copy SVG or PNG directly
              </li>
            </Ul>
            <H3>Code Generation</H3>
            <P>For class diagrams, export generates real code:</P>
            <Ul>
              <li>
                <B>TypeScript</B> — Interfaces, classes, enums with proper types
              </li>
              <li>
                <B>Java</B> — Classes with access modifiers, inheritance, and
                imports
              </li>
            </Ul>
            <H3>Import</H3>
            <Ul>
              <li>
                <B>.json</B> — Load saved diagram
              </li>
              <li>
                <B>.ts / .tsx / .js</B> — Auto-parse to class diagram
              </li>
              <li>
                <B>.java</B> — Auto-parse to class diagram
              </li>
              <li>
                <B>.uml / .txt</B> — Load as DSL code
              </li>
            </Ul>
            <P>
              Import via the 📂 button in toolbar, or drag & drop files onto the
              editor.
            </P>
          </Section>

          {/* 13. Keyboard Shortcuts */}
          <Section id="shortcuts" title="Keyboard Shortcuts">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                ["Ctrl+Enter", "Compile DSL"],
                ["Ctrl+Z", "Undo"],
                ["Ctrl+Y / Ctrl+Shift+Z", "Redo"],
                ["Delete", "Delete selected"],
                ["Ctrl+C", "Copy node"],
                ["Ctrl+V", "Paste"],
                ["Ctrl+D", "Duplicate node"],
                ["Shift+Click", "Multi-select"],
                ["Double-click", "Inline rename"],
                ["Right-click", "Context menu"],
                ["Scroll wheel", "Zoom in/out"],
                ["Middle-drag / Ctrl+drag", "Pan canvas"],
                ["?", "Toggle shortcuts panel"],
              ].map(([key, desc]) => (
                <div
                  key={key}
                  className="flex justify-between items-center px-4 py-2.5 bg-surface-2 border border-border rounded-lg text-sm"
                >
                  <span className="text-text-muted">{desc}</span>
                  <kbd className="bg-surface-3 px-2 py-0.5 rounded text-xs font-mono border border-border text-text">
                    {key}
                  </kbd>
                </div>
              ))}
            </div>
          </Section>

          {/* 14. Tips & Tricks */}
          <Section id="tips" title="Tips & Tricks">
            <Ul>
              <li>
                <B>Snap to Grid</B> — Enable "Snap" in toolbar for perfectly
                aligned nodes
              </li>
              <li>
                <B>Auto Layout</B> — Use layout presets (layered, force, radial,
                grid, linear) to auto-arrange messy diagrams
              </li>
              <li>
                <B>Align Tools</B> — Select 2+ nodes → floating toolbar appears
                with align/distribute buttons
              </li>
              <li>
                <B>Sync to Code</B> — Click ⟳ in toolbar to generate DSL from
                current visual diagram
              </li>
              <li>
                <B>Undo Everything</B> — All actions are undoable with Ctrl+Z
                (unlimited history)
              </li>
              <li>
                <B>Note Nodes</B> — Add 📝 Note from palette for
                comments/annotations
              </li>
              <li>
                <B>Edge Type Palette</B> — In Visual mode, select connection
                type before dragging
              </li>
              <li>
                <B>Reverse Edge</B> — Right-click edge → "⇄ Reverse Direction"
              </li>
              <li>
                <B>Persistent Storage</B> — Your work is auto-saved to browser
                localStorage
              </li>
              <li>
                <B>Edge Routing</B> — Toggle between straight and orthogonal
                edge routing in toolbar
              </li>
              <li>
                <B>Monochrome Mode</B> — Toggle for clean black-and-white
                diagrams ideal for printing
              </li>
              <li>
                <B>Drag & Drop Import</B> — Drop .ts, .java, .json, or .uml
                files directly onto the editor
              </li>
            </Ul>
          </Section>

          {/* Footer CTA */}
          <div className="mt-16 pt-8 border-t border-border text-center">
            <p className="text-text-muted mb-4">
              Ready to start creating diagrams?
            </p>
            <button
              onClick={onOpenEditor}
              className="px-8 py-3 bg-linear-to-r from-accent to-purple-500 hover:from-accent-hover hover:to-purple-400 text-white rounded-xl font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/25"
            >
              🚀 Open Editor
            </button>
          </div>
        </main>
      </div>

      {/* Back to Top */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 w-10 h-10 bg-accent hover:bg-accent-hover text-white rounded-full shadow-lg shadow-accent/25 flex items-center justify-center transition-all hover:-translate-y-0.5"
          aria-label="Back to top"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

// --- Helper Components ---

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-16 scroll-mt-20">
      <h2 className="text-2xl font-bold mb-5 pb-3 border-b border-border">
        {title}
      </h2>
      {children}
    </section>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg font-semibold mt-6 mb-2 text-text">{children}</h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-text-muted mb-3 leading-relaxed">{children}</p>;
}

function B({ children }: { children: React.ReactNode }) {
  return <strong className="text-text font-medium">{children}</strong>;
}

function Ul({ children }: { children: React.ReactNode }) {
  return (
    <ul className="list-disc list-inside space-y-1.5 text-text-muted mb-4 ml-2">
      {children}
    </ul>
  );
}

function Ol({ children }: { children: React.ReactNode }) {
  return (
    <ol className="list-decimal list-inside space-y-1.5 text-text-muted mb-4 ml-2">
      {children}
    </ol>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre className="bg-surface-2 border border-border rounded-xl p-5 font-mono text-sm overflow-x-auto mb-4 leading-relaxed text-text-muted">
      {children}
    </pre>
  );
}
