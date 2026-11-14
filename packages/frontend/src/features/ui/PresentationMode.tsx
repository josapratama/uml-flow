import React, { useEffect, useRef, useState, useMemo } from "react";
import type { Diagram, DiagramNode } from "@uml-editor/shared";
import { useI18n } from "../../i18n";

interface Props {
  onExit: () => void;
  diagram?: Diagram | null;
}

export function PresentationMode({ onExit, diagram }: Props) {
  const { t, locale } = useI18n();
  const isId = locale === "id";
  const containerRef = useRef<HTMLDivElement>(null);

  // Presentation tool states
  const [laserActive, setLaserActive] = useState(false);
  const [laserPos, setLaserPos] = useState({ x: -100, y: -100 });
  const [spotlightActive, setSpotlightActive] = useState(false);
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [showHud, setShowHud] = useState(true);
  const hudTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nodes: DiagramNode[] = useMemo(() => diagram?.nodes || [], [diagram]);
  const currentNode: DiagramNode | null = nodes[spotlightIndex] || null;

  // Clone canvas SVG into presentation view
  useEffect(() => {
    const liveSvg = document.querySelector<SVGSVGElement>(".canvas-svg-element");
    if (!liveSvg || !containerRef.current) return;

    const clone = liveSvg.cloneNode(true) as SVGSVGElement;
    clone.removeAttribute("class");
    clone.style.width = "100%";
    clone.style.height = "100%";
    clone.style.display = "block";
    clone.style.cursor = "none";
    clone.style.pointerEvents = "none";

    const liveBg = liveSvg.style.backgroundColor || "#ffffff";
    if (containerRef.current?.parentElement) {
      containerRef.current.parentElement.style.backgroundColor = liveBg;
    }

    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(clone);
  }, []);

  // Track cursor for laser pointer and auto-hide HUD
  const handleMouseMove = (e: React.MouseEvent) => {
    setLaserPos({ x: e.clientX, y: e.clientY });
    setShowHud(true);
    if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current);
    hudTimeoutRef.current = setTimeout(() => {
      setShowHud(false);
    }, 4000);
  };

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onExit();
      } else if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        setSpotlightIndex((prev) => (prev + 1) % Math.max(1, nodes.length));
        setSpotlightActive(true);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        setSpotlightIndex((prev) => (prev - 1 + nodes.length) % Math.max(1, nodes.length));
        setSpotlightActive(true);
      } else if (e.key === "l" || e.key === "L") {
        setLaserActive((prev) => !prev);
      } else if (e.key === "s" || e.key === "S") {
        setSpotlightActive((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [nodes.length, onExit]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden select-none ${
        laserActive ? "cursor-none" : "cursor-default"
      }`}
      style={{ backgroundColor: "#ffffff" }}
      onMouseMove={handleMouseMove}
    >
      {/* SVG Container */}
      <div
        ref={containerRef}
        className="w-full h-full p-8 flex items-center justify-center"
      />

      {/* Spotlight Overlay & Node Ring */}
      {spotlightActive && currentNode && (
        <div className="absolute inset-0 pointer-events-none transition-all duration-300">
          {/* Spotlight Card at top/bottom */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 px-5 py-2.5 rounded-2xl bg-black/85 backdrop-blur-md text-white border border-white/20 shadow-2xl flex items-center gap-3 animate-in fade-in duration-150">
            <span className="w-2.5 h-2.5 rounded-full bg-accent animate-ping" />
            <div>
              <div className="text-xs font-bold flex items-center gap-2">
                <span>{currentNode.name || currentNode.id}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-accent uppercase">
                  {currentNode.type || "node"}
                </span>
              </div>
              <div className="text-[10px] text-white/70">
                Fokus Node {spotlightIndex + 1} dari {nodes.length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Virtual Laser Pointer Dot */}
      {laserActive && (
        <div
          className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2"
          style={{ left: laserPos.x, top: laserPos.y }}
        >
          <div className="w-5 h-5 rounded-full bg-rose-500/30 animate-ping absolute -inset-0.5" />
          <div className="w-4 h-4 rounded-full bg-rose-500 border-2 border-white shadow-[0_0_15px_#f43f5e]" />
        </div>
      )}

      {/* Floating Presenter HUD at Bottom */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-30 transition-all duration-200 ${
          showHud ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="bg-black/85 backdrop-blur-xl border border-white/20 rounded-2xl p-2 shadow-2xl flex items-center gap-2 text-white">
          {/* Step Back */}
          <button
            onClick={() => {
              setSpotlightIndex((prev) => (prev - 1 + nodes.length) % Math.max(1, nodes.length));
              setSpotlightActive(true);
            }}
            disabled={nodes.length === 0}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/15 transition-colors disabled:opacity-30"
            title={isId ? "Node Sebelumnya (←)" : "Previous Node (←)"}
          >
            ←
          </button>

          {/* Step Counter Indicator */}
          <span className="text-xs font-mono px-2 text-white/80">
            {nodes.length > 0 ? `${spotlightIndex + 1} / ${nodes.length}` : "Presentasi"}
          </span>

          {/* Step Next */}
          <button
            onClick={() => {
              setSpotlightIndex((prev) => (prev + 1) % Math.max(1, nodes.length));
              setSpotlightActive(true);
            }}
            disabled={nodes.length === 0}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/15 transition-colors disabled:opacity-30"
            title={isId ? "Node Selanjutnya (→ atau Spasi)" : "Next Node (→ or Space)"}
          >
            →
          </button>

          <div className="w-px h-5 bg-white/20 mx-1" />

          {/* Laser Pointer Toggle */}
          <button
            onClick={() => setLaserActive(!laserActive)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              laserActive ? "bg-rose-500 text-white shadow-xs" : "hover:bg-white/15 text-white/80"
            }`}
            title="Toggle Laser Pointer (L)"
          >
            <span>🔴</span>
            <span className="hidden sm:inline">Laser (L)</span>
          </button>

          {/* Spotlight Mode Toggle */}
          <button
            onClick={() => setSpotlightActive(!spotlightActive)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              spotlightActive ? "bg-accent text-white shadow-xs" : "hover:bg-white/15 text-white/80"
            }`}
            title="Toggle Node Spotlight Focus (S)"
          >
            <span>🔦</span>
            <span className="hidden sm:inline">Spotlight (S)</span>
          </button>

          <div className="w-px h-5 bg-white/20 mx-1" />

          {/* Exit Button */}
          <button
            onClick={onExit}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors text-white flex items-center gap-1"
            title="Keluar Layar Penuh (Esc)"
          >
            <span>✕</span>
            <span className="hidden sm:inline">{t("presentation.exit")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
