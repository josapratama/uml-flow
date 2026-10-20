import type { DiagramType } from "@uml-editor/shared";

/** Creates a default node for the given diagram type (used by palette). */
export function createDefaultNode(
  nodeType: string,
  diagramType: DiagramType,
  index: number,
): any {
  const x = 100 + (index % 4) * 220;
  const y = 100 + Math.floor(index / 4) * 180;
  const id = `node_new_${Date.now()}`;

  // Note type is universal across all diagram types
  if (nodeType === "note") {
    return {
      id,
      type: "note",
      name: "Note",
      position: { x, y },
      size: { width: 160, height: 100 },
    };
  }

  // System Boundary grouping container is universal across all diagram types
  if (nodeType === "system" || nodeType === "boundary") {
    return {
      id,
      type: "system",
      name: "System Boundary",
      position: { x, y },
      size: { width: 340, height: 260 },
      style: {
        borderStyle: "dashed",
        borderWidth: 1.5,
        borderColor: "#94a3b8",
        backgroundColor: "transparent",
      },
    };
  }

  switch (diagramType) {
    case "class":
      return {
        id,
        type: nodeType,
        name: `New${cap(nodeType)}`,
        position: { x, y },
        size: { width: 180, height: 80 },
        attributes: [],
        methods: [],
      };
    case "activity":
      if (nodeType === "start" || nodeType === "end")
        return {
          id,
          type: nodeType,
          name: nodeType === "start" ? "●" : "◉",
          position: { x, y },
          size: { width: 30, height: 30 },
        };
      if (nodeType === "decision")
        return {
          id,
          type: nodeType,
          name: "?",
          position: { x, y },
          size: { width: 60, height: 60 },
        };
      return {
        id,
        type: nodeType,
        name: "New Action",
        position: { x, y },
        size: { width: 140, height: 40 },
      };
    case "flowchart":
      if (nodeType === "start" || nodeType === "end")
        return {
          id,
          type: nodeType,
          name: cap(nodeType),
          position: { x, y },
          size: { width: 80, height: 40 },
        };
      if (nodeType === "decision")
        return {
          id,
          type: nodeType,
          name: "?",
          position: { x, y },
          size: { width: 100, height: 80 },
        };
      return {
        id,
        type: nodeType,
        name: "New Node",
        position: { x, y },
        size: { width: 140, height: 45 },
      };
    case "erd":
      return {
        id,
        type: "entity",
        name: "NewEntity",
        position: { x, y },
        size: { width: 200, height: 80 },
        attributes: [],
      };
    case "state":
      if (nodeType === "initial")
        return {
          id,
          type: "initial",
          name: "●",
          position: { x, y },
          size: { width: 24, height: 24 },
        };
      if (nodeType === "final")
        return {
          id,
          type: "final",
          name: "◉",
          position: { x, y },
          size: { width: 24, height: 24 },
        };
      if (nodeType === "composite")
        return {
          id,
          type: "composite",
          name: "CompositeState",
          position: { x, y },
          size: { width: 220, height: 130 },
          substates: [],
        };
      return {
        id,
        type: "state",
        name: "NewState",
        position: { x, y },
        size: { width: 100, height: 50 },
      };
    case "usecase":
      if (nodeType === "actor")
        return {
          id,
          type: "actor",
          name: "Actor",
          position: { x, y },
          size: { width: 60, height: 100 },
        };
      if (nodeType === "system")
        return {
          id,
          type: "system",
          name: "System",
          position: { x, y },
          size: { width: 300, height: 300 },
        };
      return {
        id,
        type: "usecase",
        name: "New UseCase",
        position: { x, y },
        size: { width: 140, height: 50 },
      };
    case "component":
      if (
        nodeType === "interface-provided" ||
        nodeType === "interface-required"
      )
        return {
          id,
          type: nodeType,
          name: "Interface",
          position: { x, y },
          size: { width: 40, height: 40 },
        };
      return {
        id,
        type: "component",
        name: "NewComponent",
        position: { x, y },
        size: { width: 160, height: 60 },
      };
    case "deployment":
      if (nodeType === "artifact")
        return {
          id,
          type: "artifact",
          name: "artifact.jar",
          position: { x, y },
          size: { width: 130, height: 50 },
        };
      if (nodeType === "device")
        return {
          id,
          type: "device",
          name: "NewDevice",
          position: { x, y },
          size: { width: 160, height: 70 },
        };
      return {
        id,
        type: "node",
        name: "NewNode",
        position: { x, y },
        size: { width: 160, height: 70 },
      };
    default:
      return {
        id,
        type: nodeType,
        name: "New Node",
        position: { x, y },
        size: { width: 140, height: 60 },
      };
  }
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
