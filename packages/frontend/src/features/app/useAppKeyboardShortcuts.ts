import { useEffect } from "react";
import type { Diagram } from "@uml-editor/shared";

interface UseAppKeyboardShortcutsProps {
  diagram: Diagram | null;
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  selectedEdgeId: string | null;
  setSelectedEdgeId: (id: string | null) => void;
  selectedEdgeIds: Set<string>;
  setSelectedEdgeIds: (ids: Set<string>) => void;
  onUndo: () => void;
  onRedo: () => void;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (id: string) => void;
  onDeleteMultiEdges: (ids: Set<string>) => void;
  onDuplicateNode: (id: string) => string | null | undefined;
  onNudgeNode?: (id: string, dx: number, dy: number) => void;
  onCopy: (nodes: any[], edges: any[]) => void;
  onPaste: () => { nodes: any[]; edges: any[] } | null;
  onNewTab: () => void;
  onSaveCurrent: () => void;
  showPresentation: boolean;
  setShowPresentation: (v: boolean) => void;
  onToggleShortcuts: () => void;
}

export function useAppKeyboardShortcuts({
  diagram,
  selectedNodeId,
  setSelectedNodeId,
  selectedEdgeId,
  setSelectedEdgeId,
  selectedEdgeIds,
  setSelectedEdgeIds,
  onUndo,
  onRedo,
  onDeleteNode,
  onDeleteEdge,
  onDeleteMultiEdges,
  onDuplicateNode,
  onNudgeNode,
  onCopy,
  onPaste,
  onNewTab,
  onSaveCurrent,
  showPresentation,
  setShowPresentation,
  onToggleShortcuts,
}: UseAppKeyboardShortcutsProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Global app-level keys (always active unless typing in inputs)
      if (e.ctrlKey && e.key === "n") {
        e.preventDefault();
        onNewTab();
        return;
      }
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        onSaveCurrent();
        return;
      }
      if (e.key === "Escape" && showPresentation) {
        setShowPresentation(false);
        return;
      }

      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (isInput) return;

      if (e.ctrlKey && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        onUndo();
      }
      if (e.ctrlKey && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        onRedo();
      }
      if (e.key === "?" && !e.ctrlKey) {
        onToggleShortcuts();
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        if (selectedNodeId) {
          onDeleteNode(selectedNodeId);
          setSelectedNodeId(null);
        } else if (selectedEdgeIds.size > 0) {
          onDeleteMultiEdges(selectedEdgeIds);
          setSelectedEdgeIds(new Set());
          setSelectedEdgeId(null);
        } else if (selectedEdgeId) {
          onDeleteEdge(selectedEdgeId);
          setSelectedEdgeId(null);
        }
      }

      // Arrow keys: Nudge selected node position (1px default, 10px with Shift)
      if (
        (e.key === "ArrowUp" ||
          e.key === "ArrowDown" ||
          e.key === "ArrowLeft" ||
          e.key === "ArrowRight") &&
        selectedNodeId &&
        diagram
      ) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        let dx = 0;
        let dy = 0;
        if (e.key === "ArrowUp") dy = -step;
        if (e.key === "ArrowDown") dy = step;
        if (e.key === "ArrowLeft") dx = -step;
        if (e.key === "ArrowRight") dx = step;
        onNudgeNode?.(selectedNodeId, dx, dy);
      }
      if (e.ctrlKey && e.key === "c" && diagram && selectedNodeId) {
        onCopy(
          diagram.nodes.filter((n) => n.id === selectedNodeId),
          diagram.edges
        );
      }
      if (e.ctrlKey && e.key === "v" && diagram) {
        const pasted = onPaste();
        if (pasted && pasted.nodes[0]) {
          setSelectedNodeId(pasted.nodes[0].id);
        }
      }
      if (e.ctrlKey && e.key === "d" && selectedNodeId) {
        e.preventDefault();
        const newId = onDuplicateNode(selectedNodeId);
        if (newId) setSelectedNodeId(newId);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    diagram,
    selectedNodeId,
    setSelectedNodeId,
    selectedEdgeId,
    setSelectedEdgeId,
    selectedEdgeIds,
    setSelectedEdgeIds,
    onUndo,
    onRedo,
    onDeleteNode,
    onDeleteEdge,
    onDeleteMultiEdges,
    onDuplicateNode,
    onCopy,
    onPaste,
    onNewTab,
    onSaveCurrent,
    showPresentation,
    setShowPresentation,
    onToggleShortcuts,
  ]);
}
