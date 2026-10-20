import type { Diagram } from "@uml-editor/shared";

function sanitizeIdentifier(name: string): string {
  const clean = (name || "state").replace(/[^a-zA-Z0-9_]/g, "_");
  return clean.replace(/^_+|_+$/g, "") || "state";
}

function capitalize(s: string): string {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Generate XState v5 Machine & TypeScript types from a State Machine diagram.
 */
export function generateXState(diagram: Diagram): string {
  if (diagram.type !== "state") {
    return "// Only state diagrams can generate XState code";
  }

  const nodes = (diagram.nodes || []).filter(
    (n) =>
      n.type === "state" ||
      n.type === "initial" ||
      n.type === "final" ||
      n.type === "composite",
  );

  const stateNodes = nodes.filter(
    (n) => n.type === "state" || n.type === "composite",
  );
  const initialNode = nodes.find(
    (n) => n.type === "initial" || n.name === "initial" || n.name === "*",
  );

  let initialTarget = stateNodes[0] ? sanitizeIdentifier(stateNodes[0].name) : "idle";
  if (initialNode) {
    const initEdge = (diagram.edges || []).find((e) => e.source === initialNode.id);
    if (initEdge) {
      const targetNode = nodes.find((n) => n.id === initEdge.target);
      if (targetNode) initialTarget = sanitizeIdentifier(targetNode.name);
    }
  }

  const machineId = sanitizeIdentifier(diagram.name || "stateMachine");
  const events = new Set<string>();

  const lines: string[] = [
    `// Auto-generated XState v5 State Machine & TypeScript types`,
    `// Diagram: ${diagram.name || "State Diagram"}`,
    `// Generated: ${new Date().toISOString()}`,
    "",
    `import { setup, createMachine } from "xstate";`,
    "",
    `export const ${machineId}Machine = createMachine({`,
    `  id: "${machineId}",`,
    `  initial: "${initialTarget}",`,
    `  states: {`,
  ];

  for (const sn of stateNodes) {
    const sName = sanitizeIdentifier(sn.name);
    const outgoing = (diagram.edges || []).filter((e) => e.source === sn.id);

    lines.push(`    ${sName}: {`);

    const transitions: Array<{ event: string; target: string }> = [];
    let isFinal = false;

    for (const edge of outgoing) {
      const targetNode = nodes.find((n) => n.id === edge.target);
      if (!targetNode) continue;

      if (
        targetNode.type === "final" ||
        targetNode.name === "final" ||
        targetNode.name === "*"
      ) {
        isFinal = true;
        continue;
      }

      const rawEvent = edge.label?.text || edge.condition || "NEXT";
      const eventName = sanitizeIdentifier(rawEvent).toUpperCase();
      events.add(eventName);
      transitions.push({
        event: eventName,
        target: sanitizeIdentifier(targetNode.name),
      });
    }

    if (isFinal && transitions.length === 0) {
      lines.push(`      type: "final",`);
    }

    if (transitions.length > 0) {
      lines.push(`      on: {`);
      for (const t of transitions) {
        lines.push(`        ${t.event}: { target: "${t.target}" },`);
      }
      lines.push(`      },`);
    }

    lines.push(`    },`);
  }

  lines.push(`  },`);
  lines.push(`});`, "");

  // TypeScript State Union
  const stateNames = stateNodes.map((s) => `"${sanitizeIdentifier(s.name)}"`);
  lines.push(
    `export type ${capitalize(machineId)}State = ${
      stateNames.join(" | ") || "string"
    };`,
  );

  // TypeScript Event Union
  const eventTypes = Array.from(events).map((e) => `{ type: "${e}" }`);
  lines.push(
    `export type ${capitalize(machineId)}Event = ${
      eventTypes.join(" | ") || `{ type: "NEXT" }`
    };`,
  );

  return lines.join("\n");
}
