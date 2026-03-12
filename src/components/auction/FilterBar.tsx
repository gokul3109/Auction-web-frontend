"use client";

import { Search, X, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/cn";
import { colors, button } from "@/lib/theme";
import type { AuctionStatus } from "@/types";

// ─── Category options ──────────────────────────────────────────────────────────

export const CATEGORIES = [
  "Electronics",
  "Art",
  "Cars",
  "Collectibles",
  "Fashion",
  "Real Estate",
  "Watches",
  "Sports",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

// ─── Status pill ───────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { label: string; value: AuctionStatus | "all" }[] = [
  { label: "All",       value: "all"       },
  { label: "Live",      value: "active"    },
  { label: "Completed", value: "completed" },
];

// ─── Props ─────────────────────────────────────────────────────────────────────

export interface FilterBarState {
  search: string;
  status: AuctionStatus | "all";
  category: string | null;
}

interface FilterBarProps {
  value: FilterBarState;
  onChange: (next: FilterBarState) => void;
  resultCount?: number;
  loading?: boolean;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function FilterBar({ value, onChange, resultCount, loading }: FilterBarProps) {
  const hasActiveFilters = value.status !== "all" || value.category !== null || value.search !== "";

  /** patched update */
  const patch = (patch: Partial<FilterBarState>) => onChange({ ...value, ...patch });

  const clearAll = () => onChange({ search: "", status: "all", category: null });

  return (
    <div className="flex flex-col gap-4">
      {/* ── Row 1: Search + clear ──────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={value.search}
            onChange={(e) => patch({ search: e.target.value })}
            placeholder="Search auctions…"
            className={cn(
              "w-full pl-9 pr-10 py-2 rounded-xl border text-sm",
              "bg-white dark:bg-slate-900",
              "text-slate-900 dark:text-white placeholder-slate-400",
              "border-slate-200 dark:border-slate-700",
              "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
              "transition-colors",
            )}
          />
          {value.search && (
            <button
              onClick={() => patch({ search: "" })}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Result count + clear */}
        <div className="flex items-center gap-2 ml-auto">
          {loading && (
            <span className={cn("text-sm", colors.text.muted)}>Loading…</span>
          )}
          {!loading && resultCount !== undefined && (
            <span className={cn("text-sm", colors.text.muted)}>
              {resultCount} {resultCount === 1 ? "auction" : "auctions"}
            </span>
          )}
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className={cn(
                button.base, button.sizes.sm, button.variants.ghost,
                "gap-1 text-slate-500",
              )}
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Row 2: Status tabs + category chips ────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status pills */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => patch({ status: opt.value })}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150",
                value.status === opt.value
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200",
              )}
            >
              {opt.label === "Live" && value.status === "active" && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              )}
              {opt.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-5 bg-slate-200 dark:bg-slate-700" />

        {/* Category chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={cn("text-xs font-medium", colors.text.muted)}>
            <SlidersHorizontal className="w-3.5 h-3.5 inline mr-1" />
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() =>
                patch({ category: value.category === cat ? null : cat })
              }
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150",
                value.category === cat
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/30"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400",
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
