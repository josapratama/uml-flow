import React from "react";
import { useI18n } from "../../../i18n";
import { DocsContentId } from "./content/DocsContentId";
import { DocsContentEn } from "./content/DocsContentEn";

interface DocsContentProps {
  onOpenEditor: (code?: string) => void;
}

export function DocsContent({ onOpenEditor }: DocsContentProps) {
  const { t, locale } = useI18n();

  return (
    <main className="flex-1 lg:ml-72 max-w-4xl mx-auto px-4 sm:px-8 py-10">
      {/* Docs Header Banner */}
      <div className="mb-12 pb-8 border-b border-border/70">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider mb-3">
          <span>📖</span>
          <span>{locale === "id" ? "Buku Panduan Pengguna" : "User Handbook & Reference"}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text mb-3">
          {t("docs.title")}
        </h1>
        <p className="text-sm sm:text-base text-text-muted leading-relaxed max-w-2xl">
          {t("docs.subtitle")}
        </p>
      </div>

      {/* Render bilingual content */}
      {locale === "id" ? (
        <DocsContentId onOpenEditor={onOpenEditor} />
      ) : (
        <DocsContentEn onOpenEditor={onOpenEditor} />
      )}
    </main>
  );
}
