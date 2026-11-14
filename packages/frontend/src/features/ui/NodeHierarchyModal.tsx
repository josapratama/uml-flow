import React, { useState, useMemo } from "react";
import type { Diagram, DiagramNode } from "@uml-editor/shared";
import { useI18n } from "../../i18n";

interface NodeHierarchyModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagram: Diagram | null;
  onSelectNode?: (nodeId: string) => void;
  onFocusNode?: (nodeId: string) => void;
}

export function NodeHierarchyModal({
  isOpen,
  onClose,
  diagram,
  onSelectNode,
  onFocusNode,
}: NodeHierarchyModalProps) {
  const { locale } = useI18n();
  const isId = locale === "id";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Calculate degrees & relationships for all nodes
  const nodeStats = useMemo(() => {
    if (!diagram || !diagram.nodes) return new Map<string, { inDegree: number; outDegree: number; relatedNodeNames: string[] }>();

    const stats = new Map<string, { inDegree: number; outDegree: number; relatedNodeNames: string[] }>();
    for (const n of diagram.nodes) {
      stats.set(n.id, { inDegree: 0, outDegree: 0, relatedNodeNames: [] });
    }

    if (diagram.edges) {
      for (const e of diagram.edges) {
        const srcStat = stats.get(e.source);
        const tgtStat = stats.get(e.target);
        const tgtNode = diagram.nodes.find((n) => n.id === e.target);
        const srcNode = diagram.nodes.find((n) => n.id === e.source);

        if (srcStat) {
          srcStat.outDegree++;
          if (tgtNode && !srcStat.relatedNodeNames.includes(tgtNode.name || tgtNode.id)) {
            srcStat.relatedNodeNames.push(tgtNode.name || tgtNode.id);
          }
        }
        if (tgtStat) {
          tgtStat.inDegree++;
          if (srcNode && !tgtStat.relatedNodeNames.includes(srcNode.name || srcNode.id)) {
            tgtStat.relatedNodeNames.push(srcNode.name || srcNode.id);
          }
        }
      }
    }

    return stats;
  }, [diagram]);

  // Group nodes by category/type
  const categorizedNodes = useMemo(() => {
    if (!diagram || !diagram.nodes) return { categories: [], filteredNodes: [] };

    const nodes = diagram.nodes;
    const cats = new Set<string>();

    for (const n of nodes) {
      const type = n.type || "general";
      cats.add(type);
    }

    const filtered = nodes.filter((n) => {
      const name = (n.name || n.id).toLowerCase();
      const type = (n.type || "general").toLowerCase();
      const matchesSearch = name.includes(searchQuery.toLowerCase()) || type.includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || type === selectedCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });

    return {
      categories: Array.from(cats),
      filteredNodes: filtered,
    };
  }, [diagram, searchQuery, selectedCategory]);

  if (!isOpen || !diagram) return null;

  const totalNodes = diagram.nodes?.length || 0;
  const totalEdges = diagram.edges?.length || 0;
  const isolatedNodes = diagram.nodes?.filter((n) => {
    const stat = nodeStats.get(n.id);
    return (stat?.inDegree || 0) === 0 && (stat?.outDegree || 0) === 0;
  }).length || 0;

  const handleNodeClick = (nodeId: string) => {
    if (onSelectNode) onSelectNode(nodeId);
    if (onFocusNode) onFocusNode(nodeId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[88vh] bg-surface-1 border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden text-text">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-2/60">
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2 rounded-xl bg-accent/10 border border-accent/20">
              🌳
            </span>
            <div>
              <h2 className="text-lg font-bold text-text">
                {isId
                  ? "Navigator Hierarki & Arsitektur Lapisan"
                  : "Architecture Layer & Node Hierarchy Navigator"}
              </h2>
              <p className="text-xs text-text-muted">
                {isId
                  ? "Eksplorasi struktur komponen, koneksi derajat, dan lompat langsung ke canvas"
                  : "Explore component structure, connectivity degrees, and jump directly on canvas"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-3 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Global Summary Stats */}
        <div className="grid grid-cols-3 gap-3 px-6 py-3 bg-surface-2/40 border-b border-border text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-text">{isId ? "Total Node:" : "Total Nodes:"}</span>
            <span className="px-2 py-0.5 rounded-full bg-accent/15 text-accent font-bold">
              {totalNodes}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-text">{isId ? "Total Relasi:" : "Total Relations:"}</span>
            <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold">
              {totalEdges}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-text">{isId ? "Node Terisolasi:" : "Isolated Nodes:"}</span>
            <span
              className={`px-2 py-0.5 rounded-full font-bold ${
                isolatedNodes > 0
                  ? "bg-amber-500/15 text-amber-500"
                  : "bg-emerald-500/15 text-emerald-500"
              }`}
            >
              {isolatedNodes}
            </span>
          </div>
        </div>

        {/* Search & Category Tabs */}
        <div className="p-4 border-b border-border space-y-3 bg-surface-1">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isId
                  ? "🔍 Cari nama node, tipe arsitektur, atau entitas..."
                  : "🔍 Search node name, architecture type, or entity..."
              }
              className="w-full px-4 py-2 pl-9 bg-surface-2 border border-border rounded-xl text-sm text-text placeholder-text-muted focus:outline-none focus:border-accent"
              autoFocus
            />
            <span className="absolute left-3 top-2.5 text-text-muted">🔎</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-xs text-text-muted hover:text-text"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs text-text-muted mr-1 font-medium">
              {isId ? "Kategori:" : "Category:"}
            </span>
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-2.5 py-1 text-xs rounded-lg transition-all font-medium ${
                selectedCategory === "all"
                  ? "bg-accent text-white shadow-xs"
                  : "bg-surface-3 text-text-muted hover:text-text"
              }`}
            >
              {isId ? "Semua Tipe" : "All Types"} ({totalNodes})
            </button>
            {categorizedNodes.categories.map((cat) => {
              const count =
                diagram.nodes?.filter((n) => (n.type || "general").toLowerCase() === cat.toLowerCase())
                  .length || 0;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-all font-medium capitalize ${
                    selectedCategory.toLowerCase() === cat.toLowerCase()
                      ? "bg-accent text-white shadow-xs"
                      : "bg-surface-3 text-text-muted hover:text-text"
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Node Hierarchy List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 max-h-[50vh]">
          {categorizedNodes.filteredNodes.length === 0 ? (
            <div className="py-12 text-center text-text-muted">
              <span className="text-3xl block mb-2">🔍</span>
              {isId
                ? "Tidak ada node yang cocok dengan pencarian / filter ini."
                : "No nodes matched this search or category filter."}
            </div>
          ) : (
            categorizedNodes.filteredNodes.map((node) => {
              const stat = nodeStats.get(node.id) || {
                inDegree: 0,
                outDegree: 0,
                relatedNodeNames: [],
              };
              const totalDegree = stat.inDegree + stat.outDegree;

              // Extract extra details (attributes, methods, fields)
              const attrs = (node as any).attributes || (node as any).fields || [];
              const methods = (node as any).methods || [];

              return (
                <div
                  key={node.id}
                  onClick={() => handleNodeClick(node.id)}
                  className="group flex flex-col md:flex-row md:items-center justify-between p-3.5 bg-surface-2/60 hover:bg-surface-3 border border-border/80 hover:border-accent/50 rounded-xl transition-all cursor-pointer gap-3 shadow-xs"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="p-2 rounded-lg bg-surface-3 group-hover:bg-accent/20 group-hover:text-accent transition-colors text-lg shrink-0">
                      📦
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-text text-sm group-hover:text-accent transition-colors">
                          {node.name || node.id}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-surface-4 text-text-muted uppercase tracking-wider border border-border">
                          {node.type || "Node"}
                        </span>
                        {(node as any).stereotype && (
                          <span className="px-1.5 py-0.5 text-[10px] italic rounded bg-primary/10 text-primary border border-primary/20">
                            «{(node as any).stereotype}»
                          </span>
                        )}
                      </div>

                      {/* Detail attributes / methods preview */}
                      <div className="flex items-center gap-2 mt-1 text-xs text-text-muted flex-wrap">
                        {attrs.length > 0 && (
                          <span className="inline-flex items-center gap-1">
                            🔹 {attrs.length} {isId ? "atribut/kolom" : "fields/attrs"}
                          </span>
                        )}
                        {methods.length > 0 && (
                          <span className="inline-flex items-center gap-1">
                            ⚡ {methods.length} {isId ? "method" : "methods"}
                          </span>
                        )}
                        {stat.relatedNodeNames.length > 0 && (
                          <span className="text-[11px] text-text-muted truncate max-w-xs">
                            🔗 {stat.relatedNodeNames.join(", ")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Degree metrics & Focus action */}
                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    <div className="flex items-center gap-1.5 text-xs font-mono">
                      <span
                        className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        title={isId ? "Koneksi Masuk (In-degree)" : "Incoming Degree"}
                      >
                        ↓ {stat.inDegree} in
                      </span>
                      <span
                        className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        title={isId ? "Koneksi Keluar (Out-degree)" : "Outgoing Degree"}
                      >
                        ↑ {stat.outDegree} out
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNodeClick(node.id);
                      }}
                      className="px-2.5 py-1 text-xs font-medium bg-accent/15 hover:bg-accent text-accent hover:text-white rounded-lg transition-all flex items-center gap-1"
                      title={isId ? "Fokus ke node di canvas" : "Focus on canvas"}
                    >
                      🎯 {isId ? "Fokus" : "Focus"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-border bg-surface-2/60 flex items-center justify-between text-xs text-text-muted">
          <span>
            {isId
              ? "Klik pada node mana saja untuk langsung memperbesar & memusatkan pandangan canvas."
              : "Click any node to smoothly zoom & center canvas viewport onto it."}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-surface-3 hover:bg-surface-4 text-text font-medium rounded-lg transition-colors"
          >
            {isId ? "Tutup" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
