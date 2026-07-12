import { useCallback } from "react";
import type { ActionDeps } from "./types";

/** Sequence diagram actions: participants, messages. */
export function useSequenceActions({ diagram, history }: ActionDeps) {
  const participantMove = useCallback(
    (id: string, x: number) => {
      if (!diagram) return;
      history.replace({
        ...diagram,
        participants: (diagram.participants || []).map((p) =>
          p.id === id ? { ...p, position: { ...p.position, x } } : p,
        ),
      });
    },
    [diagram, history],
  );

  const participantRename = useCallback(
    (id: string, name: string) => {
      if (!diagram || !name.trim()) return;
      history.set({
        ...diagram,
        participants: (diagram.participants || []).map((p) =>
          p.id === id ? { ...p, name: name.trim() } : p,
        ),
      });
    },
    [diagram, history],
  );

  const messageEdit = useCallback(
    (id: string, label: string) => {
      if (!diagram) return;
      history.set({
        ...diagram,
        messages: (diagram.messages || []).map((m) =>
          m.id === id ? { ...m, label } : m,
        ),
      });
    },
    [diagram, history],
  );

  const messageDelete = useCallback(
    (id: string) => {
      if (!diagram) return;
      const msgs = (diagram.messages || []).filter((m) => m.id !== id);
      history.set({
        ...diagram,
        messages: msgs.map((m, i) => ({ ...m, order: i })),
      });
    },
    [diagram, history],
  );

  const messageReorder = useCallback(
    (id: string, newOrder: number) => {
      if (!diagram) return;
      const msgs = [...(diagram.messages || [])];
      const idx = msgs.findIndex((m) => m.id === id);
      if (idx < 0) return;
      const [moved] = msgs.splice(idx, 1);
      msgs.splice(Math.max(0, Math.min(msgs.length, newOrder)), 0, moved);
      history.set({
        ...diagram,
        messages: msgs.map((m, i) => ({ ...m, order: i })),
      });
    },
    [diagram, history],
  );

  const addMessage = useCallback(
    (from: string, to: string, label: string, type: string) => {
      if (!diagram) return;
      const msgs = diagram.messages || [];
      history.set({
        ...diagram,
        messages: [
          ...msgs,
          {
            id: `msg_${Date.now()}`,
            from,
            to,
            label: label || "message()",
            type: type as any,
            order: msgs.length,
          },
        ],
      });
    },
    [diagram, history],
  );

  return {
    participantMove,
    participantRename,
    messageEdit,
    messageDelete,
    messageReorder,
    addMessage,
  };
}
