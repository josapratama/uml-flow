import React, { useState, useEffect, useRef } from "react";

export interface PromptModalOptions {
  title: string;
  message?: string;
  defaultValue?: string;
  placeholder?: string;
  icon?: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

export interface ConfirmModalOptions {
  title: string;
  message: string;
  icon?: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

type DialogState =
  | {
      type: "prompt";
      options: PromptModalOptions;
      resolve: (value: string | null) => void;
    }
  | {
      type: "confirm";
      options: ConfirmModalOptions;
      resolve: (value: boolean) => void;
    }
  | null;

let dialogListener: ((state: DialogState) => void) | null = null;

/**
 * Open a sleek prompt modal and returns a Promise with the user's input, or null if cancelled.
 */
export function showPromptModal(options: PromptModalOptions): Promise<string | null> {
  return new Promise((resolve) => {
    if (!dialogListener) {
      // Fallback if dialog container is not mounted yet
      const res = window.prompt(options.message || options.title, options.defaultValue || "");
      resolve(res);
      return;
    }
    dialogListener({
      type: "prompt",
      options,
      resolve,
    });
  });
}

/**
 * Open a sleek confirmation modal and returns a Promise with boolean.
 */
export function showConfirmModal(options: ConfirmModalOptions): Promise<boolean> {
  return new Promise((resolve) => {
    if (!dialogListener) {
      // Fallback if dialog container is not mounted yet
      const res = window.confirm(options.message || options.title);
      resolve(res);
      return;
    }
    dialogListener({
      type: "confirm",
      options,
      resolve,
    });
  });
}

/**
 * AppDialogContainer component — render once in App.tsx alongside ToastContainer.
 */
export function AppDialogContainer() {
  const [current, setCurrent] = useState<DialogState>(null);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dialogListener = (dialog) => {
      setCurrent(dialog);
      if (dialog && dialog.type === "prompt") {
        setInputValue(dialog.options.defaultValue ?? "");
      }
    };
    return () => {
      dialogListener = null;
    };
  }, []);

  // Autofocus and select text on mount for prompt
  useEffect(() => {
    if (current?.type === "prompt") {
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [current]);

  // Handle ESC key globally
  useEffect(() => {
    if (!current) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [current]);

  if (!current) return null;

  const handleCancel = () => {
    if (current.type === "prompt") {
      current.resolve(null);
    } else {
      current.resolve(false);
    }
    setCurrent(null);
  };

  const handleConfirm = () => {
    if (current.type === "prompt") {
      current.resolve(inputValue);
    } else {
      current.resolve(true);
    }
    setCurrent(null);
  };

  const { options } = current;
  const isPrompt = current.type === "prompt";
  const defaultIcon = isPrompt ? "✏️" : options.danger ? "⚠️" : "💬";
  const icon = options.icon ?? defaultIcon;
  const confirmLabel = options.confirmText || (isPrompt ? "Simpan" : "Konfirmasi");
  const cancelLabel = options.cancelText || "Batal";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none"
      onClick={handleCancel}
    >
      <div
        className="bg-surface-2 border border-border/90 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-150 animate-[scaleIn_0.15s_ease-out]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        {/* Header */}
        <div className="flex items-start gap-3.5 p-5 pb-4 border-b border-border/50 bg-surface-2/60">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl shadow-xs border ${
              options.danger
                ? "bg-error/15 text-error border-error/30"
                : "bg-accent/15 text-accent border-accent/30"
            }`}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <h3 id="dialog-title" className="text-base font-semibold text-text leading-snug">
              {options.title}
            </h3>
            {options.message && (
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                {options.message}
              </p>
            )}
          </div>
          <button
            onClick={handleCancel}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-surface-3 transition-colors text-lg -mr-1 -mt-1 shrink-0"
            title="Tutup (Esc)"
          >
            ×
          </button>
        </div>

        {/* Content Body */}
        {isPrompt && (
          <div className="p-5 pt-4">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                placeholder={options.placeholder || ""}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleConfirm();
                  }
                }}
                className="w-full bg-surface-3 text-text text-sm rounded-xl px-3.5 py-2.5 border border-border focus:border-accent focus:ring-2 focus:ring-accent/25 outline-none transition-all placeholder:text-text-muted/60"
              />
              {inputValue && (
                <button
                  type="button"
                  onClick={() => {
                    setInputValue("");
                    inputRef.current?.focus();
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text text-xs w-5 h-5 flex items-center justify-center rounded-full hover:bg-surface-4 transition-colors"
                  title="Hapus input"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 bg-surface/40 border-t border-border/40">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 rounded-xl text-xs font-medium text-text-muted hover:text-text hover:bg-surface-3 transition-colors border border-border/40 hover:border-border"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] ${
              options.danger
                ? "bg-error hover:bg-error/85 shadow-error/20"
                : "bg-accent hover:bg-accent-hover shadow-accent/25"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
