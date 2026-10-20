import React from "react";
import { SAMPLES } from "../../../data/samples";
import { useI18n } from "../../../i18n";

interface LandingFooterProps {
  onOpenEditor: (code?: string) => void;
  onOpenDocs?: () => void;
  onScrollToSection: (id: string) => void;
}

export function LandingFooter({
  onOpenEditor,
  onOpenDocs,
  onScrollToSection,
}: LandingFooterProps) {
  const { t } = useI18n();

  return (
    <footer className="relative z-10 border-t border-border mt-12 bg-surface-2/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1 */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-accent to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                U
              </div>
              <span className="font-extrabold text-base text-text tracking-tight">
                UML Flow Studio
              </span>
            </div>
            <p className="text-xs text-text-muted max-w-sm leading-relaxed mb-4">
              {t("landing.footerDesc")}
            </p>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
              <span>{t("landing.footerLocalFirst")}</span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-text mb-3">
              {t("landing.footerSupportedDiagrams")}
            </h4>
            <ul className="space-y-1.5 text-xs text-text-muted">
              <li>
                <button
                  onClick={() => onOpenEditor(SAMPLES.class)}
                  className="hover:text-text transition-colors"
                >
                  Class Diagram
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenEditor(SAMPLES.sequence)}
                  className="hover:text-text transition-colors"
                >
                  Sequence Diagram
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenEditor(SAMPLES.erd)}
                  className="hover:text-text transition-colors"
                >
                  Database ERD
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenEditor(SAMPLES.state)}
                  className="hover:text-text transition-colors"
                >
                  State Machine
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenEditor(SAMPLES.flowchart)}
                  className="hover:text-text transition-colors"
                >
                  Flowchart
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-text mb-3">
              {t("landing.footerTechStack")}
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {[
                "Bun",
                "Hono",
                "React 19",
                "Vite",
                "TypeScript",
                "Tailwind CSS",
                "SVG",
                "AST Parser",
              ].map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-0.5 rounded-md bg-surface-3 border border-border text-[10px] text-text-muted"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-3">
          <div>
            {t("landing.footerCredit")}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onScrollToSection("interactive-demo")}
              className="hover:text-text transition-colors"
            >
              {t("nav.playground")}
            </button>
            <button
              onClick={() => onOpenEditor()}
              className="hover:text-text transition-colors"
            >
              {t("nav.editor")}
            </button>
            <button
              onClick={onOpenDocs || (() => onScrollToSection("features"))}
              className="hover:text-text transition-colors"
            >
              {t("nav.docs")}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
