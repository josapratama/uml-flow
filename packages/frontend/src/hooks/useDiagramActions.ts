import type { Diagram } from "@uml-editor/shared";
import { useNodeActions } from "./actions/useNodeActions";
import { useEdgeActions } from "./actions/useEdgeActions";
import { useSequenceActions } from "./actions/useSequenceActions";
import { useLayoutActions } from "./actions/useLayoutActions";
import type { DiagramHistory } from "./actions/types";

/**
 * Combines all diagram mutation actions into a single hook.
 * Each category is implemented in its own file under ./actions/.
 */
export function useDiagramActions(
  diagram: Diagram | null,
  history: DiagramHistory,
  snapEnabled: boolean,
) {
  const deps = { diagram, history, snapEnabled };

  const nodeActions = useNodeActions(deps);
  const edgeActions = useEdgeActions(deps);
  const sequenceActions = useSequenceActions(deps);
  const layoutActions = useLayoutActions(deps);

  return {
    ...nodeActions,
    ...edgeActions,
    ...sequenceActions,
    ...layoutActions,
  };
}
