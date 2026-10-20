import React from "react";
import { LanguageSwitcher, useI18n } from "../../../i18n";

interface DocsHeaderProps {
  onBack: () => void;
  onOpenEditor: (code?: string) => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function DocsHeader({
  onBack,
  onOpenEditor,
  sidebarOpen,
  onToggleSidebar,
}: DocsHeaderProps) {
  const { t } = useI18n();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-sm text-text-muted hover:text-text transition-colors flex items-center gap-1 font-medium"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {t("common.back")}
          </button>
          <span className="text-border">|</span>
          {/* Breadcrumb */}
          <nav className="hidden sm:flex items-center gap-1 text-xs text-text-muted">
            <span>{t("nav.home")}</span>
            <span>/</span>
            <span className="text-text font-medium">{t("nav.docs")}</span>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher variant="pill" />

          {/* Mobile sidebar toggle */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-text-muted hover:text-text rounded-lg hover:bg-surface-2 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>

          <button
            onClick={() => onOpenEditor()}
            className="px-4 py-1.5 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors shadow-xs"
          >
            {t("landing.getStarted")}
          </button>
        </div>
      </div>
    </header>
  );
}
