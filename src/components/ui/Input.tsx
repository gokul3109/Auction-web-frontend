import { forwardRef } from "react";
import { cn } from "@/lib/cn";
import { input, type InputState } from "@/lib/theme";

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: "sm" | "md" | "lg";
  state?: InputState;
  label?: string;
  hint?: string;
  error?: string;
  /** Icon shown on the left inside the input wrapper */
  leftIcon?: React.ReactNode;
  /** Icon/button shown on the right inside the input wrapper */
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = "md",
      state,
      label,
      hint,
      error,
      leftIcon,
      rightIcon,
      className,
      id,
      ...props
    },
    ref,
  ) => {
    const resolvedState: InputState = error ? "error" : (state ?? "default");

    const inputEl = (
      <input
        ref={ref}
        id={id}
        className={cn(
          input.base,
          input.sizes[size],
          input.states[resolvedState],
          leftIcon  && "pl-10",
          rightIcon && "pr-10",
          className,
        )}
        {...props}
      />
    );

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className={input.label}>
            {label}
          </label>
        )}

        {leftIcon || rightIcon ? (
          <div className="relative">
            {leftIcon && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                {leftIcon}
              </span>
            )}
            {inputEl}
            {rightIcon && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {rightIcon}
              </span>
            )}
          </div>
        ) : (
          inputEl
        )}

        {error ? (
          <p className={input.error}>{error}</p>
        ) : hint ? (
          <p className={input.hint}>{hint}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
export default Input;
