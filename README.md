# uml-flow

A browser-based UML diagram editor with a custom DSL, visual canvas, and AI-assisted diagram generation.

## Features

- **9 diagram types** — Class, Sequence, Activity, Flowchart, ERD, State (with composite states), Use Case, Component, Deployment
- **Dual editing modes** — write DSL code or drag-and-drop visually on the canvas (split/code/visual)
- **Multi-diagram workspace** — tabbed interface with a diagram library (persisted to localStorage)
- **AI diagram generation** — describe in plain text, get DSL (supports OpenAI-compatible APIs)
- **Export** — SVG (auto-sized), PNG, JSON, DSL, TypeScript/Java code generation
- **Diff viewer** — compare current diagram against any saved version
- **Templates** — save and reuse diagram templates
- **Presentation mode** — fullscreen view of any diagram
- **Undo/redo** — 50-step history with visual history panel
- **File persistence** — backend stores diagrams to `.data/diagrams.json` (survives restarts)

## Quick Start

```bash
# Install dependencies
bun install

# Start both backend (port 3001) and frontend (port 5173) with one command
bun run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Project Structure

```
packages/
  frontend/    React 19 + Vite + Tailwind CSS 4
  backend/     Bun + Hono API server
  shared/      TypeScript types shared between front and back
```

## DSL Examples

**Class diagram**

```
@diagram "My App" class

class User {
  +id: string
  -password: string
  +login(username: string, password: string): boolean
}

User --|> BaseEntity
```

**Component diagram**

```
@diagram "Architecture" component

component "API Gateway"
component "Auth Service"
component "Database" <<storage>>

"API Gateway" --> "Auth Service"
"Auth Service" --> "Database"
```

**Composite state**

```
@diagram "Player" state

state "Playing" {
  [initial]
  state Buffering
  state Active
  [initial] --> Buffering
  Buffering --> Active : ready
}
```

## Tech Stack

- **Frontend** — React 19, Vite 8, Tailwind CSS 4, TypeScript
- **Backend** — Bun runtime, Hono framework
- **Monorepo** — Bun workspaces, Concurrently
