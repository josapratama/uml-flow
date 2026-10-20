import React, { useState } from "react";
import { getDemoTabs, type DemoTab } from "./landingData";
import { useI18n } from "../../../i18n";

interface InteractiveDemoSectionProps {
  onOpenEditor: (code?: string) => void;
}

export function InteractiveDemoSection({ onOpenEditor }: InteractiveDemoSectionProps) {
  const { t, locale } = useI18n();
  const demoTabs = getDemoTabs(locale);
  const [activeDemoTab, setActiveDemoTab] = useState<string>("class");
  const [copiedCode, setCopiedCode] = useState(false);

  const currentTab = demoTabs.find((t) => t.id === activeDemoTab) || demoTabs[0];

  const handleCopyDemoCode = () => {
    navigator.clipboard.writeText(currentTab.dslCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleLaunchWithTab = (tab: DemoTab) => {
    onOpenEditor(tab.dslCode);
  };

  return (
    <section
      id="interactive-demo"
      className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium mb-3">
          <span>✨ {t("landing.demoBadge")}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          {t("landing.demoTitle")}
        </h2>
        <p className="text-sm text-text-muted mt-2 max-w-xl mx-auto">
          {t("landing.demoSubtitle")}
        </p>
      </div>

      {/* Tab Selection */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        {demoTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveDemoTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border ${
              activeDemoTab === tab.id
                ? "bg-accent/15 border-accent text-white shadow-sm shadow-accent/20"
                : "bg-surface-2/60 border-border text-text-muted hover:text-text hover:bg-surface-3"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface-3 text-text-muted font-normal">
              {tab.badge}
            </span>
          </button>
        ))}
      </div>

      {/* Demo Window Frame */}
      <div className="bg-surface-2/80 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Window Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-3/60">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-xs font-mono text-text-muted">
              {currentTab.id}-sample.uml
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyDemoCode}
              className="px-2.5 py-1 text-xs text-text-muted hover:text-text rounded-md bg-surface-3 border border-border transition-colors flex items-center gap-1"
              title={t("landing.demoCopyCode")}
            >
              <span>{copiedCode ? "✓" : "📋"}</span>
              <span>{copiedCode ? t("landing.demoCopied") : t("landing.demoCopyCode")}</span>
            </button>
            <button
              onClick={() => handleLaunchWithTab(currentTab)}
              className="px-3 py-1 bg-accent hover:bg-accent-hover text-white text-xs font-medium rounded-md transition-all shadow-xs active:scale-95 flex items-center gap-1.5"
            >
              <span>{t("landing.demoOpenInEditor")}</span>
              <span>➔</span>
            </button>
          </div>
        </div>

        {/* Window Body: Split DSL & Mock Visual Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
          {/* Left: Code DSL */}
          <div className="p-5 font-mono text-xs leading-relaxed overflow-x-auto bg-surface/50 max-h-[460px]">
            <pre className="text-text space-y-1">
              {currentTab.dslCode.split("\n").map((line, idx) => {
                let styledLine: React.ReactNode = line;

                if (line.startsWith("@diagram")) {
                  const parts = line.split(" ");
                  styledLine = (
                    <span>
                      <span className="text-amber-400 font-semibold">{parts[0]}</span>{" "}
                      <span className="text-emerald-400">{parts[1]}</span>{" "}
                      <span className="text-sky-400 font-bold">{parts[2]}</span>
                    </span>
                  );
                } else if (
                  line.startsWith("class ") ||
                  line.startsWith("interface ") ||
                  line.startsWith("abstract class ") ||
                  line.startsWith("entity ") ||
                  line.startsWith("participant ") ||
                  line.startsWith("state ")
                ) {
                  styledLine = <span className="text-purple-400 font-semibold">{line}</span>;
                } else if (
                  line.includes("--|>") ||
                  line.includes("..|>") ||
                  line.includes("-->") ||
                  line.includes("->") ||
                  line.includes("||--o{")
                ) {
                  styledLine = <span className="text-rose-400 font-medium">{line}</span>;
                } else if (
                  line.trim().startsWith("+") ||
                  line.trim().startsWith("-") ||
                  line.trim().startsWith("*")
                ) {
                  styledLine = (
                    <span>
                      <span className="text-sky-400 font-bold">
                        {line.substring(0, line.indexOf(line.trim()[0]) + 1)}
                      </span>
                      <span>{line.substring(line.indexOf(line.trim()[0]) + 1)}</span>
                    </span>
                  );
                }

                return (
                  <div key={idx} className="flex gap-4">
                    <span className="text-text-muted/40 text-[10px] w-6 select-none text-right">
                      {idx + 1}
                    </span>
                    <div className="flex-1">{styledLine}</div>
                  </div>
                );
              })}
            </pre>
          </div>

          {/* Right: Rich Interactive Visual Representation */}
          <div className="p-6 bg-surface-2/30 flex flex-col justify-between overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-xs font-semibold text-text uppercase tracking-wider">
                    {t("landing.demoVisualizer")}
                  </span>
                </div>
                <span className="text-[11px] text-text-muted bg-surface-3 px-2 py-0.5 rounded-md border border-border">
                  {currentTab.badge}
                </span>
              </div>

              <p className="text-xs text-text-muted mb-6 leading-relaxed">
                {currentTab.desc}
              </p>
            </div>

            {/* Diagram-Specific Schematic Preview Card */}
            {activeDemoTab === "class" && (
              <div className="space-y-4 my-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-surface-3/80 border border-accent/40 rounded-xl p-3 shadow-sm">
                    <div className="text-[11px] font-bold text-accent pb-1 border-b border-border flex items-center justify-between">
                      <span>«class» User</span>
                      <span className="text-[9px] text-emerald-400">entity</span>
                    </div>
                    <div className="py-1.5 text-[10px] space-y-0.5 font-mono text-text-muted border-b border-border">
                      <div><span className="text-sky-400">+</span> id: string</div>
                      <div><span className="text-sky-400">+</span> email: string</div>
                      <div><span className="text-rose-400">-</span> passwordHash: string</div>
                    </div>
                    <div className="pt-1.5 text-[10px] space-y-0.5 font-mono text-text-muted">
                      <div><span className="text-sky-400">+</span> validatePassword(): boolean</div>
                      <div><span className="text-sky-400">+</span> generateToken(): string</div>
                    </div>
                  </div>

                  <div className="bg-surface-3/80 border border-purple-500/40 rounded-xl p-3 shadow-sm">
                    <div className="text-[11px] font-bold text-purple-400 pb-1 border-b border-border flex items-center justify-between">
                      <span>«interface» Authenticatable</span>
                    </div>
                    <div className="py-2 text-[10px] space-y-1 font-mono text-text-muted">
                      <div><span className="text-sky-400">+</span> authenticate(): boolean</div>
                      <div><span className="text-sky-400">+</span> revokeSession(): void</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-[11px] text-text-muted py-1 bg-surface-3/40 rounded-lg border border-border/50">
                  <span className="text-rose-400 font-mono">User</span>
                  <span>{locale === "id" ? "mengimplementasikan" : "implements"}</span>
                  <span className="text-purple-400 font-mono">Authenticatable</span>
                  <span className="text-text-muted/60">{locale === "id" ? "dan memiliki" : "and owns"}</span>
                  <span className="text-emerald-400 font-mono">Session (*)</span>
                </div>
              </div>
            )}

            {activeDemoTab === "sequence" && (
              <div className="space-y-3 my-2 font-mono text-xs">
                <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                  <div className="p-1.5 bg-surface-3 rounded-lg border border-border text-sky-400">Client</div>
                  <div className="p-1.5 bg-surface-3 rounded-lg border border-border text-purple-400">Gateway</div>
                  <div className="p-1.5 bg-surface-3 rounded-lg border border-border text-accent">AuthService</div>
                  <div className="p-1.5 bg-surface-3 rounded-lg border border-border text-emerald-400">Database</div>
                </div>
                <div className="p-3 bg-surface-3/50 rounded-xl border border-border/60 text-[11px] space-y-2">
                  <div className="flex items-center justify-between text-text">
                    <span>1. POST /login</span>
                    <span className="text-sky-400">Client ➔ Gateway</span>
                  </div>
                  <div className="flex items-center justify-between text-text-muted">
                    <span>2. findUserByEmail()</span>
                    <span className="text-accent">Auth ➔ DB</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-400">
                    <span>3. 200 OK + JWT</span>
                    <span>Gateway ➔ Client</span>
                  </div>
                </div>
              </div>
            )}

            {activeDemoTab === "erd" && (
              <div className="grid grid-cols-2 gap-3 my-2 text-xs">
                <div className="bg-surface-3/90 border border-border rounded-xl p-3">
                  <div className="font-bold text-accent text-xs pb-1 border-b border-border">customers</div>
                  <div className="pt-2 text-[10px] font-mono space-y-0.5 text-text-muted">
                    <div><span className="text-amber-400 font-bold">*id</span>: int [PK]</div>
                    <div>email: varchar [unique]</div>
                    <div>full_name: varchar</div>
                  </div>
                </div>
                <div className="bg-surface-3/90 border border-border rounded-xl p-3">
                  <div className="font-bold text-purple-400 text-xs pb-1 border-b border-border">orders</div>
                  <div className="pt-2 text-[10px] font-mono space-y-0.5 text-text-muted">
                    <div><span className="text-amber-400 font-bold">*id</span>: int [PK]</div>
                    <div><span className="text-sky-400">customer_id</span>: int [FK]</div>
                    <div>order_status: varchar</div>
                  </div>
                </div>
              </div>
            )}

            {activeDemoTab === "state" && (
              <div className="flex items-center justify-between gap-1 my-3 text-[11px]">
                <span className="px-2.5 py-1 rounded-full bg-surface-3 border border-border text-text">Pending</span>
                <span className="text-accent text-xs">➔</span>
                <span className="px-2.5 py-1 rounded-full bg-accent/20 border border-accent text-accent font-semibold">Processing</span>
                <span className="text-accent text-xs">➔</span>
                <span className="px-2.5 py-1 rounded-full bg-surface-3 border border-border text-text">Shipped</span>
                <span className="text-accent text-xs">➔</span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 font-semibold">Delivered</span>
              </div>
            )}

            {activeDemoTab === "flowchart" && (
              <div className="space-y-2 my-2 text-[11px]">
                <div className="p-2 bg-surface-3 rounded-lg border border-border flex items-center justify-between">
                  <span className="font-medium">1. Start Checkout</span>
                  <span className="text-emerald-400">Entry</span>
                </div>
                <div className="p-2 bg-accent/15 border border-accent/40 rounded-lg flex items-center justify-between">
                  <span className="font-semibold text-accent">2. Valid Cart?</span>
                  <span className="text-xs">Yes ➔ Reserve Stock</span>
                </div>
                <div className="p-2 bg-surface-3 rounded-lg border border-border flex items-center justify-between">
                  <span className="font-medium">3. Complete Order</span>
                  <span className="text-sky-400">Exit</span>
                </div>
              </div>
            )}

            {/* Bottom Quick Launch Bar */}
            <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-text-muted">
              <span>{t("landing.demoAstEngine")}</span>
              <button
                onClick={() => handleLaunchWithTab(currentTab)}
                className="text-accent hover:text-accent-hover font-semibold transition-colors flex items-center gap-1"
              >
                <span>{t("landing.demoEditInCanvas")}</span>
                <span>➔</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
