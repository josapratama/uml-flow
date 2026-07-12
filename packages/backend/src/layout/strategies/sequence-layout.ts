import type { Diagram, LayoutOptions } from "@uml-editor/shared";

/**
 * Sequence diagram layout.
 * Participants are spaced horizontally; messages are implicit (rendered by frontend).
 */
export function layoutSequence(
  diagram: Diagram,
  _options: LayoutOptions,
): Diagram {
  const result = { ...diagram };
  if (result.participants) {
    result.participants = result.participants.map((p, i) => ({
      ...p,
      position: { x: i * 180 + 80, y: 60 },
    }));
  }
  return result;
}
