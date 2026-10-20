import React from "react";
import { useI18n } from "../../../i18n";

interface HeroSectionProps {
  onOpenEditor: () => void;
  onOpenDocs?: () => void;
  onScrollToSection: (id: string) => void;
}

export function HeroSection({
  onOpenEditor,
  onOpenDocs,
  onScrollToSection,
}: HeroSectionProps) {
  const { t } = useI18n();

  return (
    <section className="relative z-10 pt-16 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
      {/* Release Pill */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-2/90 border border-accent/30 text-xs text-text-muted mb-6 shadow-sm backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
        <span className="text-accent font-medium">{t("landing.newIn2Badge")}</span>
        <span>{t("landing.newIn2Desc")}</span>
      </div>

      {/* Main Heading */}
      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
        <span className="text-text">{t("landing.heroTitle")}</span>
        <br />
        <span className="bg-linear-to-r from-accent via-purple-400 to-pink-400 bg-clip-text text-transparent">
          {t("landing.heroTitleAccent")}
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-base sm:text-lg text-text-muted max-w-3xl mx-auto mb-10 leading-relaxed">
        {t("landing.heroSubtitle")}
      </p>

      {/* Hero Actions */}
      <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-center mb-14">
        <button
          onClick={() => onOpenEditor()}
          className="w-full sm:w-auto px-7 py-3.5 bg-linear-to-r from-accent via-indigo-600 to-purple-600 hover:from-accent-hover hover:to-purple-500 text-white rounded-xl font-semibold text-sm shadow-xl shadow-accent/25 hover:shadow-accent/40 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
        >
          <span className="text-base">🚀</span>
          <span>{t("landing.openWebEditor")}</span>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-mono ml-1">
            {t("landing.noSignupBadge")}
          </span>
        </button>
        <button
          onClick={() => onScrollToSection("interactive-demo")}
          className="w-full sm:w-auto px-6 py-3.5 bg-surface-2/80 hover:bg-surface-3 border border-border hover:border-accent/60 text-text rounded-xl font-medium text-sm transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
        >
          <span>⚡</span>
          <span>{t("landing.tryDemoBtn")}</span>
        </button>
        <button
          onClick={onOpenDocs || (() => onScrollToSection("features"))}
          className="w-full sm:w-auto px-5 py-3.5 text-text-muted hover:text-text font-medium text-sm transition-colors flex items-center justify-center gap-1.5"
        >
          <span>📖</span>
          <span>{t("landing.viewDocs")}</span>
        </button>
      </div>

      {/* Key Highlights Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto pt-6 border-t border-border/40">
        <div className="p-4 rounded-xl bg-surface-2/40 border border-border/50 backdrop-blur-xs">
          <div className="text-2xl font-black bg-linear-to-r from-accent to-purple-400 bg-clip-text text-transparent">
            {t("landing.heroMetricTypes")}
          </div>
          <div className="text-xs text-text-muted mt-1">{t("landing.heroMetricTypesSub")}</div>
        </div>
        <div className="p-4 rounded-xl bg-surface-2/40 border border-border/50 backdrop-blur-xs">
          <div className="text-2xl font-black bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {t("landing.heroMetricSync")}
          </div>
          <div className="text-xs text-text-muted mt-1">{t("landing.heroMetricSyncSub")}</div>
        </div>
        <div className="p-4 rounded-xl bg-surface-2/40 border border-border/50 backdrop-blur-xs">
          <div className="text-2xl font-black bg-linear-to-r from-indigo-400 to-accent bg-clip-text text-transparent">
            {t("landing.heroMetricLayouts")}
          </div>
          <div className="text-xs text-text-muted mt-1">{t("landing.heroMetricLayoutsSub")}</div>
        </div>
        <div className="p-4 rounded-xl bg-surface-2/40 border border-border/50 backdrop-blur-xs">
          <div className="text-2xl font-black bg-linear-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
            {t("landing.heroMetricCode")}
          </div>
          <div className="text-xs text-text-muted mt-1">{t("landing.heroMetricCodeSub")}</div>
        </div>
      </div>
    </section>
  );
}
