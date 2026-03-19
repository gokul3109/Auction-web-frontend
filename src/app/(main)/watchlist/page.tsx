"use client";

import { Heart, PackageSearch } from "lucide-react";
import { cn } from "@/lib/cn";
import { card, colors, typography } from "@/lib/theme";
import { useGetWatchlistQuery } from "@/store/api/auctionApi";
import AuctionCard from "@/components/auction/AuctionCard";
import AuctionCardSkeleton from "@/components/auction/AuctionCardSkeleton";

function EmptyState() {
  return (
    <div className={cn(card.base, "p-12 flex flex-col items-center text-center gap-4")}>
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <PackageSearch className="w-7 h-7 text-slate-400" />
      </div>
      <div>
        <p className={cn(typography.h5, "mb-1")}>No watched auctions yet</p>
        <p className={cn("text-sm", colors.text.muted)}>
          Tap the heart icon on any auction card to save it to your watchlist.
        </p>
      </div>
    </div>
  );
}

export default function WatchlistPage() {
  const { data: watchlist = [], isLoading, isError } = useGetWatchlistQuery();

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center">
          <Heart className="w-5 h-5 text-rose-500" />
        </div>
        <div>
          <h1 className={typography.h3}>My Watchlist</h1>
          <p className={cn("text-sm", colors.text.muted)}>
            {isLoading ? "Loading..." : `${watchlist.length} saved auction${watchlist.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {isError && (
        <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-600 dark:text-red-400">
          Unable to load your watchlist right now. Please refresh and try again.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <AuctionCardSkeleton key={i} />)
          : watchlist.length > 0
          ? watchlist.map((auction) => <AuctionCard key={auction.id} auction={auction} />)
          : !isError && <div className="col-span-full"><EmptyState /></div>}
      </div>
    </div>
  );
}
