"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Gavel } from "lucide-react";
import { cn } from "@/lib/cn";
import { card, typography, button, colors } from "@/lib/theme";
import { useAuth } from "@/hooks/useAuth";
import { useCreateAuctionMutation } from "@/store/api/auctionApi";
import AuctionForm from "@/components/auction/AuctionForm";
import type { AuctionRequest } from "@/types";
import { toast } from "@/lib/toast";

export default function CreateAuctionPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [createAuction, { isLoading }] = useCreateAuctionMutation();

  // ── Unauthenticated ────────────────────────────────────────────────────────

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 flex flex-col items-center gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Gavel className="w-7 h-7 text-slate-400" />
        </div>
        <p className={cn(typography.h4)}>Sign in to create an auction</p>
        <p className={cn("text-sm max-w-xs", colors.text.muted)}>
          You need to be signed in to list an item for bidding.
        </p>
        <Link
          href="/login"
          className={cn(button.base, button.variants.primary, button.sizes.md)}
        >
          Sign in
        </Link>
      </div>
    );
  }

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSubmit = async (data: AuctionRequest) => {
    try {
      const result = await createAuction(data).unwrap();
      router.push(`/auctions/${result.id}`);
    } catch (err: unknown) {
      const e = err as { data?: { error?: string; message?: string } };
      toast.error(e?.data?.error ?? e?.data?.message ?? "Failed to create auction. Please try again.");
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* Back */}
      <Link
        href="/"
        className={cn(
          "inline-flex items-center gap-1.5 text-sm font-medium mb-8 transition-colors",
          colors.text.muted,
          "hover:text-slate-900 dark:hover:text-white",
        )}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to auctions
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center shrink-0">
          <Gavel className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className={typography.h3}>Create Auction</h1>
          <p className={cn("text-sm mt-0.5", colors.text.muted)}>
            Fill in the details to list your item for bidding
          </p>
        </div>
      </div>

      {/* Form */}
      <div className={cn(card.base, "p-6 sm:p-8")}>
        <AuctionForm mode="create" isLoading={isLoading} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
