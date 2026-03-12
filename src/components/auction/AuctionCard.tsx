"use client";

import Link from "next/link";
import { Gavel, Clock, TrendingUp, ImageOff, Flame, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { card, badge, typography, colors } from "@/lib/theme";
import type { Auction } from "@/types";
import { useCountdown } from "@/hooks/useCountdown";

interface AuctionCardProps {
  auction: Auction;
}

// ─── Countdown section ─────────────────────────────────────────────────────────

function CountdownBadge({ endDate }: { endDate: string | null }) {
  const { label, urgency, isExpired } = useCountdown(endDate);

  if (isExpired) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 dark:text-slate-500">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Ended
      </span>
    );
  }

  const colorClass =
    urgency === "critical"
      ? "text-red-500 dark:text-red-400"
      : urgency === "urgent"
      ? "text-amber-500 dark:text-amber-400"
      : "text-slate-500 dark:text-slate-400";

  const Icon = urgency === "critical" ? Flame : Clock;

  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-semibold tabular-nums", colorClass)}>
      <Icon className={cn("w-3.5 h-3.5", urgency === "critical" && "animate-pulse")} />
      {label}
    </span>
  );
}

// ─── Main card ─────────────────────────────────────────────────────────────────

// Full static class strings — Tailwind scanner must see the complete class name,
// never a dynamic concatenation of partial tokens.
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

export default function AuctionCard({ auction }: AuctionCardProps) {
  const isActive   = auction.status === "active";
  const hasImage   = Boolean(auction.imageUrl);
  const gradient   = getFallbackGradient(auction.id);
  const priceRaised = auction.currentPrice > auction.startingPrice;

  return (
    <Link
      href={`/auctions/${auction.id}`}
      className={cn(
        card.base,
        "group overflow-hidden flex flex-col",
        "transition-all duration-200",
        "hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10 dark:hover:shadow-black/40",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
      )}
    >
      {/* ── Image / Placeholder ─────────────────────────────────────────────── */}
      <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={auction.imageUrl!}
            alt={auction.title}
            loading="lazy"
            width={400}
            height={192}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={cn("w-full h-full flex items-center justify-center", gradient)}>
            <ImageOff className="w-10 h-10 text-white/50" />
          </div>
        )}

        {/* Gradient overlay (bottom) */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-black/40 to-transparent" />

        {/* Status badge — top-left */}
        <div className="absolute top-3 left-3">
          {isActive ? (
            <span className={cn(
              badge.base, badge.sizes.sm,
              "bg-emerald-500 text-white shadow-md shadow-emerald-500/30 backdrop-blur-sm",
            )}>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" />
              Live
            </span>
          ) : (
            <span className={cn(
              badge.base, badge.sizes.sm,
              "bg-slate-700/80 text-slate-200 backdrop-blur-sm",
            )}>
              Ended
            </span>
          )}
        </div>

        {/* Category badge — top-right */}
        {auction.category && (
          <div className="absolute top-3 right-3">
            <span className={cn(
              badge.base, badge.sizes.sm,
              "bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 backdrop-blur-sm shadow-sm",
            )}>
              {auction.category}
            </span>
          </div>
        )}

        {/* Price pill — bottom-left over image */}
        <div className="absolute bottom-3 left-3">
          <span className={cn(
            "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-sm shadow",
            priceRaised
              ? "bg-indigo-600 text-white"
              : "bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white",
          )}>
            <TrendingUp className="w-3 h-3" />
            ${Number(auction.currentPrice).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4 gap-3">

        {/* Title */}
        <h3 className={cn(
          typography.h5,
          "line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors",
        )}>
          {auction.title}
        </h3>

        {/* Description */}
        {auction.description && (
          <p className={cn(typography.bodySm, "line-clamp-2")}>
            {auction.description}
          </p>
        )}

        {/* ── Footer stats ─────────────────────────────────────────────────── */}
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">

          {/* Time remaining */}
          <CountdownBadge endDate={auction.endDate} />

          {/* Bid count placeholder (will be real in Phase 2 with stats) */}
          <span className={cn("inline-flex items-center gap-1 text-xs", colors.text.muted)}>
            <Gavel className="w-3.5 h-3.5" />
            {priceRaised ? "Bids placed" : "No bids yet"}
          </span>
        </div>

        {/* Starting price context */}
        {priceRaised && (
          <p className={cn("text-xs", colors.text.muted)}>
            Started at{" "}
            <span className="line-through">
              ${Number(auction.startingPrice).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </p>
        )}
      </div>
    </Link>
  );
}
