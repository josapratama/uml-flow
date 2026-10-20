import type { DiagramType } from "@uml-editor/shared";

export interface DiagramTypeInfo {
  id: DiagramType;
  label: string;
  icon: string;
  descId: string;
  descEn: string;
  category: "structural" | "behavioral" | "flow";
}

export const DIAGRAM_TYPES: DiagramTypeInfo[] = [
  {
    id: "class",
    label: "Class Diagram",
    icon: "📋",
    descId: "Struktur kelas OOP, atribut, metode & pewarisan",
    descEn: "OOP classes, attributes, methods & inheritance",
    category: "structural",
  },
  {
    id: "sequence",
    label: "Sequence Diagram",
    icon: "🔄",
    descId: "Interaksi antar aktor, lifeline, & alur pesan",
    descEn: "Actor lifelines, messages & sequence flow",
    category: "behavioral",
  },
  {
    id: "flowchart",
    label: "Flowchart",
    icon: "📊",
    descId: "Alur proses, keputusan logika, I/O & database",
    descEn: "Process workflows, decision logic, I/O & database",
    category: "flow",
  },
  {
    id: "erd",
    label: "Database ERD",
    icon: "🗄️",
    descId: "Tabel entitas, primary/foreign key & relasi data",
    descEn: "Entity tables, primary/foreign keys & relations",
    category: "structural",
  },
  {
    id: "state",
    label: "State Machine",
    icon: "⚡",
    descId: "Status transisi, state awal/akhir & substate",
    descEn: "State transitions, initial/final states & substates",
    category: "behavioral",
  },
  {
    id: "usecase",
    label: "Use Case Diagram",
    icon: "🎯",
    descId: "Aktor, fungsi use case, & batasan sistem",
    descEn: "Actors, use cases & system boundary",
    category: "behavioral",
  },
  {
    id: "activity",
    label: "Activity Diagram",
    icon: "🏃",
    descId: "Aktivitas alur kerja, percabangan fork & join",
    descEn: "Workflow activities, forks, joins & decisions",
    category: "behavioral",
  },
  {
    id: "component",
    label: "Component Diagram",
    icon: "🧩",
    descId: "Komponen modul perangkat lunak & interface",
    descEn: "Software component modules & port interfaces",
    category: "structural",
  },
  {
    id: "deployment",
    label: "Deployment Diagram",
    icon: "🖥️",
    descId: "Infrastruktur node fisik, server & artifact",
    descEn: "Physical nodes, devices, servers & artifacts",
    category: "structural",
  },
];

export const STARTER_DSL: Record<DiagramType, string> = {
  class: `@diagram "Class Diagram" class

class Entitas {
  +id: int
  +nama: string
}
`,

  sequence: `@diagram "Sequence Diagram" sequence

participant User as actor
participant Sistem as object

User -> Sistem: request()
`,

  flowchart: `@diagram "Flowchart" flowchart

start "Mulai"
process "Langkah 1"
end "Selesai"

"Mulai" -> "Langkah 1" -> "Selesai"
`,

  erd: `@diagram "ERD Diagram" erd

entity User {
  *id: int
  nama: varchar
}

entity Order {
  *id: int
  user_id: int [fk]
}

User ||--o{ Order : places
`,

  state: `@diagram "State Diagram" state

[initial]
state "Aktif"
[final]

[initial] --> "Aktif"
"Aktif" --> [final]
`,

  usecase: `@diagram "Use Case Diagram" usecase

actor Pengguna
usecase "Fitur Utama"

Pengguna --> "Fitur Utama"
`,

  activity: `@diagram "Activity Diagram" activity

[start]
action "Aktivitas 1"
[end]

[start] --> "Aktivitas 1" --> [end]
`,

  component: `@diagram "Component Diagram" component

component "Frontend"
component "Backend API"

"Frontend" --> "Backend API"
`,

  deployment: `@diagram "Deployment Diagram" deployment

node "Client Device"
node "Server"

"Client Device" --> "Server"
`,
};
