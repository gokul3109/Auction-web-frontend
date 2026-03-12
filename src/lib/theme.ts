/**
 * Design Tokens — single source of truth for all visual decisions.
 *
 * Every component consumes from here. Adding a new color, size, or variant
 * means editing this file — nowhere else.
 *
 * Usage:
 *   import { typography, button, card } from "@/lib/theme";
 *   <h1 className={typography.h1}> ...
 *   <button className={cn(button.base, button.variants.primary, button.sizes.md)}>
 */

// ─── Typography ────────────────────────────────────────────────────────────────

export const typography = {
  // Display / headings
  display:  "text-5xl   font-extrabold tracking-tight text-slate-900 dark:text-white",
  h1:       "text-4xl   font-bold       tracking-tight text-slate-900 dark:text-white",
  h2:       "text-3xl   font-bold       tracking-tight text-slate-900 dark:text-white",
  h3:       "text-2xl   font-semibold   tracking-tight text-slate-900 dark:text-white",
  h4:       "text-xl    font-semibold                  text-slate-900 dark:text-white",
  h5:       "text-lg    font-semibold                  text-slate-900 dark:text-white",

  // Body
  bodyLg:   "text-base  font-normal leading-relaxed    text-slate-700 dark:text-slate-300",
  body:     "text-[15px] font-normal leading-relaxed   text-slate-700 dark:text-slate-300",
  bodySm:   "text-sm    font-normal leading-relaxed    text-slate-600 dark:text-slate-400",

  // Labels / UI text
  label:    "text-sm    font-medium                    text-slate-700 dark:text-slate-300",
  labelSm:  "text-xs    font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400",
  caption:  "text-xs                                   text-slate-500 dark:text-slate-400",
  link:     "text-indigo-600 dark:text-indigo-400 hover:underline underline-offset-2 transition-colors",
} as const;

// ─── Semantic Colours ──────────────────────────────────────────────────────────

export const colors = {
  text: {
    primary:   "text-slate-900 dark:text-white",
    secondary: "text-slate-600 dark:text-slate-400",
    muted:     "text-slate-400 dark:text-slate-500",
    brand:     "text-indigo-600 dark:text-indigo-400",
    success:   "text-emerald-600 dark:text-emerald-400",
    warning:   "text-amber-600  dark:text-amber-400",
    danger:    "text-red-500    dark:text-red-400",
  },
  bg: {
    page:       "bg-slate-50   dark:bg-slate-950",
    surface:    "bg-white      dark:bg-slate-900",
    elevated:   "bg-white      dark:bg-slate-800",
    brand:      "bg-indigo-600",
    brandSoft:  "bg-indigo-50  dark:bg-indigo-950",
    successSoft:"bg-emerald-50 dark:bg-emerald-950",
    warningSoft:"bg-amber-50   dark:bg-amber-950",
    dangerSoft: "bg-red-50     dark:bg-red-950/40",
  },
  border: {
    base:   "border-slate-200 dark:border-slate-700",
    strong: "border-slate-300 dark:border-slate-600",
    subtle: "border-slate-100 dark:border-slate-800",
    brand:  "border-indigo-500",
  },
} as const;

// ─── Focus Ring ────────────────────────────────────────────────────────────────

export const focus = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900";

// ─── Button ───────────────────────────────────────────────────────────────────

export const button = {
  base: `inline-flex items-center justify-center gap-2 rounded-lg font-semibold
         transition-all duration-150 cursor-pointer
         disabled:opacity-50 disabled:pointer-events-none
         focus-visible:outline-none focus-visible:ring-2
         focus-visible:ring-indigo-500 focus-visible:ring-offset-2`,

  sizes: {
    xs: "px-2.5 py-1    text-xs",
    sm: "px-3   py-1.5  text-sm",
    md: "px-4   py-2    text-[15px]",
    lg: "px-5   py-2.5  text-base",
  },

  variants: {
    primary:   "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
    ghost:     "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800",
    outline:   "border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800",
    danger:    "bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/20",
    dangerGhost: "text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40",
  },
} as const;

// ─── Input ────────────────────────────────────────────────────────────────────

export const input = {
  base: `w-full rounded-xl border bg-white dark:bg-slate-900
         text-[15px] text-slate-900 dark:text-white
         placeholder:text-slate-400 dark:placeholder:text-slate-500
         transition-colors
         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
         disabled:opacity-50 disabled:cursor-not-allowed`,

  sizes: {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5",
    lg: "px-4 py-3   text-base",
  },

  states: {
    default: "border-slate-200 dark:border-slate-700",
    error:   "border-red-400   focus:ring-red-500",
  },

  label:  "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5",
  hint:   "mt-1.5 text-xs text-slate-500 dark:text-slate-400",
  error:  "mt-1.5 text-xs text-red-500",
} as const;

// ─── Card ─────────────────────────────────────────────────────────────────────

export const card = {
  base:     "rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800",

  padding: {
    none: "",
    sm:   "p-4",
    md:   "p-6",
    lg:   "p-8",
  },

  shadow: {
    none: "",
    sm:   "shadow-sm",
    md:   "shadow-md  shadow-slate-900/5  dark:shadow-black/20",
    lg:   "shadow-xl  shadow-slate-900/10 dark:shadow-black/30",
  },

  hover:  "transition-all duration-200 hover:shadow-lg hover:shadow-slate-900/10 dark:hover:shadow-black/30 hover:-translate-y-0.5",
} as const;

// ─── Badge ────────────────────────────────────────────────────────────────────

export const badge = {
  base: "inline-flex items-center gap-1 rounded-full font-medium",

  sizes: {
    sm: "px-2   py-0.5 text-xs",
    md: "px-2.5 py-1   text-xs",
  },

  variants: {
    default:   "bg-slate-100    text-slate-600  dark:bg-slate-800  dark:text-slate-400",
    brand:     "bg-indigo-50    text-indigo-600 dark:bg-indigo-950  dark:text-indigo-400",
    success:   "bg-emerald-50   text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
    warning:   "bg-amber-50     text-amber-700  dark:bg-amber-950  dark:text-amber-400",
    danger:    "bg-red-50       text-red-600    dark:bg-red-950    dark:text-red-400",
    active:    "bg-emerald-50   text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
    completed: "bg-slate-100    text-slate-500  dark:bg-slate-800  dark:text-slate-500",
  },
} as const;

// ─── Divider ──────────────────────────────────────────────────────────────────

export const divider = "border-t border-slate-100 dark:border-slate-800";

// ─── Convenience re-exports ───────────────────────────────────────────────────

export type ButtonVariant = keyof typeof button.variants;
export type ButtonSize    = keyof typeof button.sizes;
export type BadgeVariant  = keyof typeof badge.variants;
export type BadgeSize     = keyof typeof badge.sizes;
export type CardShadow    = keyof typeof card.shadow;
export type InputState    = keyof typeof input.states;
