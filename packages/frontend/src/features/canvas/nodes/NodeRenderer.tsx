import React from "react";
import type { DiagramNode, DiagramType } from "@uml-editor/shared";
import { ClassNodeRenderer } from "./ClassNode";
import { ActivityNodeRenderer } from "./ActivityNode";
import { FlowchartNodeRenderer } from "./FlowchartNode";
import { ERDNodeRenderer } from "./ERDNode";
import { UseCaseNodeRenderer } from "./UseCaseNode";
import { StateNodeRenderer } from "./StateNode";
import { NoteNodeRenderer } from "./NoteNode";
import { ComponentNodeRenderer } from "./ComponentNode";
import { DeploymentNodeRenderer } from "./DeploymentNode";

interface Props {
  node: DiagramNode;
  diagramType: DiagramType;
  isSelected: boolean;
  hideText?: boolean;
  onDragStart: (e: React.MouseEvent) => void;
  onDoubleClick?: () => void;
}

/** Routes to the correct node renderer based on diagram type. */
export function NodeRenderer({
  node,
  diagramType,
  isSelected,
  hideText,
  onDragStart,
  onDoubleClick,
}: Props) {
  const props = { node: node as any, isSelected, onDragStart, hideText };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDoubleClick?.();
  };

  return (
    <g onDoubleClick={handleDoubleClick}>
      {(() => {
        // Note nodes are universal across all diagram types
        if ((node.type as string) === "note") {
          return (
            <NoteNodeRenderer
              node={node}
              isSelected={isSelected}
              onDragStart={onDragStart}
              hideText={hideText}
            />
          );
        }
        switch (diagramType) {
          case "activity":
            return <ActivityNodeRenderer {...props} />;
          case "flowchart":
            return <FlowchartNodeRenderer {...props} />;
          case "erd":
            return <ERDNodeRenderer {...props} />;
          case "usecase":
            return <UseCaseNodeRenderer {...props} />;
          case "state":
            return <StateNodeRenderer {...props} />;
          case "component":
            return <ComponentNodeRenderer {...props} />;
          case "deployment":
            return <DeploymentNodeRenderer {...props} />;
          default:
            return <ClassNodeRenderer {...props} />;
        }
      })()}
    </g>
  );
}
