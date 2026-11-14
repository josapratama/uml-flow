import type { Diagram, DiagramNode, DiagramEdge, SequenceParticipant, SequenceMessage } from "@uml-editor/shared";

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
  sequenceMessageIndex?: number;
}

const START_TYPES = new Set(["start", "initial", "start_event"]);
const END_TYPES = new Set(["end", "final", "terminate", "stop"]);

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
 * Initialize a new simulation run (Flowchart or Sequence)
 */
export function initSimulation(diagram: Diagram): SimulationState {
  if (diagram.type === "sequence") {
    const participants = diagram.participants || [];
    const messages = [...(diagram.messages || [])].sort((a, b) => a.order - b.order);

    if (messages.length === 0) {
      return {
        currentNodeId: participants[0]?.id || null,
        currentNode: { id: participants[0]?.id || "", name: participants[0]?.name || "", type: "participant", position: { x: 0, y: 0 }, size: { width: 100, height: 50 } } as any,
        visitedNodeIds: participants[0] ? [participants[0].id] : [],
        traceLog: [],
        availableTransitions: [],
        isCompleted: true,
        isDeadEnd: true,
        stepCount: 0,
        sequenceMessageIndex: 0,
      };
    }

    const firstMsg = messages[0];
    const fromP = participants.find(p => p.id === firstMsg.from);
    const toP = participants.find(p => p.id === firstMsg.to);

    const transition: AvailableTransition = {
      edgeId: firstMsg.id,
      targetId: firstMsg.to,
      targetName: toP?.name || firstMsg.to,
      label: firstMsg.label ? `${firstMsg.label} (${firstMsg.type})` : `Kirim pesan ke ${toP?.name || firstMsg.to}`,
    };

    const initialEntry: TraceEntry = {
      step: 1,
      nodeId: firstMsg.from,
      nodeName: fromP?.name || firstMsg.from,
      nodeType: "participant",
      edgeLabel: firstMsg.label,
      timestamp: new Date().toLocaleTimeString(),
    };

    return {
      currentNodeId: firstMsg.from,
      currentNode: { id: firstMsg.from, name: fromP?.name || firstMsg.from, type: "participant", position: { x: 0, y: 0 }, size: { width: 100, height: 50 } } as any,
      visitedNodeIds: [firstMsg.from],
      traceLog: [initialEntry],
      availableTransitions: [transition],
      isCompleted: messages.length === 1,
      isDeadEnd: false,
      stepCount: 1,
      sequenceMessageIndex: 0,
    };
  }

  // Standard Flowchart / Graph Simulation
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
 * Step forward along a selected transition
 */
export function stepSimulation(
  diagram: Diagram,
  currentState: SimulationState,
  transition: AvailableTransition
): SimulationState {
  if (diagram.type === "sequence") {
    const participants = diagram.participants || [];
    const messages = [...(diagram.messages || [])].sort((a, b) => a.order - b.order);
    const nextMsgIdx = (currentState.sequenceMessageIndex ?? 0) + 1;
    const isCompleted = nextMsgIdx >= messages.length;

    const currentMsg = messages[currentState.sequenceMessageIndex ?? 0];
    const toP = participants.find(p => p.id === transition.targetId);
    const newStep = currentState.stepCount + 1;

    const entry: TraceEntry = {
      step: newStep,
      nodeId: transition.targetId,
      nodeName: toP?.name || transition.targetId,
      nodeType: "participant",
      edgeLabel: transition.label,
      timestamp: new Date().toLocaleTimeString(),
    };

    let nextTransitions: AvailableTransition[] = [];
    if (!isCompleted && messages[nextMsgIdx]) {
      const nextMsg = messages[nextMsgIdx];
      const targetP = participants.find(p => p.id === nextMsg.to);
      nextTransitions = [
        {
          edgeId: nextMsg.id,
          targetId: nextMsg.to,
          targetName: targetP?.name || nextMsg.to,
          label: nextMsg.label ? `${nextMsg.label} (${nextMsg.type})` : `Pesan #${nextMsgIdx + 1}`,
        },
      ];
    }

    return {
      currentNodeId: transition.targetId,
      currentNode: { id: transition.targetId, name: toP?.name || transition.targetId, type: "participant", position: { x: 0, y: 0 }, size: { width: 100, height: 50 } } as any,
      visitedNodeIds: [...currentState.visitedNodeIds, transition.targetId],
      traceLog: [...currentState.traceLog, entry],
      availableTransitions: nextTransitions,
      isCompleted,
      isDeadEnd: isCompleted,
      stepCount: newStep,
      sequenceMessageIndex: nextMsgIdx,
    };
  }

  // Standard graph step
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
