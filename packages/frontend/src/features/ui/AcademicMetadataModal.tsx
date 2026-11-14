import React, { useState, useEffect } from "react";
import {
  getAcademicMetadata,
  saveAcademicMetadata,
  type AcademicMetadata,
} from "../../services/academic-metadata";
import { showToast } from "./Toast";
import { useI18n } from "../../i18n";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: (meta: AcademicMetadata) => void;
}

export function AcademicMetadataModal({ isOpen, onClose, onUpdated }: Props) {
  const { locale } = useI18n();
  const isId = locale === "id";
  const [data, setData] = useState<AcademicMetadata>(() => getAcademicMetadata());

  useEffect(() => {
    if (isOpen) {
      setData(getAcademicMetadata());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveAcademicMetadata(data);
    onUpdated?.(data);
    showToast(
      isId
        ? "Metadata kop akademis skripsi berhasil disimpan!"
        : "Academic thesis metadata saved successfully!",
      "success"
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-surface-2 border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-surface-1">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🎓</span>
            <div>
              <h2 className="text-sm font-bold text-text">
                {isId ? "Konfigurasi Kop Akademis & Skripsi" : "Thesis & Academic Header Setup"}
              </h2>
              <p className="text-[10px] text-text-muted">
                {isId ? "Kop identitas formal untuk lampiran skripsi / tech spec" : "Formal header for thesis appendix or tech spec"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-surface-3 transition-colors text-base"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar">
          {/* Enabled Checkbox Banner */}
          <label className="p-3 rounded-xl bg-surface-3 border border-border/80 flex items-center justify-between cursor-pointer group">
            <div>
              <div className="text-xs font-semibold text-text group-hover:text-accent transition-colors">
                {isId ? "Aktifkan Kop Akademis pada Kanvas" : "Enable Academic Header on Canvas"}
              </div>
              <div className="text-[10px] text-text-muted mt-0.5">
                {isId
                  ? "Sematkan identitas penulis dan institusi pada kanvas dan hasil ekspor"
                  : "Embed author and institution header on canvas and export images"}
              </div>
            </div>
            <input
              type="checkbox"
              checked={data.enabled}
              onChange={(e) => setData({ ...data, enabled: e.target.checked })}
              className="w-4 h-4 rounded text-accent focus:ring-accent"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-text-muted block mb-1">
                {isId ? "Nama Mahasiswa / Penulis:" : "Student / Author Name:"}
              </label>
              <input
                type="text"
                placeholder="Contoh: Pratama Jaya"
                value={data.authorName}
                onChange={(e) => setData({ ...data, authorName: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-lg text-text outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-text-muted block mb-1">
                {isId ? "NIM / ID Penulis:" : "Student ID / NIM:"}
              </label>
              <input
                type="text"
                placeholder="Contoh: 2101010012"
                value={data.studentId}
                onChange={(e) => setData({ ...data, studentId: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-lg text-text outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-text-muted block mb-1">
                {isId ? "Program Studi:" : "Study Program:"}
              </label>
              <input
                type="text"
                placeholder="Teknik Informatika"
                value={data.programStudy}
                onChange={(e) => setData({ ...data, programStudy: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-lg text-text outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-text-muted block mb-1">
                {isId ? "Institusi / Universitas:" : "Institution / University:"}
              </label>
              <input
                type="text"
                placeholder="Fakultas Ilmu Komputer"
                value={data.institution}
                onChange={(e) => setData({ ...data, institution: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-lg text-text outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-text-muted block mb-1">
                {isId ? "Dosen Pembimbing:" : "Supervisor:"}
              </label>
              <input
                type="text"
                placeholder="Dr. Ir. Budi Santoso, M.Kom"
                value={data.supervisorName}
                onChange={(e) => setData({ ...data, supervisorName: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-lg text-text outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-text-muted block mb-1">
                {isId ? "Bab / Klasifikasi:" : "Chapter / Classification:"}
              </label>
              <input
                type="text"
                placeholder="BAB III - Perancangan Sistem"
                value={data.documentChapter}
                onChange={(e) => setData({ ...data, documentChapter: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-lg text-text outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="p-3 rounded-xl bg-surface-3/60 border border-border space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
              Pratinjau Kop Akademis (Watermark Preview):
            </span>
            <div className="p-2.5 rounded-lg bg-surface border border-border text-xs text-text flex items-center justify-between">
              <div>
                <div className="font-bold flex items-center gap-1.5">
                  <span>{data.documentChapter || "BAB III"}</span>
                  <span className="text-text-muted">•</span>
                  <span>{data.authorName ? `${data.authorName} (${data.studentId || "NIM"})` : "Nama Mahasiswa (NIM)"}</span>
                </div>
                <div className="text-[10px] text-text-muted mt-0.5">
                  {data.programStudy || "Prodi"} · {data.institution || "Universitas"}
                  {data.supervisorName && ` · Pembimbing: ${data.supervisorName}`}
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-accent/15 text-accent font-semibold font-mono">
                UML Flow
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border bg-surface-1 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border hover:bg-surface-3 text-text-muted hover:text-text text-xs font-medium transition-colors"
          >
            {isId ? "Batal" : "Cancel"}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
          >
            {isId ? "Simpan Perubahan" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
