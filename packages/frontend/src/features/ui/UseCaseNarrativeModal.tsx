import React, { useState, useMemo } from "react";
import type { Diagram } from "@uml-editor/shared";
import {
  extractUseCaseScenarios,
  generateUseCaseNarrativeMarkdown,
  type UseCaseScenario,
} from "../../services/use-case-narrative";
import { showToast } from "./Toast";
import { useI18n } from "../../i18n";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  diagram: Diagram | null;
}

export function UseCaseNarrativeModal({ isOpen, onClose, diagram }: Props) {
  const { locale } = useI18n();
  const isId = locale === "id";
  const [activeTab, setActiveTab] = useState<"visual" | "markdown">("visual");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const scenarios: UseCaseScenario[] = useMemo(() => {
    if (!diagram) return [];
    return extractUseCaseScenarios(diagram);
  }, [diagram]);

  const filteredScenarios = useMemo(() => {
    if (!searchQuery.trim()) return scenarios;
    const q = searchQuery.toLowerCase();
    return scenarios.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.actors.some((a) => a.toLowerCase().includes(q)),
    );
  }, [scenarios, searchQuery]);

  const activeScenario = useMemo(() => {
    if (selectedId) {
      const found = scenarios.find((s) => s.id === selectedId);
      if (found) return found;
    }
    return filteredScenarios[0] || scenarios[0] || null;
  }, [selectedId, scenarios, filteredScenarios]);

  const markdownContent = useMemo(() => {
    if (!diagram) return "";
    return generateUseCaseNarrativeMarkdown(diagram);
  }, [diagram]);

  if (!isOpen || !diagram) return null;

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdownContent);
      showToast(
        isId
          ? "Spesifikasi Use Case berhasil disalin ke clipboard!"
          : "Use Case specifications copied to clipboard!",
        "success",
      );
    } catch {
      showToast(isId ? "Gagal menyalin" : "Failed to copy", "error");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${diagram.name || "usecase"}-scenario-specifications.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(
      isId
        ? "File spesifikasi skenario use case berhasil diunduh!"
        : "Scenario specifications downloaded!",
      "success",
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-surface-1 border border-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-2/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-xl shadow-inner">
              📋
            </div>
            <div>
              <h2 className="text-base font-bold text-text flex items-center gap-2">
                {isId ? "Generator Skenario Use Case" : "Use Case Scenario Generator"}
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  {scenarios.length} Use Case
                </span>
              </h2>
              <p className="text-xs text-text-muted">
                {isId
                  ? "Spesifikasi narasi standar OMG UML 2.5 siap salin ke Bab 3/4 Skripsi & SRS"
                  : "Standard OMG UML 2.5 scenario specifications ready for thesis & documentation"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl bg-surface-3 p-1 border border-border text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab("visual")}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  activeTab === "visual"
                    ? "bg-accent text-white shadow-sm"
                    : "text-text-muted hover:text-text"
                }`}
              >
                {isId ? "Tabel Skenario" : "Scenario Table"}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("markdown")}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  activeTab === "markdown"
                    ? "bg-accent text-white shadow-sm"
                    : "text-text-muted hover:text-text"
                }`}
              >
                Markdown
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-3 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col p-6 min-h-[420px]">
          {scenarios.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="text-sm font-semibold text-text mb-1">
                {isId ? "Belum Ada Node Use Case" : "No Use Case Nodes Found"}
              </h3>
              <p className="text-xs text-text-muted max-w-sm">
                {isId
                  ? "Tambahkan elemen use case (contoh: usecase \"Login Akun\") pada diagram Anda untuk men-generate skenario otomatis."
                  : "Add use case elements to your diagram to auto-generate scenarios."}
              </p>
            </div>
          ) : activeTab === "markdown" ? (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-text-muted">
                  {isId ? "Pratinjau Kode Markdown Dokumen:" : "Markdown Document Preview:"}
                </span>
                <span className="text-xs text-text-muted">
                  {markdownContent.split("\n").length} baris
                </span>
              </div>
              <pre className="flex-1 p-4 rounded-xl bg-surface-2 border border-border text-xs font-mono text-text overflow-auto select-all leading-relaxed whitespace-pre-wrap">
                {markdownContent}
              </pre>
            </div>
          ) : (
            <div className="flex-1 flex gap-5 overflow-hidden min-h-0">
              {/* Left Sidebar List */}
              <div className="w-64 flex flex-col border-r border-border pr-4 min-h-0">
                <input
                  type="text"
                  placeholder={isId ? "Cari usecase / aktor..." : "Search usecase / actor..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-1.5 mb-3 rounded-lg bg-surface-2 border border-border text-xs text-text focus:outline-none focus:border-accent"
                />

                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                  {filteredScenarios.map((s) => {
                    const isSelected = activeScenario?.id === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedId(s.id)}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                          isSelected
                            ? "bg-accent/15 border-accent text-accent font-semibold shadow-sm"
                            : "bg-surface-2/60 border-border text-text hover:bg-surface-2 hover:border-border-hover"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-mono font-bold opacity-80">{s.code}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-3 text-text-muted">
                            {s.actors[0]}
                          </span>
                        </div>
                        <div className="text-xs truncate">{s.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Detail Specification Table */}
              <div className="flex-1 overflow-y-auto pr-1">
                {activeScenario && (
                  <div className="space-y-4">
                    {/* Header Card */}
                    <div className="p-4 rounded-xl bg-surface-2/80 border border-border flex items-start justify-between">
                      <div>
                        <div className="text-[11px] font-mono font-bold text-accent mb-0.5">
                          {activeScenario.code}
                        </div>
                        <h3 className="text-base font-bold text-text mb-1">
                          {activeScenario.name}
                        </h3>
                        <p className="text-xs text-text-muted">
                          {activeScenario.description}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[11px] px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 font-semibold">
                          👤 {activeScenario.actors.join(", ")}
                        </span>
                      </div>
                    </div>

                    {/* Meta Parameters Table */}
                    <div className="rounded-xl border border-border overflow-hidden text-xs">
                      <table className="w-full text-left border-collapse">
                        <tbody>
                          <tr className="border-b border-border bg-surface-2/40">
                            <td className="w-1/3 p-2.5 font-semibold text-text-muted border-r border-border">
                              {isId ? "Kondisi Awal (Prekondisi)" : "Precondition"}
                            </td>
                            <td className="p-2.5 text-text">{activeScenario.precondition}</td>
                          </tr>
                          <tr className="border-b border-border">
                            <td className="p-2.5 font-semibold text-text-muted border-r border-border">
                              {isId ? "Kondisi Akhir (Postkondisi)" : "Postcondition"}
                            </td>
                            <td className="p-2.5 text-text">{activeScenario.postcondition}</td>
                          </tr>
                          {(activeScenario.includes.length > 0 || activeScenario.extends.length > 0) && (
                            <tr className="border-b border-border bg-surface-2/40">
                              <td className="p-2.5 font-semibold text-text-muted border-r border-border">
                                {isId ? "Relasi Khusus UML" : "UML Relationships"}
                              </td>
                              <td className="p-2.5 text-text space-y-1">
                                {activeScenario.includes.length > 0 && (
                                  <div className="text-indigo-400 font-medium">
                                    «include» {activeScenario.includes.join(", ")}
                                  </div>
                                )}
                                {activeScenario.extends.length > 0 && (
                                  <div className="text-amber-400 font-medium">
                                    «extend» {activeScenario.extends.join(", ")}
                                  </div>
                                )}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Main Scenario Steps */}
                    <div>
                      <h4 className="text-xs font-bold text-text uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        {isId ? "Skenario Alur Utama (Normal Flow)" : "Main Success Scenario"}
                      </h4>
                      <div className="rounded-xl border border-border bg-surface-2/30 divide-y divide-border overflow-hidden text-xs">
                        {activeScenario.mainFlow.map((step, idx) => (
                          <div key={idx} className="p-2.5 flex items-start gap-3">
                            <span className="w-5 h-5 rounded-full bg-surface-3 text-text-muted font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="text-text leading-relaxed">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Alternative Flows */}
                    {activeScenario.alternativeFlows.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-text uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          {isId ? "Skenario Alur Alternatif / Eksepsi" : "Alternative / Exception Flows"}
                        </h4>
                        <div className="rounded-xl border border-border bg-surface-2/30 divide-y divide-border overflow-hidden text-xs">
                          {activeScenario.alternativeFlows.map((alt, idx) => (
                            <div key={idx} className="p-2.5 space-y-1">
                              <div className="font-semibold text-amber-400">
                                ⚠ {alt.condition}
                              </div>
                              <div className="text-text-muted pl-4">
                                ↳ {alt.action}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-surface-2/60">
          <div className="text-xs text-text-muted">
            {isId ? "Format tabel terstruktur siap paste ke Microsoft Word / Google Docs" : "Structured format ready to paste into Word"}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="px-4 py-2 rounded-xl bg-surface-3 hover:bg-surface-3/80 border border-border text-text font-semibold text-xs transition-colors flex items-center gap-2"
            >
              📋 {isId ? "Salin Markdown" : "Copy Markdown"}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold text-xs shadow-md transition-colors flex items-center gap-2"
            >
              📥 {isId ? "Unduh Dokumen (.md)" : "Download (.md)"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
