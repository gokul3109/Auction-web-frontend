"use client";

import Link from "next/link";
import Image from "next/image";
import { Gavel, TrendingUp, Clock, ListChecks, ChevronDown, Trophy, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/cn";
import { button, typography, colors, card, badge, divider } from "@/lib/theme";
import { useAuth } from "@/hooks/useAuth";
import { useGetMyBidsQuery } from "@/store/api/bidApi";
import type { Bid, AuctionStatus } from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(iso.endsWith("Z") ? iso : iso + "Z"));
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuctionGroup {
  auctionId: string;
  auctionTitle: string;
  auctionStatus?: AuctionStatus;
  auctionImageUrl?: string | null;
  currentPrice?: number;
  myHighestBid: number;
  isWinning: boolean;
  bids: Bid[]; // all my bids on this auction, newest first
}

// ─── Group bids by auction ────────────────────────────────────────────────────

function groupByAuction(bids: Bid[]): AuctionGroup[] {
  const map = new Map<string, AuctionGroup>();

  for (const bid of bids) {
    const existing = map.get(bid.auctionId);
    if (!existing) {
      map.set(bid.auctionId, {
        auctionId:      bid.auctionId,
        auctionTitle:   bid.auctionTitle   ?? "Auction",
        auctionStatus:  bid.auctionStatus,
        auctionImageUrl: bid.auctionImageUrl,
        currentPrice:   bid.currentPrice,
        myHighestBid:   bid.bidAmount,
        isWinning:      false,
        bids:           [bid],
      });
    } else {
      existing.bids.push(bid);
      if (bid.bidAmount > existing.myHighestBid) {
        existing.myHighestBid = bid.bidAmount;
      }
      // Keep enriched fields from any bid that has them
      if (!existing.currentPrice && bid.currentPrice) existing.currentPrice = bid.currentPrice;
      if (!existing.auctionStatus && bid.auctionStatus) existing.auctionStatus = bid.auctionStatus;
    }
  }

  // Sort each group's bids newest first, compute isWinning
  for (const group of map.values()) {
    group.bids.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    group.isWinning =
      group.currentPrice !== undefined &&
      group.myHighestBid === group.currentPrice;
  }

  // Sort groups by most recent bid overall
  return Array.from(map.values()).sort(
    (a, b) =>
      new Date(b.bids[0].createdAt).getTime() -
      new Date(a.bids[0].createdAt).getTime(),
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function AuctionGroupSkeleton() {
  return (
    <div className={cn(card.base, "p-5 animate-pulse space-y-4")}>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-slate-200 dark:bg-slate-700 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-52 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-3 w-32 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="hidden sm:flex gap-6">
          {[0, 1].map((i) => (
            <div key={i} className="space-y-1 text-right">
              <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS: { label: string; value: AuctionStatus | "all" }[] = [
  { label: "All",   value: "all"       },
  { label: "Live",  value: "active"    },
  { label: "Ended", value: "completed" },
];

// ─── Auction group card ────────────────────────────────────────────────────────

function AuctionBidGroup({ group }: { group: AuctionGroup }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn(card.base, "overflow-hidden")}>
      {/* ── Main row ── */}
      <div className="p-5">
        <div className="flex items-start gap-4">

          {/* Thumbnail */}
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
            {group.auctionImageUrl ? (
              <Image
                src={group.auctionImageUrl}
                alt={group.auctionTitle}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Gavel className="w-6 h-6 text-slate-400" />
              </div>
            )}
          </div>

          {/* Title + badges */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 flex-wrap">
              <Link
                href={`/auctions/${group.auctionId}`}
                className={cn(
                  "font-semibold leading-snug hover:underline underline-offset-2",
                  colors.text.primary,
                )}
                onClick={(e) => e.stopPropagation()}
              >
                {group.auctionTitle}
                <ExternalLink className="inline w-3 h-3 ml-1 opacity-40" />
              </Link>
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {/* Status badge */}
              <span className={cn(
                badge.base, badge.sizes.sm,
                group.auctionStatus === "active"
                  ? badge.variants.active
                  : badge.variants.completed,
              )}>
                {group.auctionStatus === "active" ? "Live" : "Ended"}
              </span>
              {/* Winning indicator */}
              {group.auctionStatus === "active" && group.isWinning && (
                <span className={cn(badge.base, badge.sizes.sm, badge.variants.warning)}>
                  <Trophy className="w-3 h-3" />
                  Winning
                </span>
              )}
              {group.auctionStatus === "completed" && group.isWinning && (
                <span className={cn(badge.base, badge.sizes.sm, badge.variants.success)}>
                  <Trophy className="w-3 h-3" />
                  Won
                </span>
              )}
              {/* Total bids */}
              <span className={cn("text-xs", colors.text.muted)}>
                {group.bids.length} bid{group.bids.length !== 1 ? "s" : ""} placed
              </span>
            </div>
          </div>

          {/* Price stats */}
          <div className="hidden sm:flex items-start gap-6 shrink-0">
            <div className="text-right">
              <p className={cn("text-xs mb-0.5", colors.text.muted)}>My highest bid</p>
              <p className={cn("font-bold text-sm", colors.text.brand)}>
                {formatCurrency(group.myHighestBid)}
              </p>
            </div>
            {group.currentPrice !== undefined && (
              <div className="text-right">
                <p className={cn("text-xs mb-0.5", colors.text.muted)}>Current price</p>
                <div className="flex items-center justify-end gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                  <p className={cn("font-semibold text-sm", colors.text.primary)}>
                    {formatCurrency(group.currentPrice)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile price stats */}
        <div className="sm:hidden flex gap-4 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            <p className={cn("text-xs", colors.text.muted)}>My highest bid</p>
            <p className={cn("font-bold text-sm mt-0.5", colors.text.brand)}>
              {formatCurrency(group.myHighestBid)}
            </p>
          </div>
          {group.currentPrice !== undefined && (
            <div>
              <p className={cn("text-xs", colors.text.muted)}>Current price</p>
              <p className={cn("font-semibold text-sm mt-0.5", colors.text.primary)}>
                {formatCurrency(group.currentPrice)}
              </p>
            </div>
          )}
        </div>

        {/* Accordion toggle */}
        {group.bids.length > 0 && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className={cn(
              "mt-3 flex items-center gap-1.5 text-xs font-medium transition-colors",
              colors.text.muted,
              "hover:text-slate-700 dark:hover:text-slate-300",
            )}
          >
            <ChevronDown
              className={cn(
                "w-3.5 h-3.5 transition-transform duration-200",
                expanded && "rotate-180",
              )}
            />
            {expanded ? "Hide" : "Show"} bid history
          </button>
        )}
      </div>

      {/* ── Accordion: bid history ── */}
      {expanded && (
        <div className={cn(divider, "border-t")}>
          <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50">
            <p className={cn("text-xs font-semibold uppercase tracking-wide mb-3", colors.text.muted)}>
              Bid History
            </p>
            <div className="space-y-2">
              {group.bids.map((bid, i) => (
                <div
                  key={bid.id}
                  className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700/50 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className={cn("text-xs", colors.text.muted)}>
                      {formatDate(bid.createdAt)}
                    </span>
                    {i === 0 && (
                      <span className={cn(badge.base, badge.sizes.sm, badge.variants.brand)}>
                        Latest
                      </span>
                    )}
                  </div>
                  <span className={cn(
                    "text-sm font-semibold",
                    i === 0 ? colors.text.brand : colors.text.secondary,
                  )}>
                    {formatCurrency(bid.bidAmount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function MyBidsPage() {
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState<AuctionStatus | "all">("all");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data: bids = [], isLoading } = useGetMyBidsQuery(undefined, {
    skip: !isAuthenticated,
  });

  if (!mounted) return null;

  // ── Unauthenticated ────────────────────────────────────────────────────────

  if (!isAuthenticated) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Gavel className="w-7 h-7 text-slate-400" />
        </div>
        <p className={typography.h4}>Sign in to view your bids</p>
        <Link href="/login" className={cn(button.base, button.variants.primary, button.sizes.md)}>
          Sign in
        </Link>
      </div>
    );
  }

  // ── Group + filter ─────────────────────────────────────────────────────────

  const groups = groupByAuction(bids);

  const filtered =
    tab === "all" ? groups : groups.filter((g) => g.auctionStatus === tab);

  const counts = {
    all:       groups.length,
    active:    groups.filter((g) => g.auctionStatus === "active").length,
    completed: groups.filter((g) => g.auctionStatus === "completed").length,
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center shrink-0">
          <ListChecks className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className={typography.h3}>My Bids</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 w-fit mb-8">
        {TABS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150",
              tab === value
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300",
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
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <AuctionGroupSkeleton key={i} />)}
        </div>
      )}

      {/* Empty */}
      {!isLoading && filtered.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Gavel className="w-8 h-8 text-slate-300 dark:text-slate-600" />
          </div>
          <div>
            <p className={cn("font-semibold", colors.text.primary)}>
              {tab === "all" ? "No bids yet" : `No ${tab === "active" ? "live" : "ended"} bids`}
            </p>
            <p className={cn("text-sm mt-1", colors.text.muted)}>
              {tab === "all"
                ? "Find an auction and place your first bid."
                : `You have no bids on ${tab === "active" ? "live" : "ended"} auctions.`}
            </p>
          </div>
          {tab === "all" && (
            <Link href="/" className={cn(button.base, button.variants.primary, button.sizes.md)}>
              Browse auctions
            </Link>
          )}
        </div>
      )}

      {/* Groups */}
      {!isLoading && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((group) => (
            <AuctionBidGroup key={group.auctionId} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}
