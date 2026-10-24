import { createRoot } from "react-dom/client";
import { useState, useEffect } from "react";
import App from "./App";
import { LandingPage } from "./features/landing/LandingPage";
import { DocsPage } from "./features/landing/DocsPage";
import { I18nProvider } from "./i18n";
import "./styles/global.css";

type Page = "landing" | "editor" | "docs";

function Root() {
  const [initialEditorCode, setInitialEditorCode] = useState<string | undefined>();

  const [page, setPage] = useState<Page>(() => {
    const rawHash = window.location.hash;
    const search = window.location.search;
    if (
      rawHash.includes("share=") ||
      rawHash.includes("code=") ||
      search.includes("share=") ||
      search.includes("code=")
    ) {
      return "editor";
    }
    const hash = rawHash.replace("#", "");
    if (hash.startsWith("editor")) return "editor";
    if (hash.startsWith("docs")) return "docs";
    return "landing";
  });

  useEffect(() => {
    const rawHash = window.location.hash;
    // Preserve share code parameters in the URL
    if (rawHash.includes("share=") || rawHash.includes("code=")) {
      return;
    }
    const currentHash = rawHash.replace("#", "");
    const targetHash = page === "landing" ? "" : page;
    if (currentHash !== targetHash) {
      window.location.hash = targetHash;
    }
  }, [page]);

  // Listen for hash changes (browser back/forward)
  useEffect(() => {
    const handler = () => {
      const rawHash = window.location.hash;
      if (rawHash.includes("share=") || rawHash.includes("code=")) {
        setPage("editor");
        return;
      }
      const hash = rawHash.replace("#", "");
      if (hash.startsWith("editor")) setPage("editor");
      else if (hash.startsWith("docs")) setPage("docs");
      else setPage("landing");
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  // Scroll to top and reset overflow on page change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    if (page === "editor") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [page]);

  const handleOpenEditor = (code?: string) => {
    if (code) setInitialEditorCode(code);
    setPage("editor");
  };

  switch (page) {
    case "docs":
      return (
        <DocsPage
          onBack={() => setPage("landing")}
          onOpenEditor={() => handleOpenEditor()}
        />
      );
    case "editor":
      return (
        <App
          initialCode={initialEditorCode}
          onNavigateHome={() => setPage("landing")}
        />
      );
    default:
      return (
        <LandingPage
          onOpenEditor={handleOpenEditor}
          onOpenDocs={() => setPage("docs")}
        />
      );
  }
}

createRoot(document.getElementById("root")!).render(
  <I18nProvider>
    <Root />
  </I18nProvider>,
);
