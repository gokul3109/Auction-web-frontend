"use client";

import { useEffect, useState, useCallback } from "react";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { toast, type ToastItem } from "@/lib/toast";
import { cn } from "@/lib/cn";

const DURATION = 4000;
const MAX_TOASTS = 5;

const VARIANTS = {
  success: {
    border: "border-l-4 border-l-emerald-500",
    icon: CheckCircle2,
    iconCls: "text-emerald-500",
  },
  error: {
    border: "border-l-4 border-l-red-500",
    icon: AlertCircle,
    iconCls: "text-red-500",
  },
  info: {
    border: "border-l-4 border-l-indigo-500",
    icon: Info,
    iconCls: "text-indigo-500",
  },
  warning: {
    border: "border-l-4 border-l-amber-500",
    icon: AlertTriangle,
    iconCls: "text-amber-500",
  },
} as const;

interface ToastState extends ToastItem {
  exiting: boolean;
}

export default function Toaster() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const dismiss = useCallback((id: string) => {
    // Mark as exiting to trigger slide-out animation
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    // Remove from DOM after animation completes
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  useEffect(() => {
    return toast.subscribe((item) => {
      setToasts((prev) => [
        { ...item, exiting: false },
        ...prev.slice(0, MAX_TOASTS - 1),
      ]);
      // Auto-dismiss
      setTimeout(() => dismiss(item.id), DURATION);
    });
  }, [dismiss]);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed top-4 right-4 z-9999 flex flex-col gap-2 w-full max-w-sm pointer-events-none"
    >
      {toasts.map((t) => {
        const v = VARIANTS[t.variant];
        const Icon = v.icon;
        return (
          <div
            key={t.id}
            role="alert"
            className={cn(
              "pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg",
              "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
              v.border,
              t.exiting ? "toast-exit" : "toast-enter",
            )}
          >
            <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", v.iconCls)} />
            <p className="flex-1 text-sm text-slate-700 dark:text-slate-200 leading-snug">
              {t.message}
            </p>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 -mt-0.5 -mr-1 p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
