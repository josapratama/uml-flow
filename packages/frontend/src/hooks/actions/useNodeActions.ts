import { useCallback } from "react";
import { snapToGrid } from "../useSnapToGrid";
import { getVisualSize } from "../../features/canvas/nodes/getVisualSize";
import type { ActionDeps } from "./types";

/** Node-related actions: move, resize, rename, style, attributes, methods. */
export function useNodeActions({ diagram, history, snapEnabled }: ActionDeps) {
  const nodeMove = useCallback(
    (nodeId: string, x: number, y: number) => {
      if (!diagram) return;
      history.replace({
        ...diagram,
        nodes: diagram.nodes.map((n) =>
          n.id === nodeId
            ? {
                ...n,
                position: {
                  x: snapEnabled ? snapToGrid(x) : x,
                  y: snapEnabled ? snapToGrid(y) : y,
                },
              }
            : n,
        ),
      });
    },
    [diagram, history, snapEnabled],
  );

  const nodeResize = useCallback(
    (nodeId: string, x: number, y: number, width: number, height: number) => {
      if (!diagram) return;
      history.replace({
        ...diagram,
        nodes: diagram.nodes.map((n) =>
          n.id === nodeId
            ? { ...n, position: { x, y }, size: { width, height } }
            : n,
        ),
      });
    },
    [diagram, history],
  );

  const multiNodeMove = useCallback(
    (nodeIds: string[], dx: number, dy: number) => {
      if (!diagram) return;
      history.replace({
        ...diagram,
        nodes: diagram.nodes.map((n) => {
          if (!nodeIds.includes(n.id)) return n;
          const nx = snapEnabled
            ? snapToGrid(n.position.x + dx)
            : n.position.x + dx;
          const ny = snapEnabled
            ? snapToGrid(n.position.y + dy)
            : n.position.y + dy;
          return { ...n, position: { x: nx, y: ny } };
        }),
      });
    },
    [diagram, history, snapEnabled],
  );

  const nodeRename = useCallback(
    (nodeId: string, newName: string) => {
      if (!diagram || !newName.trim()) return;
      history.set({
        ...diagram,
        nodes: diagram.nodes.map((n) => {
          if (n.id !== nodeId) return n;
          const minWidth = Math.max(
            n.size.width,
            newName.trim().length * 9 + 40,
          );
          return {
            ...n,
            name: newName.trim(),
            size: { ...n.size, width: minWidth },
          };
        }),
      });
    },
    [diagram, history],
  );

  const nodeStyleChange = useCallback(
    (nodeId: string, style: any) => {
      if (!diagram) return;
      history.set({
        ...diagram,
        nodes: diagram.nodes.map((n) => {
          if (n.id !== nodeId) return n;
          const fontSize = style.fontSize || 13;
          const charW = fontSize * 0.6;
          let maxTextLen = n.name.length;
          if ("attributes" in n) {
            for (const a of (n as any).attributes || [])
              maxTextLen = Math.max(
                maxTextLen,
                `${a.visibility}${a.name}: ${a.type}`.length,
              );
            for (const m of (n as any).methods || []) {
              const p =
                m.params?.map((x: any) => `${x.name}: ${x.type}`).join(", ") ||
                "";
              maxTextLen = Math.max(
                maxTextLen,
                `${m.visibility}${m.name}(${p}): ${m.returnType}`.length,
              );
            }
          }
          const newWidth = Math.max(n.size.width, maxTextLen * charW + 30);
          const lineH = fontSize + 8;
          const attrCount = (n as any).attributes?.length || 0;
          const methodCount = (n as any).methods?.length || 0;
          const newHeight = Math.max(
            n.size.height,
            44 + attrCount * lineH + methodCount * lineH + 16,
          );
          return {
            ...n,
            style,
            size: {
              width: Math.round(newWidth),
              height: Math.round(newHeight),
            },
          };
        }),
      });
    },
    [diagram, history],
  );

  const globalStyleChange = useCallback(
    (style: any, setGlobalStyle: (s: any) => void) => {
      setGlobalStyle(style);
      if (!diagram) return;
      const isReset = Object.keys(style).length === 0;
      const fontSize = style.fontSize || 13;
      const charW = fontSize * 0.6;
      history.set({
        ...diagram,
        nodes: diagram.nodes.map((n) => {
          const newStyle = isReset
            ? undefined
            : { ...((n as any).style || {}), ...style };
          let maxTextLen = n.name.length;
          if ("attributes" in n) {
            for (const a of (n as any).attributes || [])
              maxTextLen = Math.max(
                maxTextLen,
                `${a.visibility}${a.name}: ${a.type}`.length,
              );
            for (const m of (n as any).methods || []) {
              const p =
                m.params?.map((x: any) => `${x.name}: ${x.type}`).join(", ") ||
                "";
              maxTextLen = Math.max(
                maxTextLen,
                `${m.visibility}${m.name}(${p}): ${m.returnType}`.length,
              );
            }
          }
          const newWidth = Math.max(n.size.width, maxTextLen * charW + 30);
          const lineH = fontSize + 8;
          const attrCount = (n as any).attributes?.length || 0;
          const methodCount = (n as any).methods?.length || 0;
          const newHeight = Math.max(
            n.size.height,
            44 + attrCount * lineH + methodCount * lineH + 16,
          );
          return {
            ...n,
            style: newStyle,
            size: {
              width: Math.round(newWidth),
              height: Math.round(newHeight),
            },
          };
        }),
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
