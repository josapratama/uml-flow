import React, { useState, useEffect } from "react";
import type { Diagram } from "@uml-editor/shared";
import { getAvailableConversions, convertDiagram, type ConversionTarget } from "../../services/diagram-converter";
import { showToast } from "./Toast";
import { useI18n } from "../../i18n";

interface DiagramConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagram: Diagram | null;
  onApplyConvertedDiagram: (newDiagram: Diagram, inNewTab: boolean) => void;
}

export function DiagramConverterModal({
  isOpen,
  onClose,
  diagram,
  onApplyConvertedDiagram,
}: DiagramConverterModalProps) {
  const { locale } = useI18n();
  const isId = locale === "id";

  const available = diagram ? getAvailableConversions(diagram.type) : [];
  const [selectedTarget, setSelectedTarget] = useState<ConversionTarget | null>(
    available[0]?.target || null
  );
  const [openInNewTab, setOpenInNewTab] = useState(true);

  useEffect(() => {
    const opts = diagram ? getAvailableConversions(diagram.type) : [];
    setSelectedTarget(opts[0]?.target || null);
  }, [diagram?.type, isOpen]);

  if (!isOpen || !diagram) return null;

  const handleConvert = () => {
    if (!selectedTarget) return;
    const result = convertDiagram(diagram, selectedTarget);
    if (!result) {
      showToast(isId ? "Konversi tidak didukung untuk tipe diagram ini" : "Conversion not supported", "error");
      return;
    }

    onApplyConvertedDiagram(result, openInNewTab);
    showToast(
      isId
        ? `Diagram berhasil dikonversi ke ${selectedTarget.toUpperCase()}!`
        : `Diagram converted to ${selectedTarget.toUpperCase()}!`,
      "success"
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface-2 border border-border rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-1/50">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🔄</span>
            <div>
              <h2 className="text-base font-bold text-text">
                {isId ? "Konversi Silang Tipe Diagram" : "Cross-Diagram Converter"}
              </h2>
              <p className="text-xs text-muted">
                {isId
                  ? `Konversi instan dari ${diagram.type.toUpperCase()} ke model lain`
                  : `Instant conversion from ${diagram.type.toUpperCase()} to another model`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-text hover:bg-surface-3 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {available.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted">
              {isId
                ? `Tipe diagram "${diagram.type}" saat ini belum memiliki target konversi otomatis.`
                : `Diagram type "${diagram.type}" does not have automated conversion targets yet.`}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-muted mb-2">
                {isId ? "Pilih Format Diagram Target:" : "Select Target Diagram Format:"}
              </label>
              <div className="space-y-2">
                {available.map((opt) => (
                  <button
                    key={opt.target}
                    type="button"
                    onClick={() => setSelectedTarget(opt.target)}
                    className={`w-full text-left p-3.5 rounded-xl border transition flex items-start gap-3 ${
                      selectedTarget === opt.target
                        ? "bg-accent/15 border-accent text-text shadow-2xs"
                        : "bg-surface-1 border-border text-muted hover:border-text/30"
                    }`}
                  >
                    <input
                      type="radio"
                      checked={selectedTarget === opt.target}
                      onChange={() => setSelectedTarget(opt.target)}
                      className="mt-1 text-accent focus:ring-accent"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-text">
                        {isId ? opt.labelId : opt.labelEn}
                      </div>
                      <div className="text-[11px] text-muted mt-0.5">
                        {isId ? opt.descId : opt.descEn}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Target Option: New Tab vs Replace */}
          {available.length > 0 && (
            <div className="pt-2 border-t border-border/70 space-y-2">
              <label className="block text-xs font-semibold text-muted">
                {isId ? "Tindakan Penyimpanan:" : "Destination Tab:"}
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setOpenInNewTab(true)}
                  className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 font-medium transition ${
                    openInNewTab
                      ? "bg-accent/15 border-accent text-accent font-semibold"
                      : "bg-surface-1 border-border text-muted hover:border-text/30"
                  }`}
                >
                  <span>📑 {isId ? "Buka di Tab Baru (Aman)" : "Open in New Tab"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOpenInNewTab(false)}
                  className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 font-medium transition ${
                    !openInNewTab
                      ? "bg-amber-500/15 border-amber-500 text-amber-400 font-semibold"
                      : "bg-surface-1 border-border text-muted hover:border-text/30"
                  }`}
                >
                  <span>⚠️ {isId ? "Ganti Diagram Ini" : "Replace Current"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Info Badge */}
          <div className="p-3 bg-surface-1 rounded-xl border border-border/70 text-[11px] text-muted flex items-start gap-2">
            <span className="text-accent">ℹ️</span>
            <p>
              {isId
                ? "Konversi menjaga struktur entitas, kolom atribut, tipe data, serta relasi kunci yang ada. Posisi koordinat node disinkronkan otomatis."
                : "Conversion preserves entities, attributes, data types, and relations while mapping to target UML standards."}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 bg-surface-1/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border text-xs text-muted hover:text-text hover:bg-surface-2 transition font-medium"
          >
            {isId ? "Batal" : "Cancel"}
          </button>
          <button
            type="button"
            disabled={!selectedTarget || available.length === 0}
            onClick={handleConvert}
            className="px-5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold transition flex items-center gap-2 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>✨</span>
            <span>{isId ? "Mulai Konversi" : "Convert Diagram"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
