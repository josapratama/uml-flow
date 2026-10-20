import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Locale, TranslationDictionary } from "./types";
import { id } from "./locales/id";
import { en } from "./locales/en";
import { APP_CONFIG } from "../config/app.config";

const LOCALES: Record<Locale, TranslationDictionary> = { id, en };

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (keyPath: string, vars?: Record<string, string | number>) => string;
  dict: TranslationDictionary;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      const saved = localStorage.getItem("uml_locale");
      if (saved === "id" || saved === "en") return saved;
    } catch {}
    return APP_CONFIG.app.defaultLocale;
  });

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem("uml_locale", newLocale);
      document.documentElement.lang = newLocale;
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const dict = LOCALES[locale] || LOCALES.id;

  const t = useCallback(
    (keyPath: string, vars?: Record<string, string | number>): string => {
      const keys = keyPath.split(".");
      let val: any = dict;
      for (const k of keys) {
        if (val && typeof val === "object" && k in val) {
          val = val[k];
        } else {
          // Fallback to Indonesian if key missing
          let fallbackVal: any = LOCALES.id;
          for (const fk of keys) {
            if (fallbackVal && typeof fallbackVal === "object" && fk in fallbackVal) {
              fallbackVal = fallbackVal[fk];
            } else {
              return keyPath;
            }
          }
          val = fallbackVal;
          break;
        }
      }

      if (typeof val !== "string") return keyPath;

      if (vars) {
        let result = val;
        for (const [k, v] of Object.entries(vars)) {
          result = result.replace(new RegExp(`{${k}}`, "g"), String(v));
        }
        return result;
      }

      return val;
    },
    [dict],
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dict }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return ctx;
}

/**
 * Modern Language Switcher UI component
 * Can be placed in Header, Navbar, or Modals
 */
export function LanguageSwitcher({
  variant = "pill",
  className = "",
}: {
  variant?: "pill" | "compact" | "dropdown";
  className?: string;
}) {
  const { locale, setLocale } = useI18n();

  if (variant === "compact") {
    return (
      <button
        onClick={() => setLocale(locale === "id" ? "en" : "id")}
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
          locale === "id"
            ? "bg-accent/15 text-accent border border-accent/30"
            : "bg-surface-3/80 hover:bg-surface-3 text-text border border-border/60"
        } ${className}`}
        title={`Ganti Bahasa (Sekarang: ${locale === "id" ? "Bahasa Indonesia" : "English"})`}
      >
        <span className="text-sm">{locale === "id" ? "🇮🇩" : "🇬🇧"}</span>
        <span className="font-semibold uppercase text-[11px]">{locale}</span>
      </button>
    );
  }

  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-lg bg-surface-3/60 border border-border/60 shadow-xs backdrop-blur-sm ${className}`}
    >
      <button
        onClick={() => setLocale("id")}
        className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
          locale === "id"
            ? "bg-accent text-white shadow-xs font-semibold"
            : "text-text-muted hover:text-text hover:bg-surface-2/60"
        }`}
      >
        <span>🇮🇩</span>
        <span>ID</span>
      </button>
      <button
        onClick={() => setLocale("en")}
        className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
          locale === "en"
            ? "bg-accent text-white shadow-xs font-semibold"
            : "text-text-muted hover:text-text hover:bg-surface-2/60"
        }`}
      >
        <span>🇬🇧</span>
        <span>EN</span>
      </button>
    </div>
  );
}
