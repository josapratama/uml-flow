import React from "react";
import { SAMPLES } from "../../../data/samples";
import { getDiagramTypesDetails } from "./landingData";
import { useI18n } from "../../../i18n";

interface DiagramTypesSectionProps {
  onOpenEditor: (code?: string) => void;
}

export function DiagramTypesSection({ onOpenEditor }: DiagramTypesSectionProps) {
  const { t, locale } = useI18n();
  const diagramDetails = getDiagramTypesDetails(locale);

  return (
    <section
      id="diagrams"
      className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-3">
          <span>{t("landing.diagramsBadge")}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          {t("landing.diagramsTitle")}
        </h2>
        <p className="text-sm text-text-muted mt-2 max-w-xl mx-auto">
          {t("landing.diagramsSubtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {diagramDetails.map((diag) => (
          <div
            key={diag.type}
            className="bg-surface-2/70 border border-border rounded-2xl p-6 flex flex-col justify-between hover:border-accent/50 transition-all hover:shadow-lg hover:shadow-accent/5 group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{diag.icon}</span>
                  <h3 className="font-bold text-sm text-text">{diag.type}</h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-3 text-text-muted border border-border">
                  {diag.badge}
                </span>
              </div>

              <div className="mb-4">
                <div className="text-[11px] font-semibold text-text-muted mb-1">
                  {t("landing.diagramWhenToUse")}
                </div>
                <p className="text-xs text-text leading-relaxed">{diag.whenToUse}</p>
              </div>

              <div className="mb-4 bg-surface-3/50 p-2.5 rounded-xl border border-border/60">
                <div className="text-[10px] uppercase font-mono text-text-muted mb-1">
                  {t("landing.diagramKeyNotations")}
                </div>
                <div className="text-[11px] font-mono text-accent truncate">
                  {diag.notations}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                const sampleCode = SAMPLES[diag.sampleKey] || "";
                onOpenEditor(sampleCode);
              }}
              className="w-full py-2 bg-surface-3 hover:bg-accent hover:text-white text-text text-xs font-medium rounded-xl border border-border hover:border-accent transition-all flex items-center justify-center gap-1.5"
            >
              <span>{t("landing.diagramOpenTemplate")} {diag.type}</span>
              <span>➔</span>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
