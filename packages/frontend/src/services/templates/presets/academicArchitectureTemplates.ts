import type { DiagramTemplate } from "./types";

export const ACADEMIC_ARCHITECTURE_TEMPLATES: DiagramTemplate[] = [
  {
    id: "tmpl_architecture_3tier",
    name: "Arsitektur Sistem 3-Tier (Web & Mobile)",
    description:
      "Struktur arsitektur perangkat lunak skripsi: Presentation Layer, Application Layer, dan Data Layer.",
    category: "architecture",
    tag: "Arsitektur",
    isBuiltIn: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    dsl: `@diagram "Arsitektur 3-Tier" component

component "Presentation Layer\\n(React Web & Flutter Mobile)" as c_ui
component "Application Layer\\n(REST API & Auth Service)" as c_api
component "Data Layer\\n(PostgreSQL Database Server)" as c_db
component "External Services\\n(Payment & Email Gateway)" as c_ext

c_ui -> c_api : "HTTPS / JSON"
c_api -> c_db : "SQL Query"
c_api -> c_ext : "Third-party API"`,
    diagram: {
      id: "diagram_3tier",
      name: "Arsitektur 3-Tier",
      type: "component",
      nodes: [
        {
          id: "c_ui",
          name: "Presentation Layer\n(React Web & Flutter Mobile)",
          type: "component" as any,
          position: { x: 80, y: 70 },
          size: { width: 280, height: 80 },
          style: { backgroundColor: "#e0e7ff", borderColor: "#6366f1" },
        },
        {
          id: "c_api",
          name: "Application Layer\n(REST API & Auth Service)",
          type: "component" as any,
          position: { x: 80, y: 200 },
          size: { width: 280, height: 80 },
          style: { backgroundColor: "#fef3c7", borderColor: "#f59e0b" },
        },
        {
          id: "c_db",
          name: "Data Layer\n(PostgreSQL Database Server)",
          type: "component" as any,
          position: { x: 80, y: 330 },
          size: { width: 280, height: 80 },
          style: { backgroundColor: "#d1fae5", borderColor: "#10b981" },
        },
        {
          id: "c_ext",
          name: "External Services\n(Payment & Email Gateway)",
          type: "component" as any,
          position: { x: 440, y: 200 },
          size: { width: 240, height: 80 },
          style: { backgroundColor: "#ffe4e6", borderColor: "#f43f5e" },
        },
      ],
      edges: [
        {
          id: "e_c1",
          source: "c_ui",
          target: "c_api",
          type: "flow",
          label: { text: "HTTPS / JSON" },
        },
        {
          id: "e_c2",
          source: "c_api",
          target: "c_db",
          type: "flow",
          label: { text: "SQL Query" },
        },
        {
          id: "e_c3",
          source: "c_api",
          target: "c_ext",
          type: "flow",
          label: { text: "Third-party API" },
        },
      ],
      metadata: {
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        version: 1,
      },
    },
  },
];
