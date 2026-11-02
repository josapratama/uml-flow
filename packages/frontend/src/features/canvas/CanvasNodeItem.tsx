import React from "react";
import type { DiagramNode, Position } from "@uml-editor/shared";
import { NodeRenderer } from "./nodes/NodeRenderer";
import { NodeAnchors } from "./nodes/NodeAnchors";
import { ResizeHandles, type ResizeHandle } from "./nodes/ResizeHandles";
import { getVisualSize } from "./nodes/getVisualSize";
import { resolveStyle } from "./nodes/useNodeStyle";
import { InlineEditor } from "./InlineEditor";

interface CanvasNodeItemProps {
  node: DiagramNode;
  diagramType: string;
  isSelected: boolean;
  isHovered: boolean;
  isMultiSelected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  connectingSourceId?: string;
  isEditing: boolean;
  hasMultiSelection: boolean;
  onSetHovered: (hovered: boolean) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onDragStart: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onAnchorMouseDown: (anchor: Position, side: string, e: React.MouseEvent) => void;
  onResizeStart: (handle: ResizeHandle, e: React.MouseEvent) => void;
  onQuickAddNode?: (nodeId: string) => void;
  onRenameSubmit: (val: string) => void;
  onRenameChange?: (val: string) => void;
  onRenameCancel: () => void;
  canvasTheme?: string;
}

function getInlineEditorLayout(node: DiagramNode, visualSize: { width: number; height: number }) {
  const typeStr = node.type as string;
  const isActor = typeStr === "actor";
  const isERD =
    typeStr === "entity" ||
    typeStr === "weak-entity" ||
    ("attributes" in node && !("methods" in node));
  const isClass =
    ("attributes" in node && "methods" in node) ||
    typeStr === "class" ||
    typeStr === "interface" ||
    typeStr === "abstract";
  const isSystemOrBoundary =
    typeStr === "system" || typeStr === "boundary";
  const isComponentInterface =
    typeStr === "interface" && !("methods" in node);

  const inputWidth = isActor
    ? Math.max(visualSize.width, 120)
    : Math.max(visualSize.width, 100);

  const x = Math.round(node.position.x + visualSize.width / 2 - inputWidth / 2);

  let y: number;
  if (isActor) {
    y = Math.round(
      node.position.y + Math.max(93, (86 + visualSize.height) / 2)
    );
  } else if (isERD) {
    // ERD header is 32px high; title text SVG y=21 -> vertical center of title line is at 16px
    y = Math.round(node.position.y + 16);
  } else if (isClass) {
    const hasStereo = Boolean(
      (node as any).stereotype ||
        typeStr === "interface" ||
        typeStr === "abstract"
    );
    y = Math.round(node.position.y + (hasStereo ? 28 : 15));
  } else if (isSystemOrBoundary) {
    y = Math.round(node.position.y + 14);
  } else if (isComponentInterface) {
    y = Math.round(node.position.y + visualSize.height + 12);
  } else {
    // Flowchart, UseCase ellipse, Activity, State, etc. -> text is vertically centered
    y = Math.round(node.position.y + visualSize.height / 2);
  }

  return { x, y, width: inputWidth };
}

export function CanvasNodeItem({
  node,
  diagramType,
  isSelected,
  isHovered,
  isMultiSelected,
  isConnecting,
  isReconnecting,
  connectingSourceId,
  isEditing,
  hasMultiSelection,
  onSetHovered,
  onContextMenu,
  onDragStart,
  onDoubleClick,
  onAnchorMouseDown,
  onResizeStart,
  onQuickAddNode,
  onRenameSubmit,
  onRenameChange,
  onRenameCancel,
  canvasTheme,
}: CanvasNodeItemProps) {
  const visualSize = getVisualSize(node);

  return (
    <React.Fragment key={node.id}>
      <g
        onMouseEnter={() => onSetHovered(true)}
        onMouseLeave={() => onSetHovered(false)}
        onContextMenu={onContextMenu}
      >
        <NodeRenderer
          node={node}
          diagramType={diagramType as any}
          isSelected={isSelected || isMultiSelected}
          hideText={isEditing}
          onDragStart={onDragStart}
          onDoubleClick={onDoubleClick}
          canvasTheme={canvasTheme}
        />

        {/* Drop target highlights */}
        {isConnecting && connectingSourceId !== node.id && isHovered && (
          <rect
            x={node.position.x - 3}
            y={node.position.y - 3}
            width={visualSize.width + 6}
            height={visualSize.height + 6}
            rx={6}
            fill="none"
            stroke="#6366f1"
            strokeWidth="2.5"
            strokeDasharray="5,3"
            opacity="0.7"
            style={{ pointerEvents: "none" }}
          />
        )}

        {isReconnecting && isHovered && (
          <rect
            x={node.position.x - 3}
            y={node.position.y - 3}
            width={visualSize.width + 6}
            height={visualSize.height + 6}
            rx={6}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeDasharray="5,3"
            opacity="0.7"
            style={{ pointerEvents: "none" }}
          />
        )}

        <NodeAnchors
          node={node}
          visible={isSelected || isHovered || isMultiSelected}
          onAnchorMouseDown={onAnchorMouseDown}
        />

        <ResizeHandles
          node={node}
          visible={isSelected && !hasMultiSelection}
          onResizeStart={onResizeStart}
        />

        {/* Quick-Add Node Connector button */}
        {isSelected && !hasMultiSelection && onQuickAddNode && (
          <g
            className="cursor-pointer group"
            transform={`translate(${node.position.x + visualSize.width + 16}, ${node.position.y + visualSize.height / 2})`}
            onClick={(e) => {
              e.stopPropagation();
              onQuickAddNode(node.id);
            }}
          >
            <line
              x1={-16}
              y1={0}
              x2={-4}
              y2={0}
              stroke="#6366f1"
              strokeWidth="1.5"
              strokeDasharray="2,2"
            />
            <circle
              r={10}
              fill="#6366f1"
              className="hover:fill-indigo-500 transition-colors shadow-sm"
            />
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fill="#ffffff"
              fontSize="13"
              fontWeight="bold"
              className="select-none pointer-events-none"
            >
              +
            </text>
          </g>
        )}
      </g>

      {/* Inline editor for node rename */}
      {isEditing && (
        (() => {
          const s = resolveStyle((node as any).style, canvasTheme);
          const layout = getInlineEditorLayout(node, visualSize);
          return (
            <InlineEditor
              x={layout.x}
              y={layout.y}
              width={layout.width}
              initialValue={node.name}
              onSubmit={onRenameSubmit}
              onChange={onRenameChange}
              onCancel={onRenameCancel}
              fontColor={s.fontColor}
              fontSize={s.fontSize}
              fontFamily={s.fontFamily}
              fontWeight={s.fontWeight}
            />
          );
        })()
      )}
    </React.Fragment>
  );
}
