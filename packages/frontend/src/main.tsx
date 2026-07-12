import { createRoot } from "react-dom/client";
import { useState, useEffect } from "react";
import App from "./App";
import { LandingPage } from "./features/landing/LandingPage";
import { DocsPage } from "./features/landing/DocsPage";
import "./styles/global.css";

type Page = "landing" | "editor" | "docs";

function Root() {
  const [page, setPage] = useState<Page>(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash === "editor") return "editor";
    if (hash === "docs") return "docs";
    if (localStorage.getItem("uml-editor-code")) return "editor";
    return "landing";
  });

  useEffect(() => {
    window.location.hash = page === "landing" ? "" : page;
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

  switch (page) {
    case "docs":
      return (
        <DocsPage
          onBack={() => setPage("landing")}
          onOpenEditor={() => setPage("editor")}
        />
      );
    case "editor":
      return <App />;
    default:
      return (
        <LandingPage
          onOpenEditor={() => setPage("editor")}
          onOpenDocs={() => setPage("docs")}
        />
      );
  }
}

createRoot(document.getElementById("root")!).render(<Root />);
