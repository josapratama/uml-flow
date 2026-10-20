import React, { useState, useEffect } from "react";
import {
  LandingNavbar,
  HeroSection,
  InteractiveDemoSection,
  HowItWorksSection,
  FeaturesSection,
  ComparisonSection,
  DiagramTypesSection,
  TemplatesSection,
  FaqSection,
  CtaSection,
  LandingFooter,
} from "./components";

interface LandingPageProps {
  onOpenEditor: (code?: string) => void;
  onOpenDocs?: () => void;
}

export function LandingPage({ onOpenEditor, onOpenDocs }: LandingPageProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-surface text-text overflow-y-auto selection:bg-accent/30 selection:text-white">
      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-linear-to-b from-accent/20 via-purple-600/10 to-transparent blur-[120px] rounded-full" />
        <div className="absolute top-[600px] -left-40 w-[500px] h-[500px] bg-indigo-600/10 blur-[130px] rounded-full" />
        <div className="absolute top-[1200px] -right-40 w-[600px] h-[600px] bg-purple-600/10 blur-[140px] rounded-full" />
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(99,102,241,0.4) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Sticky Top Navigation */}
      <LandingNavbar
        scrolled={scrolled}
        onOpenEditor={onOpenEditor}
        onOpenDocs={onOpenDocs}
        onScrollToSection={scrollToSection}
      />

      {/* Hero Section */}
      <HeroSection
        onOpenEditor={onOpenEditor}
        onOpenDocs={onOpenDocs}
        onScrollToSection={scrollToSection}
      />

      {/* Interactive Demo Section */}
      <InteractiveDemoSection onOpenEditor={onOpenEditor} />

      {/* How It Works Walkthrough */}
      <HowItWorksSection onOpenEditor={onOpenEditor} />

      {/* Features Grid */}
      <FeaturesSection />

      {/* Detailed Feature Comparison */}
      <ComparisonSection />

      {/* Diagram Types Matrix */}
      <DiagramTypesSection onOpenEditor={onOpenEditor} />

      {/* Curated Templates Showcase */}
      <TemplatesSection onOpenEditor={onOpenEditor} />

      {/* Frequently Asked Questions */}
      <FaqSection />

      {/* Call to Action */}
      <CtaSection
        onOpenEditor={onOpenEditor}
        onOpenDocs={onOpenDocs}
        onScrollToSection={scrollToSection}
      />

      {/* Footer */}
      <LandingFooter
        onOpenEditor={onOpenEditor}
        onOpenDocs={onOpenDocs}
        onScrollToSection={scrollToSection}
      />
    </div>
  );
}
