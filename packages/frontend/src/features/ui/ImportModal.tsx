import React, { useState } from "react";
import { isSQLDDL, parseSQLToERD } from "../../services/sql-importer";
import { isMermaidCode, parseMermaidToDSL } from "../../services/mermaid-importer";
import { isPlantUMLCode, parsePlantUMLToDSL } from "../../services/plantuml-importer";
import { showToast } from "./Toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImportDSL: (dsl: string) => void;
}

type ImportSource = "auto" | "sql" | "mermaid" | "plantuml";

const SAMPLES = {
  sql: `-- Contoh SQL DDL untuk ERD Skripsi
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL,
  created_at TIMESTAMP
);

CREATE TABLE categories (
  id INT PRIMARY KEY,
  name VARCHAR(50) NOT NULL
);

CREATE TABLE posts (
  id INT PRIMARY KEY,
  user_id INT NOT NULL,
  category_id INT,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);`,

  mermaid: `%% Contoh Mermaid Class Diagram
classDiagram
  class Student {
    +String nim
    +String name
    +submitThesis()
  }
  class Advisor {
    +String nip
    +approveProposal()
  }
  Student --> Advisor : guided by`,

  plantuml: `' Contoh PlantUML
@startuml
class User {
  +id: int
  +name: string
  +login(): boolean
}
class Role {
  +id: int
  +name: string
}
User --> Role : has
@enduml`,
};

export function ImportModal({ isOpen, onClose, onImportDSL }: Props) {
  const [source, setSource] = useState<ImportSource>("auto");
  const [inputText, setInputText] = useState("");
  const [diagramName, setDiagramName] = useState("Imported Diagram");

  if (!isOpen) return null;

  const handleConvert = () => {
    const trimmed = inputText.trim();
    if (!trimmed) {
      showToast("Silakan masukkan teks kode terlebih dahulu", "error");
      return;
    }

    try {
      let resultDSL = "";
      let detectedType = source;

      if (source === "auto") {
        if (isSQLDDL(trimmed)) detectedType = "sql";
        else if (isMermaidCode(trimmed)) detectedType = "mermaid";
        else if (isPlantUMLCode(trimmed)) detectedType = "plantuml";
        else {
          // Assume raw UML Flow DSL
          resultDSL = trimmed;
        }
      }

      if (detectedType === "sql") {
        resultDSL = parseSQLToERD(trimmed, diagramName);
        showToast("SQL DDL berhasil dikonversi ke ERD!", "success");
      } else if (detectedType === "mermaid") {
        resultDSL = parseMermaidToDSL(trimmed, diagramName);
        showToast("Mermaid berhasil dikonversi ke UML Flow!", "success");
      } else if (detectedType === "plantuml") {
        resultDSL = parsePlantUMLToDSL(trimmed, diagramName);
        showToast("PlantUML berhasil dikonversi ke UML Flow!", "success");
      }

      onImportDSL(resultDSL);
      onClose();
    } catch (err) {
      showToast(
        `Gagal mengonversi: ${err instanceof Error ? err.message : "Sintaks tidak valid"}`,
        "error",
      );
    }
  };

  const loadSample = (type: "sql" | "mermaid" | "plantuml") => {
    setSource(type);
    setInputText(SAMPLES[type]);
    if (type === "sql") setDiagramName("Database Schema ERD");
    else if (type === "mermaid") setDiagramName("Mermaid Flow");
    else setDiagramName("PlantUML Class");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-surface-2 border border-border rounded-2xl shadow-2xl w-[600px] max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-surface-2/80">
          <div className="flex items-center gap-2">
            <span className="text-lg">📥</span>
            <div>
              <h2 className="text-sm font-semibold text-text tracking-tight">
                Import Code / External Diagrams
              </h2>
              <div className="text-[10px] text-text-muted">
                Konversi SQL DDL, Mermaid, atau PlantUML ke UML Flow DSL secara otomatis
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-surface-3 transition-colors text-base"
          >
            ×
          </button>
        </div>

        {/* Source Selector & Options */}
        <div className="px-5 py-3 border-b border-border bg-surface-3/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-surface-3 p-1 rounded-lg border border-border/60">
            {[
              { id: "auto", label: "Auto-Detect" },
              { id: "sql", label: "SQL DDL" },
              { id: "mermaid", label: "Mermaid" },
              { id: "plantuml", label: "PlantUML" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSource(tab.id as ImportSource)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  source === tab.id
                    ? "bg-accent text-white shadow-xs"
                    : "text-text-muted hover:text-text"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <span>Isi Contoh:</span>
            <button
              onClick={() => loadSample("sql")}
              className="px-2 py-0.5 rounded bg-surface border border-border hover:border-accent text-[11px]"
            >
              SQL
            </button>
            <button
              onClick={() => loadSample("mermaid")}
              className="px-2 py-0.5 rounded bg-surface border border-border hover:border-accent text-[11px]"
            >
              Mermaid
            </button>
            <button
              onClick={() => loadSample("plantuml")}
              className="px-2 py-0.5 rounded bg-surface border border-border hover:border-accent text-[11px]"
            >
              PlantUML
            </button>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-5 flex-1 flex flex-col gap-3 overflow-hidden">
          <div>
            <label className="block text-[11px] font-medium text-text-muted mb-1">
              Nama Diagram Hasil Konversi
            </label>
            <input
              type="text"
              value={diagramName}
              onChange={(e) => setDiagramName(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-text outline-none focus:border-accent"
              placeholder="Database Schema..."
            />
          </div>

          <div className="flex-1 flex flex-col min-h-[220px]">
            <label className="block text-[11px] font-medium text-text-muted mb-1 flex justify-between">
              <span>Paste Kode di Bawah:</span>
              <span className="text-[10px] text-accent">
                {source === "sql"
                  ? "Format: CREATE TABLE tableName (...);"
                  : source === "mermaid"
                  ? "Format: classDiagram, erDiagram, sequenceDiagram, dsb."
                  : source === "plantuml"
                  ? "Format: @startuml ... @enduml"
                  : "Mendukung SQL DDL, Mermaid, PlantUML, & UML Flow"}
              </span>
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Tempelkan kode SQL DDL, Mermaid, atau PlantUML Anda di sini..."
              className="flex-1 w-full p-3 font-mono text-xs bg-surface border border-border rounded-xl text-text outline-none focus:border-accent resize-none leading-relaxed placeholder:text-text-muted/40"
              autoFocus
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border bg-surface-2/80 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs bg-surface-3 text-text-muted hover:text-text rounded-lg transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleConvert}
            disabled={!inputText.trim()}
            className="px-5 py-1.5 text-xs font-medium bg-accent hover:bg-accent-hover text-white rounded-lg transition-all shadow-xs disabled:opacity-40 active:scale-95 flex items-center gap-1.5"
          >
            <span>✨</span>
            <span>Konversi & Tampilkan</span>
          </button>
        </div>
      </div>
    </div>
  );
}
