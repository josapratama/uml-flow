import { storage, type SavedDiagram } from "./storage";
import { getAcademicMetadata, saveAcademicMetadata, type AcademicMetadata } from "./academic-metadata";
import { loadTemplates, saveTemplate, type DiagramTemplate } from "./templates";

export interface WorkspaceBackup {
  version: "1.0";
  exportedAt: string;
  appName: "uml-flow";
  diagrams: SavedDiagram[];
  openTabIds: string[];
  academicMetadata: AcademicMetadata;
  templates: DiagramTemplate[];
}

/**
 * Creates a complete JSON snapshot of all saved diagrams, open tabs,
 * academic thesis configuration, and user templates.
 */
export function exportWorkspaceBackup(): string {
  const backup: WorkspaceBackup = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    appName: "uml-flow",
    diagrams: storage.list(),
    openTabIds: storage.getOpenTabIds(),
    academicMetadata: getAcademicMetadata(),
    templates: loadTemplates(),
  };

  return JSON.stringify(backup, null, 2);
}

/**
 * Restores a workspace backup from JSON string.
 * Supports 'merge' (safe union without overwriting) or 'replace' (full clean restoration).
 */
export function restoreWorkspaceBackup(
  jsonStr: string,
  mode: "merge" | "replace" = "merge"
): { restoredCount: number; message: string } {
  let data: any;
  try {
    data = JSON.parse(jsonStr.trim());
  } catch {
    throw new Error("File cadangan tidak valid (Format JSON rusak)");
  }

  if (!data || typeof data !== "object" || !Array.isArray(data.diagrams)) {
    throw new Error("Struktur file backup tidak valid. Field 'diagrams' tidak ditemukan.");
  }

  const incomingDiagrams: SavedDiagram[] = data.diagrams;

  if (mode === "replace") {
    // 1. Full clean restore
    try {
      localStorage.setItem("uml-editor-diagrams", JSON.stringify(incomingDiagrams));
      if (Array.isArray(data.openTabIds) && data.openTabIds.length > 0) {
        storage.setOpenTabIds(data.openTabIds);
      }
      if (data.academicMetadata) {
        saveAcademicMetadata(data.academicMetadata);
      }
    } catch {}

    return {
      restoredCount: incomingDiagrams.length,
      message: `Berhasil memulihkan ${incomingDiagrams.length} diagram, riwayat tab, dan pengaturan kop naskah.`,
    };
  }

  // Merge Mode: Safe union
  const existingList = storage.list();
  const existingIds = new Set(existingList.map((d) => d.id));
  const existingNames = new Set(existingList.map((d) => d.name));

  let mergedCount = 0;
  for (const d of incomingDiagrams) {
    if (!existingIds.has(d.id) && !existingNames.has(d.name)) {
      existingList.push(d);
      existingIds.add(d.id);
      existingNames.add(d.name);
      mergedCount++;
    } else {
      // Conflict: add with (Restored) suffix
      const renamed: SavedDiagram = {
        ...d,
        id: `diag_restored_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: `${d.name} (Restored)`,
      };
      existingList.push(renamed);
      mergedCount++;
    }
  }

  try {
    localStorage.setItem("uml-editor-diagrams", JSON.stringify(existingList));
    if (data.academicMetadata && !getAcademicMetadata().enabled) {
      saveAcademicMetadata(data.academicMetadata);
    }
  } catch {}

  return {
    restoredCount: mergedCount,
    message: `Berhasil menggabungkan ${mergedCount} diagram ke dalam pustaka kerja saat ini.`,
  };
}
