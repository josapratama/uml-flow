import React, { useState, useEffect, useRef } from "react";
import type { Diagram } from "@uml-editor/shared";
import {
  initSimulation,
  stepSimulation,
  type SimulationState,
  type AvailableTransition,
} from "../../services/flow-simulator";
import { useI18n } from "../../i18n";
import { showToast } from "./Toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  diagram: Diagram | null;
  onSelectNode: (nodeId: string) => void;
  onFocusNode: (nodeId: string) => void;
}

export function FlowSimulatorModal({
  isOpen,
  onClose,
  diagram,
  onSelectNode,
  onFocusNode,
}: Props) {
  const { locale } = useI18n();
  const isId = locale === "id";

  const [state, setState] = useState<SimulationState | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const playTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize or reset simulation when opened
  useEffect(() => {
    if (isOpen && diagram) {
      const initial = initSimulation(diagram);
      setState(initial);
      setIsPlaying(false);
      setShowHistory(false);
      if (initial.currentNodeId) {
        onSelectNode(initial.currentNodeId);
        onFocusNode(initial.currentNodeId);
      }
    } else {
      setState(null);
      setIsPlaying(false);
    }
  }, [isOpen, diagram]);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, []);

  if (!isOpen || !diagram || !state) return null;

  const handleStep = (transition: AvailableTransition) => {
    const nextState = stepSimulation(diagram, state, transition);
    setState(nextState);

    if (nextState.currentNodeId) {
      onSelectNode(nextState.currentNodeId);
      onFocusNode(nextState.currentNodeId);
    }

    if (nextState.isCompleted) {
      setIsPlaying(false);
      if (playTimerRef.current) clearInterval(playTimerRef.current);
      showToast(
        isId
          ? `Alur berhasil mencapai akhir dalam ${nextState.stepCount} langkah!`
          : `Flow completed in ${nextState.stepCount} steps!`,
        "success"
      );
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    if (playTimerRef.current) clearInterval(playTimerRef.current);
    const fresh = initSimulation(diagram);
    setState(fresh);
    if (fresh.currentNodeId) {
      onSelectNode(fresh.currentNodeId);
      onFocusNode(fresh.currentNodeId);
    }
  };

  const toggleAutoPlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    } else {
      if (state.isCompleted) {
        handleReset();
      }
      setIsPlaying(true);
    }
  };

  // Auto-play effect loop
  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setInterval(() => {
        setState((current) => {
          if (!current || current.isCompleted || current.availableTransitions.length === 0) {
            setIsPlaying(false);
            if (playTimerRef.current) clearInterval(playTimerRef.current);
            return current;
          }
          // Default take the first transition on auto-play
          const transition = current.availableTransitions[0];
          const next = stepSimulation(diagram, current, transition);
          if (next.currentNodeId) {
            onSelectNode(next.currentNodeId);
            onFocusNode(next.currentNodeId);
          }
          if (next.isCompleted) {
            setIsPlaying(false);
            if (playTimerRef.current) clearInterval(playTimerRef.current);
          }
          return next;
        });
      }, 1500);
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, diagram]);

  return (
    <div className="fixed top-14 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 pointer-events-none animate-in slide-in-from-top-2 duration-150">
      <div className="bg-surface-2/95 backdrop-blur-xl border border-accent/40 rounded-2xl shadow-2xl p-3.5 pointer-events-auto flex flex-col gap-3">
        {/* Top Status Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-text uppercase tracking-wider">
                {isId ? "Simulator Alur Interaktif" : "Flow Simulator"}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-accent/15 text-accent font-semibold border border-accent/30">
                Langkah #{state.stepCount}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* View History Drawer Button */}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`px-2.5 py-1 text-xs rounded-lg border transition-all flex items-center gap-1.5 ${
                showHistory
                  ? "bg-accent text-white border-accent"
                  : "bg-surface-3 text-text-muted hover:text-text border-border"
              }`}
              title={isId ? "Lihat riwayat alur" : "View trace history"}
            >
              <span>📜</span>
              <span className="text-[11px] font-medium">{state.traceLog.length}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-surface-3 transition-colors text-sm"
              title={isId ? "Tutup Simulasi" : "Close Simulation"}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Active Node Highlight Banner */}
        <div className="p-2.5 rounded-xl bg-surface-3 border border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xl">
              {state.isCompleted ? "🏁" : state.availableTransitions.length > 1 ? "🔀" : "📍"}
            </span>
            <div className="min-w-0">
              <div className="text-xs font-bold text-text truncate">
                {state.currentNode?.name || state.currentNodeId}
              </div>
              <div className="text-[10px] text-text-muted">
                Tipe: <span className="font-mono text-accent">{state.currentNode?.type || "node"}</span>
                {state.isCompleted && " • Selesai"}
                {state.isDeadEnd && " • Jalan Buntu (Tidak ada cabang keluar)"}
              </div>
            </div>
          </div>

          {/* Reset button */}
          <button
            onClick={handleReset}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-surface-2 hover:bg-surface-4 text-text-muted hover:text-text border border-border transition-colors flex items-center gap-1"
            title={isId ? "Mulai ulang dari start" : "Restart from start"}
          >
            <span>↺</span>
            <span className="hidden sm:inline">{isId ? "Reset" : "Reset"}</span>
          </button>
        </div>

        {/* Transition Buttons (Decisions / Branches) */}
        {!state.isCompleted && state.availableTransitions.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted">
              {state.availableTransitions.length > 1
                ? (isId ? "Pilih Cabang Percabangan:" : "Choose Branch Transition:")
                : (isId ? "Langkah Berikutnya:" : "Next Step:")}
            </span>
            <div className="flex flex-wrap gap-2">
              {state.availableTransitions.map((tr) => (
                <button
                  key={tr.edgeId}
                  onClick={() => handleStep(tr)}
                  className="flex-1 min-w-[140px] px-3 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-xs flex items-center justify-between gap-2 active:scale-95 transition-all"
                >
                  <span className="truncate">👉 {tr.label}</span>
                  <span className="text-[10px] opacity-75 font-mono">({tr.targetName})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Completion Message */}
        {state.isCompleted && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>🎉</span>
              <span>{isId ? `Simulasi selesai dalam ${state.stepCount} langkah.` : `Simulation completed in ${state.stepCount} steps.`}</span>
            </div>
            <button
              onClick={handleReset}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs transition-colors"
            >
              {isId ? "Ulangi Lagi" : "Play Again"}
            </button>
          </div>
        )}

        {/* Bottom Playback Controls */}
        <div className="flex items-center justify-between pt-1 border-t border-border/60 text-xs">
          <button
            onClick={toggleAutoPlay}
            disabled={state.isCompleted && state.availableTransitions.length === 0}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              isPlaying
                ? "bg-amber-500 text-white shadow-xs"
                : "bg-surface-3 hover:bg-surface-4 text-text border border-border"
            }`}
          >
            <span>{isPlaying ? "⏸" : "▶"}</span>
            <span>{isPlaying ? (isId ? "Jeda" : "Pause") : (isId ? "Putar Otomatis" : "Auto-Play")}</span>
          </button>

          <span className="text-[11px] text-text-muted">
            {state.visitedNodeIds.length} node dikunjungi
          </span>
        </div>

        {/* Expandable Trace History Drawer */}
        {showHistory && (
          <div className="mt-2 pt-2 border-t border-border space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar animate-in slide-in-from-top-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted block">
              {isId ? "Riwayat Langkah (Execution Trace):" : "Execution Trace History:"}
            </span>
            <div className="space-y-1">
              {state.traceLog.map((entry) => (
                <div
                  key={entry.step}
                  onClick={() => {
                    onSelectNode(entry.nodeId);
                    onFocusNode(entry.nodeId);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-surface-3/80 hover:bg-surface-4 text-text text-xs flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-accent font-bold">#{entry.step}</span>
                    <span className="font-medium">{entry.nodeName}</span>
                    {entry.edgeLabel && (
                      <span className="text-[10px] text-text-muted font-mono">
                        via &quot;{entry.edgeLabel}&quot;
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-text-muted">{entry.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
