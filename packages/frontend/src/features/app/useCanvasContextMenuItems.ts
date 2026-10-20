import React, { useCallback } from "react";
import type { Diagram, Position } from "@uml-editor/shared";
import type { ContextMenuItem } from "../canvas/ContextMenu";
import type { CanvasTheme } from "../../hooks/useTheme";
import {
  buildNodeContextMenuItems,
  buildEdgeContextMenuItems,
  buildCanvasContextMenuItems,
} from "./context-menu";

interface ContextMenuTarget {
  type: "canvas" | "node" | "edge";
  id?: string;
  worldPos: Position;
  multiNodeIds?: string[];
}

interface UseCanvasContextMenuItemsOptions {
  diagram: Diagram | null;
  diagramHistory: any;
  actions: any;
  copy: (nodes: any[], edges: any[]) => void;
  paste: (dx?: number, dy?: number) => { nodes: any[]; edges: any[] } | null;
  hasClipboard: boolean;
  canvasTheme: CanvasTheme;
  toggleCanvasTheme: () => void;
  snapEnabled: boolean;
  setSnapEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  edgeRouting: "straight" | "orthogonal";
  handleEdgeRoutingToggle: () => void;
  handleLayout: (preset: string) => void;
  handleQuickAddNode: (nodeId: string) => void;
  setSelectedNodeId: (id: string | null) => void;
  setSelectedEdgeId: (id: string | null) => void;
  setShowStylePanel: (type: "node" | "global" | "edge" | null) => void;
  setContextMenu: (
    menu: { x: number; y: number; items: ContextMenuItem[] } | null
  ) => void;
}

import { useI18n } from "../../i18n";

export function useCanvasContextMenuItems({
  diagram,
  diagramHistory,
  actions,
  copy,
  paste,
  hasClipboard,
  canvasTheme,
  toggleCanvasTheme,
  snapEnabled,
  setSnapEnabled,
  edgeRouting,
  handleEdgeRoutingToggle,
  handleLayout,
  handleQuickAddNode,
  setSelectedNodeId,
  setSelectedEdgeId,
  setShowStylePanel,
  setContextMenu,
}: UseCanvasContextMenuItemsOptions) {
  const { locale } = useI18n();

  const handleCanvasContextMenu = useCallback(
    (e: React.MouseEvent, target: ContextMenuTarget) => {
      e.preventDefault();
      if (!diagram) return;

      let items: ContextMenuItem[] = [];

      if (target.type === "node") {
        items = buildNodeContextMenuItems({
          diagram,
          nodeId: target.id,
          multiNodeIds: target.multiNodeIds,
          canvasTheme,
          actions,
          copy,
          diagramHistory,
          setSelectedNodeId,
          handleQuickAddNode,
          locale,
        });
      } else if (target.type === "edge") {
        items = buildEdgeContextMenuItems({
          diagram,
          edgeId: target.id,
          worldPos: target.worldPos,
          actions,
          setSelectedEdgeId,
          setShowStylePanel,
          locale,
        });
      } else if (target.type === "canvas") {
        items = buildCanvasContextMenuItems({
          diagram,
          worldPos: target.worldPos,
          diagramHistory,
          setSelectedNodeId,
          hasClipboard,
          paste,
          handleLayout,
          canvasTheme,
          toggleCanvasTheme,
          snapEnabled,
          setSnapEnabled,
          edgeRouting,
          handleEdgeRoutingToggle,
          locale,
        });
      }

      setContextMenu({ x: e.clientX, y: e.clientY, items });
    },
    [
      diagram,
      diagramHistory,
      actions,
      copy,
      paste,
      hasClipboard,
      canvasTheme,
      toggleCanvasTheme,
      snapEnabled,
      setSnapEnabled,
      edgeRouting,
      handleEdgeRoutingToggle,
      handleLayout,
      handleQuickAddNode,
      setSelectedNodeId,
      setSelectedEdgeId,
      setShowStylePanel,
      setContextMenu,
      locale,
    ]
  );

  return { handleCanvasContextMenu };
}
