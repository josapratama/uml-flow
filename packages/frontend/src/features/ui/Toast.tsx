import { useState, useEffect, useCallback } from "react";

export interface ToastMessage {
  id: string;
  text: string;
  type: "success" | "error" | "info";
}

let toastListener: ((msg: ToastMessage) => void) | null = null;

/** Show a toast notification from anywhere in the app. */
export function showToast(
  text: string,
  type: "success" | "error" | "info" = "info",
) {
  toastListener?.({ id: `toast_${Date.now()}`, text, type });
}

/** Toast container component — render once in App. */
export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    toastListener = (msg) => {
      setToasts((prev) => [...prev, msg]);
      setTimeout(
        () => setToasts((prev) => prev.filter((t) => t.id !== msg.id)),
        3000,
      );
    };
    return () => {
      toastListener = null;
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium animate-[slideIn_0.2s_ease] ${
            t.type === "success"
              ? "bg-green-600 text-white"
              : t.type === "error"
                ? "bg-red-600 text-white"
                : "bg-surface-3 text-text border border-border"
          }`}
        >
          {t.type === "success" && "✓ "}
          {t.type === "error" && "✕ "}
          {t.text}
        </div>
      ))}
    </div>
  );
}
