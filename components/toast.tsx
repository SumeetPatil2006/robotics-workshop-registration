"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const toast = {
  success: (message: string, duration = 4000) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("app-toast", {
          detail: { type: "success", message, duration },
        })
      );
    }
  },
  error: (message: string, duration = 4000) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("app-toast", {
          detail: { type: "error", message, duration },
        })
      );
    }
  },
  info: (message: string, duration = 4000) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("app-toast", {
          detail: { type: "info", message, duration },
        })
      );
    }
  },
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return toast;
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (item: ToastItem) => {
      setToasts((prev) => [...prev, item]);
      const duration = item.duration ?? 4000;
      if (duration > 0) {
        setTimeout(() => {
          removeToast(item.id);
        }, duration);
      }
    },
    [removeToast],
  );

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      addToast({
        id: Math.random().toString(36).substring(2, 9),
        ...customEvent.detail,
      });
    };

    window.addEventListener("app-toast", handleToastEvent);
    return () => {
      window.removeEventListener("app-toast", handleToastEvent);
    };
  }, [addToast]);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration = 4000) => {
      addToast({
        id: Math.random().toString(36).substring(2, 9),
        type,
        message,
        duration,
      });
    },
    [addToast],
  );

  const value = {
    showToast,
    success: (msg: string, dur = 4000) => showToast(msg, "success", dur),
    error: (msg: string, dur = 4000) => showToast(msg, "error", dur),
    info: (msg: string, dur = 4000) => showToast(msg, "info", dur),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed top-5 left-0 right-0 z-[100] flex flex-col items-center gap-2.5 px-4 sm:top-6"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-center gap-3 rounded-full border px-4 py-2.5 text-sm font-medium shadow-[0_12px_32px_rgba(13,29,59,0.12)] backdrop-blur-md transition-all duration-300 max-w-md ${
              t.type === "success"
                ? "border-emerald-200 bg-white/95 text-emerald-900"
                : t.type === "error"
                  ? "border-red-200 bg-white/95 text-red-900"
                  : "border-[var(--border)] bg-white/95 text-[var(--navy)]"
            }`}
          >
            {t.type === "success" && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />}
            {t.type === "error" && <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />}
            {t.type === "info" && <Info className="h-4 w-4 shrink-0 text-[var(--blue)]" />}
            <span className="text-xs sm:text-sm">{t.message}</span>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="ml-1 -mr-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-gray-100 hover:text-[var(--navy)]"
              aria-label="Close notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
