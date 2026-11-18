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
    if (!diagram) return;
    const hasNodes = diagram.nodes && diagram.nodes.length > 0;
    const hasParticipants = diagram.participants && diagram.participants.length > 0;
    if (!hasNodes && !hasParticipants) return;
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const rect = svgEl.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    for (const n of diagram.nodes || []) {
      minX = Math.min(minX, n.position.x);
      minY = Math.min(minY, n.position.y);
      maxX = Math.max(maxX, n.position.x + (n.size?.width || 120));
      maxY = Math.max(maxY, n.position.y + (n.size?.height || 60));
    }

    for (const p of diagram.participants || []) {
      minX = Math.min(minX, p.position.x - 60);
      minY = Math.min(minY, p.position.y - 20);
      maxX = Math.max(maxX, p.position.x + 60);
      const msgCount = diagram.messages?.length || 0;
      maxY = Math.max(maxY, 120 + (msgCount + 2) * 50);
    }

    // For usecase diagrams, add extra margin for the system boundary frame & header bar
    if (diagram.type === "usecase") {
      const ucNodes = diagram.nodes?.filter((n) => n.type === "usecase");
      if (ucNodes && ucNodes.length > 0) {
        minY -= 56;
        minX -= 40;
        maxX += 40;
        maxY += 36;
      }
    }

    const topPadScreen = 68; // Reserve space for CanvasControls floating bar at top
    const bottomPadScreen = 40;
    const horizontalPadScreen = 48;

    const availableW = Math.max(100, rect.width - horizontalPadScreen * 2);
    const availableH = Math.max(100, rect.height - topPadScreen - bottomPadScreen);

    const worldW = Math.max(100, maxX - minX);
    const worldH = Math.max(100, maxY - minY);
    const newScale = Math.min(availableW / worldW, availableH / worldH, 1.15);
    const safeScale = Math.max(0.35, newScale);

    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    const targetCenterX = horizontalPadScreen + availableW / 2;
    const targetCenterY = topPadScreen + availableH / 2;

    setView({
      scale: safeScale,
      offsetX: targetCenterX - cx * safeScale,
      offsetY: targetCenterY - cy * safeScale,
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
      const topPadScreen = 68;
      const bottomPadScreen = 40;
      const horizontalPadScreen = 48;

      const availableW = Math.max(100, rect.width - horizontalPadScreen * 2);
      const availableH = Math.max(100, rect.height - topPadScreen - bottomPadScreen);

      const worldW = Math.max(100, maxX - minX);
      const worldH = Math.max(100, maxY - minY);
      const newScale = Math.min(availableW / worldW, availableH / worldH, 1.5);
      const safeScale = Math.max(0.35, newScale);

      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;

      const targetCenterX = horizontalPadScreen + availableW / 2;
      const targetCenterY = topPadScreen + availableH / 2;

      setView({
        scale: safeScale,
        offsetX: targetCenterX - cx * safeScale,
        offsetY: targetCenterY - cy * safeScale,
      });
    },
    [diagram, svgRef, setView],
  );

  return { zoomIn, zoomOut, zoomReset, zoomToFit, zoomToSelection };
}
