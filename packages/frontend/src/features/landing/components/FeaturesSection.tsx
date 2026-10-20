import React from "react";
import { useI18n } from "../../../i18n";

export function FeaturesSection() {
  const { t } = useI18n();

  const features = [
    {
      icon: "📝",
      title: t("landing.featuresDslTitle"),
      desc: t("landing.featuresDslDesc"),
      color: "bg-accent/10 border-accent/20",
    },
    {
      icon: "✨",
      title: t("landing.featuresAiTitle"),
      desc: t("landing.featuresAiDesc"),
      color: "bg-purple-500/10 border-purple-500/20",
    },
    {
      icon: "🔄",
      title: t("landing.featuresSyncTitle"),
      desc: t("landing.featuresSyncDesc"),
      color: "bg-sky-500/10 border-sky-500/20",
    },
    {
      icon: "🔷",
      title: t("landing.featuresCodeGenTitle"),
      desc: t("landing.featuresCodeGenDesc"),
      color: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      icon: "📐",
      title: t("landing.featuresLayoutsTitle"),
      desc: t("landing.featuresLayoutsDesc"),
      color: "bg-amber-500/10 border-amber-500/20",
    },
    {
      icon: "💾",
      title: t("landing.featuresDiffTitle"),
      desc: t("landing.featuresDiffDesc"),
      color: "bg-rose-500/10 border-rose-500/20",
    },
  ];

  return (
    <section
      id="features"
      className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium mb-3">
          <span>{t("landing.featuresBadge")}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          {t("landing.featuresMainTitle")}
        </h2>
        <p className="text-sm text-text-muted mt-2 max-w-2xl mx-auto">
          {t("landing.featuresMainSubtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feat, idx) => (
          <div
            key={idx}
            className="group relative bg-surface-2/70 backdrop-blur-md border border-border rounded-2xl p-7 hover:border-accent/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/5"
          >
            <div
              className={`w-12 h-12 rounded-xl ${feat.color} border flex items-center justify-center text-xl mb-5 group-hover:scale-105 transition-transform`}
            >
              {feat.icon}
            </div>
            <h3 className="text-base font-bold text-text mb-2">{feat.title}</h3>
            <p className="text-xs text-text-muted leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
