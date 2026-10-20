import React from "react";
import {
  Section,
  H3,
  P,
  B,
  Ul,
  Ol,
  Kbd,
  DocCallout,
  DocCodeBlock,
  DocSyntaxTable,
} from "../DocTypography";

interface DocsContentEnProps {
  onOpenEditor: (code?: string) => void;
}

export function DocsContentEn({ onOpenEditor }: DocsContentEnProps) {
  return (
    <>
      {/* 1. Overview & Quick Start */}
      <Section
        id="getting-started"
        title="1. Overview & Quick Start"
        icon="🚀"
        badge="Basics"
      >
        <P>
          <B>UML Flow</B> is a modern software architecture modeling platform
          that combines the clarity and speed of declarative text DSL with the intuitive
          power of an interactive, bidirectional visual canvas. You can craft
          publication-ready diagrams in seconds.
        </P>

        <DocCallout type="academic" title="UML 2.5 & Academic Standards">
          All diagrams compiled by UML Flow adhere to formal OMG UML 2.5 standards and
          are tailored for academic engineering theses, conference papers, and software architecture documentation.
        </DocCallout>

        <H3>Quick Start in 60 Seconds</H3>
        <Ol>
          <li>
            <B>Launch the Studio</B>: Click <B>Launch Editor</B> in the top navigation bar.
          </li>
          <li>
            <B>Write DSL or Pick a Template</B>: Use the <B>Templates</B> dropdown to load
            pre-built examples like <i>IPO Research Framework</i>, <i>Waterfall SDLC</i>, or <i>Academic Database ERD</i>.
          </li>
          <li>
            <B>Instant Compilation</B>: Diagrams render on the canvas in real-time as you type.
          </li>
          <li>
            <B>Bidirectional Editing</B>: Edit text code on the left OR freely manipulate elements on the visual canvas on the right.
          </li>
        </Ol>

        <H3>Studio Workspace Layout</H3>
        <Ul>
          <li><B>Top Toolbar</B>: Switch editor modes (Split / Visual / Code), trigger compilation, undo/redo, auto-layout, apply palettes, and export.</li>
          <li><B>DSL Editor (Left)</B>: High-speed code editor with syntax highlighting, inline linting, and error annotations.</li>
          <li><B>Visual Canvas (Center)</B>: Infinite-pan interactive canvas with grid snapping, zoom, and smart orthogonal right-angle routing.</li>
          <li><B>Node Palette (Left Sidebar in Visual Mode)</B>: Draggable element icons and relationship connector tools.</li>
          <li><B>Property Inspector (Right Sidebar)</B>: Comprehensive panel for editing element names, types, class attributes/methods, and color styles.</li>
        </Ul>
      </Section>

      {/* 2. Editor Modes & Two-Way Sync */}
      <Section
        id="editor-modes"
        title="2. Editor Modes & Bidirectional Sync"
        icon="🔄"
        badge="Core Feature"
      >
        <P>
          UML Flow offers three distinct viewing modes tailored to different stages of your design workflow:
        </P>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
          <div className="p-3.5 rounded-xl bg-surface-2 border border-border">
            <div className="font-bold text-accent text-sm mb-1">Split (Recommended)</div>
            <p className="text-xs text-text-muted">
              Side-by-side editing: live code editor on the left and dynamic canvas on the right.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-surface-2 border border-border">
            <div className="font-bold text-text text-sm mb-1">Visual</div>
            <p className="text-xs text-text-muted">
              Full-screen visual diagramming with a draggable node palette for rapid graphical prototyping.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-surface-2 border border-border">
            <div className="font-bold text-text text-sm mb-1">Code</div>
            <p className="text-xs text-text-muted">
              Distraction-free, full-width code editor ideal for high-speed typing and keyboard-centric users.
            </p>
          </div>
        </div>

        <H3>Auto-Compilation</H3>
        <P>
          With <B>Auto Compile</B> enabled (green lightning indicator in the toolbar), diagrams compile automatically 700ms after you finish typing. You can also press <Kbd>Ctrl</Kbd> + <Kbd>Enter</Kbd> at any moment to trigger manual compilation.
        </P>

        <H3>How Two-Way Live Sync Works (Canvas to Code)</H3>
        <P>
          Whenever you reposition nodes on the canvas or customize properties in the inspector, click the <B>Sync from Canvas (⟳)</B> button in the toolbar. The engine reverse-generates clean, organized DSL code from the current canvas state without destroying comments or formatting!
        </P>

        <DocCallout type="tip" title="Pro Workflow Tip">
          Start by writing the broad architecture in the DSL editor, then drag nodes on the canvas to refine layout positioning, and finally hit <b>Sync (⟳)</b> to commit the visual arrangement back to code.
        </DocCallout>
      </Section>

      {/* 3. Class Diagram */}
      <Section
        id="class-diagram"
        title="3. Class Diagram (Object-Oriented Architecture)"
        icon="🏗️"
        badge="UML 2.5"
      >
        <P>
          Class diagrams model system structures: classes, interfaces, abstract entities, enumerations, member attributes, methods, and relationships.
        </P>

        <DocCodeBlock
          code={`@diagram "User Management System" class

class User {
  +id: string
  +name: string
  -passwordHash: string
  #email: string
  +login(email: string, pass: string): boolean
  +logout(): void
}

interface Authenticatable {
  +generateToken(): string
  +verifyToken(token: string): boolean
}

abstract class BaseEntity {
  +createdAt: Date
  +updatedAt: Date
  #auditLog(): void
}

enum UserRole {
  +ADMIN
  +STUDENT
  +LECTURER
}

User --|> BaseEntity : inherits (inheritance)
User ..|> Authenticatable : implements (realization)
User --> UserRole : assigns role (association)`}
          diagramType="class"
          title="Complete Class Diagram Example"
          onOpenEditor={onOpenEditor}
        />

        <DocSyntaxTable
          title="Class Diagram Relationship Syntax Table"
          rows={[
            {
              symbol: "--|>",
              keyword: "Inheritance / Generalization",
              example: "User --|> BaseEntity",
              description: "Solid line with hollow triangle arrow head (is-a).",
            },
            {
              symbol: "..|>",
              keyword: "Realization / Implementation",
              example: "User ..|> Authenticatable",
              description: "Dashed line with hollow triangle arrow head.",
            },
            {
              symbol: "-->",
              keyword: "Directed Association",
              example: 'User "1" --> "*" Order',
              description: "Solid line with open arrow showing relationship.",
            },
            {
              symbol: "o--",
              keyword: "Aggregation",
              example: "Department o-- Professor",
              description: "Solid line with hollow diamond (has-a loose bond).",
            },
            {
              symbol: "*--",
              keyword: "Composition",
              example: "University *-- Faculty",
              description: "Solid line with filled diamond (tight ownership).",
            },
            {
              symbol: "..>",
              keyword: "Dependency",
              example: "OrderService ..> PaymentGateway",
              description: "Dashed line with open arrow (requires module).",
            },
          ]}
        />
      </Section>

      {/* 4. Sequence Diagram */}
      <Section
        id="sequence-diagram"
        title="4. Sequence Diagram (Time-Ordered Interactions)"
        icon="🔀"
        badge="UML 2.5"
      >
        <P>
          Sequence diagrams map interactions between lifelines across time. Essential for API workflows, authentication handshakes, and microservice call tracing.
        </P>

        <DocCodeBlock
          code={`@diagram "JWT Authentication Flow" sequence

participant User as actor
participant WebClient as boundary
participant ApiGateway as control
participant AuthService as control
participant Database as entity

User -> WebClient : Enter email & password
WebClient -> ApiGateway : POST /api/v1/auth/login
ApiGateway -> AuthService : verifyCredentials()
AuthService -> Database : SELECT * FROM users WHERE email=?
Database -->> AuthService : User Record
AuthService -> AuthService : bcrypt.compare(password)
AuthService -->> ApiGateway : 200 OK + JWT Bearer Token
ApiGateway -->> WebClient : Set-Cookie: session_id
WebClient -->> User : Display Main Dashboard`}
          diagramType="sequence"
          title="JWT Login API Sequence Flow"
          onOpenEditor={onOpenEditor}
        />
      </Section>

      {/* 5. Flowchart */}
      <Section
        id="flowchart"
        title="5. Flowcharts & Research Methodologies"
        icon="📊"
        badge="Academic"
      >
        <P>
          Flowcharts visually represent step-by-step algorithms, Input-Process-Output (IPO) conceptual models, and software development methodologies (SDLC Waterfall/Agile).
        </P>

        <DocCodeBlock
          code={`@diagram "IPO Research Conceptual Model" flowchart

start "Start Research"
process "1. INPUT: Problem Statement\\n• Literature review & user interviews\\n• Functional requirements analysis"
process "2. PROCESS: Design & Implementation\\n• UML Flow modeling & Database ERD\\n• Full-stack coding & API integration"
decision "Verification Test Passed?"
process "3. OUTPUT: Integrated Software\\n• Operational web application\\n• Thesis final evaluation report"
end "Complete (Thesis Final)"

"Start Research" -> "1. INPUT: Problem Statement\\n• Literature review & user interviews\\n• Functional requirements analysis"
"1. INPUT: Problem Statement\\n• Literature review & user interviews\\n• Functional requirements analysis" -> "2. PROCESS: Design & Implementation\\n• UML Flow modeling & Database ERD\\n• Full-stack coding & API integration"
"2. PROCESS: Design & Implementation\\n• UML Flow modeling & Database ERD\\n• Full-stack coding & API integration" -> "Verification Test Passed?" : "Black Box"
"Verification Test Passed?" -> "3. OUTPUT: Integrated Software\\n• Operational web application\\n• Thesis final evaluation report" : "Yes (Passed)"
"Verification Test Passed?" -> "2. PROCESS: Design & Implementation\\n• UML Flow modeling & Database ERD\\n• Full-stack coding & API integration" : "Revise (Failed)"
"3. OUTPUT: Integrated Software\\n• Operational web application\\n• Thesis final evaluation report" -> "Complete (Thesis Final)"`}
          diagramType="flowchart"
          title="IPO Research Framework Flowchart"
          onOpenEditor={onOpenEditor}
        />
      </Section>

      {/* 6. Database ERD */}
      <Section
        id="erd"
        title="6. Database ERD (Relational Schemas)"
        icon="🗄️"
        badge="Database"
      >
        <P>
          Entity Relationship Diagrams define relational database tables, data types, Primary/Foreign keys, and Crow's Foot cardinality relationships.
        </P>

        <DocCodeBlock
          code={`@diagram "University Academic Database" erd

entity Students {
  *id: int [pk]
  student_number: varchar(15) [unique]
  full_name: varchar(100)
  advisor_id: int [fk]
}

entity Lecturers {
  *id: int [pk]
  staff_code: varchar(15) [unique]
  full_name: varchar(100)
}

entity CourseEnrollments {
  *id: int [pk]
  student_id: int [fk]
  course_id: int [fk]
  semester: varchar(10)
  grade: char(2)
}

entity Courses {
  *id: int [pk]
  course_code: varchar(10) [unique]
  course_name: varchar(100)
  credits: int
}

Students ||--o{ CourseEnrollments : enrolls
Courses ||--o{ CourseEnrollments : listed_in
Lecturers ||--o{ Students : advises`}
          diagramType="erd"
          title="Academic Database ERD Schema"
          onOpenEditor={onOpenEditor}
        />
      </Section>

      {/* 7. State Machine Diagram */}
      <Section
        id="state-diagram"
        title="7. State Machine Diagrams (Entity Lifecycles)"
        icon="🔄"
        badge="UML 2.5"
      >
        <P>
          State machine diagrams model the discrete states an entity undergoes in response to external events, transitions, and guard conditions.
        </P>

        <DocCodeBlock
          code={`@diagram "E-Commerce Order Lifecycle" state

state PendingPayment
state ProcessingOrder
state Shipped
state Delivered
state Cancelled

[*] -> PendingPayment : Customer places order
PendingPayment -> ProcessingOrder : Payment received
PendingPayment -> Cancelled : Payment timeout (24h)
ProcessingOrder -> Shipped : Dispatch parcel [tracking valid]
Shipped -> Delivered : Courier confirms receipt
Delivered -> [*] : Transaction complete
Cancelled -> [*] : Release stock reservation`}
          diagramType="state"
          title="E-Commerce Order State Machine"
          onOpenEditor={onOpenEditor}
        />
      </Section>

      {/* 8. Activity Diagram */}
      <Section
        id="activity-diagram"
        title="8. Activity Diagrams & Swimlanes"
        icon="🏊"
        badge="UML 2.5"
      >
        <P>
          Activity diagrams model step-by-step business workflows. The <b>Swimlanes</b> feature segments activities by organizational role or system boundary.
        </P>

        <DocCodeBlock
          code={`@diagram "Library Book Borrowing Workflow" activity

|Student|
start
:Browse Books on Shelf;
:Present Library Card & Book;

|Librarian|
:Scan Barcode on Book;
if (Overdue Fines Exist?) then (Yes)
  :Display Fine Amount;
  :Collect Fine Payment;
else (No)
endif
:Record Loan Transaction;
:Hand Book to Student;

|Student|
:Receive Borrowed Book;
stop`}
          diagramType="activity"
          title="Library Borrowing Flow with Swimlanes"
          onOpenEditor={onOpenEditor}
        />
      </Section>

      {/* 9. Use Case Diagram */}
      <Section
        id="usecase-diagram"
        title="9. Use Case Diagrams (Functional Scope)"
        icon="👤"
        badge="UML 2.5"
      >
        <P>
          Use case diagrams map interactions between external human actors or systems and the core functional use cases within the application boundary.
        </P>

        <DocCodeBlock
          code={`@diagram "Academic Portal System" usecase

actor Student
actor Professor
actor "Finance Dept" as Finance

system "University Academic Portal" {
  usecase "Authenticate Account" as uc_login
  usecase "Course Registration" as uc_reg
  usecase "Tuition Fee Verification" as uc_fee
  usecase "Submit Semester Grades" as uc_grades
  usecase "Print Academic Transcript" as uc_transcript
}

Student --> uc_login
Student --> uc_reg
Student --> uc_transcript
Professor --> uc_login
Professor --> uc_grades
Finance --> uc_fee
uc_reg ..> uc_fee : <<include>>`}
          diagramType="usecase"
          title="University Portal Use Case Diagram"
          onOpenEditor={onOpenEditor}
        />
      </Section>

      {/* 10. Component Diagram */}
      <Section
        id="component-diagram"
        title="10. Component Diagrams & 3-Tier Architecture"
        icon="🧩"
        badge="Architecture"
      >
        <P>
          Component diagrams capture modular system topologies, microservices, and multi-tier architectural tiers.
        </P>

        <DocCodeBlock
          code={`@diagram "3-Tier System Architecture" component

component "Presentation Layer\\n(React Web & Flutter Mobile)" as c_ui
component "Application Layer\\n(Node.js / Express REST API)" as c_api
component "Database Layer\\n(PostgreSQL Server Cluster)" as c_db
component "External Payment Gateway\\n(Stripe / PayPal API)" as c_gateway

c_ui -> c_api : "HTTPS / JSON Payload"
c_api -> c_db : "TCP / SQL Query"
c_api -> c_gateway : "REST Webhook"`}
          diagramType="component"
          title="3-Tier Software Architecture"
          onOpenEditor={onOpenEditor}
        />
      </Section>

      {/* 11. Visual Canvas & Orthogonal Routing */}
      <Section
        id="visual-editing"
        title="11. Visual Canvas & Smart Orthogonal Routing"
        icon="↗️"
        badge="Visual Controls"
      >
        <P>
          UML Flow is built for fluidity and interactive control on any resolution:
        </P>

        <H3>Connecting Elements via Ports</H3>
        <Ol>
          <li>Hover over any source node. Magnetic anchor handles (Top, Right, Bottom, Left) appear automatically.</li>
          <li>Click and hold any port anchor, then drag a line toward the destination node.</li>
          <li>Release the mouse over the destination element to forge an instantaneous relationship.</li>
        </Ol>

        <H3>Right-Angle Orthogonal Routing (90°)</H3>
        <P>
          Toggle the <B>Garis Siku (Orthogonal)</B> button in the toolbar. The engine routes all connector paths with sharp, elegant 90-degree corners, using dynamic channel spacing to eliminate overlapping lines.
        </P>

        <H3>Multi-Element Selection & Alignment</H3>
        <P>
          Hold <Kbd>Shift</Kbd> and click multiple elements or drag a marquee box. The align toolbar appears automatically to let you:
        </P>
        <Ul>
          <li><B>Align Left / Center / Right</B>: Align nodes horizontally.</li>
          <li><B>Align Top / Middle / Bottom</B>: Align nodes vertically.</li>
          <li><B>Distribute Evenly</B>: Equidistantly space elements for clean presentation.</li>
        </Ul>
      </Section>

      {/* 12. Curated Color Palettes */}
      <Section
        id="styling"
        title="12. 1-Click Formal Palettes & Custom Styling"
        icon="🎓"
        badge="Styling"
      >
        <P>
          Deliver stunning visual presentations with one-click color presets located in the <b>Options ⚙️</b> menu and <b>Style Panel 🎨</b>:
        </P>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-4">
          <div className="p-3 rounded-lg border border-border bg-white text-slate-900 shadow-2xs">
            <div className="font-bold text-xs flex items-center gap-1.5 mb-1">
              <span>🎓</span> Skripsi Formal
            </div>
            <p className="text-[11px] text-slate-600">Pure white background, clean slate borders. Academic standard.</p>
          </div>
          <div className="p-3 rounded-lg border border-indigo-500/40 bg-indigo-50/80 text-indigo-950 shadow-2xs">
            <div className="font-bold text-xs flex items-center gap-1.5 mb-1">
              <span>💎</span> Modern Indigo
            </div>
            <p className="text-[11px] text-indigo-800">Contemporary indigo accents for professional tech architecture.</p>
          </div>
          <div className="p-3 rounded-lg border border-emerald-500/40 bg-emerald-50/80 text-emerald-950 shadow-2xs">
            <div className="font-bold text-xs flex items-center gap-1.5 mb-1">
              <span>🌿</span> Forest Emerald
            </div>
            <p className="text-[11px] text-emerald-800">Soothing emerald green for data processing and business logic.</p>
          </div>
          <div className="p-3 rounded-lg border border-amber-500/40 bg-amber-50/80 text-amber-950 shadow-2xs">
            <div className="font-bold text-xs flex items-center gap-1.5 mb-1">
              <span>🌅</span> Sunset Amber
            </div>
            <p className="text-[11px] text-amber-800">Warm amber tones for critical branches and validation flows.</p>
          </div>
          <div className="p-3 rounded-lg border border-sky-500/40 bg-sky-50/80 text-sky-950 shadow-2xs">
            <div className="font-bold text-xs flex items-center gap-1.5 mb-1">
              <span>☁️</span> Sky Cyan
            </div>
            <p className="text-[11px] text-sky-800">Light cyan tones for cloud infrastructure and networking.</p>
          </div>
          <div className="p-3 rounded-lg border border-purple-500/40 bg-slate-900 text-purple-200 shadow-2xs">
            <div className="font-bold text-xs flex items-center gap-1.5 mb-1">
              <span>🌌</span> Cyber Violet
            </div>
            <p className="text-[11px] text-purple-300">High-contrast futuristic dark mode for conference presentations.</p>
          </div>
        </div>

        <H3>Monochrome Printing Mode</H3>
        <P>
          Need to submit printed black-and-white reports? Toggle the <B>Monochrome Print Mode</B> in Options to convert all elements into crisp, high-contrast black-and-white graphics.
        </P>
      </Section>

      {/* 13. Export */}
      <Section
        id="export"
        title="13. High-DPI Export (PNG 300 DPI, SVG, PDF)"
        icon="💾"
        badge="Publication"
      >
        <P>
          Export high-resolution deliverables in one click via the <b>Export</b> menu:
        </P>

        <Ul>
          <li><B>High-Resolution PNG (300 DPI)</B>: Crisp raster images with transparent or solid backgrounds, ideal for inserting into Word documents or research papers without pixelation.</li>
          <li><B>Scalable Vector Graphics (SVG)</B>: Infinitely scalable vector standard for publication printing on A4/A3/F4 posters.</li>
          <li><B>Academic Figure Captioning</B>: Generates standard formatted citations (e.g. <i>Figure 3.1: System Architecture</i>) compliant with thesis writing handbooks.</li>
          <li><B>Project JSON</B>: Full backup files to save and reload diagrams anytime.</li>
        </Ul>
      </Section>

      {/* 14. Code Generation */}
      <Section
        id="code-generation"
        title="14. Code Generators (TypeScript, Java, & SQL DDL)"
        icon="💻"
        badge="Developer"
      >
        <P>
          Bridge the gap between design and production with our integrated code generation compiler:
        </P>

        <div className="space-y-3 my-4">
          <div className="p-3.5 rounded-xl bg-surface-2 border border-border">
            <div className="font-bold text-accent text-xs mb-1">TypeScript Code Generator</div>
            <p className="text-xs text-text-muted">
              Compiles Class Diagrams into production <code>interface</code>, <code>abstract class</code>, and <code>enum</code> structures.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-surface-2 border border-border">
            <div className="font-bold text-accent text-xs mb-1">Java OOP Code Generator</div>
            <p className="text-xs text-text-muted">
              Transforms Class Diagrams into idiomatic Java classes with private encapsulation, constructor initializers, and getters/setters.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-surface-2 border border-border">
            <div className="font-bold text-accent text-xs mb-1">SQL DDL Schema Generator</div>
            <p className="text-xs text-text-muted">
              Translates Entity Relationship Diagrams (ERD) into executable PostgreSQL/MySQL <code>CREATE TABLE</code> statements complete with <code>PRIMARY KEY</code> and <code>FOREIGN KEY</code> constraints.
            </p>
          </div>
        </div>
      </Section>

      {/* 15. Keyboard Shortcuts */}
      <Section
        id="shortcuts"
        title="15. Keyboard Shortcuts Cheatsheet"
        icon="⌨️"
        badge="Productivity"
      >
        <P>
          Accelerate your workflow with these keyboard shortcuts:
        </P>

        <div className="overflow-hidden rounded-xl border border-border/80 bg-surface-2/70 my-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-surface-3/50 border-b border-border text-[11px] font-bold uppercase text-text-muted">
                <th className="py-2.5 px-4">Keybinding</th>
                <th className="py-2.5 px-4">Action</th>
                <th className="py-2.5 px-4">Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              <tr>
                <td className="py-2.5 px-4"><Kbd>Ctrl</Kbd> + <Kbd>Enter</Kbd></td>
                <td className="py-2.5 px-4 font-medium text-text">Compile DSL code to visual canvas</td>
                <td className="py-2.5 px-4 text-text-muted">Editor</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4"><Kbd>Ctrl</Kbd> + <Kbd>Z</Kbd></td>
                <td className="py-2.5 px-4 font-medium text-text">Undo previous action</td>
                <td className="py-2.5 px-4 text-text-muted">History</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4"><Kbd>Ctrl</Kbd> + <Kbd>Y</Kbd> / <Kbd>Ctrl+Shift+Z</Kbd></td>
                <td className="py-2.5 px-4 font-medium text-text">Redo undone action</td>
                <td className="py-2.5 px-4 text-text-muted">History</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4"><Kbd>Ctrl</Kbd> + <Kbd>F</Kbd></td>
                <td className="py-2.5 px-4 font-medium text-text">Open canvas node search bar</td>
                <td className="py-2.5 px-4 text-text-muted">Canvas</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4"><Kbd>Ctrl</Kbd> + <Kbd>A</Kbd></td>
                <td className="py-2.5 px-4 font-medium text-text">Select all canvas nodes</td>
                <td className="py-2.5 px-4 text-text-muted">Canvas</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4"><Kbd>Delete</Kbd> / <Kbd>Backspace</Kbd></td>
                <td className="py-2.5 px-4 font-medium text-text">Delete selected node or relationship</td>
                <td className="py-2.5 px-4 text-text-muted">Canvas</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4"><Kbd>Space</Kbd> + <Kbd>Mouse Drag</Kbd></td>
                <td className="py-2.5 px-4 font-medium text-text">Pan across the infinite canvas</td>
                <td className="py-2.5 px-4 text-text-muted">Navigation</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4"><Kbd>Double Click</Kbd> on Element</td>
                <td className="py-2.5 px-4 font-medium text-text">Inline rename element or edge label</td>
                <td className="py-2.5 px-4 text-text-muted">Canvas</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}
