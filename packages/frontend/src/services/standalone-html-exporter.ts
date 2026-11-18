import type { Diagram } from "@uml-editor/shared";
import { getFullDiagramSVG } from "./export-png";

/**
 * Generates a self-contained, interactive HTML document containing the full diagram SVG.
 * Includes embedded vanilla JS for smooth pan, zoom, fit, search node highlighting,
 * and dark/light theme toggle. Runs completely offline in any web browser.
 */
export function exportToStandaloneHTML(
  svgElement: SVGSVGElement,
  diagram: Diagram
): string {
  let fullSvg = "";
  try {
    if (typeof XMLSerializer !== "undefined") {
      fullSvg = getFullDiagramSVG(svgElement);
    } else {
      fullSvg = `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg"><text x="20" y="30">${escapeHtml(diagram.name || "Diagram")}</text></svg>`;
    }
  } catch {
    fullSvg = `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg"><text x="20" y="30">${escapeHtml(diagram.name || "Diagram")}</text></svg>`;
  }
  const title = diagram.name || "Diagram UML Flow";
  const nodeCount = diagram.nodes?.length || 0;
  const edgeCount = diagram.edges?.length || 0;
  const diagramType = diagram.type.toUpperCase();

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} - UML Flow Viewer</title>
  <style>
    :root {
      --bg: #0f172a;
      --surface: #1e293b;
      --border: #334155;
      --text: #f8fafc;
      --muted: #94a3b8;
      --accent: #6366f1;
      --accent-hover: #4f46e5;
    }
    body.light {
      --bg: #f8fafc;
      --surface: #ffffff;
      --border: #e2e8f0;
      --text: #0f172a;
      --muted: #64748b;
      --accent: #4f46e5;
      --accent-hover: #4338ca;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      user-select: none;
    }
    body {
      background: var(--bg);
      color: var(--text);
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: background 0.2s, color 0.2s;
    }
    header {
      height: 52px;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      z-index: 10;
      flex-shrink: 0;
    }
    .logo-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .badge {
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 6px;
      background: rgba(99, 102, 241, 0.15);
      color: var(--accent);
      border: 1px solid rgba(99, 102, 241, 0.3);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text);
    }
    .meta {
      font-size: 12px;
      color: var(--muted);
      margin-left: 8px;
    }
    .controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .search-input {
      background: var(--bg);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      outline: none;
      width: 160px;
      transition: all 0.2s;
    }
    .search-input:focus {
      border-color: var(--accent);
      width: 220px;
    }
    button {
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s;
    }
    button:hover {
      background: var(--bg);
      border-color: var(--accent);
      color: var(--accent);
    }
    #viewport {
      flex: 1;
      width: 100%;
      height: 100%;
      position: relative;
      cursor: grab;
      overflow: hidden;
      background-image: radial-gradient(circle, var(--border) 1px, transparent 1px);
      background-size: 20px 20px;
    }
    #viewport.dragging {
      cursor: grabbing;
    }
    #svg-container {
      position: absolute;
      top: 0;
      left: 0;
      transform-origin: 0 0;
      will-change: transform;
    }
    svg {
      display: block;
      overflow: visible;
    }
    .highlight-node {
      filter: drop-shadow(0 0 8px #6366f1) !important;
      stroke: #6366f1 !important;
      stroke-width: 3px !important;
    }
    .floating-hud {
      position: absolute;
      bottom: 16px;
      right: 16px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 6px 10px;
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
      z-index: 5;
    }
    .zoom-text {
      font-size: 12px;
      font-weight: 600;
      color: var(--muted);
      min-width: 44px;
      text-align: center;
    }
    .footer-info {
      position: absolute;
      bottom: 16px;
      left: 16px;
      font-size: 11px;
      color: var(--muted);
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 4px 10px;
      border-radius: 8px;
      pointer-events: none;
      z-index: 5;
    }
  </style>
</head>
<body class="dark">
  <header>
    <div class="logo-group">
      <span class="badge">${diagramType}</span>
      <span class="title">${escapeHtml(title)}</span>
      <span class="meta">(${nodeCount} node â€¢ ${edgeCount} relasi)</span>
    </div>
    <div class="controls">
      <input type="text" id="search-input" class="search-input" placeholder="Cari elemen / node..." />
      <button id="btn-theme" title="Ubah Tema Gelap/Terang">ðŸŒ“ Tema</button>
      <button id="btn-fit" title="Sesuaikan Tampilan (Fit Screen)">â›° Fit</button>
      <button id="btn-reset" title="Reset Zoom">100%</button>
      <button id="btn-download" title="Unduh File SVG Ini">â¬‡ Unduh SVG</button>
    </div>
  </header>

  <div id="viewport">
    <div id="svg-container">
      ${fullSvg}
    </div>
    <div class="floating-hud">
      <button id="btn-zoom-out" style="padding: 4px 8px;">âˆ’</button>
      <span id="zoom-val" class="zoom-text">100%</span>
      <button id="btn-zoom-in" style="padding: 4px 8px;">+</button>
    </div>
    <div class="footer-info">
      Interaktif: Drag mouse untuk Pan â€¢ Scroll untuk Zoom â€¢ Klik 2x untuk Fit
    </div>
  </div>

  <script>
    (function() {
      var viewport = document.getElementById("viewport");
      var container = document.getElementById("svg-container");
      var zoomVal = document.getElementById("zoom-val");
      var searchInput = document.getElementById("search-input");
      var btnTheme = document.getElementById("btn-theme");
      var btnFit = document.getElementById("btn-fit");
      var btnReset = document.getElementById("btn-reset");
      var btnZoomIn = document.getElementById("btn-zoom-in");
      var btnZoomOut = document.getElementById("btn-zoom-out");
      var btnDownload = document.getElementById("btn-download");

      var scale = 1;
      var panX = 0;
      var panY = 0;
      var isDragging = false;
      var startX = 0;
      var startY = 0;

      function updateTransform() {
        container.style.transform = "translate(" + panX + "px, " + panY + "px) scale(" + scale + ")";
        zoomVal.textContent = Math.round(scale * 100) + "%";
      }

      function fitDiagram() {
        var svg = container.querySelector("svg");
        if (!svg) return;
        var bbox = svg.getBBox();
        var vw = viewport.clientWidth - 80;
        var vh = viewport.clientHeight - 80;
        if (bbox.width <= 0 || bbox.height <= 0) return;
        scale = Math.min(vw / bbox.width, vh / bbox.height, 1.5);
        scale = Math.max(scale, 0.2);
        panX = (viewport.clientWidth - bbox.width * scale) / 2 - bbox.x * scale;
        panY = (viewport.clientHeight - bbox.height * scale) / 2 - bbox.y * scale;
        updateTransform();
      }

      viewport.addEventListener("mousedown", function(e) {
        if (e.button !== 0) return;
        isDragging = true;
        startX = e.clientX - panX;
        startY = e.clientY - panY;
        viewport.classList.add("dragging");
      });

      window.addEventListener("mousemove", function(e) {
        if (!isDragging) return;
        panX = e.clientX - startX;
        panY = e.clientY - startY;
        updateTransform();
      });

      window.addEventListener("mouseup", function() {
        isDragging = false;
        viewport.classList.remove("dragging");
      });

      viewport.addEventListener("wheel", function(e) {
        e.preventDefault();
        var delta = e.deltaY < 0 ? 1.15 : 0.85;
        var newScale = Math.min(Math.max(scale * delta, 0.1), 5);
        var rect = viewport.getBoundingClientRect();
        var mx = e.clientX - rect.left;
        var my = e.clientY - rect.top;
        panX = mx - (mx - panX) * (newScale / scale);
        panY = my - (my - panY) * (newScale / scale);
        scale = newScale;
        updateTransform();
      }, { passive: false });

      viewport.addEventListener("dblclick", function(e) {
        if (e.target === viewport || e.target === container) {
          fitDiagram();
        }
      });

      btnZoomIn.addEventListener("click", function() {
        scale = Math.min(scale * 1.2, 5);
        updateTransform();
      });

      btnZoomOut.addEventListener("click", function() {
        scale = Math.max(scale / 1.2, 0.1);
        updateTransform();
      });

      btnReset.addEventListener("click", function() {
        scale = 1;
        panX = 40;
        panY = 40;
        updateTransform();
      });

      btnFit.addEventListener("click", fitDiagram);

      btnTheme.addEventListener("click", function() {
        document.body.classList.toggle("light");
        document.body.classList.toggle("dark");
      });

      btnDownload.addEventListener("click", function() {
        var svg = container.querySelector("svg");
        if (!svg) return;
        var xml = new XMLSerializer().serializeToString(svg);
        var blob = new Blob([xml], { type: "image/svg+xml" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "${escapeHtml(diagram.name)}.svg";
        a.click();
        URL.revokeObjectURL(url);
      });

      searchInput.addEventListener("input", function() {
        var query = searchInput.value.trim().toLowerCase();
        var texts = container.querySelectorAll("text");
        texts.forEach(function(t) {
          var parentNode = t.closest(".uml-node, g");
          if (!parentNode) return;
          if (query && t.textContent.toLowerCase().includes(query)) {
            parentNode.classList.add("highlight-node");
          } else {
            parentNode.classList.remove("highlight-node");
          }
        });
      });

      // Initial auto-fit
      setTimeout(fitDiagram, 50);
    })();
  </script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
