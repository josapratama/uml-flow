import type { Diagram } from "@uml-editor/shared";
import { api } from "./api";

const STORAGE_KEY = "uml-editor-diagrams";
const CURRENT_KEY = "uml-editor-current";
const CODE_KEY = "uml-editor-code";
const OPEN_TABS_KEY = "uml-editor-open-tabs";

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

  /** List all saved diagrams in Library */
  list(): SavedDiagram[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  /** Get IDs of currently open tabs */
  getOpenTabIds(): string[] {
    try {
      const data = localStorage.getItem(OPEN_TABS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  /** Save IDs of currently open tabs */
  setOpenTabIds(ids: string[]): void {
    try {
      localStorage.setItem(OPEN_TABS_KEY, JSON.stringify(ids));
    } catch {
      /* quota exceeded */
    }
  },

  /** Register an ID as open tab */
  openTab(id: string): void {
    const ids = this.getOpenTabIds();
    if (!ids.includes(id)) {
      this.setOpenTabIds([...ids, id]);
    }
  },

  /** Remove an ID from open tabs */
  closeTab(id: string): void {
    const ids = this.getOpenTabIds().filter((tid) => tid !== id);
    this.setOpenTabIds(ids);
  },

  /** Get only diagrams that are currently open as tabs */
  getOpenTabs(): SavedDiagram[] {
    const all = this.list();
    if (all.length === 0) return [];

    const rawOpen = localStorage.getItem(OPEN_TABS_KEY);
    if (rawOpen === null) {
      const initial = [all[0]];
      this.setOpenTabIds([all[0].id]);
      return initial;
    }

    const openIds = this.getOpenTabIds();
    if (openIds.length === 0) {
      return [];
    }

    const map = new Map(all.map((d) => [d.id, d]));
    const result: SavedDiagram[] = [];
    const validIds: string[] = [];

    for (const id of openIds) {
      const item = map.get(id);
      if (item) {
        result.push(item);
        validIds.push(id);
      }
    }

    if (validIds.length !== openIds.length) {
      this.setOpenTabIds(validIds);
    }

    return result;
  },

  /** Save diagram to library (localStorage + server sync) */
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

    if (entry.diagram) {
      const serverDiagram: any = {
        ...entry.diagram,
        id: entry.id,
        name: entry.name,
        code: entry.code || "",
        metadata: {
          ...entry.diagram.metadata,
          updatedAt: entry.updatedAt || new Date().toISOString(),
        },
      };
      api
        .updateServerDiagram(entry.id, serverDiagram)
        .catch(() => api.saveServerDiagram(serverDiagram))
        .catch(() => {});
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
    const openIds = this.getOpenTabIds().filter((tid) => tid !== id);
    this.setOpenTabIds(openIds);

    api.deleteServerDiagram(id).catch(() => {});
  },

  /** Sync list from server on startup */
  async syncFromServer(): Promise<SavedDiagram[]> {
    try {
      const serverDiagrams = await api.getDiagrams();
      if (!serverDiagrams || serverDiagrams.length === 0) return this.list();

      const localList = this.list();
      const localIdMap = new Map(localList.map((d) => [d.id, d]));
      const localNameSet = new Set(localList.map((d) => d.name));

      let hasChanges = false;
      for (const sd of serverDiagrams) {
        if (!localIdMap.has(sd.id) && !localNameSet.has(sd.name)) {
          localList.push({
            id: sd.id,
            name: sd.name,
            code: (sd as any).code || "",
            diagram: sd,
            updatedAt: sd.metadata?.updatedAt || new Date().toISOString(),
          });
          localNameSet.add(sd.name);
          hasChanges = true;
        }
      }

      if (hasChanges) {
        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(localList.slice(0, 50)),
          );
        } catch {}
      }

      return localList;
    } catch {
      return this.list();
    }
  },
};
