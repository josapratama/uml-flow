import { useState, useCallback, useRef } from "react";

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useHistory<T>(initialState: T) {
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  const maxHistory = useRef(50);

  /**
   * Set new state AND push current to history (creates undo point).
   * Use for discrete actions: compile, delete, add node, style change.
   */
  const set = useCallback((newState: T) => {
    setHistory((h) => ({
      past: [...h.past.slice(-maxHistory.current), h.present],
      present: newState,
      future: [],
    }));
  }, []);

  /**
   * Replace current state WITHOUT pushing to history.
   * Use for continuous actions: dragging, live rename typing.
   * Call `commit()` when the action ends to create the undo point.
   */
  const replace = useCallback((newState: T) => {
    setHistory((h) => ({ ...h, present: newState }));
  }, []);

  /** Snapshot ref to track state before a drag/continuous operation starts. */
  const snapshotRef = useRef<T | null>(null);

  /**
   * Save current state as snapshot (call at drag START).
   */
  const snapshot = useCallback(() => {
    setHistory((h) => {
      snapshotRef.current = h.present;
      return h;
    });
  }, []);

  /**
   * Commit: push the snapshot to history (call at drag END).
   * This makes the entire drag operation a single undo step.
   */
  const commit = useCallback(() => {
    if (snapshotRef.current !== null) {
      setHistory((h) => ({
        past: [...h.past.slice(-maxHistory.current), snapshotRef.current as T],
        present: h.present,
        future: [],
      }));
      snapshotRef.current = null;
    }
  }, []);

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.past.length === 0) return h;
      // Skip null entries in past to avoid losing diagram
      let idx = h.past.length - 1;
      while (idx >= 0 && h.past[idx] === null) idx--;
      if (idx < 0) return h;
      const prev = h.past[idx];
      return {
        past: h.past.slice(0, idx),
        present: prev,
        future: [h.present, ...h.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((h) => {
      if (h.future.length === 0) return h;
      const next = h.future[0];
      return {
        past: [...h.past.slice(-maxHistory.current), h.present],
        present: next,
        future: h.future.slice(1),
      };
    });
  }, []);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;
  const historyLength = history.past.length;
  const redoLength = history.future.length;

  return {
    state: history.present,
    set,
    replace,
    snapshot,
    commit,
    undo,
    redo,
    canUndo,
    canRedo,
    historyLength,
    redoLength,
  };
}
