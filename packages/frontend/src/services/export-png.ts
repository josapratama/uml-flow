/**
 * Exports the canvas SVG as a PNG file.
 * Captures the FULL diagram content (not just the visible viewport).
 * Resets zoom/pan transform and fits all content.
 */
/**
 * Helper to calculate the bounding box of real diagram content,
 * safely ignoring giant/transparent backdrop rects or unbounded elements.
 */
function calculateContentBBox(
  diagramGroup: SVGGraphicsElement | null,
): { x: number; y: number; width: number; height: number } {
  if (!diagramGroup) return { x: 0, y: 0, width: 800, height: 600 };

  try {
    const children = Array.from(diagramGroup.children) as SVGGraphicsElement[];
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let foundValid = false;

    for (const child of children) {
      if (child.tagName.toLowerCase() === "rect") {
        const fill = child.getAttribute("fill");
        const w = parseFloat(child.getAttribute("width") || "0");
        const h = parseFloat(child.getAttribute("height") || "0");
        if (fill === "transparent" && (w >= 500 || h >= 500)) continue;
      }

      try {
        const bbox = child.getBBox();
        if (
          bbox.width > 0 &&
          bbox.height > 0 &&
          bbox.width < 3000 &&
          bbox.height < 3000
        ) {
          minX = Math.min(minX, bbox.x);
          minY = Math.min(minY, bbox.y);
          maxX = Math.max(maxX, bbox.x + bbox.width);
          maxY = Math.max(maxY, bbox.y + bbox.height);
          foundValid = true;
        }
      } catch {}
    }

    if (foundValid && maxX > minX && maxY > minY) {
      return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      };
    }

    const fullBBox = diagramGroup.getBBox();
    if (
      fullBBox.width > 0 &&
      fullBBox.height > 0 &&
      fullBBox.width < 3000 &&
      fullBBox.height < 3000
    ) {
      return fullBBox;
    }
  } catch {}

  return { x: 0, y: 0, width: 800, height: 600 };
}

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
  const diagramGroup = svgElement.querySelector(
    "g[transform]",
  ) as SVGGraphicsElement | null;

  const contentBBox = calculateContentBBox(diagramGroup);

  const padding = 40;
  const totalW = contentBBox.width + padding * 2;
  const totalH = contentBBox.height + padding * 2;

  // Reset the transform on the content group to show full diagram
  if (contentGroup) {
    // Translate so content starts at (padding, padding)
    const tx = -contentBBox.x + padding;
    const ty = -contentBBox.y + padding;
    contentGroup.setAttribute("transform", `translate(${tx}, ${ty})`);
    contentGroup.removeAttribute("style");
  }

  // Remove UI elements that shouldn't be in export
  // (resize handles, anchors, selection indicators, minimap, zoom controls)
  const removeSelectors = [
    ".resize-handles",
    ".node-anchors",
    ".validation-overlay",
    "[class*='selected']",
    "rect[fill='transparent'][width='5000']",
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

  const contentBBox = calculateContentBBox(diagramGroup);

  const padding = 40;
  const totalW = contentBBox.width + padding * 2;
  const totalH = contentBBox.height + padding * 2;

  if (contentGroup) {
    contentGroup.setAttribute(
      "transform",
      `translate(${-contentBBox.x + padding}, ${-contentBBox.y + padding})`,
    );
    contentGroup.removeAttribute("style");
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

/**
 * Export the diagram as an A4 Print-ready PDF.
 * Opens a dedicated print preview with academic styling and prompts print/save to PDF.
 */
export function exportAsPDF(
  svgElement: SVGSVGElement,
  diagramName: string,
): void {
  const svgString = getFullDiagramSVG(svgElement);
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    throw new Error("Popup blocked. Please allow popups to export PDF.");
  }

  const year = new Date().getFullYear();
  printWindow.document.write(`
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>${diagramName} - PDF Export</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 15mm;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #ffffff;
      color: #0f172a;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .sheet {
      width: 100%;
      max-width: 960px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .svg-wrapper {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      background: #ffffff;
    }
    .svg-wrapper svg {
      width: 100%;
      height: auto;
      max-height: 70vh;
    }
    .caption-box {
      margin-top: 14px;
      text-align: center;
    }
    .caption-title {
      font-size: 13px;
      font-weight: 600;
      color: #0f172a;
    }
    .caption-source {
      font-size: 11px;
      font-style: italic;
      color: #64748b;
      margin-top: 3px;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .svg-wrapper { border: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="svg-wrapper">
      ${svgString}
    </div>
    <div class="caption-box">
      <div class="caption-title">Gambar: ${diagramName}</div>
      <div class="caption-source">Sumber: Hasil Olahan UML Flow (${year})</div>
    </div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>
  `);
  printWindow.document.close();
}
