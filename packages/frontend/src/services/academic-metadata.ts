export interface AcademicMetadata {
  authorName: string;
  studentId: string;
  programStudy: string;
  institution: string;
  supervisorName: string;
  documentTitle: string;
  documentChapter: string;
  enabled: boolean;
}

const STORAGE_KEY = "uml_academic_metadata";

export const DEFAULT_ACADEMIC_METADATA: AcademicMetadata = {
  authorName: "",
  studentId: "",
  programStudy: "Teknik Informatika",
  institution: "Fakultas Ilmu Komputer",
  supervisorName: "",
  documentTitle: "Perancangan Sistem",
  documentChapter: "BAB III",
  enabled: false,
};

let memoryMetadata: AcademicMetadata | null = null;

export function getAcademicMetadata(): AcademicMetadata {
  if (typeof localStorage === "undefined") {
    return memoryMetadata || DEFAULT_ACADEMIC_METADATA;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ACADEMIC_METADATA;
    return { ...DEFAULT_ACADEMIC_METADATA, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_ACADEMIC_METADATA;
  }
}

export function saveAcademicMetadata(metadata: AcademicMetadata): void {
  memoryMetadata = metadata;
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(metadata));
  } catch {}
}

export function formatAcademicWatermark(metadata?: AcademicMetadata): string {
  const meta = metadata || getAcademicMetadata();
  const parts: string[] = [];
  if (meta.documentChapter) parts.push(meta.documentChapter);
  if (meta.authorName) {
    parts.push(meta.studentId ? `${meta.authorName} (${meta.studentId})` : meta.authorName);
  }
  if (meta.programStudy) parts.push(meta.programStudy);
  if (meta.institution) parts.push(meta.institution);
  return parts.join(" · ");
}
