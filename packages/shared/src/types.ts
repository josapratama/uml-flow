// ============================================
// UML Editor - Core Types
// ============================================

// --- Diagram Types ---
export type DiagramType =
  | "class"
  | "sequence"
  | "usecase"
  | "activity"
  | "state"
  | "flowchart"
  | "erd"
  | "component"
  | "deployment";

// --- Node Types ---
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

// --- Class Diagram ---
export interface UMLAttribute {
  visibility: "+" | "-" | "#" | "~";
  name: string;
  type: string;
  isStatic?: boolean;
}

export interface UMLMethod {
  visibility: "+" | "-" | "#" | "~";
  name: string;
  params: { name: string; type: string }[];
  returnType: string;
  isStatic?: boolean;
  isAbstract?: boolean;
}

export interface ClassNode {
  id: string;
  type: "class" | "interface" | "abstract" | "enum";
  name: string;
  position: Position;
  size: Size;
  attributes: UMLAttribute[];
  methods: UMLMethod[];
  stereotypes?: string[];
  style?: import("./styling").NodeStyle;
}

// --- Sequence Diagram ---
export interface SequenceParticipant {
  id: string;
  name: string;
  type: "actor" | "object" | "boundary" | "control" | "entity";
  position: Position;
}

export interface SequenceMessage {
  id: string;
  from: string;
  to: string;
  label: string;
  type: "sync" | "async" | "return" | "create" | "destroy" | "self";
  order: number;
}

export interface SequenceFragment {
  id: string;
  type: "alt" | "opt" | "loop" | "par" | "break" | "critical";
  label: string;
  startOrder: number;
  endOrder: number;
  conditions?: string[];
}

// --- Use Case Diagram ---
export interface UseCaseNode {
  id: string;
  type: "actor" | "usecase" | "system";
  name: string;
  position: Position;
  size: Size;
}

// --- Activity Diagram ---
export interface ActivityNode {
  id: string;
  type:
    | "start"
    | "end"
    | "action"
    | "decision"
    | "fork"
    | "join"
    | "merge"
    | "signal"
    | "timer";
  name: string;
  position: Position;
  size: Size;
  swimlane?: string;
}

// --- State Diagram ---
export interface StateNode {
  id: string;
  type:
    | "initial"
    | "final"
    | "state"
    | "composite"
    | "choice"
    | "history"
    | "deepHistory";
  name: string;
  position: Position;
  size: Size;
  entry?: string;
  exit?: string;
  do?: string;
  substates?: StateNode[];
}

// --- Flowchart ---
export interface FlowchartNode {
  id: string;
  type:
    | "start"
    | "end"
    | "process"
    | "decision"
    | "io"
    | "document"
    | "database"
    | "subroutine"
    | "preparation"
    | "connector";
  name: string;
  position: Position;
  size: Size;
}

// --- ERD ---
export interface ERDEntity {
  id: string;
  type: "entity" | "weak-entity";
  name: string;
  position: Position;
  size: Size;
  attributes: ERDAttribute[];
}

export interface ERDAttribute {
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isNullable: boolean;
  isUnique: boolean;
}

// --- Component Diagram ---
export interface ComponentNode {
  id: string;
  type: "component" | "interface" | "port" | "package";
  name: string;
  position: Position;
  size: Size;
  provides?: string[];
  requires?: string[];
}

// --- Deployment Diagram ---
export interface DeploymentNode {
  id: string;
  type: "node" | "device" | "execution-env" | "artifact" | "container";
  name: string;
  position: Position;
  size: Size;
  children?: DeploymentNode[];
}

export type DiagramNode =
  | ClassNode
  | UseCaseNode
  | ActivityNode
  | StateNode
  | FlowchartNode
  | ERDEntity
  | ComponentNode
  | DeploymentNode;

// --- Edge/Connection Types ---
export type RelationType =
  | "association"
  | "aggregation"
  | "composition"
  | "inheritance"
  | "realization"
  | "dependency"
  | "include"
  | "extend"
  | "transition"
  | "flow"
  | "one-to-one"
  | "one-to-many"
  | "many-to-many"
  | "communication"
  | "deploy";

export interface EdgeLabel {
  text: string;
  position?: number;
  offsetX?: number;
  offsetY?: number;
}

export type AnchorSide = "top" | "bottom" | "left" | "right" | "auto";

export interface Edge {
  id: string;
  source: string;
  target: string;
  type: RelationType;
  label?: EdgeLabel;
  sourceLabel?: string;
  targetLabel?: string;
  points?: Position[];
  condition?: string;
  style?: import("./styling").EdgeStyle;
  sourceAnchor?: AnchorSide;
  targetAnchor?: AnchorSide;
}

// --- Diagram Model ---
export interface Diagram {
  id: string;
  name: string;
  type: DiagramType;
  nodes: DiagramNode[];
  edges: Edge[];
  participants?: SequenceParticipant[];
  messages?: SequenceMessage[];
  fragments?: SequenceFragment[];
  swimlanes?: string[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: number;
  };
}

// --- Layout ---
export interface LayoutOptions {
  direction: "TB" | "LR" | "BT" | "RL";
  nodeSpacing: number;
  rankSpacing: number;
  edgeRouting: "orthogonal" | "polyline" | "straight";
}

// --- API Types ---
export interface ParseResult {
  success: boolean;
  diagram?: Diagram;
  errors?: ParseError[];
}

export interface ParseError {
  line: number;
  column: number;
  message: string;
  severity: "error" | "warning";
}

export interface ExportOptions {
  format: "svg" | "png" | "json" | "dsl";
  width?: number;
  height?: number;
  background?: string;
}
