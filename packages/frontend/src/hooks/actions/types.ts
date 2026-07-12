import type { Diagram } from "@uml-editor/shared";

/** Shared history interface for all action hooks. */
export interface DiagramHistory {
  set: (d: any) => void;
  replace: (d: any) => void;
  snapshot: () => void;
  commit: () => void;
}

/** Common deps for action hooks. */
export interface ActionDeps {
  diagram: Diagram | null;
  history: DiagramHistory;
  snapEnabled: boolean;
}
