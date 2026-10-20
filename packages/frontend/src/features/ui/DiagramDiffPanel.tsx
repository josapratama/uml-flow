import React, { useState, useMemo } from "react";
import type { Diagram } from "@uml-editor/shared";
import { compareDiagrams } from "../../services/diagram-diff";
import type { SavedDiagram } from "../../services/storage";
import { useI18n } from "../../i18n";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentDiagram: Diagram | null;
  savedDiagrams: SavedDiagram[];
  onLoadVersion: (diagram: Diagram) => void;
}

export function DiagramDiffPanel({
  isOpen,
  onClose,
  currentDiagram,
  savedDiagrams,
  onLoadVersion,
}: Props) {
  const { t, locale } = useI18n();
  const isId = locale === "id";
  const [compareId, setCompareId] = useState<string>("");

  const compareDiagram = useMemo(() => {
    if (!compareId) return null;
    return savedDiagrams.find((d) => d.id === compareId)?.diagram || null;
  }, [compareId, savedDiagrams]);

  const diff = useMemo(() => {
    if (!currentDiagram || !compareDiagram) return null;
    return compareDiagrams(compareDiagram, currentDiagram);
  }, [currentDiagram, compareDiagram]);

  if (!isOpen) return null;

  const hasDiagrams = savedDiagrams.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-surface-2 border border-border rounded-xl shadow-2xl w-[520px] max-h-[75vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-base">⊕</span>
            <h2 className="text-sm font-semibold text-text">{t("modals.diffTitle")}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Compare selector */}
        <div className="px-4 py-3 border-b border-border space-y-2">
          <div className="text-[11px] text-text-muted">
            {isId
              ? "Bandingkan diagram saat ini dengan versi tersimpan:"
              : "Compare current diagram against a saved version:"}
          </div>
          {!hasDiagrams ? (
            <div className="text-[11px] text-text-muted/60 italic">
              {isId
                ? "Tidak ada diagram tersimpan. Simpan diagram ke pustaka terlebih dahulu."
                : "No saved diagrams found. Save some diagrams to the library first."}
            </div>
          ) : (
            <select
              value={compareId}
              onChange={(e) => setCompareId(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-surface-3 border border-border rounded text-text outline-none focus:border-accent"
            >
              <option value="">
                {isId ? "— Pilih diagram tersimpan untuk dibandingkan —" : "— Select a saved diagram to compare —"}
              </option>
              {savedDiagrams
                .filter((d) => d.diagram)
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({new Date(d.updatedAt).toLocaleDateString()})
                  </option>
                ))}
            </select>
          )}
        </div>

        {/* Diff results */}
        <div className="flex-1 overflow-y-auto p-4">
          {!currentDiagram ? (
            <EmptyState message={isId ? "Tidak ada diagram aktif untuk dibandingkan." : "No current diagram to compare."} />
          ) : !compareId ? (
            <EmptyState message={isId ? "Pilih diagram tersimpan di atas untuk melihat perbedaan." : "Select a saved diagram above to see the diff."} />
          ) : !diff ? (
            <EmptyState message={isId ? "Gagal menghitung perbedaan diagram." : "Could not compute diff."} />
          ) : (
            <div className="space-y-4">
              {/* Summary badge */}
              <div className="flex items-center gap-2 px-3 py-2 bg-surface-3 rounded-lg border border-border">
                <span className="text-sm">📊</span>
                <span className="text-xs text-text font-medium">
                  {diff.summary}
                </span>
              </div>

              {/* Added nodes */}
              {diff.addedNodes.length > 0 && (
                <Section
                  title={isId ? "Node Ditambahkan" : "Added Nodes"}
                  color="text-green-500"
                  icon="+"
                  count={diff.addedNodes.length}
                >
                  {diff.addedNodes.map((n) => (
                    <DiffItem
                      key={n.id}
                      color="green"
                      label={n.name}
                      sub={n.type}
                    />
                  ))}
                </Section>
              )}

              {/* Removed nodes */}
              {diff.removedNodes.length > 0 && (
                <Section
                  title={isId ? "Node Dihapus" : "Removed Nodes"}
                  color="text-error"
                  icon="−"
                  count={diff.removedNodes.length}
                >
                  {diff.removedNodes.map((n) => (
                    <DiffItem
                      key={n.id}
                      color="red"
                      label={n.name}
                      sub={n.type}
                    />
                  ))}
                </Section>
              )}

              {/* Modified nodes */}
              {diff.modifiedNodes.length > 0 && (
                <Section
                  title={isId ? "Node Dimodifikasi" : "Modified Nodes"}
                  color="text-yellow-500"
                  icon="~"
                  count={diff.modifiedNodes.length}
                >
                  {diff.modifiedNodes.map(({ node, changes }) => (
                    <DiffItem
                      key={node.id}
                      color="yellow"
                      label={node.name}
                      sub={changes.join(" · ")}
                    />
                  ))}
                </Section>
              )}

              {/* Added edges */}
              {diff.addedEdges.length > 0 && (
                <Section
                  title={isId ? "Relasi Ditambahkan" : "Added Edges"}
                  color="text-green-500"
                  icon="+"
                  count={diff.addedEdges.length}
                >
                  {diff.addedEdges.map((e) => (
                    <DiffItem
                      key={e.id}
                      color="green"
                      label={`${e.source} → ${e.target}`}
                      sub={e.type}
                    />
                  ))}
                </Section>
              )}

              {/* Removed edges */}
              {diff.removedEdges.length > 0 && (
                <Section
                  title={isId ? "Relasi Dihapus" : "Removed Edges"}
                  color="text-error"
                  icon="−"
                  count={diff.removedEdges.length}
                >
                  {diff.removedEdges.map((e) => (
                    <DiffItem
                      key={e.id}
                      color="red"
                      label={`${e.source} → ${e.target}`}
                      sub={e.type}
                    />
                  ))}
                </Section>
              )}

              {/* No changes */}
              {diff.addedNodes.length === 0 &&
                diff.removedNodes.length === 0 &&
                diff.modifiedNodes.length === 0 &&
                diff.addedEdges.length === 0 &&
                diff.removedEdges.length === 0 && (
                  <div className="text-center py-6 text-text-muted text-xs">
                    {isId
                      ? "✓ Tidak ada perbedaan — kedua versi diagram identik."
                      : "✓ No differences found — diagrams are identical."}
                  </div>
                )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        {compareDiagram && (
          <div className="flex items-center gap-2 px-4 py-3 border-t border-border">
            <button
              onClick={() => {
                onLoadVersion(compareDiagram);
                onClose();
              }}
              className="flex-1 py-1.5 text-xs bg-surface-3 border border-border rounded text-text-muted hover:text-text hover:border-accent transition-colors"
            >
              ↩ {isId ? "Pulihkan versi yang dipilih" : "Restore selected version"}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs text-text-muted bg-surface-3 border border-border rounded hover:text-text"
            >
              {t("common.close")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-10 text-text-muted text-xs">{message}</div>
  );
}

function Section({
  title,
  color,
  icon,
  count,
  children,
}: {
  title: string;
  color: string;
  icon: string;
  count: number;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div>
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="flex items-center gap-2 w-full mb-1.5 group"
      >
        <span className={`text-[11px] font-bold ${color}`}>
          {icon} {title}
        </span>
        <span className="text-[10px] text-text-muted">({count})</span>
        <span className="text-[10px] text-text-muted ml-auto opacity-50 group-hover:opacity-100">
          {collapsed ? "▶" : "▼"}
        </span>
      </button>
      {!collapsed && <div className="space-y-1 pl-2">{children}</div>}
    </div>
  );
}

function DiffItem({
  color,
  label,
  sub,
}: {
  color: "green" | "red" | "yellow";
  label: string;
  sub: string;
}) {
  const bg =
    color === "green"
      ? "bg-green-500/10 border-green-500/20"
      : color === "red"
        ? "bg-error/10 border-error/20"
        : "bg-yellow-500/10 border-yellow-500/20";
  const text =
    color === "green"
      ? "text-green-600"
      : color === "red"
        ? "text-error"
        : "text-yellow-600";

  return (
    <div
      className={`flex items-center gap-2 px-2.5 py-1.5 rounded border ${bg}`}
    >
      <span className={`text-xs font-medium ${text} min-w-0 truncate`}>
        {label}
      </span>
      <span className="text-[10px] text-text-muted shrink-0 ml-auto">
        {sub}
      </span>
    </div>
  );
}
