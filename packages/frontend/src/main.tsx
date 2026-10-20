import { createRoot } from "react-dom/client";
import { useState, useEffect } from "react";
import App from "./App";
import { LandingPage } from "./features/landing/LandingPage";
import { DocsPage } from "./features/landing/DocsPage";
import "./styles/global.css";

type Page = "landing" | "editor" | "docs";

function Root() {
  const [initialEditorCode, setInitialEditorCode] = useState<string | undefined>();

  const [page, setPage] = useState<Page>(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash === "editor") return "editor";
    if (hash === "docs") return "docs";
    return "landing";
  });

  useEffect(() => {
    const currentHash = window.location.hash.replace("#", "");
    const targetHash = page === "landing" ? "" : page;
    if (currentHash !== targetHash) {
      window.location.hash = targetHash;
    }
  }, [page]);

  // Listen for hash changes (browser back/forward)
  useEffect(() => {
    const handler = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash === "editor") setPage("editor");
      else if (hash === "docs") setPage("docs");
      else setPage("landing");
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

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

createRoot(document.getElementById("root")!).render(<Root />);
