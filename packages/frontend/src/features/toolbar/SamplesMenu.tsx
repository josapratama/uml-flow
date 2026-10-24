import React, { useState, useRef, useEffect } from "react";
import { useI18n, type Locale } from "../../i18n";

interface Props {
  onSampleChange: (sample: string) => void;
}

const getSamplesList = (locale: Locale) => {
  const isId = locale === "id";
  return [
    { id: "class", label: "Class Diagram", icon: "🏗️", desc: isId ? "Model domain & relasi OOP" : "OOP domain models & relations" },
    { id: "sequence", label: "Sequence Diagram", icon: "🔀", desc: isId ? "API & alur komunikasi pesan" : "API & message lifelines" },
    { id: "erd", label: "Database ERD", icon: "🗄️", desc: isId ? "Tabel entitas, PK/FK & relasi" : "Entity tables, PK/FK & relations" },
    { id: "state", label: "State Machine", icon: "🔁", desc: isId ? "Siklus hidup objek & transisi" : "Object lifecycle & transitions" },
    { id: "flowchart", label: "Flowchart", icon: "📊", desc: isId ? "Keputusan, proses & alur kerja" : "Decisions, processes & workflows" },
    { id: "activity", label: "Activity Diagram", icon: "⚡", desc: isId ? "Aksi, percabangan & penggabungan" : "Actions, forks & joins" },
    { id: "usecase", label: "Use Case Diagram", icon: "👤", desc: isId ? "Batasan aktor & tujuan sistem" : "Actor boundaries & system goals" },
    { id: "component", label: "Component Diagram", icon: "🧩", desc: isId ? "Modul perangkat lunak & layanan" : "Software modules & services" },
    { id: "deployment", label: "Deployment Diagram", icon: "☁️", desc: isId ? "Node, perangkat keras & infra cloud" : "Nodes, hardware & cloud infra" },
  ];
};

export function SamplesMenu({ onSampleChange }: Props) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const samplesList = getSamplesList(locale);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

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
        <span>📐</span>
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
        <div className="absolute left-0 top-full mt-1.5 w-60 bg-surface-2/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-text-muted font-semibold border-b border-border/50">
            {t("samples.menuHeading")}
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            {samplesList.map((sample) => (
              <button
                key={sample.id}
                onClick={() => {
                  onSampleChange(sample.id);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-surface-3 transition-colors text-xs text-text group"
              >
                <span className="text-base group-hover:scale-110 transition-transform">
                  {sample.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-text group-hover:text-accent transition-colors">
                    {sample.label}
                  </div>
                  <div className="text-[10px] text-text-muted truncate">
                    {sample.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
