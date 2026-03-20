export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

type Listener = (item: ToastItem) => void;

const listeners = new Set<Listener>();

function emit(variant: ToastVariant, message: string) {
  const item: ToastItem = {
    id: Math.random().toString(36).slice(2),
    message,
    variant,
  };
  listeners.forEach((fn) => fn(item));
}

export const toast = {
  success: (message: string) => emit("success", message),
  error:   (message: string) => emit("error",   message),
  info:    (message: string) => emit("info",     message),
  warning: (message: string) => emit("warning",  message),

  /** Returns an unsubscribe function */
  subscribe: (fn: Listener): (() => void) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
