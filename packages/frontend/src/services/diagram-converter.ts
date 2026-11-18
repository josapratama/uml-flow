import type { Diagram, DiagramNode, Edge, ClassNode, ERDEntity, ActivityNode, FlowchartNode, SequenceParticipant as Participant, SequenceMessage as Message } from "@uml-editor/shared";

export type ConversionTarget = "class" | "erd" | "activity" | "flowchart" | "sequence";

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
        {
          target: "sequence",
          labelId: "Sequence Diagram (Interaksi Objek & Method)",
          labelEn: "Sequence Diagram (Object & Method Interaction)",
          descId: "Generate alur pemanggilan method antar Class menjadi Sequence Diagram",
          descEn: "Generate chronological method call interactions across Classes",
        },
      ];
    case "usecase":
      return [
        {
          target: "sequence",
          labelId: "Sequence Diagram (Alur Boundary-Control-Entity)",
          labelEn: "Sequence Diagram (Boundary-Control-Entity Flow)",
          descId: "Generate interaksi Aktor → Sistem Boundary → Database dari Use Case",
          descEn: "Generate Actor → System Boundary → Database sequence flow from Use Cases",
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

export function convertUseCaseToSequence(diagram: Diagram): Diagram {
  const actors = diagram.nodes.filter((n) => (n.type as string) === "actor");
  const usecases = diagram.nodes.filter((n) => (n.type as string) === "usecase");

  const participants: Participant[] = [];
  const spacing = 190;

  // Add actors as participants
  if (actors.length > 0) {
    actors.forEach((a, idx) => {
      participants.push({
        id: a.id,
        name: a.name,
        type: "actor",
        position: { x: 100 + idx * spacing, y: 60 },
      });
    });
  } else {
    participants.push({
      id: "actor_user",
      name: "User",
      type: "actor",
      position: { x: 100, y: 60 },
    });
  }

  const sysIdx = participants.length;
  const sysId = "p_system_boundary";
  const dbId = "p_database_entity";

  participants.push(
    {
      id: sysId,
      name: diagram.name && diagram.name !== "Untitled" ? diagram.name : "System Controller",
      type: "boundary",
      position: { x: 100 + sysIdx * spacing, y: 60 },
    },
    {
      id: dbId,
      name: "Database",
      type: "entity",
      position: { x: 100 + (sysIdx + 1) * spacing, y: 60 },
    }
  );

  const messages: Message[] = [];
  let order = 1;

  for (const uc of usecases) {
    // Find actor connected to this usecase
    const actorEdge = diagram.edges.find(
      (e) =>
        (e.source === uc.id && actors.some((a) => a.id === e.target)) ||
        (e.target === uc.id && actors.some((a) => a.id === e.source))
    );
    const actorId = actorEdge
      ? actorEdge.source === uc.id
        ? actorEdge.target
        : actorEdge.source
      : participants[0].id;

    // 1. Request from Actor to System
    messages.push({
      id: `msg_${order}`,
      from: actorId,
      to: sysId,
      label: `Request: ${uc.name}`,
      type: "sync",
      order: order++,
    });

    // 2. Check if this use case includes another use case
    const includeEdges = diagram.edges.filter(
      (e) =>
        e.source === uc.id &&
        (e.type === "include" || (e.label?.text || "").toLowerCase().includes("include"))
    );
    for (const inc of includeEdges) {
      const targetUc = usecases.find((u) => u.id === inc.target);
      if (targetUc) {
        messages.push({
          id: `msg_${order}`,
          from: sysId,
          to: sysId,
          label: `Verify <<include>>: ${targetUc.name}`,
          type: "self",
          order: order++,
        });
      }
    }

    // 3. Query/Persist to Database
    messages.push({
      id: `msg_${order}`,
      from: sysId,
      to: dbId,
      label: `Process & Query (${uc.name})`,
      type: "sync",
      order: order++,
    });

    // 4. Return from Database
    messages.push({
      id: `msg_${order}`,
      from: dbId,
      to: sysId,
      label: `Result OK`,
      type: "return",
      order: order++,
    });

    // 5. Response back to Actor
    messages.push({
      id: `msg_${order}`,
      from: sysId,
      to: actorId,
      label: `Response: ${uc.name} Berhasil`,
      type: "return",
      order: order++,
    });
  }

  return {
    id: `seq_${Date.now()}`,
    name: `${diagram.name} (Sequence)`,
    type: "sequence",
    nodes: [],
    edges: [],
    participants,
    messages,
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    },
  };
}

export function convertClassToSequence(diagram: Diagram): Diagram {
  const classes = diagram.nodes as ClassNode[];
  const spacing = 190;
  const participants: Participant[] = [
    {
      id: "p_client",
      name: "Client / Caller",
      type: "actor",
      position: { x: 100, y: 60 },
    },
    ...classes.map((cls, idx) => ({
      id: cls.id,
      name: cls.name,
      type: "object" as const,
      position: { x: 100 + (idx + 1) * spacing, y: 60 },
    })),
  ];

  const messages: Message[] = [];
  let order = 1;

  for (const cls of classes) {
    const methods = cls.methods || [];
    const firstMethod = methods[0]?.name ? `${methods[0].name}()` : `execute${cls.name}()`;

    messages.push({
      id: `msg_${order}`,
      from: "p_client",
      to: cls.id,
      label: firstMethod,
      type: "sync",
      order: order++,
    });

    // Check outgoing class relations
    const relatedEdges = diagram.edges.filter((e) => e.source === cls.id && e.target !== cls.id);
    for (const rel of relatedEdges) {
      const targetCls = classes.find((c) => c.id === rel.target);
      if (targetCls) {
        const targetMethod =
          targetCls.methods?.[0]?.name ? `${targetCls.methods[0].name}()` : `load${targetCls.name}()`;
        messages.push({
          id: `msg_${order}`,
          from: cls.id,
          to: targetCls.id,
          label: targetMethod,
          type: "sync",
          order: order++,
        });
        messages.push({
          id: `msg_${order}`,
          from: targetCls.id,
          to: cls.id,
          label: `${targetCls.name}Data`,
          type: "return",
          order: order++,
        });
      }
    }

    messages.push({
      id: `msg_${order}`,
      from: cls.id,
      to: "p_client",
      label: `return ${methods[0]?.returnType || "Result"}`,
      type: "return",
      order: order++,
    });
  }

  return {
    id: `seq_${Date.now()}`,
    name: `${diagram.name} (Sequence)`,
    type: "sequence",
    nodes: [],
    edges: [],
    participants,
    messages,
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
  if (diagram.type === "class" && target === "sequence") return convertClassToSequence(diagram);
  if (diagram.type === "usecase" && target === "sequence") return convertUseCaseToSequence(diagram);
  if (diagram.type === "flowchart" && target === "activity") return convertFlowchartToActivity(diagram);
  if (diagram.type === "activity" && target === "flowchart") return convertActivityToFlowchart(diagram);
  return null;
}
