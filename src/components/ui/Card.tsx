import { cn } from "@/lib/cn";
import { card, type CardShadow } from "@/lib/theme";

interface CardProps {
  padding?: keyof typeof card.padding;
  shadow?: CardShadow;
  /** Adds hover lift effect */
  hoverable?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export default function Card({
  padding = "md",
  shadow = "sm",
  hoverable = false,
  className,
  children,
  onClick,
}: CardProps) {
  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      onClick={onClick}
      className={cn(
        card.base,
        card.padding[padding],
        card.shadow[shadow],
        hoverable && card.hover,
        onClick && "text-left w-full cursor-pointer",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/* ── Sub-components for structured cards ──────────────────────────────────── */

interface CardSectionProps {
  className?: string;
  children: React.ReactNode;
}

Card.Header = function CardHeader({ className, children }: CardSectionProps) {
  return (
    <div className={cn("border-b border-slate-100 dark:border-slate-800 pb-4 mb-4", className)}>
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({ className, children }: CardSectionProps) {
  return (
    <div className={cn("border-t border-slate-100 dark:border-slate-800 pt-4 mt-4", className)}>
      {children}
    </div>
  );
};
