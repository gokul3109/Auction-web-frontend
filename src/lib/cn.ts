import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes safely.
 * Handles conditional classes (clsx) + deduplication (tailwind-merge).
 *
 * Usage:
 *   cn("px-4 py-2", isActive && "bg-indigo-600", className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
