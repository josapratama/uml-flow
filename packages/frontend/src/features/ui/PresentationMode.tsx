import { useEffect, useRef } from "react";

interface Props {
  onExit: () => void;
}

/**
 * Fullscreen presentation mode.
 * Clones the canvas SVG at render time (captures current zoom/pan state),
 * scales it to fill the screen, and shows it without any UI chrome.
 */
export function PresentationMode({ onExit }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Clone the live canvas SVG including its current transform (zoom/pan)
    const liveSvg = document.querySelector<SVGSVGElement>(
      ".canvas-svg-element",
    );
    if (!liveSvg || !containerRef.current) return;

    const clone = liveSvg.cloneNode(true) as SVGSVGElement;

    // Remove interactive attributes from clone
    clone.removeAttribute("class");
    clone.style.width = "100%";
    clone.style.height = "100%";
    clone.style.display = "block";
    clone.style.cursor = "default";

    // Disable pointer events on all elements inside clone
    clone.style.pointerEvents = "none";

    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(clone);
  }, []);

  // Keyboard Esc to exit
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onExit();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onExit]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "#ffffff" }}
      onClick={onExit}
    >
      {/* Exit hint — appears on hover */}
      <div className="absolute top-4 right-4 opacity-0 hover:opacity-100 transition-opacity z-10 pointer-events-auto">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExit();
          }}
          className="px-3 py-1.5 bg-black/80 text-white rounded-lg text-sm"
        >
          Exit (Esc)
        </button>
      </div>

      {/* ESC hint at bottom */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-400 opacity-50 pointer-events-none">
        Click anywhere or press Esc to exit
      </div>

      {/* SVG container */}
      <div
        ref={containerRef}
        className="w-full h-full p-8"
        style={{ pointerEvents: "none" }}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
