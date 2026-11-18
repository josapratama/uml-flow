import type { Diagram, DiagramNode, Edge, ClassNode, ERDEntity, ActivityNode, FlowchartNode } from "@uml-editor/shared";

export type ConversionTarget = "class" | "erd" | "activity" | "flowchart";

export function getAvailableConversions(type: string): { target: ConversionTarget; labelId: string; labelEn: string; descId: string; descEn: string }[] {
  switch (type) {
    case "erd":
      return [
        {
          target: "class",
          labelId: "Class Diagram (OOP Model)",
          labelEn: "Class Diagram (OOP Model)",
          descId: "Konversi entitas DB ke Class OOP & tipe data TypeScript",
          descEn: "Convert DB entities to OOP Classes & TS data types",
        },
      ];
    case "class":
      return [
        {
          target: "erd",
          labelId: "Entity Relationship Diagram (ERD)",
          labelEn: "Entity Relationship Diagram (ERD)",
          descId: "Konversi Class ke Tabel Database relasional lengkap dengan PK & FK",
          descEn: "Convert Classes to Relational Database Tables with PK & FK",
        },
      ];
    case "flowchart":
      return [
        {
          target: "activity",
          labelId: "Activity Diagram (UML Bab 3)",
          labelEn: "Activity Diagram (UML Ch. 3)",
          descId: "Konversi alur flowchart ke Activity Diagram resmi skripsi",
          descEn: "Convert flowchart process to standard UML Activity Diagram",
        },
      ];
    case "activity":
      return [
        {
          target: "flowchart",
          labelId: "Flowchart (Diagram Alir Sistem)",
          labelEn: "Flowchart (System Flow)",
          descId: "Konversi aksi aktivitas ke simbol flowchart proses & keputusan",
          descEn: "Convert activity actions to standard process & decision flowchart symbols",
        },
      ];
    default:
      return [];
  }
}

function mapSqlTypeToTs(sqlType: string): string {
  const t = sqlType.toLowerCase();
  if (t.includes("int") || t.includes("float") || t.includes("double") || t.includes("decimal") || t.includes("numeric")) {
    return "number";
  }
  if (t.includes("bool")) {
    return "boolean";
  }
  if (t.includes("date") || t.includes("time")) {
    return "Date";
  }
  if (t.includes("json")) {
    return "Record<string, any>";
  }
  return "string";
}

function mapTsTypeToSql(tsType: string, isPk: boolean): string {
  const t = tsType.toLowerCase();
  if (isPk) return "BIGINT";
  if (t.includes("number")) return "INT";
  if (t.includes("bool")) return "BOOLEAN";
  if (t.includes("date")) return "TIMESTAMP";
  if (t.includes("float") || t.includes("double")) return "DECIMAL(10,2)";
  return "VARCHAR(255)";
}

export function convertErdToClass(diagram: Diagram): Diagram {
  const newNodes: DiagramNode[] = diagram.nodes.map((node) => {
    const erd = node as ERDEntity;
    const className = erd.name.charAt(0).toUpperCase() + erd.name.slice(1);
    const attributes = (erd.attributes || []).map((attr) => ({
      visibility: "+" as const,
      name: attr.name,
      type: mapSqlTypeToTs(attr.type || "string"),
    }));

    const classNode: ClassNode = {
      id: erd.id,
      type: "class",
      name: className,
      position: { ...erd.position },
      size: {
        width: Math.max(erd.size?.width || 180, 160),
        height: Math.max(erd.size?.height || 120, 100),
      },
      attributes,
      methods: [
        {
          visibility: "+" as const,
          name: `save`,
          params: [],
          returnType: "Promise<boolean>",
        },
        {
          visibility: "+" as const,
          name: `delete`,
          params: [],
          returnType: "Promise<boolean>",
        },
      ],
    };
    return classNode;
  });

  const newEdges: Edge[] = diagram.edges.map((e) => {
    let sourceLabel = "1";
    let targetLabel = "*";
    if (e.type === "one-to-one") {
      sourceLabel = "1";
      targetLabel = "1";
    } else if (e.type === "many-to-many") {
      sourceLabel = "*";
      targetLabel = "*";
    }

    return {
      id: e.id,
      source: e.source,
      target: e.target,
      type: "association",
      sourceLabel,
      targetLabel,
      label: e.label,
    };
  });

  return {
    id: `class_${Date.now()}`,
    name: `${diagram.name} (Class Model)`,
    type: "class",
    nodes: newNodes,
    edges: newEdges,
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    },
  };
}

export function convertClassToErd(diagram: Diagram): Diagram {
  const newNodes: DiagramNode[] = diagram.nodes.map((node) => {
    const cls = node as ClassNode;
    const entityName = cls.name;
    const attributes = (cls.attributes || []).map((attr, idx) => {
      const isPk = attr.name.toLowerCase() === "id" || attr.name.toLowerCase() === `${entityName}_id` || idx === 0;
      return {
        name: attr.name,
        type: mapTsTypeToSql(attr.type || "string", isPk),
        isPrimaryKey: isPk,
        isForeignKey: attr.name.toLowerCase().endsWith("_id") && !isPk,
        isNullable: !isPk,
        isUnique: isPk,
      };
    });

    // Ensure has at least 1 PK
    if (!attributes.some((a) => a.isPrimaryKey)) {
      attributes.unshift({
        name: "id",
        type: "BIGINT",
        isPrimaryKey: true,
        isForeignKey: false,
        isNullable: false,
        isUnique: true,
      });
    }

    const erdNode: ERDEntity = {
      id: cls.id,
      type: "entity",
      name: entityName,
      position: { ...cls.position },
      size: {
        width: Math.max(cls.size?.width || 200, 180),
        height: Math.max(cls.size?.height || 140, 120),
      },
      attributes,
    };
    return erdNode;
  });

  const newEdges: Edge[] = diagram.edges.map((e) => {
    return {
      id: e.id,
      source: e.source,
      target: e.target,
      type: e.sourceLabel === "1" && e.targetLabel === "1" ? "one-to-one" : "one-to-many",
      label: e.label,
    };
  });

  return {
    id: `erd_${Date.now()}`,
    name: `${diagram.name} (ERD)`,
    type: "erd",
    nodes: newNodes,
    edges: newEdges,
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    },
  };
}

export function convertFlowchartToActivity(diagram: Diagram): Diagram {
  const newNodes: DiagramNode[] = diagram.nodes.map((node) => {
    const fc = node as FlowchartNode;
    let actType: ActivityNode["type"] = "action";
    let sz = { width: fc.size?.width || 160, height: fc.size?.height || 50 };

    if (fc.type === "start") {
      actType = "start";
      sz = { width: 32, height: 32 };
    } else if (fc.type === "end") {
      actType = "end";
      sz = { width: 32, height: 32 };
    } else if (fc.type === "decision") {
      actType = "decision";
      sz = { width: 100, height: 60 };
    }

    const actNode: ActivityNode = {
      id: fc.id,
      type: actType,
      name: fc.name,
      position: { ...fc.position },
      size: sz,
    };
    return actNode;
  });

  const newEdges: Edge[] = diagram.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: "flow",
    label: e.label,
  }));

  return {
    id: `activity_${Date.now()}`,
    name: `${diagram.name} (Activity)`,
    type: "activity",
    nodes: newNodes,
    edges: newEdges,
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    },
  };
}

export function convertActivityToFlowchart(diagram: Diagram): Diagram {
  const newNodes: DiagramNode[] = diagram.nodes.map((node) => {
    const act = node as ActivityNode;
    let fcType: FlowchartNode["type"] = "process";
    let sz = { width: act.size?.width || 160, height: act.size?.height || 50 };

    if (act.type === "start") {
      fcType = "start";
      sz = { width: 120, height: 40 };
    } else if (act.type === "end") {
      fcType = "end";
      sz = { width: 120, height: 40 };
    } else if (act.type === "decision") {
      fcType = "decision";
      sz = { width: 120, height: 60 };
    }

    const fcNode: FlowchartNode = {
      id: act.id,
      type: fcType,
      name: act.name,
      position: { ...act.position },
      size: sz,
    };
    return fcNode;
  });

  const newEdges: Edge[] = diagram.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: "flow",
    label: e.label,
  }));

  return {
    id: `flowchart_${Date.now()}`,
    name: `${diagram.name} (Flowchart)`,
    type: "flowchart",
    nodes: newNodes,
    edges: newEdges,
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    },
  };
}

export function convertDiagram(diagram: Diagram, target: ConversionTarget): Diagram | null {
  if (diagram.type === "erd" && target === "class") return convertErdToClass(diagram);
  if (diagram.type === "class" && target === "erd") return convertClassToErd(diagram);
  if (diagram.type === "flowchart" && target === "activity") return convertFlowchartToActivity(diagram);
  if (diagram.type === "activity" && target === "flowchart") return convertActivityToFlowchart(diagram);
  return null;
}
