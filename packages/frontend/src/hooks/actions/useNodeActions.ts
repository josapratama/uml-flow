import { useCallback, useRef } from "react";
import { computeFlowNodeSize } from "@uml-editor/shared";
import { snapToGrid } from "../useSnapToGrid";
import { getVisualSize } from "../../features/canvas/nodes/getVisualSize";
import type { ActionDeps } from "./types";

/** Node-related actions: move, resize, rename, style, attributes, methods. */
export function useNodeActions({ diagram, history, snapEnabled }: ActionDeps) {
  const nodeMove = useCallback(
    (nodeId: string, x: number, y: number) => {
      if (!diagram) return;
      const targetNode = diagram.nodes.find((n) => n.id === nodeId);
      if (!targetNode) return;
      const targetX = snapEnabled ? snapToGrid(x) : x;
      const targetY = snapEnabled ? snapToGrid(y) : y;
      const dx = targetX - targetNode.position.x;
      const dy = targetY - targetNode.position.y;

      const subIds = new Set<string>();
      if (targetNode.type === "composite" && (targetNode as any).substates) {
        for (const sub of (targetNode as any).substates) subIds.add(sub.id);
      }

      history.replace({
        ...diagram,
        nodes: diagram.nodes.map((n) => {
          if (n.id === nodeId) {
            return {
              ...n,
              position: { x: targetX, y: targetY },
            };
          }
          if (subIds.has(n.id)) {
            return {
              ...n,
              position: {
                x: n.position.x + dx,
                y: n.position.y + dy,
              },
            };
          }
          return n;
        }),
      });
    },
    [diagram, history, snapEnabled],
  );

  const nodeResize = useCallback(
    (nodeId: string, x: number, y: number, width: number, height: number) => {
      if (!diagram) return;
      const targetX = snapEnabled ? snapToGrid(x) : x;
      const targetY = snapEnabled ? snapToGrid(y) : y;
      const targetW = snapEnabled ? Math.max(40, snapToGrid(width)) : width;
      const targetH = snapEnabled ? Math.max(30, snapToGrid(height)) : height;
      history.replace({
        ...diagram,
        nodes: diagram.nodes.map((n) =>
          n.id === nodeId
            ? { ...n, position: { x: targetX, y: targetY }, size: { width: targetW, height: targetH } }
            : n,
        ),
      });
    },
    [diagram, history, snapEnabled],
  );

  const multiNodeMove = useCallback(
    (nodeIds: string[], dx: number, dy: number) => {
      if (!diagram || (dx === 0 && dy === 0)) return;
      history.replace({
        ...diagram,
        nodes: diagram.nodes.map((n) => {
          if (!nodeIds.includes(n.id)) return n;
          return {
            ...n,
            position: {
              x: Math.round(n.position.x + dx),
              y: Math.round(n.position.y + dy),
            },
          };
        }),
      });
    },
    [diagram, history],
  );

  /** Recompute a node's size from its text/style. Flow-like diagrams use smart wrapping. */
  const fitSize = (node: any, fontSize: number, style?: any) => {
    const diagType = diagram?.type;
    if ("attributes" in node) {
      return getVisualSize({ ...node, style: { ...(style ?? node.style), fontSize } });
    }
    if (diagType === "flowchart" || diagType === "activity" || diagType === "state") {
      if (node.type !== "composite") {
        return computeFlowNodeSize(node.type, node.name || "", fontSize, diagType);
      }
    }
    // Other diagrams: keep width, grow height only if wrapped text needs it
    return getVisualSize({ ...node, style: { ...(style ?? node.style), fontSize } });
  };

  /** Rapid successive edits (sliders, color drags) collapse into a single undo step. */
  const lastEditRef = useRef<{ key: string; t: number }>({ key: "", t: 0 });
  const commitCoalesced = (next: any, key: string) => {
    const now = Date.now();
    const same = lastEditRef.current.key === key && now - lastEditRef.current.t < 700;
    lastEditRef.current = { key, t: now };
    if (same) history.replace(next);
    else history.set(next);
  };

  const nodeRename = useCallback(
    (nodeId: string, newName: string) => {
      const cleaned = newName.replace(/\r/g, "").trim();
      if (!diagram || !cleaned) return;
      const targetNode = diagram.nodes.find((n) => n.id === nodeId);
      if (!targetNode || targetNode.name === cleaned) return;
      history.set({
        ...diagram,
        nodes: diagram.nodes.map((n) => {
          if (n.id !== nodeId) return n;
          const renamed: any = { ...n, name: cleaned };
          const fs = (n as any).style?.fontSize || 13;
          const flowLike =
            diagram.type === "flowchart" ||
            diagram.type === "activity" ||
            diagram.type === "state";
          if (flowLike || "attributes" in n) {
            renamed.size = fitSize(renamed, fs);
          } else {
            const w = Math.min(360, Math.max(n.size.width, cleaned.length * 9 + 40));
            renamed.size = { ...n.size, width: w };
            renamed.size = getVisualSize(renamed);
          }
          return renamed;
        }),
      });
    },
    [diagram, history],
  );

  /** Edit name and/or size from the properties panel. */
  const nodeUpdate = useCallback(
    (nodeId: string, patch: { name?: string; width?: number; height?: number }) => {
      if (!diagram) return;
      const node = diagram.nodes.find((n) => n.id === nodeId);
      if (!node) return;
      if (patch.name !== undefined && patch.name.trim() !== node.name) {
        nodeRename(nodeId, patch.name);
        return;
      }
      if (patch.width === undefined && patch.height === undefined) return;
      const width = Math.max(20, Math.round(patch.width ?? node.size.width));
      const height = Math.max(20, Math.round(patch.height ?? node.size.height));
      history.set({
        ...diagram,
        nodes: diagram.nodes.map((n) =>
          n.id === nodeId ? { ...n, size: { width, height } } : n,
        ),
      });
    },
    [diagram, history, nodeRename],
  );

  const nodeAutoFit = useCallback(
    (nodeId: string) => {
      if (!diagram) return;
      history.set({
        ...diagram,
        nodes: diagram.nodes.map((n) => {
          if (n.id !== nodeId) return n;
          const fs = (n as any).style?.fontSize || 13;
          return { ...n, size: fitSize(n, fs) };
        }),
      });
    },
    [diagram, history],
  );

  const nodeStyleChange = useCallback(
    (nodeId: string, style: any) => {
      if (!diagram) return;
      commitCoalesced(
        {
          ...diagram,
          nodes: diagram.nodes.map((n) => {
            if (n.id !== nodeId) return n;
            const prevFs = (n as any).style?.fontSize || 13;
            const fs = style.fontSize || 13;
            const updated: any = { ...n, style: Object.keys(style).length ? style : undefined };
            if (fs !== prevFs) updated.size = fitSize(updated, fs, style);
            return updated;
          }),
        },
        `style:${nodeId}`,
      );
    },
    [diagram, history],
  );

  const globalStyleChange = useCallback(
    (style: any, setGlobalStyle: (s: any) => void) => {
      setGlobalStyle(style);
      if (!diagram) return;
      const isReset = Object.keys(style).length === 0;
      commitCoalesced(
        {
          ...diagram,
          nodes: diagram.nodes.map((n) => {
            const prevStyle = (n as any).style || {};
            const newStyle = isReset ? undefined : { ...prevStyle, ...style };
            const prevFs = prevStyle.fontSize || 13;
            const fs = newStyle?.fontSize || 13;
            const updated: any = { ...n, style: newStyle };
            if (fs !== prevFs) updated.size = fitSize(updated, fs, newStyle);
            return updated;
          }),
        },
        "style:global",
      );
    },
    [diagram, history],
  );

  /** Copy this node's style to every node of the same type. */
  const applyStyleToSameType = useCallback(
    (nodeId: string) => {
      if (!diagram) return;
      const src: any = diagram.nodes.find((n) => n.id === nodeId);
      if (!src) return;
      history.set({
        ...diagram,
        nodes: diagram.nodes.map((n: any) =>
          n.type === src.type && n.id !== nodeId
            ? { ...n, style: src.style ? { ...src.style } : undefined }
            : n,
        ),
      });
    },
    [diagram, history],
  );

  const addNode = useCallback(
    (node: any) => {
      if (!diagram) return;
      history.set({ ...diagram, nodes: [...diagram.nodes, node] });
    },
    [diagram, history],
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      if (!diagram) return;
      history.set({
        ...diagram,
        nodes: diagram.nodes.filter((n) => n.id !== nodeId),
        edges: diagram.edges.filter(
          (e) => e.source !== nodeId && e.target !== nodeId,
        ),
      });
    },
    [diagram, history],
  );

  const duplicateNode = useCallback(
    (nodeId: string): string | null => {
      if (!diagram) return null;
      const node = diagram.nodes.find((n) => n.id === nodeId);
      if (!node) return null;
      const dup = {
        ...structuredClone(node),
        id: `${node.id}_dup_${Date.now()}`,
        position: { x: node.position.x + 30, y: node.position.y + 30 },
      };
      history.set({ ...diagram, nodes: [...diagram.nodes, dup] });
      return dup.id;
    },
    [diagram, history],
  );

  const addAttribute = useCallback(
    (nodeId: string, name: string, type: string, visibility: string) => {
      if (!diagram) return;
      history.set({
        ...diagram,
        nodes: diagram.nodes.map((n) => {
          if (n.id !== nodeId || !("attributes" in n)) return n;
          const cn = n as any;
          const updated = {
            ...cn,
            attributes: [...cn.attributes, { visibility, name, type }],
          };
          return { ...updated, size: getVisualSize(updated as any) };
        }),
      });
    },
    [diagram, history],
  );

  const addMethod = useCallback(
    (nodeId: string, name: string, returnType: string, visibility: string) => {
      if (!diagram) return;
      history.set({
        ...diagram,
        nodes: diagram.nodes.map((n) => {
          if (n.id !== nodeId || !("methods" in n)) return n;
          const cn = n as any;
          const updated = {
            ...cn,
            methods: [
              ...cn.methods,
              { visibility, name, params: [], returnType },
            ],
          };
          return { ...updated, size: getVisualSize(updated as any) };
        }),
      });
    },
    [diagram, history],
  );

  const deleteAttribute = useCallback(
    (nodeId: string, index: number) => {
      if (!diagram) return;
      history.set({
        ...diagram,
        nodes: diagram.nodes.map((n) => {
          if (n.id !== nodeId || !("attributes" in n)) return n;
          const cn = n as any;
          const attrs = [...cn.attributes];
          attrs.splice(index, 1);
          const updated = { ...cn, attributes: attrs };
          return { ...updated, size: getVisualSize(updated as any) };
        }),
      });
    },
    [diagram, history],
  );

  const deleteMethod = useCallback(
    (nodeId: string, index: number) => {
      if (!diagram) return;
      history.set({
        ...diagram,
        nodes: diagram.nodes.map((n) => {
          if (n.id !== nodeId || !("methods" in n)) return n;
          const cn = n as any;
          const methods = [...cn.methods];
          methods.splice(index, 1);
          const updated = { ...cn, methods };
          return { ...updated, size: getVisualSize(updated as any) };
        }),
      });
    },
    [diagram, history],
  );

  const addERDColumn = useCallback(
    (
      nodeId: string,
      name: string,
      type: string,
      isPK: boolean,
      isFK: boolean,
      isNullable: boolean,
    ) => {
      if (!diagram) return;
      history.set({
        ...diagram,
        nodes: diagram.nodes.map((n) => {
          if (n.id !== nodeId || !("attributes" in n) || "methods" in n)
            return n;
          const erd = n as any;
          const updated = {
            ...erd,
            attributes: [
              ...erd.attributes,
              {
                name,
                type,
                isPrimaryKey: isPK,
                isForeignKey: isFK,
                isNullable,
                isUnique: false,
              },
            ],
          };
          return { ...updated, size: getVisualSize(updated as any) };
        }),
      });
    },
    [diagram, history],
  );

  const deleteERDColumn = useCallback(
    (nodeId: string, index: number) => {
      if (!diagram) return;
      history.set({
        ...diagram,
        nodes: diagram.nodes.map((n) => {
          if (n.id !== nodeId || !("attributes" in n) || "methods" in n)
            return n;
          const erd = n as any;
          const attrs = [...erd.attributes];
          attrs.splice(index, 1);
          const updated = { ...erd, attributes: attrs };
          return { ...updated, size: getVisualSize(updated as any) };
        }),
      });
    },
    [diagram, history],
  );

  return {
    nodeMove,
    nodeResize,
    multiNodeMove,
    nodeRename,
    nodeStyleChange,
    globalStyleChange,
    nodeUpdate,
    nodeAutoFit,
    applyStyleToSameType,
    addNode,
    deleteNode,
    duplicateNode,
    addAttribute,
    addMethod,
    deleteAttribute,
    deleteMethod,
    addERDColumn,
    deleteERDColumn,
  };
}
