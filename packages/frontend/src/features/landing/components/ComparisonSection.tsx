import React from "react";
import { useI18n } from "../../../i18n";

export function ComparisonSection() {
  const { t, locale } = useI18n();

  const isId = locale === "id";

  const comparisonData = [
    {
      feature: isId
        ? "Sinkronisasi Dua Arah (Kanvas Drag ↔ Kode DSL)"
        : "Bidirectional Two-Way Sync (Canvas Drag ↔ Code DSL)",
      umlFlow: true,
      plantUml: false,
      mermaid: false,
      drawIo: false,
      highlight: true,
    },
    {
      feature: isId
        ? "Mode Garis Siku (Orthogonal 90°) Otomatis & Rapi"
        : "Smart Orthogonal 90° Routing with Channel Spacing",
      umlFlow: true,
      plantUml: isId ? "Terbatas" : "Limited",
      mermaid: false,
      drawIo: "Manual",
      highlight: true,
    },
    {
      feature: isId
        ? "Dukungan Bahasa Indonesia & Inggris (Bilingual)"
        : "Bilingual UI (Bahasa Indonesia & English)",
      umlFlow: true,
      plantUml: false,
      mermaid: false,
      drawIo: isId ? "Parsial" : "Partial",
      highlight: true,
    },
    {
      feature: isId
        ? "Generator Kode Backend (TypeScript, Java, SQL, XState)"
        : "Code Generation (TypeScript, Java, SQL, XState)",
      umlFlow: true,
      plantUml: false,
      mermaid: false,
      drawIo: false,
      highlight: true,
    },
    {
      feature: isId
        ? "Templat Skripsi Akademik 1-Klik (Bab 2, 3, 4)"
        : "1-Click Academic Thesis Templates (Bab 2, 3, 4)",
      umlFlow: true,
      plantUml: false,
      mermaid: false,
      drawIo: false,
      highlight: true,
    },
    {
      feature: isId
        ? "Palet Warna Terkurasi (Skripsi Formal, Emerald, Indigo)"
        : "Curated 1-Click Color Palettes & Print Monochrome",
      umlFlow: true,
      plantUml: false,
      mermaid: false,
      drawIo: "Manual",
      highlight: false,
    },
    {
      feature: isId
        ? "100% Client-Side Tanpa Server (Aman & Offline)"
        : "100% Client-Side Local Storage (Private & Offline)",
      umlFlow: true,
      plantUml: false,
      mermaid: true,
      drawIo: true,
      highlight: false,
    },
  ];

  const renderVal = (val: boolean | string) => {
    if (val === true) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs">
          ✓
        </span>
      );
    }
    if (val === false) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-surface-3 text-text-muted/40 font-bold text-xs">
          —
        </span>
      );
    }
    return (
      <span className="text-[11px] font-medium text-text-muted px-2 py-0.5 rounded bg-surface-3 border border-border/50">
        {val}
      </span>
    );
  };

  return (
    <section id="comparison" className="relative py-20 px-4 sm:px-6 max-w-7xl mx-auto z-10">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <span>⚖️</span>
          <span>{t("landing.comparisonBadge")}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-text tracking-tight mb-4">
          {t("landing.comparisonTitle")}
        </h2>
        <p className="text-base sm:text-lg text-text-muted">
          {t("landing.comparisonSubtitle")}
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border/80 bg-surface-2/60 backdrop-blur-md shadow-2xl">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className="border-b border-border bg-surface-3/50 text-xs text-text uppercase tracking-wider">
              <th className="py-4 px-5 font-semibold text-text-muted">
                {t("landing.featureCol")}
              </th>
              <th className="py-4 px-5 font-bold text-accent bg-accent/10 border-x border-accent/20 text-center">
                <span className="flex items-center justify-center gap-1.5">
                  <span className="text-sm">⚡</span> UML Flow
                </span>
              </th>
              <th className="py-4 px-5 font-medium text-text-muted text-center">
                PlantUML
              </th>
              <th className="py-4 px-5 font-medium text-text-muted text-center">
                Mermaid.js
              </th>
              <th className="py-4 px-5 font-medium text-text-muted text-center">
                Draw.io
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-xs sm:text-sm">
            {comparisonData.map((row, idx) => (
              <tr
                key={idx}
                className="hover:bg-surface-3/30 transition-colors"
              >
                <td className="py-3.5 px-5 font-medium text-text">
                  <div className="flex items-center gap-2">
                    {row.highlight && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                    )}
                    <span>{row.feature}</span>
                  </div>
                </td>
                <td className="py-3.5 px-5 text-center bg-accent/5 border-x border-accent/20">
                  {renderVal(row.umlFlow)}
                </td>
                <td className="py-3.5 px-5 text-center">{renderVal(row.plantUml)}</td>
                <td className="py-3.5 px-5 text-center">{renderVal(row.mermaid)}</td>
                <td className="py-3.5 px-5 text-center">{renderVal(row.drawIo)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
