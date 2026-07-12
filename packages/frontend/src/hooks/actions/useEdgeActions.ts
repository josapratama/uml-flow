import { useCallback } from "react";
import type { Diagram, Position } from "@uml-editor/shared";
import type { ActionDeps } from "./types";

/** Edge-related actions: waypoints, reconnect, style, type, reverse, label. */
export function useEdgeActions({ diagram, history }: ActionDeps) {
  const edgeWaypointMove = useCallback(
    (edgeId: string, idx: number, x: number, y: number) => {
      if (!diagram) return;
      history.replace({
        ...diagram,
        edges: diagram.edges.map((e) => {
          if (e.id !== edgeId) return e;
          const pts = [...(e.points || [])];
          if (pts.length === 0) pts.push({ x, y });
          else pts[idx] = { x, y };
          return { ...e, points: pts };
        }),
      });
    },
    [diagram, history],
  );

  const edgeWaypointAdd = useCallback(
    (edgeId: string, afterIdx: number, pt: Position) => {
      if (!diagram) return;
      history.set({
        ...diagram,
        edges: diagram.edges.map((e) => {
          if (e.id !== edgeId) return e;
          const pts = [...(e.points || [])];
          pts.splice(afterIdx, 0, pt);
          return { ...e, points: pts };
        }),
      });
    },
    [diagram, history],
  );

  const edgeWaypointDelete = useCallback(
    (edgeId: string, waypointIndex: number) => {
      if (!diagram) return;
      history.set({
        ...diagram,
        edges: diagram.edges.map((e) => {
          if (e.id !== edgeId || !e.points) return e;
          const pts = [...e.points];
          pts.splice(waypointIndex, 1);
          return { ...e, points: pts.length > 0 ? pts : undefined };
        }),
      });
    },
    [diagram, history],
  );

  const edgeEndpointDrag = useCallback(
    (edgeId: string, end: "source" | "target", anchor: string) => {
      if (!diagram) return;
      history.set({
        ...diagram,
        edges: diagram.edges.map((e) => {
          if (e.id !== edgeId) return e;
          return end === "source"
            ? { ...e, sourceAnchor: anchor as any }
            : { ...e, targetAnchor: anchor as any };
        }),
      });
    },
    [diagram, history],
  );

  const edgeReconnect = useCallback(
    (
      edgeId: string,
      end: "source" | "target",
      newNodeId: string,
      anchorSide?: string,
    ) => {
      if (!diagram) return;
      const edge = diagram.edges.find((e) => e.id === edgeId);
      if (!edge) return;
      if (end === "source" && newNodeId === edge.target) return;
      if (end === "target" && newNodeId === edge.source) return;
      const isSameNode =
        (end === "source" && newNodeId === edge.source) ||
        (end === "target" && newNodeId === edge.target);
      history.set({
        ...diagram,
        edges: diagram.edges.map((e) => {
          if (e.id !== edgeId) return e;
          if (end === "source")
            return {
              ...e,
              source: newNodeId,
              sourceAnchor: (anchorSide as any) || undefined,
              points: isSameNode ? e.points : undefined,
            };
          return {
            ...e,
            target: newNodeId,
            targetAnchor: (anchorSide as any) || undefined,
            points: isSameNode ? e.points : undefined,
          };
        }),
      });
    },
    [diagram, history],
  );

  const edgeStyleChange = useCallback(
    (edgeId: string, style: any) => {
      if (!diagram) return;
      history.set({
        ...diagram,
        edges: diagram.edges.map((e) =>
          e.id === edgeId ? { ...e, style } : e,
        ),
      });
    },
    [diagram, history],
  );

  const edgeTypeChange = useCallback(
    (edgeId: string, type: string) => {
      if (!diagram) return;
      history.set({
        ...diagram,
        edges: diagram.edges.map((e) =>
          e.id === edgeId ? { ...e, type: type as any } : e,
        ),
      });
    },
    [diagram, history],
  );

  const edgeReverse = useCallback(
    (edgeId: string) => {
      if (!diagram) return;
      history.set({
        ...diagram,
        edges: diagram.edges.map((e) => {
          if (e.id !== edgeId) return e;
          return {
            ...e,
            source: e.target,
            target: e.source,
            sourceAnchor: e.targetAnchor,
            targetAnchor: e.sourceAnchor,
            sourceLabel: e.targetLabel,
            targetLabel: e.sourceLabel,
            points: e.points ? [...e.points].reverse() : undefined,
          };
        }),
      });
    },
    [diagram, history],
  );

  const edgeLabelEdit = useCallback(
    (edgeId: string, label: string) => {
      if (!diagram) return;
      history.set({
        ...diagram,
        edges: diagram.edges.map((e) =>
          e.id === edgeId
            ? {
                ...e,
                label: label ? { text: label, ...(e.label || {}) } : undefined,
              }
            : e,
        ),
      });
    },
    [diagram, history],
  );

  const edgeLabelMove = useCallback(
    (edgeId: string, offsetX: number, offsetY: number) => {
      if (!diagram) return;
      history.replace({
        ...diagram,
        edges: diagram.edges.map((e) => {
          if (e.id !== edgeId || !e.label) return e;
          return { ...e, label: { ...e.label, offsetX, offsetY } };
        }),
      });
    },
    [diagram, history],
  );

  const addEdge = useCallback(
    (
      sourceId: string,
      targetId: string,
      type: string,
      sourceAnchor?: string,
      targetAnchor?: string,
    ) => {
      if (!diagram || sourceId === targetId) return;
      history.set({
        ...diagram,
        edges: [
          ...diagram.edges,
          {
            id: `edge_${sourceId}_${targetId}_${Date.now()}`,
            source: sourceId,
            target: targetId,
            type: type as any,
            sourceAnchor: sourceAnchor as any,
            targetAnchor: targetAnchor as any,
          },
        ],
      });
    },
    [diagram, history],
  );

  const deleteEdge = useCallback(
    (edgeId: string) => {
      if (!diagram) return;
      history.set({
        ...diagram,
        edges: diagram.edges.filter((e) => e.id !== edgeId),
      });
    },
    [diagram, history],
  );

  return {
    edgeWaypointMove,
    edgeWaypointAdd,
    edgeWaypointDelete,
    edgeEndpointDrag,
    edgeReconnect,
    edgeStyleChange,
    edgeTypeChange,
    edgeReverse,
    edgeLabelEdit,
    edgeLabelMove,
    addEdge,
    deleteEdge,
  };
}
