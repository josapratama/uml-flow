import React from "react";
import type { DiagramNode, Position } from "@uml-editor/shared";
import { getVisualSize } from "./getVisualSize";

interface Props {
  node: DiagramNode;
  visible: boolean;
  onResizeStart: (handle: ResizeHandle, e: React.MouseEvent) => void;
}

export type ResizeHandle = "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w";

const HANDLE_SIZE = 7;

/**
 * Renders resize handles around a selected node.
 * 4 corners + 4 edges for full resize control.
 */
export function ResizeHandles({ node, visible, onResizeStart }: Props) {
  if (!visible) return null;

  const { position } = node;
  const size = getVisualSize(node);
  const x = position.x;
  const y = position.y;
  const w = size.width;
  const h = size.height;

  const handles: {
    id: ResizeHandle;
    cx: number;
    cy: number;
    cursor: string;
  }[] = [
    { id: "nw", cx: x, cy: y, cursor: "nw-resize" },
    { id: "ne", cx: x + w, cy: y, cursor: "ne-resize" },
    { id: "sw", cx: x, cy: y + h, cursor: "sw-resize" },
    { id: "se", cx: x + w, cy: y + h, cursor: "se-resize" },
    { id: "n", cx: x + w / 2, cy: y, cursor: "n-resize" },
    { id: "s", cx: x + w / 2, cy: y + h, cursor: "s-resize" },
    { id: "w", cx: x, cy: y + h / 2, cursor: "w-resize" },
    { id: "e", cx: x + w, cy: y + h / 2, cursor: "e-resize" },
  ];

  return (
    <g className="resize-handles">
      {handles.map((handle) => (
        <rect
          key={handle.id}
          x={handle.cx - HANDLE_SIZE / 2}
          y={handle.cy - HANDLE_SIZE / 2}
          width={HANDLE_SIZE}
          height={HANDLE_SIZE}
          fill="white"
          stroke="#6366f1"
          strokeWidth="1.5"
          style={{ cursor: handle.cursor }}
          onMouseDown={(e) => {
            e.stopPropagation();
            onResizeStart(handle.id, e);
          }}
        />
      ))}
    </g>
  );
}

/**
 * Calculate new position and size based on resize handle drag.
 */
export function calculateResize(
  handle: ResizeHandle,
  originalPos: Position,
  originalSize: { width: number; height: number },
  dx: number,
  dy: number,
  minWidth: number = 60,
  minHeight: number = 30,
): { position: Position; size: { width: number; height: number } } {
  let x = originalPos.x;
  let y = originalPos.y;
  let w = originalSize.width;
  let h = originalSize.height;

  switch (handle) {
    case "se":
      w = Math.max(minWidth, w + dx);
      h = Math.max(minHeight, h + dy);
      break;
    case "sw":
      x = x + dx;
      w = Math.max(minWidth, w - dx);
      h = Math.max(minHeight, h + dy);
      if (w === minWidth) x = originalPos.x + originalSize.width - minWidth;
      break;
    case "ne":
      y = y + dy;
      w = Math.max(minWidth, w + dx);
      h = Math.max(minHeight, h - dy);
      if (h === minHeight) y = originalPos.y + originalSize.height - minHeight;
      break;
    case "nw":
      x = x + dx;
      y = y + dy;
      w = Math.max(minWidth, w - dx);
      h = Math.max(minHeight, h - dy);
      if (w === minWidth) x = originalPos.x + originalSize.width - minWidth;
      if (h === minHeight) y = originalPos.y + originalSize.height - minHeight;
      break;
    case "n":
      y = y + dy;
      h = Math.max(minHeight, h - dy);
      if (h === minHeight) y = originalPos.y + originalSize.height - minHeight;
      break;
    case "s":
      h = Math.max(minHeight, h + dy);
      break;
    case "w":
      x = x + dx;
      w = Math.max(minWidth, w - dx);
      if (w === minWidth) x = originalPos.x + originalSize.width - minWidth;
      break;
    case "e":
      w = Math.max(minWidth, w + dx);
      break;
  }

  return { position: { x, y }, size: { width: w, height: h } };
}
