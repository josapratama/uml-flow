import { useCallback } from "react";
import type { Diagram } from "@uml-editor/shared";
import type { ViewState } from "./useCanvasState";

/**
 * Zoom controls: in, out, reset, fit.
 */
export function useCanvasZoom(
  svgRef: React.RefObject<SVGSVGElement | null>,
  view: ViewState,
  setView: React.Dispatch<React.SetStateAction<ViewState>>,
  diagram: Diagram | null,
) {
  const zoomIn = useCallback(
    () => setView((v) => ({ ...v, scale: Math.min(3, v.scale * 1.2) })),
    [setView],
  );
  const zoomOut = useCallback(
    () => setView((v) => ({ ...v, scale: Math.max(0.2, v.scale * 0.8) })),
    [setView],
  );
  const zoomReset = useCallback(
    () => setView({ offsetX: 0, offsetY: 0, scale: 1 }),
    [setView],
  );

  const zoomToFit = useCallback(() => {
    if (!diagram || diagram.nodes.length === 0) return;
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const rect = svgEl.getBoundingClientRect();
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const n of diagram.nodes) {
      minX = Math.min(minX, n.position.x);
      minY = Math.min(minY, n.position.y);
      maxX = Math.max(maxX, n.position.x + n.size.width);
      maxY = Math.max(maxY, n.position.y + n.size.height);
    }
    const pad = 60;
    const worldW = maxX - minX + pad * 2;
    const worldH = maxY - minY + pad * 2;
    const newScale = Math.min(rect.width / worldW, rect.height / worldH, 2);
    const cx = (minX + maxX) / 2,
      cy = (minY + maxY) / 2;
    setView({
      scale: newScale,
      offsetX: rect.width / 2 - cx * newScale,
      offsetY: rect.height / 2 - cy * newScale,
    });
  }, [diagram, svgRef, setView]);

  const zoomToSelection = useCallback(
    (nodeIds: string[]) => {
      if (!diagram || nodeIds.length === 0) return;
      const svgEl = svgRef.current;
      if (!svgEl) return;
      const rect = svgEl.getBoundingClientRect();
      const selected = diagram.nodes.filter((n) => nodeIds.includes(n.id));
      if (selected.length === 0) return;
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
      for (const n of selected) {
        minX = Math.min(minX, n.position.x);
        minY = Math.min(minY, n.position.y);
        maxX = Math.max(maxX, n.position.x + n.size.width);
        maxY = Math.max(maxY, n.position.y + n.size.height);
      }
      const pad = 80;
      const worldW = maxX - minX + pad * 2;
      const worldH = maxY - minY + pad * 2;
      const newScale = Math.min(rect.width / worldW, rect.height / worldH, 2);
      const cx = (minX + maxX) / 2,
        cy = (minY + maxY) / 2;
      setView({
        scale: newScale,
        offsetX: rect.width / 2 - cx * newScale,
        offsetY: rect.height / 2 - cy * newScale,
      });
    },
    [diagram, svgRef, setView],
  );

  return { zoomIn, zoomOut, zoomReset, zoomToFit, zoomToSelection };
}
