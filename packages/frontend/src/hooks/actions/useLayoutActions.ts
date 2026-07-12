import { useCallback } from "react";
import type { Diagram } from "@uml-editor/shared";
import { api } from "../../services/api";
import type { ActionDeps } from "./types";

/** Layout actions: align, distribute, group, layout selection. */
export function useLayoutActions({ diagram, history }: ActionDeps) {
  const alignNodes = useCallback(
    (
      nodeIds: string[],
      alignment: "left" | "center" | "right" | "top" | "middle" | "bottom",
    ) => {
      if (!diagram || nodeIds.length < 2) return;
      const targets = diagram.nodes.filter((n) => nodeIds.includes(n.id));
      if (targets.length < 2) return;
      let ref: number;
      switch (alignment) {
        case "left":
          ref = Math.min(...targets.map((n) => n.position.x));
          break;
        case "right":
          ref = Math.max(...targets.map((n) => n.position.x + n.size.width));
          break;
        case "center":
          ref =
            (Math.min(...targets.map((n) => n.position.x)) +
              Math.max(...targets.map((n) => n.position.x + n.size.width))) /
            2;
          break;
        case "top":
          ref = Math.min(...targets.map((n) => n.position.y));
          break;
        case "bottom":
          ref = Math.max(...targets.map((n) => n.position.y + n.size.height));
          break;
        case "middle":
          ref =
            (Math.min(...targets.map((n) => n.position.y)) +
              Math.max(...targets.map((n) => n.position.y + n.size.height))) /
            2;
          break;
      }
      history.set({
        ...diagram,
        nodes: diagram.nodes.map((n) => {
          if (!nodeIds.includes(n.id)) return n;
          switch (alignment) {
            case "left":
              return { ...n, position: { ...n.position, x: ref } };
            case "right":
              return {
                ...n,
                position: { ...n.position, x: ref - n.size.width },
              };
            case "center":
              return {
                ...n,
                position: { ...n.position, x: ref - n.size.width / 2 },
              };
            case "top":
              return { ...n, position: { ...n.position, y: ref } };
            case "bottom":
              return {
                ...n,
                position: { ...n.position, y: ref - n.size.height },
              };
            case "middle":
              return {
                ...n,
                position: { ...n.position, y: ref - n.size.height / 2 },
              };
            default:
              return n;
          }
        }),
      });
    },
    [diagram, history],
  );

  const distributeNodes = useCallback(
    (nodeIds: string[], direction: "horizontal" | "vertical") => {
      if (!diagram || nodeIds.length < 3) return;
      const targets = diagram.nodes.filter((n) => nodeIds.includes(n.id));
      if (targets.length < 3) return;
      const sorted = [...targets].sort((a, b) =>
        direction === "horizontal"
          ? a.position.x - b.position.x
          : a.position.y - b.position.y,
      );
      const first = sorted[0],
        last = sorted[sorted.length - 1];
      const totalSpan =
        direction === "horizontal"
          ? last.position.x + last.size.width - first.position.x
          : last.position.y + last.size.height - first.position.y;
      const totalNodeSize = sorted.reduce(
        (sum, n) =>
          sum + (direction === "horizontal" ? n.size.width : n.size.height),
        0,
      );
      const gap = (totalSpan - totalNodeSize) / (sorted.length - 1);
      let pos =
        direction === "horizontal" ? first.position.x : first.position.y;
      const posMap = new Map<string, number>();
      for (const n of sorted) {
        posMap.set(n.id, pos);
        pos +=
          (direction === "horizontal" ? n.size.width : n.size.height) + gap;
      }
      history.set({
        ...diagram,
        nodes: diagram.nodes.map((n) => {
          if (!posMap.has(n.id)) return n;
          const newPos = posMap.get(n.id)!;
          return direction === "horizontal"
            ? { ...n, position: { ...n.position, x: newPos } }
            : { ...n, position: { ...n.position, y: newPos } };
        }),
      });
    },
    [diagram, history],
  );

  const groupNodes = useCallback(
    (nodeIds: string[]): string | null => {
      if (!diagram || nodeIds.length < 2) return null;
      const targets = diagram.nodes.filter((n) => nodeIds.includes(n.id));
      if (targets.length < 2) return null;
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
      for (const n of targets) {
        minX = Math.min(minX, n.position.x);
        minY = Math.min(minY, n.position.y);
        maxX = Math.max(maxX, n.position.x + n.size.width);
        maxY = Math.max(maxY, n.position.y + n.size.height);
      }
      const pad = 30;
      const groupNode: any = {
        id: `group_${Date.now()}`,
        type: "note",
        name: "Group",
        position: { x: minX - pad, y: minY - pad },
        size: { width: maxX - minX + pad * 2, height: maxY - minY + pad * 2 },
      };
      history.set({ ...diagram, nodes: [groupNode, ...diagram.nodes] });
      return groupNode.id;
    },
    [diagram, history],
  );

  const layoutSelection = useCallback(
    async (nodeIds: string[], preset: string = "layered") => {
      if (!diagram || nodeIds.length < 2) return;
      const selectedSet = new Set(nodeIds);
      const subDiagram: Diagram = {
        ...diagram,
        nodes: diagram.nodes.filter((n) => selectedSet.has(n.id)),
        edges: diagram.edges.filter(
          (e) => selectedSet.has(e.source) && selectedSet.has(e.target),
        ),
      };
      try {
        const result = await api.layout(subDiagram, undefined, preset);
        if (result.diagram) {
          const posMap = new Map(
            result.diagram.nodes.map((n) => [n.id, n.position]),
          );
          history.set({
            ...diagram,
            nodes: diagram.nodes.map((n) => {
              const newPos = posMap.get(n.id);
              return newPos ? { ...n, position: newPos } : n;
            }),
          });
        }
      } catch {}
    },
    [diagram, history],
  );

  return { alignNodes, distributeNodes, groupNodes, layoutSelection };
}
