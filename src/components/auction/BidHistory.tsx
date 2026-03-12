import { cn } from "@/lib/cn";
import { card, typography, colors } from "@/lib/theme";
import type { Bid } from "@/types";
import { Gavel, User } from "lucide-react";

interface BidHistoryProps {
  bids: Bid[];
  currentUserId?: string;
  isLoading?: boolean;
}

function formatBidTime(dateStr: string): string {
  // Normalize to UTC — backend sends LocalDateTime without timezone suffix
  const normalized = dateStr.endsWith("Z") || dateStr.includes("+") ? dateStr : dateStr + "Z";
  const date = new Date(normalized);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1)  return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24)   return `${diffH}h ago`;

  return date.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", month: "short", day: "numeric" });
}

function BidRow({
  bid,
  isYou,
  rank,
}: {
  bid: Bid;
  isYou: boolean;
  rank: number;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
        rank === 1
          ? "bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900"
          : "hover:bg-slate-50 dark:hover:bg-slate-800/60",
      )}
    >
      {/* Rank / avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold",
          rank === 1
            ? "bg-indigo-600 text-white"
            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400",
        )}
      >
        {rank === 1 ? "🥇" : `#${rank}`}
      </div>

      {/* Bidder */}
      <div className="flex items-center gap-1.5 min-w-0">
        <User className="w-3.5 h-3.5 shrink-0 text-slate-400" />
        <span
          className={cn(
            "text-sm font-medium truncate",
            isYou
              ? "text-indigo-600 dark:text-indigo-400"
              : colors.text.secondary,
          )}
        >
          {isYou ? "You" : "Anonymous"}
        </span>
      </div>

      {/* Amount */}
      <div className="ml-auto text-right shrink-0">
        <span
          className={cn(
            "text-sm font-bold tabular-nums",
            rank === 1
              ? "text-indigo-600 dark:text-indigo-400"
              : colors.text.primary,
          )}
        >
          ${Number(bid.bidAmount).toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}
        </span>
        <p className={cn("text-xs mt-0.5", colors.text.muted)}>
          {formatBidTime(bid.createdAt)}
        </p>
      </div>
    </div>
  );
}

function BidSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse shrink-0" />
          <div className="w-20 h-4 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
          <div className="ml-auto w-16 h-4 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export default function BidHistory({
  bids,
  currentUserId,
  isLoading,
}: BidHistoryProps) {
  // Sort newest first for display; rank is based on bid amount desc
  const sorted = [...bids].sort(
    (a, b) => Number(b.bidAmount) - Number(a.bidAmount),
  );

  if (isLoading) {
    return (
      <div className={cn(card.base, "p-4")}>
        <BidSkeleton />
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div
        className={cn(
          card.base,
          "p-8 flex flex-col items-center gap-3 text-center",
        )}
      >
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Gavel className="w-6 h-6 text-slate-400" />
        </div>
        <div>
          <p className={cn("text-sm font-medium", colors.text.primary)}>
            No bids yet
          </p>
          <p className={cn("text-xs mt-0.5", colors.text.muted)}>
            Be the first to place a bid!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(card.base, "overflow-hidden")}>
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className={cn("text-sm font-semibold", colors.text.primary)}>
          {bids.length} {bids.length === 1 ? "bid" : "bids"}
        </span>
        <span className={cn("text-xs", colors.text.muted)}>
          Highest first
        </span>
      </div>
      <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
        {sorted.map((bid, idx) => (
          <BidRow
            key={bid.id}
            bid={bid}
            isYou={bid.userId === currentUserId}
            rank={idx + 1}
          />
        ))}
      </div>
    </div>
  );
}
