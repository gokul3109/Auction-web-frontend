"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { cn } from "@/lib/cn";
import { card, typography, button, colors } from "@/lib/theme";
import { useAuth } from "@/hooks/useAuth";
import {
  useGetAuctionQuery,
  useUpdateAuctionMutation,
  useDeleteAuctionMutation,
} from "@/store/api/auctionApi";
import AuctionForm from "@/components/auction/AuctionForm";
import type { AuctionRequest } from "@/types";
import { toast } from "@/lib/toast";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function EditSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      <div className="rounded-2xl bg-slate-200 dark:bg-slate-700 h-120 animate-pulse" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EditAuctionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const { data: auction, isLoading, isError } = useGetAuctionQuery(id);
  const [updateAuction, { isLoading: isUpdating }] =
    useUpdateAuctionMutation();
  const [deleteAuction, { isLoading: isDeleting }] = useDeleteAuctionMutation();

  // ── Loading ────────────────────────────────────────────────────────────────

  if (isLoading) return <EditSkeleton />

  // ── Not found ──────────────────────────────────────────────────────────────

  if (isError || !auction) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 flex flex-col items-center gap-4 text-center">
        <p className={cn(typography.h4)}>Auction not found</p>
        <Link
          href="/"
          className={cn(button.base, button.variants.primary, button.sizes.md)}
        >
          Back to auctions
        </Link>
      </div>
    );
  }

  // ── Seller guard ───────────────────────────────────────────────────────────

  if (!isAuthenticated || user?.id !== auction.userId) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 flex flex-col items-center gap-4 text-center">
        <p className={cn(typography.h4)}>
          You don&apos;t have permission to edit this auction
        </p>
        <Link
          href={`/auctions/${id}`}
          className={cn(button.base, button.variants.primary, button.sizes.md)}
        >
          View auction
        </Link>
      </div>
    );
  }

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSubmit = async (data: AuctionRequest) => {
    try {
      await updateAuction({ id, data }).unwrap();
      router.push(`/auctions/${id}`);
    } catch (err: unknown) {
      const e = err as { data?: { error?: string; message?: string } };
      toast.error(e?.data?.error ?? e?.data?.message ?? "Failed to update auction. Please try again.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAuction(id).unwrap();
      router.push("/");
    } catch (err: unknown) {
      const e = err as { data?: { error?: string; message?: string } };
      toast.error(e?.data?.error ?? e?.data?.message ?? "Failed to delete auction. Please try again.");
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* Back */}
      <Link
        href={`/auctions/${id}`}
        className={cn(
          "inline-flex items-center gap-1.5 text-sm font-medium mb-8 transition-colors",
          colors.text.muted,
          "hover:text-slate-900 dark:hover:text-white",
        )}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to auction
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center shrink-0">
          <Pencil className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="min-w-0">
          <h1 className={typography.h3}>Edit Auction</h1>
          <p
            className={cn("text-sm mt-0.5 truncate max-w-xs", colors.text.muted)}
          >
            {auction.title}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className={cn(card.base, "p-6 sm:p-8")}>
        <AuctionForm
          mode="edit"
          defaultValues={auction}
          isLoading={isUpdating}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  );
}
