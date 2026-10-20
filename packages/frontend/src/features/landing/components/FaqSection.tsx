import React, { useState } from "react";
import { useI18n } from "../../../i18n";

export function FaqSection() {
  const { t, locale } = useI18n();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const isId = locale === "id";

  const faqs = [
    {
      q: isId
        ? "Apakah UML Flow gratis dan memerlukan instalasi atau registrasi?"
        : "Is UML Flow free, and does it require installation or sign-up?",
      a: isId
        ? "UML Flow 100% gratis dan berjalan langsung di browser modern Anda. Tidak ada instalasi plugin Java, tidak ada server backend pihak ketiga yang lambat, dan tidak memerlukan login atau kartu kredit."
        : "UML Flow is 100% free and runs directly in any modern web browser. No Java runtime required, no remote servers, and no signup or credit card needed.",
    },
    {
      q: isId
        ? "Bagaimana cara kerja sinkronisasi dua arah (Two-Way Live Sync)?"
        : "How does Bidirectional Two-Way Live Sync work?",
      a: isId
        ? "Anda dapat mengetik kode DSL untuk merender diagram secara instan. Sebaliknya, saat Anda menggeser posisi node di kanvas atau mengubah properti, Anda dapat mengklik tombol Sinkron (⟳) untuk meregenerasi kode DSL otomatis tanpa kehilangan tata letak visual."
        : "You can write DSL text to compile diagrams instantly. Conversely, whenever you reposition nodes or edit properties visually on the canvas, clicking the Sync (⟳) button regenerates the DSL code cleanly.",
    },
    {
      q: isId
        ? "Apakah hasil diagram cocok untuk Skripsi, Tesis, dan Jurnal Akademik?"
        : "Are exported diagrams suitable for academic thesis, papers, and publications?",
      a: isId
        ? "Sangat cocok! UML Flow menyediakan preset palet 'Skripsi Formal' (latar putih, border tegas hitam-kelabu, font standar), mode cetak monokrom resolusi tinggi, caption gambar otomatis (Gambar 3.X), serta ekspor PNG 300 DPI dan SVG vektor tajam tanpa pecah."
        : "Extremely suitable! UML Flow includes a dedicated 'Skripsi Formal' academic palette, high-contrast monochrome mode, automatic academic figure captions, and crisp 300 DPI PNG & vector SVG exports.",
    },
    {
      q: isId
        ? "Apa itu Mode Garis Siku (Orthogonal Routing) dan kapan menggunakannya?"
        : "What is Orthogonal Line Mode and when should I use it?",
      a: isId
        ? "Mode Orthogonal membelokkan garis relasi dengan sudut 90 derajat siku rapi alih-alih garis miring diagonal. Fitur ini sangat disukai untuk diagram alir (Flowchart), Activity Diagram, dan Class Diagram kompleks agar garis tidak saling memotong dan bertumpuk."
        : "Orthogonal routing routes connectors with neat 90-degree right angles instead of diagonal straight lines. It is ideal for Flowcharts, Activity Diagrams, and complex Class Diagrams to prevent clutter.",
    },
    {
      q: isId
        ? "Bahasa pemrograman apa saja yang didukung oleh Generator Kode?"
        : "What programming languages are supported by the Code Generator?",
      a: isId
        ? "Anda dapat menghasilkan kode siap pakai untuk TypeScript (Interface & Type definitions), Java (Class OOP dengan getter/setter), SQL DDL (CREATE TABLE dengan Primary Key & Foreign Key), serta XState (State Machine JSON config)."
        : "You can instantly generate production-ready TypeScript interfaces, Java OOP classes with getters/setters, SQL DDL schema with primary/foreign keys, and XState state machines.",
    },
  ];

  return (
    <section id="faq" className="relative py-20 px-4 sm:px-6 max-w-4xl mx-auto z-10">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <span>❓</span>
          <span>{t("landing.faqBadge")}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-text tracking-tight mb-4">
          {t("landing.faqTitle")}
        </h2>
        <p className="text-base sm:text-lg text-text-muted">
          {t("landing.faqSubtitle")}
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="rounded-xl border border-border/70 bg-surface-2/70 backdrop-blur-md overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-text hover:text-accent transition-colors"
              >
                <span>{faq.q}</span>
                <span
                  className={`text-xs p-1.5 rounded-lg bg-surface-3 transition-transform duration-200 shrink-0 ${
                    isOpen ? "rotate-180 text-accent" : "text-text-muted"
                  }`}
                >
                  ▼
                </span>
              </button>
              {isOpen && (
                <div className="px-5 pb-4 text-xs sm:text-sm text-text-muted leading-relaxed border-t border-border/40 pt-3 bg-surface-1/40">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
