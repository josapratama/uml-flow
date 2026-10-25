import React, { useState, useRef, useEffect, useMemo } from "react";
import { useI18n } from "../../i18n";
import { RICH_SAMPLES, type SampleItem } from "../../data/samples";

interface Props {
  onSampleChange: (sampleId: string, inNewTab?: boolean) => void;
}

export function SamplesMenu({ onSampleChange }: Props) {
  const { t, locale } = useI18n();
  const isId = locale === "id";
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [confirmSample, setConfirmSample] = useState<SampleItem | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setConfirmSample(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const categories = useMemo(() => [
    { id: "all", label: isId ? "Semua" : "All" },
    { id: "database", label: "ERD" },
    { id: "api", label: "Sequence" },
    { id: "architecture", label: "Class / Arch" },
    { id: "workflow", label: "Flow & Activity" },
    { id: "lifecycle", label: "State" },
    { id: "system", label: "System & Infra" },
  ], [isId]);

  const filteredSamples = useMemo(() => {
    if (selectedCategory === "all") return RICH_SAMPLES;
    return RICH_SAMPLES.filter((s) => s.category === selectedCategory);
  }, [selectedCategory]);

  const handleApply = (sample: SampleItem, inNewTab: boolean) => {
    onSampleChange(sample.id, inNewTab);
    setOpen(false);
    setConfirmSample(null);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`h-8 px-2.5 text-xs font-medium rounded-lg border transition-all flex items-center gap-1.5 ${
          open
            ? "bg-surface-4 text-text border-accent shadow-xs"
            : "bg-surface-3 text-text-muted hover:text-text hover:bg-surface-4 border-border"
        }`}
        title={t("samples.menuTooltip")}
      >
        <span>📚</span>
        <span className="hidden sm:inline md:hidden xl:inline">{t("samples.menuTitle")}</span>
        <span className="hidden md:inline xl:hidden">Contoh</span>
        <svg
          width="8"
          height="8"
          viewBox="0 0 10 10"
          className={`transition-transform opacity-60 ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M2 3.5 L5 6.5 L8 3.5"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 w-88 sm:w-96 bg-surface-2/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Header */}
          <div className="px-2 pt-1 pb-2 border-b border-border/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text flex items-center gap-1.5">
                <span>📚</span>
                <span>{isId ? "Koleksi Contoh Diagram Studi Kasus" : "Diagram Case Study Presets"}</span>
              </span>
              <span className="text-[10px] font-mono text-accent bg-accent/15 px-1.5 py-0.5 rounded font-semibold">
                {RICH_SAMPLES.length} {isId ? "Kasus" : "Presets"}
              </span>
            </div>
            <p className="text-[10px] text-text-muted mt-0.5">
              {isId
                ? "Pilih contoh nyata siap pakai untuk memandu desain atau dokumentasi Anda:"
                : "Choose a production-grade template to jumpstart your design:"}
            </p>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 mt-2 overflow-x-auto pb-0.5 custom-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2 py-0.8 text-[10px] rounded-md font-medium transition-all shrink-0 ${
                    selectedCategory === cat.id
                      ? "bg-accent text-white shadow-2xs font-semibold"
                      : "bg-surface-3 text-text-muted hover:text-text hover:bg-surface-4"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Konfirmasi Tab Baru / Timpa Kanvas */}
          {confirmSample ? (
            <div className="p-3 my-2 rounded-lg bg-surface-3 border border-accent/40 animate-in fade-in">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{confirmSample.icon}</span>
                <span className="text-xs font-bold text-text">
                  {isId ? confirmSample.titleId : confirmSample.title}
                </span>
              </div>
              <p className="text-[10px] text-text-muted mb-2.5 leading-relaxed">
                {isId
                  ? "Bagaimana Anda ingin memuat contoh diagram ini?"
                  : "How would you like to load this sample diagram?"}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleApply(confirmSample, true)}
                  className="flex-1 py-1.5 px-2 rounded-md bg-accent hover:bg-accent-hover text-white text-[11px] font-semibold transition-colors shadow-xs"
                >
                  📑 {isId ? "Buka di Tab Baru" : "Open in New Tab"}
                </button>
                <button
                  onClick={() => handleApply(confirmSample, false)}
                  className="py-1.5 px-2.5 rounded-md bg-surface-4 hover:bg-error/20 hover:text-error text-text-muted text-[11px] font-medium transition-colors border border-border"
                >
                  {isId ? "Timpa Kanvas Ini" : "Replace Current"}
                </button>
                <button
                  onClick={() => setConfirmSample(null)}
                  className="py-1.5 px-2 rounded-md text-text-muted hover:text-text text-[11px] transition-colors"
                >
                  {isId ? "Batal" : "Cancel"}
                </button>
              </div>
            </div>
          ) : (
            /* Daftar Preset */
            <div className="max-h-76 overflow-y-auto custom-scrollbar space-y-1 p-1">
              {filteredSamples.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => setConfirmSample(sample)}
                  className="w-full flex items-start gap-2.5 p-2 rounded-lg text-left hover:bg-surface-3 transition-all cursor-pointer group border border-transparent hover:border-border/60"
                >
                  <span className="text-lg p-1.5 rounded-md bg-surface-3 group-hover:scale-110 transition-transform shrink-0">
                    {sample.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold text-text group-hover:text-accent transition-colors truncate">
                        {isId ? sample.titleId : sample.title}
                      </span>
                      <span className="text-[9px] font-mono uppercase px-1 rounded bg-surface-4 text-text-muted shrink-0">
                        {sample.type}
                      </span>
                    </div>
                    <div className="text-[10px] text-text-muted line-clamp-2 mt-0.5 leading-snug">
                      {isId ? sample.descriptionId : sample.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
