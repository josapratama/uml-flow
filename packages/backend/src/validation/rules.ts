import type { Diagram, ClassNode, ERDEntity } from "@uml-editor/shared";

export interface ValidationIssue {
  nodeId?: string;
  edgeId?: string;
  severity: "error" | "warning" | "info";
  message: string;
  rule: string;
}

/**
 * Validates a diagram against UML/ERD rules.
 */
export function validateDiagram(diagram: Diagram): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  switch (diagram.type) {
    case "class":
      validateClassDiagram(diagram, issues);
      break;
    case "erd":
      validateERD(diagram, issues);
      break;
    case "usecase":
      validateUseCase(diagram, issues);
      break;
    case "state":
      validateState(diagram, issues);
      break;
    case "activity":
    case "flowchart":
      validateFlow(diagram, issues);
      break;
  }

  // Generic validations
  validateGeneric(diagram, issues);

  return issues;
}

function validateGeneric(diagram: Diagram, issues: ValidationIssue[]) {
  // Sequence diagrams validate participants and messages separately
  if (diagram.type === "sequence") {
    const participants = diagram.participants || [];
    const messages = diagram.messages || [];
    const pIds = new Set(participants.map((p) => p.id));
    for (const msg of messages) {
      if (!pIds.has(msg.from)) {
        issues.push({
          severity: "error",
          message: `Message source "${msg.from}" not found`,
          rule: "broken-message",
        });
      }
      if (!pIds.has(msg.to)) {
        issues.push({
          severity: "error",
          message: `Message target "${msg.to}" not found`,
          rule: "broken-message",
        });
      }
    }
    return;
  }

  // Check for orphan nodes (no connections)
  for (const node of diagram.nodes) {
    const hasEdge = diagram.edges.some(
      (e) => e.source === node.id || e.target === node.id,
    );
    if (!hasEdge && diagram.nodes.length > 1) {
      issues.push({
        nodeId: node.id,
        severity: "info",
        message: `"${node.name}" has no connections`,
        rule: "orphan-node",
      });
    }
  }

  // Check for duplicate node names
  const names = new Map<string, string>();
  for (const node of diagram.nodes) {
    if (names.has(node.name)) {
      issues.push({
        nodeId: node.id,
        severity: "warning",
        message: `Duplicate name "${node.name}"`,
        rule: "duplicate-name",
      });
    }
    names.set(node.name, node.id);
  }

  // Check for self-referencing edges
  for (const edge of diagram.edges) {
    if (edge.source === edge.target) {
      issues.push({
        edgeId: edge.id,
        severity: "info",
        message: "Self-referencing edge",
        rule: "self-reference",
      });
    }
  }

  // Check for edges pointing to non-existent nodes
  const nodeIds = new Set(diagram.nodes.map((n) => n.id));
  for (const edge of diagram.edges) {
    if (!nodeIds.has(edge.source)) {
      issues.push({
        edgeId: edge.id,
        severity: "error",
        message: `Edge source "${edge.source}" not found`,
        rule: "broken-edge",
      });
    }
    if (!nodeIds.has(edge.target)) {
      issues.push({
        edgeId: edge.id,
        severity: "error",
        message: `Edge target "${edge.target}" not found`,
        rule: "broken-edge",
      });
    }
  }
}

function validateClassDiagram(diagram: Diagram, issues: ValidationIssue[]) {
  for (const node of diagram.nodes) {
    if (!("attributes" in node)) continue;
    const cn = node as ClassNode;

    // Interface should not have private members
    if (cn.type === "interface") {
      for (const attr of cn.attributes) {
        if (attr.visibility === "-") {
          issues.push({
            nodeId: cn.id,
            severity: "warning",
            message: `Interface "${cn.name}" has private attribute "${attr.name}"`,
            rule: "interface-private",
          });
        }
      }
      for (const method of cn.methods) {
        if (method.visibility === "-") {
          issues.push({
            nodeId: cn.id,
            severity: "warning",
            message: `Interface "${cn.name}" has private method "${method.name}"`,
            rule: "interface-private",
          });
        }
      }
    }

    // Empty class warning
    if (
      cn.attributes.length === 0 &&
      cn.methods.length === 0 &&
      cn.type !== "enum"
    ) {
      issues.push({
        nodeId: cn.id,
        severity: "info",
        message: `"${cn.name}" has no members`,
        rule: "empty-class",
      });
    }

    // Circular inheritance check
    const visited = new Set<string>();
    let current = cn.id;
    while (current) {
      if (visited.has(current)) {
        issues.push({
          nodeId: cn.id,
          severity: "error",
          message: `Circular inheritance detected for "${cn.name}"`,
          rule: "circular-inheritance",
        });
        break;
      }
      visited.add(current);
      const parentEdge = diagram.edges.find(
        (e) => e.source === current && e.type === "inheritance",
      );
      current = parentEdge?.target || "";
    }
  }
}

function validateERD(diagram: Diagram, issues: ValidationIssue[]) {
  for (const node of diagram.nodes) {
    if (!("attributes" in node) || "methods" in node) continue;
    const entity = node as ERDEntity;

    // Entity must have primary key
    const hasPK = entity.attributes.some((a) => a.isPrimaryKey);
    if (!hasPK) {
      issues.push({
        nodeId: entity.id,
        severity: "warning",
        message: `Entity "${entity.name}" has no primary key`,
        rule: "erd-no-pk",
      });
    }

    // Entity should have at least one attribute
    if (entity.attributes.length === 0) {
      issues.push({
        nodeId: entity.id,
        severity: "warning",
        message: `Entity "${entity.name}" has no attributes`,
        rule: "erd-empty",
      });
    }
  }
}

function validateUseCase(diagram: Diagram, issues: ValidationIssue[]) {
  const actors = diagram.nodes.filter((n) => n.type === "actor");
  const usecases = diagram.nodes.filter((n) => n.type === "usecase");

  if (actors.length === 0) {
    issues.push({
      severity: "warning",
      message: "No actors defined",
      rule: "usecase-no-actor",
    });
  }
  if (usecases.length === 0) {
    issues.push({
      severity: "warning",
      message: "No use cases defined",
      rule: "usecase-no-usecase",
    });
  }

  // Each use case should be connected to at least one actor
  for (const uc of usecases) {
    const connected = diagram.edges.some(
      (e) =>
        (e.source === uc.id || e.target === uc.id) &&
        actors.some((a) => a.id === e.source || a.id === e.target),
    );
    if (!connected) {
      issues.push({
        nodeId: uc.id,
        severity: "info",
        message: `Use case "${uc.name}" not connected to any actor`,
        rule: "usecase-orphan",
      });
    }
  }
}

function validateState(diagram: Diagram, issues: ValidationIssue[]) {
  const hasInitial = diagram.nodes.some((n) => n.type === "initial");
  if (!hasInitial) {
    issues.push({
      severity: "warning",
      message: "No initial state defined",
      rule: "state-no-initial",
    });
  }
}

function validateFlow(diagram: Diagram, issues: ValidationIssue[]) {
  const hasStart = diagram.nodes.some((n) => n.type === "start");
  const hasEnd = diagram.nodes.some((n) => n.type === "end");
  if (!hasStart) {
    issues.push({
      severity: "warning",
      message: "No start node",
      rule: "flow-no-start",
    });
  }
  if (!hasEnd) {
    issues.push({
      severity: "info",
      message: "No end node",
      rule: "flow-no-end",
    });
  }
}
