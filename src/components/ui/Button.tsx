import { forwardRef } from "react";
import { cn } from "@/lib/cn";
import { button, type ButtonVariant, type ButtonSize } from "@/lib/theme";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Renders as a full-width block */
  block?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      block = false,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          button.base,
          button.variants[variant],
          button.sizes[size],
          block && "w-full",
          className,
        )}
        {...props}
      >
        {loading ? (
          <>
            <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
            {children}
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
export default Button;
