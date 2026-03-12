"use client";

import { useState, useMemo } from "react";
import { Zap, PackageSearch } from "lucide-react";
import { cn } from "@/lib/cn";
import { typography, colors } from "@/lib/theme";
import { useGetAuctionsQuery } from "@/store/api/auctionApi";
import AuctionCard from "@/components/auction/AuctionCard";
import AuctionCardSkeleton from "@/components/auction/AuctionCardSkeleton";
import FilterBar, { type FilterBarState } from "@/components/auction/FilterBar";

// ─── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <PackageSearch className="w-8 h-8 text-slate-400" />
      </div>
      <div>
        <p className={cn(typography.h5, "mb-1")}>
          {hasFilters ? "No matching auctions" : "No auctions yet"}
        </p>
        <p className={cn("text-sm", colors.text.muted)}>
          {hasFilters
            ? "Try adjusting your filters or search query."
            : "Check back soon — new auctions are added every day!"}
        </p>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [filters, setFilters] = useState<FilterBarState>({
    search: "",
    status: "all",
    category: null,
  });

  // Only send status to the backend — category is filtered client-side to avoid
  // case-sensitivity issues with the DB's exact-match query (findByStatusAndCategory).
  const statusFilter = filters.status !== "all" ? { status: filters.status } : undefined;

  const { data: rawAuctions = [], isLoading, isError } = useGetAuctionsQuery(statusFilter);

  // Always fetch all auctions for the hero stats (RTK Query deduplicates the request
  // when statusFilter is also undefined, so no extra network call in that case)
  const { data: allAuctions = [], isLoading: isStatsLoading } = useGetAuctionsQuery(undefined);
  const activeCount    = allAuctions.filter((a) => a.status === "active").length;
  const completedCount = allAuctions.filter((a) => a.status === "completed").length;
  const totalBidValue  = allAuctions.reduce((sum, a) => sum + Number(a.currentPrice), 0);

  // Client-side: category (case-insensitive) + search
  const displayed = useMemo(() => {
    let result = rawAuctions;

    if (filters.category) {
      const cat = filters.category.toLowerCase();
      result = result.filter((a) => a.category?.toLowerCase() === cat);
    }

    const q = filters.search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q) ||
          a.category?.toLowerCase().includes(q),
      );
    }

    return result;
  }, [rawAuctions, filters.category, filters.search]);

  const hasFilters =
    filters.status !== "all" || filters.category !== null || filters.search !== "";

  return (
    <div className="w-full">
      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <div className="bg-linear-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">

            {/* Headline */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-sm font-medium mb-4">
                <Zap className="w-3.5 h-3.5" />
                Live Auctions
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-3">
                Bid. Win.{" "}
                <span className="text-indigo-200">Own it.</span>
              </h1>
              <p className="text-indigo-200 text-lg max-w-md leading-relaxed">
                Discover unique items, compete in real-time, and snag incredible deals every day.
              </p>
            </div>

            {/* Stats tiles */}
            <div className="grid grid-cols-3 gap-3 lg:gap-4 w-full lg:w-auto">
              {isStatsLoading ? (
                // Skeleton tiles while stats load
                <>
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex flex-col items-center p-4 rounded-2xl bg-white/10 backdrop-blur text-center">
                      <div className="h-7 w-10 rounded-md bg-white/20 animate-pulse mb-1" />
                      <div className="h-3 w-14 rounded bg-white/10 animate-pulse" />
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <div className="flex flex-col items-center p-4 rounded-2xl bg-white/10 backdrop-blur text-center">
                    <span className="text-2xl font-extrabold">{activeCount}</span>
                    <span className="text-xs text-indigo-200 mt-0.5">Live</span>
                  </div>
                  <div className="flex flex-col items-center p-4 rounded-2xl bg-white/10 backdrop-blur text-center">
                    <span className="text-2xl font-extrabold">{completedCount}</span>
                    <span className="text-xs text-indigo-200 mt-0.5">Completed</span>
                  </div>
                  <div className="flex flex-col items-center p-4 rounded-2xl bg-white/10 backdrop-blur text-center">
                    <span className="text-2xl font-extrabold">
                      ${totalBidValue > 999
                        ? `${(totalBidValue / 1000).toFixed(1)}k`
                        : totalBidValue.toFixed(0)}
                    </span>
                    <span className="text-xs text-indigo-200 mt-0.5">Total value</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────────────────────── */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* FilterBar */}
        <FilterBar
          value={filters}
          onChange={setFilters}
          resultCount={isLoading ? undefined : displayed.length}
          loading={isLoading}
        />

        {/* Error */}
        {isError && (
          <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-600 dark:text-red-400">
            Unable to load auctions right now. Please try refreshing the page.
          </div>
        )}

        {/* Auction grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <AuctionCardSkeleton key={i} />
              ))
            : displayed.length > 0
            ? displayed.map((auction) => (
                <AuctionCard key={auction.id} auction={auction} />
              ))
            : !isError && <EmptyState hasFilters={hasFilters} />}
        </div>
      </div>
    </div>
  );
}
