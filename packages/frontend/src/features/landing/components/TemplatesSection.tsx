import React from "react";
import { SAMPLES } from "../../../data/samples";
import { getCuratedTemplates } from "./landingData";
import { useI18n } from "../../../i18n";

interface TemplatesSectionProps {
  onOpenEditor: (code?: string) => void;
}

export function TemplatesSection({ onOpenEditor }: TemplatesSectionProps) {
  const { t, locale } = useI18n();
  const templates = getCuratedTemplates(locale);

  return (
    <section
      id="templates"
      className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium mb-3">
          <span>{t("landing.templatesPrebuilt")}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          {t("landing.templatesMainTitle")}
        </h2>
        <p className="text-sm text-text-muted mt-2 max-w-xl mx-auto">
          {t("landing.templatesMainSubtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto">
        {templates.map((tmpl) => (
          <div
            key={tmpl.title}
            className="bg-surface-2/80 border border-border rounded-2xl p-6 flex items-start gap-4 hover:border-accent/60 transition-all hover:shadow-xl hover:shadow-accent/5 group"
          >
            <div className="text-3xl p-3 bg-surface-3 rounded-xl border border-border group-hover:scale-105 transition-transform">
              {tmpl.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-sm text-text">{tmpl.title}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/25">
                  {tmpl.type}
                </span>
              </div>
              <p className="text-xs text-text-muted mb-4 leading-relaxed">
                {tmpl.desc}
              </p>
              <button
                onClick={() => {
                  const sampleCode = SAMPLES[tmpl.sampleKey] || "";
                  onOpenEditor(sampleCode);
                }}
                className="px-3.5 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-lg transition-all shadow-xs active:scale-95 flex items-center gap-1.5"
              >
                <span>{t("landing.useTemplateBtn")}</span>
                <span>➔</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
