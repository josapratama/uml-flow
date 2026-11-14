import type { Diagram, DiagramNode, DiagramEdge } from "@uml-editor/shared";

export interface TraceEntry {
  step: number;
  nodeId: string;
  nodeName: string;
  nodeType: string;
  edgeLabel?: string;
  timestamp: string;
}

export interface AvailableTransition {
  edgeId: string;
  targetId: string;
  targetName: string;
  label: string;
}

export interface SimulationState {
  currentNodeId: string | null;
  currentNode: DiagramNode | null;
  visitedNodeIds: string[];
  traceLog: TraceEntry[];
  availableTransitions: AvailableTransition[];
  isCompleted: boolean;
  isDeadEnd: boolean;
  stepCount: number;
}

const START_TYPES = new Set(["start", "initial", "start_event"]);
const END_TYPES = new Set(["end", "final", "terminate", "stop"]);

/**
 * Find the initial entry node of a diagram
 */
export function findStartNode(diagram: Diagram): DiagramNode | null {
  const nodes = diagram.nodes || [];
  if (nodes.length === 0) return null;

  // 1. Look for explicit start node type
  const explicitStart = nodes.find(n => START_TYPES.has((n.type || "").toLowerCase()));
  if (explicitStart) return explicitStart;

  // 2. Look for node with 0 incoming edges
  const incoming = new Set(diagram.edges?.map(e => e.target) || []);
  const rootNode = nodes.find(n => !incoming.has(n.id));
  if (rootNode) return rootNode;

  // 3. Fallback to first node
  return nodes[0];
}

/**
 * Get outgoing transitions for a node
 */
export function getTransitions(diagram: Diagram, fromNodeId: string): AvailableTransition[] {
  const edges = (diagram.edges || []).filter(e => e.source === fromNodeId);
  const nodes = diagram.nodes || [];

  return edges.map((e, index) => {
    const target = nodes.find(n => n.id === e.target);
    const targetName = target?.name || e.target;
    let label = e.label?.trim();
    if (!label) {
      label = edges.length > 1 ? `Cabang ${index + 1}: Menuju ${targetName}` : `Menuju ${targetName}`;
    }
    return {
      edgeId: e.id,
      targetId: e.target,
      targetName,
      label,
    };
  });
}

/**
 * Initialize a new simulation run
 */
export function initSimulation(diagram: Diagram): SimulationState {
  const start = findStartNode(diagram);
  if (!start) {
    return {
      currentNodeId: null,
      currentNode: null,
      visitedNodeIds: [],
      traceLog: [],
      availableTransitions: [],
      isCompleted: true,
      isDeadEnd: true,
      stepCount: 0,
    };
  }

  const transitions = getTransitions(diagram, start.id);
  const isEnd = END_TYPES.has((start.type || "").toLowerCase());

  const initialEntry: TraceEntry = {
    step: 1,
    nodeId: start.id,
    nodeName: start.name || start.id,
    nodeType: start.type || "node",
    timestamp: new Date().toLocaleTimeString(),
  };

  return {
    currentNodeId: start.id,
    currentNode: start,
    visitedNodeIds: [start.id],
    traceLog: [initialEntry],
    availableTransitions: transitions,
    isCompleted: isEnd,
    isDeadEnd: !isEnd && transitions.length === 0,
    stepCount: 1,
  };
}

/**
 * Step forward along a selected transition edge
 */
export function stepSimulation(
  diagram: Diagram,
  currentState: SimulationState,
  transition: AvailableTransition
): SimulationState {
  const nodes = diagram.nodes || [];
  const targetNode = nodes.find(n => n.id === transition.targetId);

  if (!targetNode) {
    return {
      ...currentState,
      isCompleted: true,
      isDeadEnd: true,
    };
  }

  const nextTransitions = getTransitions(diagram, targetNode.id);
  const isEnd = END_TYPES.has((targetNode.type || "").toLowerCase());
  const newStep = currentState.stepCount + 1;

  const entry: TraceEntry = {
    step: newStep,
    nodeId: targetNode.id,
    nodeName: targetNode.name || targetNode.id,
    nodeType: targetNode.type || "node",
    edgeLabel: transition.label,
    timestamp: new Date().toLocaleTimeString(),
  };

  return {
    currentNodeId: targetNode.id,
    currentNode: targetNode,
    visitedNodeIds: [...currentState.visitedNodeIds, targetNode.id],
    traceLog: [...currentState.traceLog, entry],
    availableTransitions: nextTransitions,
    isCompleted: isEnd || nextTransitions.length === 0,
    isDeadEnd: !isEnd && nextTransitions.length === 0,
    stepCount: newStep,
  };
}
