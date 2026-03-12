"use client";

import Link from "next/link";
import { Plus, Gavel, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/cn";
import { button, typography, colors } from "@/lib/theme";
import { useAuth } from "@/hooks/useAuth";
import { useGetMyAuctionsQuery } from "@/store/api/auctionApi";
import AuctionCard from "@/components/auction/AuctionCard";
import AuctionCardSkeleton from "@/components/auction/AuctionCardSkeleton";
import type { AuctionStatus } from "@/types";
import { useState, useEffect } from "react";

// ─── Tab data ──────────────────────────────────────────────────────────────────

const TABS: { label: string; value: AuctionStatus | "all" }[] = [
  { label: "All",       value: "all"       },
  { label: "Active",    value: "active"    },
  { label: "Completed", value: "completed" },
];

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function MyAuctionsPage() {
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState<AuctionStatus | "all">("all");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data: auctions = [], isLoading } = useGetMyAuctionsQuery(undefined, {
    skip: !isAuthenticated,
  });

  // ── Unauthenticated ────────────────────────────────────────────────────────

  if (!mounted) return null;

  if (!isAuthenticated) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Gavel className="w-7 h-7 text-slate-400" />
        </div>
        <p className={typography.h4}>Sign in to view your listings</p>
        <Link
          href="/login"
          className={cn(button.base, button.variants.primary, button.sizes.md)}
        >
          Sign in
        </Link>
      </div>
    );
  }

  // ── Filter by tab ──────────────────────────────────────────────────────────

  const filtered =
    tab === "all" ? auctions : auctions.filter((a) => a.status === tab);

  const counts = {
    all:       auctions.length,
    active:    auctions.filter((a) => a.status === "active").length,
    completed: auctions.filter((a) => a.status === "completed").length,
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center shrink-0">
            <LayoutDashboard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className={typography.h3}>My Listings</h1>
            <p className={cn("text-sm mt-0.5", colors.text.muted)}>
              {isLoading ? "Loading…" : `${auctions.length} auction${auctions.length !== 1 ? "s" : ""} total`}
            </p>
          </div>
        </div>

        <Link
          href="/auctions/create"
          className={cn(button.base, button.variants.primary, button.sizes.md)}
        >
          <Plus className="w-4 h-4" />
          List an item
        </Link>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 w-fit mb-8">
        {TABS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150",
              tab === value
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : cn("text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"),
            )}
          >
            {label}
            {!isLoading && (
              <span className={cn(
                "ml-1.5 text-xs font-normal",
                tab === value ? colors.text.muted : "text-slate-400 dark:text-slate-500",
              )}>
                {counts[value]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <AuctionCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Gavel className="w-8 h-8 text-slate-300 dark:text-slate-600" />
          </div>
          <div>
            <p className={cn("font-semibold", colors.text.primary)}>
              {tab === "all"
                ? "No auctions yet"
                : `No ${tab} auctions`}
            </p>
            <p className={cn("text-sm mt-1", colors.text.muted)}>
              {tab === "all"
                ? "List your first item to start selling."
                : `You have no ${tab} auctions at the moment.`}
            </p>
          </div>
          {tab === "all" && (
            <Link
              href="/auctions/create"
              className={cn(button.base, button.variants.primary, button.sizes.md)}
            >
              <Plus className="w-4 h-4" />
              List an item
            </Link>
          )}
        </div>
      )}

      {/* Grid */}
      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      )}
    </div>
  );
}
