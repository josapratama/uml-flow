import React from "react";
import { LanguageSwitcher, useI18n } from "../../../i18n";

interface LandingNavbarProps {
  scrolled: boolean;
  onOpenEditor: () => void;
  onOpenDocs?: () => void;
  onScrollToSection: (id: string) => void;
}

export function LandingNavbar({
  scrolled,
  onOpenEditor,
  onOpenDocs,
  onScrollToSection,
}: LandingNavbarProps) {
  const { t } = useI18n();

  return (
    <nav
      className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-surface-2/90 backdrop-blur-xl border-b border-border shadow-xl shadow-black/25"
          : "bg-surface/50 backdrop-blur-md border-b border-border/40"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-accent via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-accent/25">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="8" y="14" width="7" height="7" rx="1.5" />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-linear-to-r from-white via-text to-text-muted bg-clip-text text-transparent">
                UML Flow
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/25">
                v2.0
              </span>
            </div>
          </div>

          {/* Nav Links (Desktop) */}
          <div className="hidden lg:flex items-center gap-5 xl:gap-6">
            <button
              onClick={() => onScrollToSection("interactive-demo")}
              className="text-xs font-medium text-text-muted hover:text-text transition-colors"
            >
              {t("nav.playground")}
            </button>
            <button
              onClick={() => onScrollToSection("how-it-works")}
              className="text-xs font-medium text-text-muted hover:text-text transition-colors"
            >
              {t("landing.howItWorksBadge")}
            </button>
            <button
              onClick={() => onScrollToSection("features")}
              className="text-xs font-medium text-text-muted hover:text-text transition-colors"
            >
              {t("nav.features")}
            </button>
            <button
              onClick={() => onScrollToSection("comparison")}
              className="text-xs font-medium text-text-muted hover:text-text transition-colors"
            >
              {t("landing.comparisonBadge")}
            </button>
            <button
              onClick={() => onScrollToSection("diagrams")}
              className="text-xs font-medium text-text-muted hover:text-text transition-colors"
            >
              {t("nav.diagrams")}
            </button>
            <button
              onClick={() => onScrollToSection("templates")}
              className="text-xs font-medium text-text-muted hover:text-text transition-colors"
            >
              {t("nav.templates")}
            </button>
            <button
              onClick={() => onScrollToSection("faq")}
              className="text-xs font-medium text-text-muted hover:text-text transition-colors"
            >
              {t("nav.faq")}
            </button>
            <button
              onClick={onOpenDocs || (() => onScrollToSection("quick-reference"))}
              className="text-xs font-semibold text-accent hover:text-accent-hover transition-colors flex items-center gap-1"
            >
              <span>{t("nav.docs")}</span>
              <span className="text-[10px]">↗</span>
            </button>
          </div>

          {/* Actions: Language Switcher + Launch CTA */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher variant="pill" />

            <button
              onClick={() => onOpenEditor()}
              className="px-4 py-2 bg-linear-to-r from-accent to-purple-600 hover:from-accent-hover hover:to-purple-500 text-white rounded-lg text-xs font-semibold transition-all hover:shadow-lg hover:shadow-accent/25 active:scale-95 flex items-center gap-1.5"
            >
              <span>{t("landing.launchEditor")}</span>
              <span>🚀</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
