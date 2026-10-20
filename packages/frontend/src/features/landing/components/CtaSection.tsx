import React from "react";
import { useI18n } from "../../../i18n";

interface CtaSectionProps {
  onOpenEditor: () => void;
  onOpenDocs?: () => void;
  onScrollToSection: (id: string) => void;
}

export function CtaSection({
  onOpenEditor,
  onOpenDocs,
  onScrollToSection,
}: CtaSectionProps) {
  const { t } = useI18n();

  return (
    <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-accent/20 via-purple-600/20 to-pink-600/20 border border-accent/40 p-10 sm:p-16 text-center shadow-2xl backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0%,transparent_70%)]" />
        <div className="relative z-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            {t("landing.ctaTitle")}
          </h2>
          <p className="text-sm sm:text-base text-text-muted max-w-xl mx-auto mb-8 leading-relaxed">
            {t("landing.ctaSubtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onOpenEditor()}
              className="px-8 py-4 bg-linear-to-r from-accent via-indigo-600 to-purple-600 hover:from-accent-hover hover:to-purple-500 text-white rounded-xl font-bold text-sm shadow-xl shadow-accent/30 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
            >
              <span>{t("landing.ctaLaunch")}</span>
              <span>🚀</span>
            </button>
            <button
              onClick={onOpenDocs || (() => onScrollToSection("interactive-demo"))}
              className="px-6 py-4 bg-surface-2/90 hover:bg-surface-3 border border-border text-text rounded-xl font-semibold text-sm transition-all"
            >
              {t("landing.ctaDocs")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
