import type { Edge, DiagramNode } from "@uml-editor/shared";
import { getVisualSize } from "../nodes/getVisualSize";
import { getBestTargetAnchor } from "./anchor-utils";

export interface EdgeRoutingConfig {
  laneOffset: number;
  labelRatio: number;
  labelShift: number;
}

export interface ComputedEdgeLayout {
  portFractionMap: Map<string, number>;
  edgeConfigs: Map<string, EdgeRoutingConfig>;
  channelOffsetMap: Map<string, number>;
}

export function computeEdgeRoutingLayout(
  edges: Edge[],
  nodes: DiagramNode[],
  isOrthogonal: boolean
): ComputedEdgeLayout {
  const nodeMap = new Map<string, DiagramNode>(nodes.map((n) => [n.id, n]));

  // 1. Calculate distributed anchor ports for each face of each node
  interface FaceConn {
    edgeId: string;
    isSource: boolean;
    otherCoord: number;
  }
  const faceMap = new Map<string, FaceConn[]>();

  for (const edge of edges) {
    const sNode = nodeMap.get(edge.source);
    const tNode = nodeMap.get(edge.target);
    if (!sNode || !tNode) continue;

    const sSize = getVisualSize(sNode);
    const tSize = getVisualSize(tNode);
    const sCenter = {
      x: sNode.position.x + sSize.width / 2,
      y: sNode.position.y + sSize.height / 2,
    };
    const tCenter = {
      x: tNode.position.x + tSize.width / 2,
      y: tNode.position.y + tSize.height / 2,
    };

    const sAnchor =
      edge.sourceAnchor ||
      (isOrthogonal ? getBestTargetAnchor(sNode, tNode, nodes) : undefined);
    const tAnchor =
      edge.targetAnchor ||
      (isOrthogonal ? getBestTargetAnchor(tNode, sNode, nodes) : undefined);

    if (sAnchor) {
      const key = `${edge.source}:${sAnchor}`;
      const list = faceMap.get(key) || [];
      const coord =
        sAnchor === "top" || sAnchor === "bottom" ? tCenter.x : tCenter.y;
      list.push({
        edgeId: edge.id,
        isSource: true,
        otherCoord: coord,
      });
      faceMap.set(key, list);
    }

    if (tAnchor) {
      const key = `${edge.target}:${tAnchor}`;
      const list = faceMap.get(key) || [];
      const coord =
        tAnchor === "top" || tAnchor === "bottom" ? sCenter.x : sCenter.y;
      list.push({
        edgeId: edge.id,
        isSource: false,
        otherCoord: coord,
      });
      faceMap.set(key, list);
    }
  }

  const portFractionMap = new Map<string, number>();
  for (const [, conns] of faceMap) {
    conns.sort((a, b) => a.otherCoord - b.otherCoord);
    const n = conns.length;
    for (let i = 0; i < n; i++) {
      const c = conns[i];
      let frac = 0.5;
      if (n === 2) {
        frac = i === 0 ? 0.35 : 0.65;
      } else if (n === 3) {
        frac = i === 0 ? 0.25 : i === 1 ? 0.5 : 0.75;
      } else if (n > 3) {
        frac = 0.15 + (0.7 * i) / (n - 1);
      }
      const role = c.isSource ? "source" : "target";
      portFractionMap.set(`${c.edgeId}:${role}`, frac);
    }
  }

  // 2. Calculate two-way lane offsets and anti-clash label placement
  const pairMap = new Map<string, Edge[]>();
  for (const edge of edges) {
    const key = [edge.source, edge.target].sort().join("<->");
    const list = pairMap.get(key) || [];
    list.push(edge);
    pairMap.set(key, list);
  }

  const edgeConfigs = new Map<string, EdgeRoutingConfig>();

  for (const [, pairEdges] of pairMap) {
    if (pairEdges.length === 1) {
      edgeConfigs.set(pairEdges[0].id, {
        laneOffset: 0,
        labelRatio: 0.5,
        labelShift: -10,
      });
    } else if (
      pairEdges.length === 2 &&
      pairEdges[0].source === pairEdges[1].target
    ) {
      // Two-way street between opposite nodes:
      // Both take their forward right lane (+10px) and place label near source (38%)
      for (const e of pairEdges) {
        edgeConfigs.set(e.id, {
          laneOffset: 10,
          labelRatio: 0.38,
          labelShift: 12,
        });
      }
    } else {
      const n = pairEdges.length;
      for (let i = 0; i < n; i++) {
        const norm = i - (n - 1) / 2;
        edgeConfigs.set(pairEdges[i].id, {
          laneOffset: norm * 14,
          labelRatio: 0.28 + (0.44 * i) / Math.max(1, n - 1),
          labelShift: norm >= 0 ? 12 : -12,
        });
      }
    }
  }

  // 3. Calculate corridor channel offsets for orthogonal routing to prevent shared spines
  const channelOffsetMap = new Map<string, number>();

  if (isOrthogonal) {
    interface CorridorConn {
      edgeId: string;
      partnerCoord: number;
      dir: number;
    }
    const hCorridors = new Map<string, CorridorConn[]>();
    const vCorridors = new Map<string, CorridorConn[]>();

    for (const edge of edges) {
      const sNode = nodeMap.get(edge.source);
      const tNode = nodeMap.get(edge.target);
      if (!sNode || !tNode || sNode.id === tNode.id) continue;

      const sSize = getVisualSize(sNode);
      const tSize = getVisualSize(tNode);
      const sCenter = {
        x: sNode.position.x + sSize.width / 2,
        y: sNode.position.y + sSize.height / 2,
      };
      const tCenter = {
        x: tNode.position.x + tSize.width / 2,
        y: tNode.position.y + tSize.height / 2,
      };

      const sAnchor =
        edge.sourceAnchor || getBestTargetAnchor(sNode, tNode, nodes);
      const tAnchor =
        edge.targetAnchor || getBestTargetAnchor(tNode, sNode, nodes);

      const sIsHoriz = sAnchor === "left" || sAnchor === "right";
      const tIsHoriz = tAnchor === "left" || tAnchor === "right";

      if (sIsHoriz && tIsHoriz) {
        const leftBound = Math.min(
          sNode.position.x + sSize.width,
          tNode.position.x + tSize.width
        );
        const rightBound = Math.max(sNode.position.x, tNode.position.x);
        const gap = rightBound - leftBound;
        if (gap > 20) {
          const key = `${Math.round(leftBound / 50) * 50}-${Math.round(rightBound / 50) * 50}`;
          const list = hCorridors.get(key) || [];
          const partnerCoord =
            sNode.position.x > tNode.position.x ? sCenter.y : tCenter.y;
          const dir = sNode.position.x < tNode.position.x ? 1 : -1;
          list.push({ edgeId: edge.id, partnerCoord, dir });
          hCorridors.set(key, list);
        }
      } else if (!sIsHoriz && !tIsHoriz) {
        const topBound = Math.min(
          sNode.position.y + sSize.height,
          tNode.position.y + tSize.height
        );
        const bottomBound = Math.max(sNode.position.y, tNode.position.y);
        const gap = bottomBound - topBound;
        if (gap > 20) {
          const key = `${Math.round(topBound / 50) * 50}-${Math.round(bottomBound / 50) * 50}`;
          const list = vCorridors.get(key) || [];
          const partnerCoord =
            sNode.position.y > tNode.position.y ? sCenter.x : tCenter.x;
          const dir = sNode.position.y < tNode.position.y ? 1 : -1;
          list.push({ edgeId: edge.id, partnerCoord, dir });
          vCorridors.set(key, list);
        }
      }
    }

    // Allocate channel tracks across horizontal corridors
    for (const [, conns] of hCorridors) {
      if (conns.length <= 1) continue;
      conns.sort((a, b) => {
        if (Math.abs(a.partnerCoord - b.partnerCoord) > 2) {
          return a.partnerCoord - b.partnerCoord;
        }
        if (a.dir !== b.dir) return a.dir - b.dir;
        return a.edgeId.localeCompare(b.edgeId);
      });
      const n = conns.length;
      const spacing = Math.min(26, Math.max(16, 120 / (n + 1)));
      const totalSpan = (n - 1) * spacing;
      const start = -totalSpan / 2;
      for (let i = 0; i < n; i++) {
        channelOffsetMap.set(conns[i].edgeId, Math.round(start + i * spacing));
      }
    }

    // Allocate channel tracks across vertical corridors
    for (const [, conns] of vCorridors) {
      if (conns.length <= 1) continue;
      conns.sort((a, b) => {
        if (Math.abs(a.partnerCoord - b.partnerCoord) > 2) {
          return a.partnerCoord - b.partnerCoord;
        }
        if (a.dir !== b.dir) return a.dir - b.dir;
        return a.edgeId.localeCompare(b.edgeId);
      });
      const n = conns.length;
      const spacing = Math.min(24, Math.max(14, 100 / (n + 1)));
      const totalSpan = (n - 1) * spacing;
      const start = -totalSpan / 2;
      for (let i = 0; i < n; i++) {
        channelOffsetMap.set(conns[i].edgeId, Math.round(start + i * spacing));
      }
    }
  }

  return {
    portFractionMap,
    edgeConfigs,
    channelOffsetMap,
  };
}
