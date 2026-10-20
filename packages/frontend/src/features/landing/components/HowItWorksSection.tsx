import React from "react";
import { useI18n } from "../../../i18n";

interface HowItWorksSectionProps {
  onOpenEditor: () => void;
}

export function HowItWorksSection({ onOpenEditor: _ }: HowItWorksSectionProps) {
  const { t, locale } = useI18n();
  const isId = locale === "id";

  const steps = [
    {
      num: "01",
      title: t("landing.step1Title"),
      desc: t("landing.step1Desc"),
      icon: "✍️",
      codeSnippet: `@diagram "Order Processing" sequence
actor User
boundary API as "Web Gateway"
control OrderService
User -> API : checkout()
API -> OrderService : placeOrder()`,
      color: "from-blue-500/20 to-indigo-500/10",
      border: "hover:border-indigo-500/50",
      accent: "text-indigo-400",
    },
    {
      num: "02",
      title: t("landing.step2Title"),
      desc: t("landing.step2Desc"),
      icon: "📐",
      codeSnippet: isId
        ? `// Interaksi Visual Kanvas
• Drag & drop posisi elemen
• Mode Siku (Orthogonal 90°)
• 1-Klik Palet Skripsi Formal
• Align & Auto-Layout Sugiyama`
        : `// Visual Canvas Interaction
• Drag & drop element positions
• Orthogonal Mode (90° bends)
• 1-Click Curated Color Themes
• Align & Sugiyama Auto-Layout`,
      color: "from-emerald-500/20 to-teal-500/10",
      border: "hover:border-emerald-500/50",
      accent: "text-emerald-400",
    },
    {
      num: "03",
      title: t("landing.step3Title"),
      desc: t("landing.step3Desc"),
      icon: "🚀",
      codeSnippet: isId
        ? `// Ekspor & Generator Kode
• PNG 300 DPI (High-Res Cetak)
• SVG Vektor Resolusi Tajam
• TypeScript Interfaces & Enum
• Java Classes & SQL DDL Schema`
        : `// Export & Code Generation
• High-Res 300 DPI PNG (Print)
• Crisp Vector SVG Export
• TypeScript Interfaces & Enum
• Java Classes & SQL DDL Schema`,
      color: "from-purple-500/20 to-pink-500/10",
      border: "hover:border-purple-500/50",
      accent: "text-purple-400",
    },
  ];

  return (
    <section id="how-it-works" className="relative py-20 px-4 sm:px-6 max-w-7xl mx-auto z-10">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider mb-4">
          <span>⚡</span>
          <span>{t("landing.howItWorksBadge")}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-text tracking-tight mb-4">
          {t("landing.howItWorksTitle")}
        </h2>
        <p className="text-base sm:text-lg text-text-muted">
          {t("landing.howItWorksSubtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={`flex flex-col justify-between p-6 rounded-2xl bg-surface-2/80 backdrop-blur-md border border-border/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${step.border} group`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className={`text-2xl font-black ${step.accent} font-mono tracking-tighter opacity-80`}>
                  {step.num}
                </span>
                <span className="text-2xl p-2.5 rounded-xl bg-surface-3/80 border border-border group-hover:scale-110 transition-transform">
                  {step.icon}
                </span>
              </div>
              <h3 className="text-lg font-bold text-text mb-2 group-hover:text-accent transition-colors">
                {step.title}
              </h3>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed mb-5">
                {step.desc}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface-1/90 border border-border/70 font-mono text-[11px] text-text-muted overflow-x-auto select-none">
              <pre className="text-text-muted/90">{step.codeSnippet}</pre>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
