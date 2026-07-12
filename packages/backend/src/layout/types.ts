import type { Position } from "@uml-editor/shared";

/** Internal representation of a node during layout computation. */
export interface LayoutNode {
  id: string;
  rank: number;
  order: number;
  position: Position;
  width: number;
  height: number;
}

/** Adjacency representation for graph algorithms. */
export interface LayoutGraph {
  nodes: Map<string, LayoutNode>;
  adjacency: Map<string, string[]>;
  reverseAdj: Map<string, string[]>;
}
