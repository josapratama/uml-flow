import {
  computeFlowNodeSize,
  type Diagram,
  type LayoutOptions,
} from "@uml-editor/shared";
import {
  layoutLayered,
  layoutLinear,
  layoutSequence,
  layoutForce,
  layoutGrid,
  layoutRadial,
} from "./strategies";

export type LayoutPreset =
  | "auto"
  | "layered"
  | "linear"
  | "force"
  | "grid"
  | "radial";

const DEFAULT_OPTIONS: LayoutOptions = {
  direction: "TB",
  nodeSpacing: 80,
  rankSpacing: 120,
  edgeRouting: "orthogonal",
};

/**
 * Layout engine facade.
 * All presets support all diagram types.
 * Sequence diagrams always use sequence layout for participants,
 * but other presets can still rearrange participant positions.
 */
export class LayoutEngine {
  private options: LayoutOptions;
  private preset: LayoutPreset;

  constructor(options?: Partial<LayoutOptions>, preset?: LayoutPreset) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.preset = preset || "auto";
  }

  layout(diagram: Diagram): Diagram {
    if (diagram.nodes.length === 0 && !diagram.participants?.length) {
      return diagram;
    }

    // Sequence diagrams: always layout participants, then apply preset to nodes if any
    if (diagram.type === "sequence") {
      return this.layoutSequenceDiagram(diagram);
    }

    // Normalize node sizes for flow/activity/state diagrams before computing positions
    const normalized = this.normalizeNodeSizes(diagram);

    // For all other diagrams, apply the selected preset
    if (this.preset === "auto") {
      return this.autoLayout(normalized);
    }
    return this.applyPreset(normalized, this.preset);
  }

  private normalizeNodeSizes(diagram: Diagram): Diagram {
    if (
      diagram.type !== "flowchart" &&
      diagram.type !== "activity" &&
      diagram.type !== "state"
    ) {
      return diagram;
    }

    const nodes = diagram.nodes.map((node) => {
      if (
        "attributes" in node ||
        "methods" in node ||
        node.type === "composite"
      ) {
        return node;
      }
      const fontSize = (node as any).style?.fontSize || 13;
      const optimalSize = computeFlowNodeSize(
        node.type,
        node.name || "",
        fontSize,
        diagram.type,
      );
      return { ...node, size: optimalSize };
    });

    return { ...diagram, nodes };
  }

  private hasBranching(diagram: Diagram): boolean {
    const outCounts = new Map<string, number>();
    for (const edge of diagram.edges) {
      outCounts.set(edge.source, (outCounts.get(edge.source) || 0) + 1);
      if ((outCounts.get(edge.source) || 0) > 1) return true;
    }
    return false;
  }

  private autoLayout(diagram: Diagram): Diagram {
    switch (diagram.type) {
      case "activity":
        if ((diagram as any).swimlanes && (diagram as any).swimlanes.length > 0) {
          return this.layoutActivityWithSwimlanes(diagram);
        }
        if (this.hasBranching(diagram)) {
          return layoutLayered(diagram, {
            ...this.options,
            rankSpacing: 96,
            nodeSpacing: 80,
          });
        }
        return layoutLinear(diagram, this.options);
      case "flowchart":
        if (this.hasBranching(diagram)) {
          return layoutLayered(diagram, {
            ...this.options,
            rankSpacing: 96,
            nodeSpacing: 80,
          });
        }
        return layoutLinear(diagram, this.options);
      case "usecase":
        return this.layoutUseCaseDiagram(diagram);
      case "state":
        return layoutLayered(diagram, {
          ...this.options,
          direction: "LR",
          rankSpacing: 200,
          nodeSpacing: 90,
        });
      case "component":
        return layoutLayered(diagram, this.options);
      case "deployment":
        return layoutLayered(diagram, { ...this.options, rankSpacing: 150 });
      default:
        return layoutLayered(diagram, this.options);
    }
  }

  private applyPreset(diagram: Diagram, preset: LayoutPreset): Diagram {
    const isFlow =
      diagram.type === "flowchart" || diagram.type === "activity";
    switch (preset) {
      case "layered":
      case "linear":
        if (diagram.type === "activity" && (diagram as any).swimlanes?.length) {
          return this.layoutActivityWithSwimlanes(diagram);
        }
        return preset === "linear"
          ? layoutLinear(diagram, this.options)
          : layoutLayered(
              diagram,
              isFlow
                ? { ...this.options, rankSpacing: 96, nodeSpacing: 80 }
                : this.options,
            );
      case "force":
        return layoutForce(diagram, this.options);
      case "grid":
        return layoutGrid(diagram, this.options);
      case "radial":
        return layoutRadial(diagram, this.options);
      default:
        return layoutLayered(diagram, this.options);
    }
  }

  private layoutActivityWithSwimlanes(diagram: Diagram): Diagram {
    const swimlanes = (diagram as any).swimlanes as string[];
    if (!swimlanes || swimlanes.length === 0) {
      return this.hasBranching(diagram)
        ? layoutLayered(diagram, { ...this.options, rankSpacing: 96, nodeSpacing: 80 })
        : layoutLinear(diagram, this.options);
    }

    const laneMap = new Map<string, number>();
    swimlanes.forEach((name, idx) => laneMap.set(name, idx));

    // Determine column widths
    const minColWidth = 260;
    let maxNodeWidth = 140;
    for (const n of diagram.nodes) {
      if (n.size?.width && n.size.width > maxNodeWidth) {
        maxNodeWidth = n.size.width;
      }
    }
    const colWidth = Math.max(minColWidth, maxNodeWidth + 60);
    const startX = 60;
    const startY = 80;
    const rankSpacing = 95;

    // Build adjacency and in-degree for topological ranking
    const inDegree = new Map<string, number>();
    const adj = new Map<string, string[]>();
    for (const n of diagram.nodes) {
      inDegree.set(n.id, 0);
      adj.set(n.id, []);
    }
    for (const e of diagram.edges) {
      if (adj.has(e.source) && inDegree.has(e.target)) {
        adj.get(e.source)!.push(e.target);
        inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
      }
    }

    const rankMap = new Map<string, number>();
    const queue: string[] = [];
    for (const [id, deg] of inDegree.entries()) {
      if (deg === 0) {
        queue.push(id);
        rankMap.set(id, 0);
      }
    }

    const visited = new Set<string>();
    while (queue.length > 0) {
      const u = queue.shift()!;
      visited.add(u);
      const currRank = rankMap.get(u) || 0;
      for (const v of adj.get(u) || []) {
        const nextRank = Math.max(rankMap.get(v) || 0, currRank + 1);
        rankMap.set(v, nextRank);
        if (!visited.has(v) && !queue.includes(v)) {
          queue.push(v);
        }
      }
    }

    // Any unranked nodes get fallback rank
    let fallbackRank = Math.max(0, ...Array.from(rankMap.values())) + 1;
    for (const n of diagram.nodes) {
      if (!rankMap.has(n.id)) {
        rankMap.set(n.id, fallbackRank++);
      }
    }

    // Sort nodes by rank, then lane
    const nodesByRank = [...diagram.nodes].sort((a, b) => {
      const rA = rankMap.get(a.id) || 0;
      const rB = rankMap.get(b.id) || 0;
      if (rA !== rB) return rA - rB;
      const laneA = laneMap.get((a as any).swimlane) ?? 0;
      const laneB = laneMap.get((b as any).swimlane) ?? 0;
      return laneA - laneB;
    });

    const laneYTracker = new Map<number, number>();
    const newNodes = nodesByRank.map((node) => {
      const laneIdx = laneMap.has((node as any).swimlane)
        ? laneMap.get((node as any).swimlane)!
        : 0;
      const r = rankMap.get(node.id) || 0;
      const nodeW = node.size?.width || 140;
      const nodeH = node.size?.height || 50;
      const colCenterX = startX + laneIdx * colWidth + colWidth / 2;
      const posX = Math.round(colCenterX - nodeW / 2);

      let targetY = startY + r * rankSpacing;
      const lastY = laneYTracker.get(laneIdx);
      if (lastY !== undefined && targetY < lastY + 60) {
        targetY = lastY + 60;
      }
      laneYTracker.set(laneIdx, targetY + nodeH);

      return {
        ...node,
        position: { x: posX, y: targetY },
      };
    });

    return {
      ...diagram,
      nodes: newNodes,
    };
  }

  private layoutUseCaseDiagram(diagram: Diagram): Diagram {
    const actors = diagram.nodes.filter((n) => (n.type as string) === "actor");
    const usecases = diagram.nodes.filter((n) => (n.type as string) === "usecase");
    const others = diagram.nodes.filter(
      (n) => (n.type as string) !== "actor" && (n.type as string) !== "usecase"
    );

    if (actors.length === 0 || usecases.length === 0) {
      return layoutLayered(diagram, {
        ...this.options,
        direction: "LR",
        rankSpacing: 180,
        nodeSpacing: 70,
      });
    }

    // 1. Partition actors into left (primary) and right (secondary/admin) columns
    let leftActors = actors;
    let rightActors: typeof actors = [];
    if (actors.length >= 2) {
      const splitIdx = Math.ceil(actors.length * 0.65);
      leftActors = actors.slice(0, splitIdx);
      rightActors = actors.slice(splitIdx);
    }
    const rightActorIds = new Set(rightActors.map((a) => a.id));

    // 2. Partition use cases into col1 (left inside system boundary) & col2 (right inside system boundary)
    const includeExtendTargetIds = new Set<string>();
    for (const e of diagram.edges) {
      const lbl = (e.label?.text || "").toLowerCase();
      if (
        e.type === "include" ||
        e.type === "extend" ||
        lbl.includes("include") ||
        lbl.includes("extend")
      ) {
        includeExtendTargetIds.add(e.target);
      }
    }

    const col1: typeof usecases = [];
    const col2: typeof usecases = [];

    for (const uc of usecases) {
      const connectedToRightActor = diagram.edges.some(
        (e) =>
          (e.source === uc.id && rightActorIds.has(e.target)) ||
          (e.target === uc.id && rightActorIds.has(e.source))
      );
      if (includeExtendTargetIds.has(uc.id) || connectedToRightActor) {
        col2.push(uc);
      } else {
        col1.push(uc);
      }
    }

    // Balance columns if one is empty and total usecases >= 5
    if (col1.length === 0 && col2.length > 1) {
      const half = Math.ceil(col2.length / 2);
      col1.push(...col2.splice(0, half));
    } else if (col2.length === 0 && col1.length >= 6) {
      const half = Math.ceil(col1.length / 2);
      col2.push(...col1.splice(half));
    }

    const startY = 120;
    const rowStep = 94;
    const col1X = 310;
    const maxCol1Width = col1.reduce((m, n) => Math.max(m, n.size?.width || 180), 180);
    const col2X = col1.length > 0 ? col1X + maxCol1Width + 90 : col1X;
    const maxCol2Width = col2.reduce((m, n) => Math.max(m, n.size?.width || 180), 180);

    const maxRows = Math.max(col1.length, col2.length, 1);
    const totalBoundaryH = (maxRows - 1) * rowStep;

    const posMap = new Map<string, { x: number; y: number }>();

    // Position Column 1 Use Cases
    const col1OffsetY = startY + Math.max(0, (totalBoundaryH - Math.max(0, col1.length - 1) * rowStep) / 2);
    col1.forEach((uc, idx) => {
      const w = uc.size?.width || 180;
      posMap.set(uc.id, {
        x: Math.round(col1X + (maxCol1Width - w) / 2),
        y: Math.round(col1OffsetY + idx * rowStep),
      });
    });

    // Position Column 2 Use Cases
    const col2OffsetY = startY + Math.max(0, (totalBoundaryH - Math.max(0, col2.length - 1) * rowStep) / 2);
    col2.forEach((uc, idx) => {
      const w = uc.size?.width || 180;
      posMap.set(uc.id, {
        x: Math.round(col2X + (maxCol2Width - w) / 2),
        y: Math.round(col2OffsetY + idx * rowStep),
      });
    });

    // Helper to position an actor column aligned with connected use cases
    const positionActorColumn = (actorList: typeof actors, baseX: number) => {
      const minActorGap = 150;
      const desiredYs = actorList.map((actor, idx) => {
        const connectedUcs = diagram.edges
          .filter((e) => e.source === actor.id || e.target === actor.id)
          .map((e) => (e.source === actor.id ? e.target : e.source))
          .map((id) => posMap.get(id))
          .filter(Boolean) as { x: number; y: number }[];
        if (connectedUcs.length > 0) {
          const avgY = connectedUcs.reduce((sum, p) => sum + p.y, 0) / connectedUcs.length;
          return avgY - 20;
        }
        return startY + idx * minActorGap;
      });

      // Enforce minimum vertical separation between actors
      for (let i = 1; i < desiredYs.length; i++) {
        if (desiredYs[i] < desiredYs[i - 1] + minActorGap) {
          desiredYs[i] = desiredYs[i - 1] + minActorGap;
        }
      }

      actorList.forEach((actor, idx) => {
        posMap.set(actor.id, {
          x: Math.round(baseX),
          y: Math.round(Math.max(80, desiredYs[idx])),
        });
      });
    };

    positionActorColumn(leftActors, 70);
    const rightActorX = (col2.length > 0 ? col2X + maxCol2Width : col1X + maxCol1Width) + 120;
    positionActorColumn(rightActors, rightActorX);

    // Position any remaining nodes (e.g. notes or system boxes)
    others.forEach((n, idx) => {
      posMap.set(n.id, {
        x: col1X + idx * 180,
        y: startY + maxRows * rowStep + 40,
      });
    });

    return {
      ...diagram,
      nodes: diagram.nodes.map((node) => ({
        ...node,
        position: posMap.get(node.id) || node.position,
      })),
    };
  }

  private layoutSequenceDiagram(diagram: Diagram): Diagram {
    // Always position participants horizontally
    let result = layoutSequence(diagram, this.options);

    // If there are also nodes (rare for sequence), layout them too
    if (result.nodes.length > 0 && this.preset !== "auto") {
      result = this.applyPreset(result, this.preset);
    }

    return result;
  }
}
