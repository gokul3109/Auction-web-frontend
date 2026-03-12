"use client";

import { useState } from "react";
import Link from "next/link";
import { Gavel, Loader2, TrendingUp, Lock } from "lucide-react";
import { cn } from "@/lib/cn";
import { button, colors } from "@/lib/theme";
import { usePlaceBidMutation } from "@/store/api/bidApi";

interface PlaceBidFormProps {
  auctionId: string;
  currentPrice: number;
  isActive: boolean;
  isSeller: boolean;
  isAuthenticated: boolean;
  isLeadingBidder?: boolean;
}

export default function PlaceBidForm({
  auctionId,
  currentPrice,
  isActive,
  isSeller,
  isAuthenticated,
  isLeadingBidder = false,
}: PlaceBidFormProps) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [placeBid, { isLoading }] = usePlaceBidMutation();

  const minBid = currentPrice + 0.01;

  const validate = (val: string): string => {
    const num = parseFloat(val);
    if (!val.trim() || isNaN(num)) return "Enter a valid amount";
    if (num <= currentPrice)
      return `Bid must be greater than $${currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    const validationError = validate(amount);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");

    try {
      await placeBid({
        auctionId,
        data: { bidAmount: parseFloat(amount) },
      }).unwrap();
      setAmount("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const e = err as { data?: { error?: string; message?: string } };
      setError(
        e?.data?.error ||
          e?.data?.message ||
          "Failed to place bid. Please try again.",
      );
    }
  };

  // ── Disabled state (not active) ───────────────────────────────────────────

  if (!isActive) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
        <Lock className="w-4 h-4 text-slate-400 shrink-0" />
        <span className={cn("text-sm", colors.text.muted)}>
          Bidding is closed
        </span>
      </div>
    );
  }

  // ── Seller view ───────────────────────────────────────────────────────────

  if (isSeller) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40">
        <Gavel className="w-4 h-4 text-indigo-500 shrink-0" />
        <span className={cn("text-sm text-indigo-600 dark:text-indigo-400 font-medium")}>
          You are the seller of this auction
        </span>
      </div>
    );
  }

  // ── Unauthenticated ───────────────────────────────────────────────────────

  if (!isAuthenticated) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
          <Lock className="w-4 h-4 text-slate-400 shrink-0" />
          <span className={cn("text-sm", colors.text.muted)}>
            Sign in to place a bid
          </span>
        </div>
        <Link
          href="/login"
          className={cn(
            button.base,
            button.variants.primary,
            button.sizes.md,
            "w-full justify-center",
          )}
        >
          Sign in to bid
        </Link>
      </div>
    );
  }

  // ── Bid form ───────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      {/* Leading bidder warning */}
      {isLeadingBidder && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
          <span className="text-amber-500 shrink-0 mt-0.5">⚠</span>
          <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
            You already have the highest bid. Bidding again will raise your own price.
          </p>
        </div>
      )}
      {/* Minimum bid hint */}
      <p className={cn("text-xs", colors.text.muted)}>
        Minimum bid:{" "}
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          $
          {minBid.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}
        </span>
      </p>

      {/* Amount input */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400 select-none">
          $
        </span>
        <input
          type="number"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            if (error) setError("");
            if (success) setSuccess(false);
          }}
          placeholder={minBid.toFixed(2)}
          step="0.01"
          min={minBid}
          disabled={isLoading}
          className={cn(
            "w-full pl-7 pr-4 py-2.5 rounded-xl border text-sm font-semibold",
            "bg-white dark:bg-slate-900 text-slate-900 dark:text-white",
            "placeholder-slate-300 dark:placeholder-slate-600",
            "outline-none transition-all",
            "disabled:opacity-60 disabled:cursor-not-allowed",
            error
              ? "border-red-400 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900"
              : "border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900",
          )}
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 flex items-start gap-1">
          <span className="shrink-0 mt-0.5">⚠</span>
          {error}
        </p>
      )}

      {/* Success */}
      {success && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          ✓ Bid placed successfully!
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading || !amount}
        className={cn(
          button.base,
          button.variants.primary,
          button.sizes.md,
          "w-full justify-center",
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Placing bid…
          </>
        ) : (
          <>
            <TrendingUp className="w-4 h-4" />
            Place Bid
          </>
        )}
      </button>
    </form>
  );
}
