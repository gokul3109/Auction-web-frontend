"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { button, input, colors } from "@/lib/theme";
import type { AuctionRequest } from "@/types";
import { CATEGORIES } from "./FilterBar";

// ─── Date helpers ──────────────────────────────────────────────────────────────

/**
 * Convert a backend date string (LocalDateTime, no TZ suffix → treated as UTC after
 * the frontend normalization) into the "YYYY-MM-DDTHH:mm" format required by
 * <input type="datetime-local">, expressed in the browser's local timezone.
 */
function toDatetimeLocal(isoStr: string): string {
  const normalized =
    isoStr.endsWith("Z") || isoStr.includes("+") ? isoStr : isoStr + "Z";
  const d = new Date(normalized);
  // Shift from UTC to local time so the input shows the correct local value
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
}

/**
 * Convert a datetime-local string (browser local time) to a UTC ISO string
 * for the backend.
 */
function toUtcIso(localStr: string): string {
  return new Date(localStr).toISOString();
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface AuctionFormProps {
  defaultValues?: {
    title?: string;
    description?: string | null;
    startingPrice?: number;
    category?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    imageUrl?: string | null;
  };
  onSubmit: (data: AuctionRequest) => Promise<void>;
  isLoading?: boolean;
  mode: "create" | "edit";
  onDelete?: () => void;
  isDeleting?: boolean;
}

// ─── Field wrapper ─────────────────────────────────────────────────────────────

function Field({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className={input.label}>
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className={input.hint}>{hint}</p>}
      {error && <p className={input.error}>{error}</p>}
    </div>
  );
}

// ─── AuctionForm ──────────────────────────────────────────────────────────────

export default function AuctionForm({
  defaultValues = {},
  onSubmit,
  isLoading = false,
  mode,
  onDelete,
  isDeleting = false,
}: AuctionFormProps) {
  const [title, setTitle] = useState(defaultValues.title ?? "");
  const [description, setDescription] = useState(
    defaultValues.description ?? "",
  );
  const [startingPrice, setStartingPrice] = useState(
    defaultValues.startingPrice != null
      ? String(defaultValues.startingPrice)
      : "",
  );
  const [category, setCategory] = useState(defaultValues.category ?? "");
  const [startDate, setStartDate] = useState(
    defaultValues.startDate ? toDatetimeLocal(defaultValues.startDate) : "",
  );
  const [endDate, setEndDate] = useState(
    defaultValues.endDate ? toDatetimeLocal(defaultValues.endDate) : "",
  );
  const [imageUrl, setImageUrl] = useState(defaultValues.imageUrl ?? "");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ── Validation ───────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const next: Record<string, string> = {};

    if (!title.trim()) next.title = "Title is required";
    else if (title.length > 120) next.title = "Title must be 120 characters or fewer";

    if (!category) next.category = "Category is required";

    const price = parseFloat(startingPrice);
    if (!startingPrice || isNaN(price) || price <= 0)
      next.startingPrice = "Starting price must be greater than 0";

    if (!endDate) next.endDate = "End date is required";
    else if (startDate && new Date(startDate) >= new Date(endDate))
      next.endDate = "End date must be after start date";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const clearError = (field: string) =>
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });

  // ── Submit ───────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data: AuctionRequest = {
      title: title.trim(),
      description: description.trim() || undefined,
      startingPrice: parseFloat(startingPrice),
      category: category || undefined,
      startDate: startDate ? toUtcIso(startDate) : undefined,
      endDate: endDate ? toUtcIso(endDate) : undefined,
      imageUrl: imageUrl.trim() || undefined,
    };

    await onSubmit(data).catch(() => {
      // error is surfaced by the parent via the API error banner
    });
  };

  const inputCls = (field: string) =>
    cn(
      input.base,
      input.sizes.md,
      errors[field] ? input.states.error : input.states.default,
    );

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Image preview */}
      {imageUrl && (
        <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-100 dark:bg-slate-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}

      {/* Title */}
      <Field label="Title" required error={errors.title}>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            clearError("title");
          }}
          placeholder="e.g. Vintage Rolex Submariner"
          maxLength={120}
          className={inputCls("title")}
        />
        <p className={input.hint}>{title.length}/120</p>
      </Field>

      {/* Description */}
      <Field
        label="Description"
        hint="Describe your item — condition, provenance, included accessories…"
      >
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide details that help bidders understand what they're getting…"
          rows={4}
          className={cn(inputCls("description"), "resize-none")}
        />
      </Field>

      {/* Price + Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field
          label="Starting Price (USD)"
          required
          error={errors.startingPrice}
        >
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-[15px] select-none pointer-events-none">
              $
            </span>
            <input
              type="number"
              value={startingPrice}
              onChange={(e) => {
                setStartingPrice(e.target.value);
                clearError("startingPrice");
              }}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              className={cn(inputCls("startingPrice"), "pl-8")}
            />
          </div>
        </Field>

        <Field label="Category" required error={errors.category}>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              clearError("category");
            }}
            className={cn(inputCls("category"), "cursor-pointer")}
          >
            <option value="" disabled>— Select a category —</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Start Date" hint="Optional — leave blank to start immediately">
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={inputCls("startDate")}
          />
        </Field>

        <Field label="End Date" required error={errors.endDate}>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              clearError("endDate");
            }}
            className={inputCls("endDate")}
          />
        </Field>
      </div>

      {/* Image URL */}
      <Field
        label="Image URL"
        hint="Paste a direct link to an image (https://…). Preview updates automatically."
      >
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className={inputCls("imageUrl")}
        />
      </Field>

      {/* Actions row */}
      <div className="pt-2 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isLoading || isDeleting}
          className={cn(
            button.base,
            button.variants.primary,
            button.sizes.lg,
            "flex-1 sm:flex-none",
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {mode === "create" ? "Creating…" : "Saving…"}
            </>
          ) : mode === "create" ? (
            "Create Auction"
          ) : (
            "Save Changes"
          )}
        </button>

        {/* Delete — initial button */}
        {mode === "edit" && onDelete && !showDeleteConfirm && (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isLoading || isDeleting}
            className={cn(
              button.base,
              button.variants.dangerGhost,
              button.sizes.lg,
            )}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        )}

        {/* Delete — confirm state */}
        {mode === "edit" && showDeleteConfirm && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("text-sm font-medium", colors.text.danger)}>
              Are you sure?
            </span>
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className={cn(button.base, button.variants.danger, button.sizes.sm)}
            >
              {isDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                "Yes, delete"
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className={cn(
                button.base,
                button.variants.secondary,
                button.sizes.sm,
              )}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </form>
  );
}
