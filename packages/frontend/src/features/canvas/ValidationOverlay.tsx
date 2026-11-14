import { useMemo } from "react";
import type { Diagram } from "@uml-editor/shared";
import {
  validateDiagramNodes,
  type NodeWarning,
} from "../../services/diagram-validator";
import { getVisualSize } from "./nodes/getVisualSize";
import { useI18n } from "../../i18n";

interface Props {
  diagram: Diagram;
  onAutoRepair?: () => void;
}

/**
 * Renders small warning/info icons on nodes that have validation issues.
 * Positioned at top-right corner of each node.
 */
export function ValidationOverlay({ diagram, onAutoRepair }: Props) {
  const { locale } = useI18n();
  const warnings = useMemo(() => validateDiagramNodes(diagram, locale), [diagram, locale]);

  if (warnings.length === 0) return null;

  // Group by node
  const byNode = new Map<string, NodeWarning[]>();
  for (const w of warnings) {
    if (!byNode.has(w.nodeId)) byNode.set(w.nodeId, []);
    byNode.get(w.nodeId)!.push(w);
  }

  const isId = locale === "id";

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
        const titleMsg = nodeWarnings.map((w) => w.message).join("\n");
        const title = onAutoRepair
          ? `${titleMsg}\n${isId ? "(Klik untuk perbaiki diagram otomatis)" : "(Click to auto-repair diagram)"}`
          : titleMsg;

        return (
          <g
            key={nodeId}
            style={{ pointerEvents: "auto", cursor: onAutoRepair ? "pointer" : "default" }}
            onClick={(e) => {
              e.stopPropagation();
              onAutoRepair?.();
            }}
          >
            <title>{title}</title>
            <circle
              cx={x}
              cy={y}
              r={7.5}
              fill={color}
              stroke="white"
              strokeWidth="1.5"
              className={onAutoRepair ? "hover:scale-125 transition-transform" : ""}
            />
            <text
              x={x}
              y={y + 3.5}
              textAnchor="middle"
              fontSize="9"
              fill="white"
              fontWeight="bold"
              className="select-none pointer-events-none"
            >
              {hasWarning ? "!" : "i"}
            </text>
          </g>
        );
      })}
    </g>
  );
}
