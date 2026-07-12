import { useMemo } from "react";
import type { Diagram } from "@uml-editor/shared";
import {
  validateDiagramNodes,
  type NodeWarning,
} from "../../services/diagram-validator";
import { getVisualSize } from "./nodes/getVisualSize";

interface Props {
  diagram: Diagram;
}

/**
 * Renders small warning/info icons on nodes that have validation issues.
 * Positioned at top-right corner of each node.
 */
export function ValidationOverlay({ diagram }: Props) {
  const warnings = useMemo(() => validateDiagramNodes(diagram), [diagram]);

  if (warnings.length === 0) return null;

  // Group by node
  const byNode = new Map<string, NodeWarning[]>();
  for (const w of warnings) {
    if (!byNode.has(w.nodeId)) byNode.set(w.nodeId, []);
    byNode.get(w.nodeId)!.push(w);
  }

  return (
    <g className="validation-overlay" style={{ pointerEvents: "none" }}>
      {Array.from(byNode.entries()).map(([nodeId, nodeWarnings]) => {
        const node = diagram.nodes.find((n) => n.id === nodeId);
        if (!node) return null;
        const size = getVisualSize(node);
        const x = node.position.x + size.width - 6;
        const y = node.position.y - 6;
        const hasWarning = nodeWarnings.some((w) => w.severity === "warning");
        const color = hasWarning ? "#f59e0b" : "#6366f1";
        const title = nodeWarnings.map((w) => w.message).join("\n");

        return (
          <g key={nodeId} style={{ pointerEvents: "auto" }}>
            <title>{title}</title>
            <circle
              cx={x}
              cy={y}
              r={7}
              fill={color}
              stroke="white"
              strokeWidth="1.5"
            />
            <text
              x={x}
              y={y + 3.5}
              textAnchor="middle"
              fontSize="9"
              fill="white"
              fontWeight="bold"
            >
              {hasWarning ? "!" : "i"}
            </text>
          </g>
        );
      })}
    </g>
  );
}
