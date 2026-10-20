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

  // Keep a synchronous ref to present so drag snapshot/commit never miss updates due to React batching
  const presentRef = useRef<T>(initialState);
  presentRef.current = history.present;

  /** Snapshot ref to track state before a drag/continuous operation starts. */
  const snapshotRef = useRef<T | null>(null);

  /**
   * Set new state AND push current to history (creates undo point).
   * Use for discrete actions: compile, delete, add node, style change.
   * Filters out identical states and null/undefined values to prevent empty undo steps.
   */
  const set = useCallback((newState: T) => {
    if (!newState || newState === presentRef.current) return;
    const prev = presentRef.current;
    presentRef.current = newState;
    setHistory((h) => {
      // Do not push null or identical state to past
      if (!prev || JSON.stringify(prev) === JSON.stringify(newState)) {
        return { ...h, present: newState };
      }
      return {
        past: [...h.past.slice(-maxHistory.current), prev],
        present: newState,
        future: [],
      };
    });
  }, []);

  /**
   * Replace current state WITHOUT pushing to history.
   * Use for continuous actions: dragging, live rename typing.
   * Call `commit()` when the action ends to create the undo point.
   */
  const replace = useCallback((newState: T) => {
    presentRef.current = newState;
    setHistory((h) => ({ ...h, present: newState }));
  }, []);

  /**
   * Save current state as snapshot (call at drag START).
   * Deep-clones the current state synchronously so it is preserved even during in-place mutations.
   */
  const snapshot = useCallback(() => {
    const cur = presentRef.current;
    if (cur !== null && cur !== undefined) {
      try {
        snapshotRef.current = JSON.parse(JSON.stringify(cur));
      } catch {
        snapshotRef.current = cur;
      }
    } else {
      snapshotRef.current = null;
    }
  }, []);

  /**
   * Commit: push the snapshot to history (call at drag END).
   * This makes the entire drag operation a single undo step.
   */
  const commit = useCallback(() => {
    const snap = snapshotRef.current;
    snapshotRef.current = null;
    if (snap !== null && snap !== undefined) {
      const cur = presentRef.current;
      if (cur !== null && cur !== undefined) {
        const currentJson = JSON.stringify(cur);
        const snapJson = JSON.stringify(snap);
        if (currentJson !== snapJson) {
          setHistory((h) => ({
            past: [...h.past.slice(-maxHistory.current), snap],
            present: cur,
            future: [],
          }));
        }
      }
    }
  }, []);

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.past.length === 0) return h;
      const prev = h.past[h.past.length - 1];
      if (!prev) return h;
      presentRef.current = prev;
      const newFuture = h.present ? [h.present, ...h.future] : h.future;
      return {
        past: h.past.slice(0, -1),
        present: prev,
        future: newFuture,
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((h) => {
      if (h.future.length === 0) return h;
      const next = h.future[0];
      if (!next) return h;
      presentRef.current = next;
      const newPast = h.present
        ? [...h.past.slice(-maxHistory.current), h.present]
        : h.past;
      return {
        past: newPast,
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
