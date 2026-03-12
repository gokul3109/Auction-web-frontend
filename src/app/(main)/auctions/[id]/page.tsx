"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ImageOff,
  Clock,
  Flame,
  TrendingUp,
  Tag,
  Trophy,
  Zap,
  CalendarClock,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { card, badge, typography, colors, button } from "@/lib/theme";
import { useGetAuctionQuery, useGetAuctionWinnerQuery } from "@/store/api/auctionApi";
import { useGetBidsQuery } from "@/store/api/bidApi";
import { useAuth } from "@/hooks/useAuth";
import { useCountdown } from "@/hooks/useCountdown";
import { useAuctionEvents } from "@/hooks/useAuctionEvents";
import BidHistory from "@/components/auction/BidHistory";
import PlaceBidForm from "@/components/auction/PlaceBidForm";

// ─── Gradient fallbacks (full static strings for Tailwind scanner) ─────────────

const FALLBACK_GRADIENTS = [
  "bg-linear-to-br from-indigo-500 to-purple-600",
  "bg-linear-to-br from-rose-500 to-pink-600",
  "bg-linear-to-br from-amber-500 to-orange-600",
  "bg-linear-to-br from-emerald-500 to-teal-600",
  "bg-linear-to-br from-sky-500 to-blue-600",
  "bg-linear-to-br from-violet-500 to-purple-600",
] as const;

function getFallbackGradient(id: string): string {
  const sum = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return FALLBACK_GRADIENTS[sum % FALLBACK_GRADIENTS.length];
}

// ─── Loading skeleton ──────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-5">
          <div className="aspect-video rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
          <div className="space-y-3">
            <div className="h-8 w-3/4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-56 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
          <div className="h-40 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AuctionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user, isAuthenticated } = useAuth();

  const { data: auction, isLoading, isError } = useGetAuctionQuery(id);
  const { data: bids = [], isLoading: bidsLoading } = useGetBidsQuery(id);
  const { data: winner } = useGetAuctionWinnerQuery(id, {
    skip: auction?.status !== "completed",
  });

  // Subscribe to live SSE updates only while auction is active
  useAuctionEvents(auction?.status === "active" ? id : null);

  const countdown = useCountdown(auction?.endDate ?? null);

  const isActive = auction?.status === "active";
  const isSeller = !!(user && auction && user.id === auction.userId);

  // Check if the current user already holds the highest bid
  const highestBid = bids.length > 0
    ? bids.reduce((top, b) => Number(b.bidAmount) > Number(top.bidAmount) ? b : top)
    : null;
  const isLeadingBidder = !!(user && highestBid && highestBid.userId === user.id);

  const isCurrentUserWinner =
    !!(winner?.hasWinner && winner.winnerId === user?.id);
  const priceRaised =
    !!auction && auction.currentPrice > auction.startingPrice;

  // ── Loading ────────────────────────────────────────────────────────────────

  if (isLoading) return <DetailSkeleton />;

  // ── Error / not found ──────────────────────────────────────────────────────

  if (isError || !auction) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <span className="text-3xl">🔍</span>
        </div>
        <p className={cn(typography.h4, "mb-1")}>Auction not found</p>
        <p className={cn("text-sm max-w-xs", colors.text.muted)}>
          This auction may have been removed or the link is invalid.
        </p>
        <Link
          href="/"
          className={cn(button.base, button.variants.primary, button.sizes.md)}
        >
          Back to auctions
        </Link>
      </div>
    );
  }

  const gradient = getFallbackGradient(auction.id);

  return (
    <div className="w-full pb-20">
      {/* ── Back nav ──────────────────────────────────────────────────────── */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <Link
          href="/"
          className={cn(
            "inline-flex items-center gap-1.5 text-sm font-medium transition-colors",
            colors.text.muted,
            "hover:text-slate-900 dark:hover:text-white",
          )}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to auctions
        </Link>
      </div>

      {/* ── Main grid ─────────────────────────────────────────────────────── */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ── Left: image + info + bid history ────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Image */}
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-100 dark:bg-slate-800 shadow-sm">
              {auction.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={auction.imageUrl}
                  alt={auction.title}
                  loading="lazy"
                  width={800}
                  height={450}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className={cn(
                    "w-full h-full flex items-center justify-center",
                    gradient,
                  )}
                >
                  <ImageOff className="w-16 h-16 text-white/40" />
                </div>
              )}

              {/* Status badge */}
              <div className="absolute top-4 left-4">
                {isActive ? (
                  <span
                    className={cn(
                      badge.base,
                      badge.sizes.md,
                      "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30",
                    )}
                  >
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
                    Live
                  </span>
                ) : (
                  <span
                    className={cn(
                      badge.base,
                      badge.sizes.md,
                      "bg-slate-700/80 text-slate-200 backdrop-blur-sm",
                    )}
                  >
                    Ended
                  </span>
                )}
              </div>

              {/* Category */}
              {auction.category && (
                <div className="absolute top-4 right-4">
                  <span
                    className={cn(
                      badge.base,
                      badge.sizes.md,
                      "bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 backdrop-blur-sm shadow-sm",
                    )}
                  >
                    <Tag className="w-3 h-3" />
                    {auction.category}
                  </span>
                </div>
              )}
            </div>

            {/* Title + description */}
            <div className="space-y-3">
              <h1 className={typography.h2}>{auction.title}</h1>
              {auction.description && (
                <p className={cn(typography.bodyLg, "leading-relaxed")}>
                  {auction.description}
                </p>
              )}
            </div>

            {/* Info strip */}
            <div
              className={cn(
                card.base,
                "p-5 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4",
              )}
            >
              <div>
                <p className={typography.labelSm}>Starting price</p>
                <p className={cn("mt-1 font-bold text-lg", colors.text.primary)}>
                  $
                  {Number(auction.startingPrice).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>

              <div>
                <p className={typography.labelSm}>Total bids</p>
                <p className={cn("mt-1 font-bold text-lg", colors.text.primary)}>
                  {bids.length}
                </p>
              </div>

              {auction.endDate && (
                <div className="col-span-2 sm:col-span-1">
                  <p className={typography.labelSm}>
                    {isActive ? "Ends" : "Ended"}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-sm font-medium flex items-center gap-1.5",
                      colors.text.primary,
                    )}
                  >
                    <CalendarClock className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(auction.endDate).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })} IST
                  </p>
                </div>
              )}
            </div>

            {/* Bid history */}
            <div>
              <h2 className={cn(typography.h4, "mb-4")}>Bid History</h2>
              <BidHistory
                bids={bids}
                currentUserId={user?.id}
                isLoading={bidsLoading}
              />
            </div>
          </div>

          {/* ── Right: sticky bid panel ──────────────────────────────────── */}
          <div className="space-y-4 lg:sticky lg:top-24">

            {/* Winner banner — shown once auction is completed */}
            {!isActive && winner?.hasWinner && (
              <div
                className={cn(
                  card.base,
                  "p-5",
                  isCurrentUserWinner
                    ? "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30"
                    : "",
                )}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
                    <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p
                      className={cn(
                        "font-semibold text-sm",
                        isCurrentUserWinner
                          ? "text-amber-700 dark:text-amber-300"
                          : colors.text.primary,
                      )}
                    >
                      {isCurrentUserWinner
                        ? "🎉 You won this auction!"
                        : "Auction ended"}
                    </p>
                    <p className={cn("text-xs mt-0.5", colors.text.muted)}>
                      {isCurrentUserWinner
                        ? "Congratulations!"
                        : "This auction has a winner"}
                    </p>
                  </div>
                </div>
                <div className="pt-3 border-t border-amber-200 dark:border-amber-800/60">
                  <p className={typography.labelSm}>Winning bid</p>
                  <p className="text-2xl font-extrabold text-amber-700 dark:text-amber-400 tabular-nums mt-0.5">
                    $
                    {Number(winner.winningBidAmount).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Price + bid form card */}
            <div className={cn(card.base, "p-5 space-y-5")}>

              {/* Current price */}
              <div>
                <p className={typography.labelSm}>Current price</p>
                <div className="flex items-end gap-2 mt-1.5">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                    $
                    {Number(auction.currentPrice).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                  {priceRaised && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-xs font-medium mb-1",
                        colors.text.success,
                      )}
                    >
                      <TrendingUp className="w-3 h-3" />
                      Active bidding
                    </span>
                  )}
                </div>
                {priceRaised && (
                  <p className={cn("text-xs mt-1", colors.text.muted)}>
                    Started at $
                    {Number(auction.startingPrice).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                )}
              </div>

              {/* Countdown bar */}
              {isActive && !countdown.isExpired && (
                <div
                  className={cn(
                    "flex items-center gap-2.5 p-3 rounded-xl",
                    countdown.urgency === "critical"
                      ? "bg-red-50  dark:bg-red-950/30"
                      : countdown.urgency === "urgent"
                      ? "bg-amber-50 dark:bg-amber-950/30"
                      : "bg-slate-50 dark:bg-slate-800",
                  )}
                >
                  {countdown.urgency === "critical" ? (
                    <Flame
                      className={cn(
                        "w-4 h-4 shrink-0 animate-pulse",
                        colors.text.danger,
                      )}
                    />
                  ) : (
                    <Clock
                      className={cn(
                        "w-4 h-4 shrink-0",
                        countdown.urgency === "urgent"
                          ? colors.text.warning
                          : colors.text.muted,
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      "text-sm font-semibold tabular-nums",
                      countdown.urgency === "critical"
                        ? colors.text.danger
                        : countdown.urgency === "urgent"
                        ? colors.text.warning
                        : colors.text.secondary,
                    )}
                  >
                    {countdown.label} remaining
                  </span>
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-slate-100 dark:border-slate-800" />

              {/* Bid form */}
              <PlaceBidForm
                auctionId={auction.id}
                currentPrice={Number(auction.currentPrice)}
                isActive={isActive}
                isSeller={isSeller}
                isAuthenticated={isAuthenticated}
                isLeadingBidder={isLeadingBidder}
              />
            </div>

            {/* Live indicator — only when active */}
            {isActive && (
              <div className={cn(card.base, "p-4 flex items-center gap-3")}>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      colors.text.primary,
                    )}
                  >
                    Live updates active
                  </p>
                  <p className={cn("text-xs", colors.text.muted)}>
                    New bids appear instantly
                  </p>
                </div>
                <span className="ml-auto w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
