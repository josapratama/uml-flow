import type { Diagram } from "@uml-editor/shared";

const STORAGE_KEY = "uml-editor-diagrams";
const CURRENT_KEY = "uml-editor-current";
const CODE_KEY = "uml-editor-code";

export interface SavedDiagram {
  id: string;
  name: string;
  code: string;
  diagram: Diagram | null;
  updatedAt: string;
}

export const storage = {
  /** Save current code to localStorage */
  saveCode(code: string): void {
    try {
      localStorage.setItem(CODE_KEY, code);
    } catch {
      /* quota exceeded */
    }
  },

  /** Load saved code */
  loadCode(): string | null {
    return localStorage.getItem(CODE_KEY);
  },

  /** Save current diagram */
  saveCurrent(diagram: Diagram | null): void {
    try {
      localStorage.setItem(CURRENT_KEY, JSON.stringify(diagram));
    } catch {
      /* */
    }
  },

  /** Load current diagram */
  loadCurrent(): Diagram | null {
    try {
      const data = localStorage.getItem(CURRENT_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  /** List all saved diagrams */
  list(): SavedDiagram[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  /** Save diagram to library */
  save(entry: SavedDiagram): void {
    const list = this.list();
    const idx = list.findIndex((d) => d.id === entry.id);
    if (idx >= 0) list[idx] = entry;
    else list.unshift(entry);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 50)));
    } catch {
      /* */
    }
  },

  /** Delete from library */
  remove(id: string): void {
    const list = this.list().filter((d) => d.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      /* */
    }
  },
};
