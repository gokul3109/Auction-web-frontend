import { cn } from "@/lib/cn";
import { badge, type BadgeVariant, type BadgeSize } from "@/lib/theme";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}

export default function Badge({
  variant = "default",
  size = "md",
  dot = false,
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        badge.base,
        badge.variants[variant],
        badge.sizes[size],
        className,
      )}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      )}
      {children}
    </span>
  );
}
