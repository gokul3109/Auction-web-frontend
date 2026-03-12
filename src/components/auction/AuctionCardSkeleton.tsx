import { cn } from "@/lib/cn";
import { card } from "@/lib/theme";

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse",
        className,
      )}
    />
  );
}

export default function AuctionCardSkeleton() {
  return (
    <div className={cn(card.base, "overflow-hidden flex flex-col")}>
      {/* Image placeholder */}
      <div className="h-48 bg-slate-200 dark:bg-slate-700 animate-pulse" />

      {/* Content */}
      <div className="p-4 flex flex-col gap-3">
        {/* Title */}
        <div className="space-y-2">
          <Shimmer className="h-4 w-3/4" />
          <Shimmer className="h-4 w-1/2" />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Shimmer className="h-3 w-full" />
          <Shimmer className="h-3 w-4/5" />
        </div>

        {/* Footer stats */}
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <Shimmer className="h-3.5 w-16" />
          <Shimmer className="h-3.5 w-14" />
        </div>
      </div>
    </div>
  );
}
