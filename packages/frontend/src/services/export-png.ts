/**
 * Exports the canvas SVG as a PNG file.
 * Captures the FULL diagram content (not just the visible viewport).
 * Resets zoom/pan transform and fits all content.
 */
export async function exportAsPNG(
  svgElement: SVGSVGElement,
  filename: string,
  scale: number = 2,
): Promise<void> {
  // Clone the SVG
  const clone = svgElement.cloneNode(true) as SVGSVGElement;

  // Find the main content group (has the transform with translate/scale)
  const contentGroup = clone.querySelector(
    "g[transform]",
  ) as SVGGElement | null;

  // Calculate the bounding box of all diagram content
  // We do this on the ORIGINAL element to get real coordinates
  const diagramGroup = svgElement.querySelector(
    "g[transform]",
  ) as SVGGElement | null;

  let contentBBox = { x: 0, y: 0, width: 800, height: 600 };
  if (diagramGroup) {
    try {
      const bbox = (diagramGroup as SVGGraphicsElement).getBBox();
      if (bbox.width > 0 && bbox.height > 0) {
        contentBBox = bbox;
      }
    } catch {
      // getBBox can fail if element is not rendered
    }
  }

  const padding = 40;
  const totalW = contentBBox.width + padding * 2;
  const totalH = contentBBox.height + padding * 2;

  // Reset the transform on the content group to show full diagram
  if (contentGroup) {
    // Translate so content starts at (padding, padding)
    const tx = -contentBBox.x + padding;
    const ty = -contentBBox.y + padding;
    contentGroup.setAttribute("transform", `translate(${tx}, ${ty})`);
  }

  // Remove UI elements that shouldn't be in export
  // (resize handles, anchors, selection indicators, minimap, zoom controls)
  const removeSelectors = [
    ".resize-handles",
    ".node-anchors",
    ".validation-overlay",
    "[class*='selected']",
  ];
  removeSelectors.forEach((sel) => {
    clone.querySelectorAll(sel).forEach((el) => el.remove());
  });

  // Remove selection visual indicators (blue borders)
  clone.querySelectorAll(".uml-node.selected").forEach((el) => {
    el.classList.remove("selected");
  });
  clone.querySelectorAll(".uml-edge.selected").forEach((el) => {
    el.classList.remove("selected");
  });

  // Set SVG dimensions to fit full content
  clone.setAttribute("width", String(totalW));
  clone.setAttribute("height", String(totalH));
  clone.setAttribute("viewBox", `0 0 ${totalW} ${totalH}`);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

  // Set white background
  const bgRect = clone.querySelector("rect[width='100%']");
  if (bgRect) {
    bgRect.setAttribute("fill", "#ffffff");
    bgRect.setAttribute("width", String(totalW));
    bgRect.setAttribute("height", String(totalH));
  }

  // Remove grid pattern (not needed in export)
  const gridPattern = clone.querySelector("#grid");
  if (gridPattern) {
    const gridRect = clone.querySelector("rect[fill='url(#grid)']");
    if (gridRect) gridRect.setAttribute("fill", "#ffffff");
  }

  const svgData = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = totalW * scale;
      canvas.height = totalH * scale;
      const ctx = canvas.getContext("2d")!;

      // White background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        if (!blob) {
          resolve();
          return;
        }
        const pngUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = pngUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(pngUrl), 1000);
        resolve();
      }, "image/png");
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to render SVG to image"));
    };
    img.src = url;
  });
}

/**
 * Get SVG string of the full diagram (for clipboard or other uses).
 * Same logic as exportAsPNG but returns SVG string.
 */
export function getFullDiagramSVG(svgElement: SVGSVGElement): string {
  const clone = svgElement.cloneNode(true) as SVGSVGElement;
  const diagramGroup = svgElement.querySelector(
    "g[transform]",
  ) as SVGGraphicsElement | null;
  const contentGroup = clone.querySelector(
    "g[transform]",
  ) as SVGGElement | null;

  let contentBBox = { x: 0, y: 0, width: 800, height: 600 };
  if (diagramGroup) {
    try {
      const bbox = diagramGroup.getBBox();
      if (bbox.width > 0 && bbox.height > 0) contentBBox = bbox;
    } catch {}
  }

  const padding = 40;
  const totalW = contentBBox.width + padding * 2;
  const totalH = contentBBox.height + padding * 2;

  if (contentGroup) {
    contentGroup.setAttribute(
      "transform",
      `translate(${-contentBBox.x + padding}, ${-contentBBox.y + padding})`,
    );
  }

  clone.setAttribute("width", String(totalW));
  clone.setAttribute("height", String(totalH));
  clone.setAttribute("viewBox", `0 0 ${totalW} ${totalH}`);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  const bgRect = clone.querySelector("rect[width='100%']");
  if (bgRect) {
    bgRect.setAttribute("fill", "#ffffff");
    bgRect.setAttribute("width", String(totalW));
    bgRect.setAttribute("height", String(totalH));
  }

  return new XMLSerializer().serializeToString(clone);
}
