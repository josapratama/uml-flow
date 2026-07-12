import { useState, useEffect, useRef } from "react";

interface Props {
  onOpenEditor: () => void;
  onOpenDocs?: () => void;
}

const FEATURES = [
  {
    icon: "📝",
    title: "Custom DSL",
    desc: "Write diagrams in a simple, readable text format with syntax highlighting and real-time auto-compile.",
  },
  {
    icon: "🎨",
    title: "Visual Editor",
    desc: "Drag-and-drop nodes, draw connections, resize and style — full visual editing without touching code.",
  },
  {
    icon: "🔷",
    title: "Code Generation",
    desc: "Export class diagrams to TypeScript or Java. Import .ts/.java files to auto-generate diagrams.",
  },
  {
    icon: "📐",
    title: "Auto Layout",
    desc: "6 layout algorithms: layered, force-directed, radial, grid, linear, and sequence-optimized.",
  },
  {
    icon: "🔄",
    title: "Bi-directional Sync",
    desc: "Edit code or canvas — changes sync both ways. Visual edits generate DSL, DSL compiles to canvas.",
  },
  {
    icon: "📥",
    title: "Export Anywhere",
    desc: "Export as PNG, SVG, JSON, DSL, TypeScript, or Java. Copy to clipboard with one click.",
  },
];

const DIAGRAM_TYPES = [
  { name: "Class", icon: "🏗️", desc: "Classes, interfaces, inheritance" },
  { name: "Sequence", icon: "🔀", desc: "Object interactions over time" },
  { name: "Activity", icon: "⚡", desc: "Workflows and processes" },
  { name: "Flowchart", icon: "📊", desc: "Step-by-step decisions" },
  { name: "ERD", icon: "🗄️", desc: "Database entity relationships" },
  { name: "State", icon: "🔁", desc: "Object lifecycle states" },
  { name: "Use Case", icon: "👤", desc: "System functionality view" },
];

const STEPS = [
  {
    num: "1",
    title: "Write DSL",
    desc: "Type your diagram using our simple text syntax with auto-complete and highlighting.",
  },
  {
    num: "2",
    title: "Auto Compile",
    desc: "Your diagram renders instantly on the canvas as you type — no manual steps needed.",
  },
  {
    num: "3",
    title: "Edit & Export",
    desc: "Refine visually with drag-and-drop, then export to PNG, SVG, code, or JSON.",
  },
];

const STATS = [
  { value: "7", label: "Diagram Types" },
  { value: "6", label: "Layout Algorithms" },
  { value: "7", label: "Export Formats" },
  { value: "3", label: "Editor Modes" },
];

export function LandingPage({ onOpenEditor, onOpenDocs }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const sectionsRef = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-6");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );
    sectionsRef.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const registerSection = (id: string) => (el: HTMLElement | null) => {
    if (el) sectionsRef.current.set(id, el);
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-surface text-text overflow-y-auto scroll-smooth">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.08)_0%,transparent_60%)]" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(99,102,241,0.15) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-surface/90 backdrop-blur-xl border-b border-border shadow-lg shadow-black/20"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-linear-to-r from-accent to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                U
              </div>
              <span className="text-lg font-bold text-text">UML Editor</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollTo("features")}
                className="text-sm text-text-muted hover:text-text transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollTo("diagrams")}
                className="text-sm text-text-muted hover:text-text transition-colors"
              >
                Diagrams
              </button>
              <button
                onClick={onOpenDocs || (() => scrollTo("dsl-example"))}
                className="text-sm text-text-muted hover:text-text transition-colors"
              >
                Docs
              </button>
              <button
                onClick={onOpenEditor}
                className="px-5 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/25"
              >
                Open Editor
              </button>
            </div>
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-text-muted hover:text-text"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-surface-2/95 backdrop-blur-xl border-b border-border">
            <div className="px-4 py-3 space-y-2">
              <button
                onClick={() => scrollTo("features")}
                className="block w-full text-left px-3 py-2 text-sm text-text-muted hover:text-text rounded-lg hover:bg-surface-3"
              >
                Features
              </button>
              <button
                onClick={() => scrollTo("diagrams")}
                className="block w-full text-left px-3 py-2 text-sm text-text-muted hover:text-text rounded-lg hover:bg-surface-3"
              >
                Diagrams
              </button>
              <button
                onClick={onOpenDocs || (() => scrollTo("dsl-example"))}
                className="block w-full text-left px-3 py-2 text-sm text-text-muted hover:text-text rounded-lg hover:bg-surface-3"
              >
                Docs
              </button>
              <button
                onClick={onOpenEditor}
                className="block w-full px-3 py-2 bg-accent text-white rounded-lg text-sm font-semibold text-center"
              >
                Open Editor
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div
          ref={registerSection("hero")}
          className="opacity-0 translate-y-6 transition-all duration-700"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-2 border border-border text-xs text-text-muted mb-8">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />7
            diagram types supported
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            <span className="bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Design UML Diagrams
            </span>
            <br />
            <span className="text-text">with Code & Canvas</span>
          </h1>
          <p className="text-lg sm:text-xl text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            A powerful browser-based editor combining a custom DSL with visual
            drag-and-drop. Write text, see diagrams instantly, export to code.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onOpenEditor}
              className="px-8 py-4 bg-linear-to-r from-accent to-purple-500 hover:from-accent-hover hover:to-purple-400 text-white rounded-xl font-semibold text-lg transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/30"
            >
              🚀 Open Editor
            </button>
            <button
              onClick={onOpenDocs || (() => scrollTo("dsl-example"))}
              className="px-8 py-4 bg-surface-2 border border-border text-text rounded-xl font-semibold text-lg hover:border-accent hover:bg-surface-3 transition-all"
            >
              📖 Documentation
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section
        id="features"
        className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <div
          ref={registerSection("features")}
          className="opacity-0 translate-y-6 transition-all duration-700"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            Powerful Features
          </h2>
          <p className="text-text-muted text-center mb-16 max-w-xl mx-auto">
            Everything you need to design, visualize, and export professional
            UML diagrams.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group relative bg-surface-2/60 backdrop-blur-sm border border-border rounded-2xl p-7 hover:border-accent/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5"
              >
                <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-accent/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <span className="text-2xl mb-4 block">{f.icon}</span>
                  <h3 className="text-lg font-semibold mb-2 text-text">
                    {f.title}
                  </h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div
          ref={registerSection("how-it-works")}
          className="opacity-0 translate-y-6 transition-all duration-700"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            How It Works
          </h2>
          <p className="text-text-muted text-center mb-16">
            Three simple steps to create professional diagrams.
          </p>
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-linear-to-r from-accent/40 via-purple-500/40 to-accent/40" />
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="relative flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 rounded-full bg-linear-to-r from-accent to-purple-500 flex items-center justify-center text-white font-bold text-lg mb-5 shadow-lg shadow-accent/20 relative z-10">
                  {step.num}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diagram Types */}
      <section
        id="diagrams"
        className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <div
          ref={registerSection("diagrams")}
          className="opacity-0 translate-y-6 transition-all duration-700"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            7 Diagram Types
          </h2>
          <p className="text-text-muted text-center mb-16 max-w-xl mx-auto">
            Full UML support for software design, architecture, and
            documentation.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {DIAGRAM_TYPES.map((d) => (
              <div
                key={d.name}
                className="group bg-surface-2/60 backdrop-blur-sm border border-border rounded-xl p-5 hover:border-accent/60 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">{d.icon}</span>
                  <h3 className="font-semibold text-text">{d.name}</h3>
                </div>
                <p className="text-xs text-text-muted">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DSL Code Example */}
      <section
        id="dsl-example"
        className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto"
      >
        <div
          ref={registerSection("dsl-example")}
          className="opacity-0 translate-y-6 transition-all duration-700"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            Simple DSL Syntax
          </h2>
          <p className="text-text-muted text-center mb-16 max-w-xl mx-auto">
            Write diagrams in plain text. No complex XML or JSON — just
            readable, intuitive syntax.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Code side */}
            <div className="bg-surface-2/80 backdrop-blur-sm border border-border rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface-3/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                  <div className="w-3 h-3 rounded-full bg-green-400/60" />
                </div>
                <span className="text-xs text-text-muted ml-2">
                  diagram.uml
                </span>
              </div>
              <div className="p-5 font-mono text-sm leading-relaxed overflow-x-auto">
                <div>
                  <span className="text-purple-300">@diagram</span>{" "}
                  <span className="text-green-300">"User System"</span>{" "}
                  <span className="text-blue-300">class</span>
                </div>
                <div className="mt-3">
                  <span className="text-purple-300">class</span> User {"{"}
                </div>
                <div className="ml-4">
                  <span className="text-cyan-300">+</span>id:{" "}
                  <span className="text-blue-300">string</span>
                </div>
                <div className="ml-4">
                  <span className="text-cyan-300">+</span>name:{" "}
                  <span className="text-blue-300">string</span>
                </div>
                <div className="ml-4">
                  <span className="text-cyan-300">-</span>password:{" "}
                  <span className="text-blue-300">string</span>
                </div>
                <div className="ml-4">
                  <span className="text-cyan-300">+</span>login(user, pass):{" "}
                  <span className="text-blue-300">boolean</span>
                </div>
                <div>{"}"}</div>
                <div className="mt-3">
                  <span className="text-purple-300">interface</span>{" "}
                  Serializable {"{"}
                </div>
                <div className="ml-4">
                  <span className="text-cyan-300">+</span>serialize():{" "}
                  <span className="text-blue-300">string</span>
                </div>
                <div>{"}"}</div>
                <div className="mt-3">
                  User <span className="text-red-300">--|&gt;</span>{" "}
                  Serializable
                </div>
              </div>
            </div>
            {/* Preview side */}
            <div className="bg-surface-2/80 backdrop-blur-sm border border-border rounded-2xl p-6 flex flex-col justify-center">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success" /> Rendered
                Preview
              </h3>
              <div className="space-y-3 text-sm text-text-muted">
                <div className="bg-surface-3 border border-border rounded-lg p-3">
                  <div className="font-semibold text-text text-xs mb-1">
                    «class» User
                  </div>
                  <div className="border-t border-border pt-1 mt-1 text-xs space-y-0.5">
                    <div>
                      <span className="text-cyan-300">+</span> id: string
                    </div>
                    <div>
                      <span className="text-cyan-300">+</span> name: string
                    </div>
                    <div>
                      <span className="text-cyan-300">-</span> password: string
                    </div>
                  </div>
                  <div className="border-t border-border pt-1 mt-1 text-xs">
                    <div>
                      <span className="text-cyan-300">+</span> login(user,
                      pass): boolean
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center text-xs text-text-muted">
                  <span className="text-accent">▲</span>
                  <span className="mx-2 border-l border-dashed border-border h-4" />
                  <span>implements</span>
                </div>
                <div className="bg-surface-3 border border-border rounded-lg p-3">
                  <div className="font-semibold text-text text-xs mb-1">
                    «interface» Serializable
                  </div>
                  <div className="border-t border-border pt-1 mt-1 text-xs">
                    <div>
                      <span className="text-cyan-300">+</span> serialize():
                      string
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-text-muted mt-4">
                Auto-compiled from DSL → visual diagram in real-time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div
          ref={registerSection("stats")}
          className="opacity-0 translate-y-6 transition-all duration-700"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="text-center bg-surface-2/60 backdrop-blur-sm border border-border rounded-2xl p-6 hover:border-accent/40 transition-colors"
              >
                <div className="text-4xl font-extrabold bg-linear-to-r from-accent to-purple-400 bg-clip-text text-transparent mb-1">
                  {s.value}
                </div>
                <div className="text-sm text-text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div
          ref={registerSection("cta")}
          className="opacity-0 translate-y-6 transition-all duration-700"
        >
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-accent/20 via-purple-500/20 to-accent/20 border border-accent/30 p-10 sm:p-16 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.1)_0%,transparent_70%)]" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Design?
              </h2>
              <p className="text-text-muted mb-8 max-w-lg mx-auto">
                Start creating professional UML diagrams in seconds. No sign-up
                required — everything runs in your browser.
              </p>
              <button
                onClick={onOpenEditor}
                className="px-8 py-4 bg-linear-to-r from-accent to-purple-500 hover:from-accent-hover hover:to-purple-400 text-white rounded-xl font-semibold text-lg transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/30"
              >
                🚀 Start Creating Diagrams
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-linear-to-r from-accent to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                  U
                </div>
                <span className="font-bold text-text">UML Editor</span>
              </div>
              <p className="text-sm text-text-muted">
                A modern browser-based UML diagram editor with DSL and visual
                editing.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-text-muted">
                <li>
                  <button
                    onClick={onOpenEditor}
                    className="hover:text-text transition-colors"
                  >
                    Open Editor
                  </button>
                </li>
                <li>
                  <button
                    onClick={onOpenDocs || (() => scrollTo("features"))}
                    className="hover:text-text transition-colors"
                  >
                    Documentation
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo("features")}
                    className="hover:text-text transition-colors"
                  >
                    Features
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollTo("diagrams")}
                    className="hover:text-text transition-colors"
                  >
                    Diagram Types
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Tech Stack</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  "React",
                  "Vite",
                  "Tailwind CSS",
                  "Bun",
                  "Hono",
                  "TypeScript",
                ].map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 bg-surface-3 border border-border rounded-md text-xs text-text-muted"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-border text-center text-xs text-text-muted">
            Built with Bun, Hono, React, Vite, and Tailwind CSS
          </div>
        </div>
      </footer>
    </div>
  );
}
