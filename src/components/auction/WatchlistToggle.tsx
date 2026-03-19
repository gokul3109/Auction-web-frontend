"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/cn";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  useAddToWatchlistMutation,
  useRemoveFromWatchlistMutation,
} from "@/store/api/auctionApi";

interface WatchlistToggleProps {
  auctionId: string;
  isWatchlisted: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function WatchlistToggle({
  auctionId,
  isWatchlisted,
  className,
  onClick,
}: WatchlistToggleProps) {
  const { isAuthenticated } = useAuth();
  const [addToWatchlist, { isLoading: adding }] = useAddToWatchlistMutation();
  const [removeFromWatchlist, { isLoading: removing }] = useRemoveFromWatchlistMutation();

    // Optimistic local state — updates immediately; syncs back when server data arrives
    const [localWatchlisted, setLocalWatchlisted] = useState(isWatchlisted);

    useEffect(() => {
      setLocalWatchlisted(isWatchlisted);
    }, [isWatchlisted]);

    if (!isAuthenticated) return null;

  const isLoading = adding || removing;

  async function handleToggle(e: React.MouseEvent<HTMLButtonElement>) {
    onClick?.(e);
    if (isLoading) return;

      const optimisticValue = !localWatchlisted;
      setLocalWatchlisted(optimisticValue); // instant feedback

    try {
        if (localWatchlisted) {
        await removeFromWatchlist(auctionId).unwrap();
      } else {
        await addToWatchlist(auctionId).unwrap();
      }
    } catch {
        setLocalWatchlisted(!optimisticValue); // revert on error
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
        aria-label={localWatchlisted ? "Remove from watchlist" : "Add to watchlist"}
      className={cn(
        "inline-flex items-center justify-center rounded-lg transition-colors",
        "bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-sm",
        "text-slate-500 hover:text-rose-500 dark:text-slate-300 dark:hover:text-rose-400",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
      disabled={isLoading}
    >
        <Heart className={cn("w-4 h-4", localWatchlisted && "fill-current text-rose-500 dark:text-rose-400")} />
    </button>
  );
}
