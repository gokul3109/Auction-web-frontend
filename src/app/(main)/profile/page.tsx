"use client";

import { useState, useEffect, useRef } from "react";
import { User, Mail, Lock, Check, AlertCircle, Camera, Trophy, Gavel, TrendingUp, BarChart2, ChevronDown } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { button, typography, colors, card, input as inputTheme, divider, badge } from "@/lib/theme";
import { useAuth } from "@/hooks/useAuth";
import { useGetMeQuery, useUpdateProfileMutation } from "@/store/api/authApi";
import { useGetMyAuctionsQuery } from "@/store/api/auctionApi";
import { useGetMyBidsQuery } from "@/store/api/bidApi";
import { useAppDispatch } from "@/hooks/useAppStore";
import { updateUser } from "@/store/authSlice";
import Link from "next/link";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string | null, username: string): string {
  const src = name ?? username;
  return src
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── Stats bar ────────────────────────────────────────────────────────────────

import type { Auction, Bid } from "@/types";

function StatsBar({ auctions, bids }: { auctions: Auction[]; bids: Bid[] }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"stats" | "won">("stats");

  // Group bids by auction and find winning ones in COMPLETED auctions only
  const auctionBidMap = new Map<string, { myHighest: number; currentPrice?: number; status?: string }>();
  for (const bid of bids) {
    const entry = auctionBidMap.get(bid.auctionId);
    if (!entry) {
      auctionBidMap.set(bid.auctionId, { myHighest: bid.bidAmount, currentPrice: bid.currentPrice, status: bid.auctionStatus });
    } else {
      if (bid.bidAmount > entry.myHighest) entry.myHighest = bid.bidAmount;
      if (!entry.currentPrice && bid.currentPrice) entry.currentPrice = bid.currentPrice;
      if (!entry.status && bid.auctionStatus) entry.status = bid.auctionStatus;
    }
  }

  const wonEntries = Array.from(auctionBidMap.values()).filter(
    (e) => e.status === "completed" && e.currentPrice !== undefined && e.myHighest === e.currentPrice,
  );
  const totalSpent = wonEntries.reduce((sum, e) => sum + e.myHighest, 0);

  // Won bids (full Bid objects) for the won tab
  const wonMap = new Map<string, Bid>();
  for (const bid of bids) {
    if (bid.auctionStatus !== "completed") continue;
    const entry = wonMap.get(bid.auctionId);
    if (!entry) wonMap.set(bid.auctionId, bid);
    else if (bid.bidAmount > entry.bidAmount) wonMap.set(bid.auctionId, bid);
  }
  const wonBids = Array.from(wonMap.values()).filter(
    (b) => b.currentPrice !== undefined && b.bidAmount === b.currentPrice,
  );

  const stats = [
    { label: "Auctions listed", value: auctions.length, icon: <Gavel className="w-4 h-4" />, color: "text-indigo-500" },
    { label: "Total bids placed", value: bids.length, icon: <BarChart2 className="w-4 h-4" />, color: "text-blue-500" },
    { label: "Auctions won", value: wonEntries.length, icon: <Trophy className="w-4 h-4" />, color: "text-amber-500" },
    { label: "Total spent", value: totalSpent > 0 ? formatCurrency(totalSpent) : "—", icon: <TrendingUp className="w-4 h-4" />, color: "text-emerald-500" },
  ];

  return (
    <div className={cn(card.base, "overflow-hidden")}>
      {/* Accordion header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
            <BarChart2 className="w-4.5 h-4.5 text-slate-500" />
          </div>
          <div>
            <h2 className={cn("font-semibold", colors.text.primary)}>Activity Stats</h2>
            <p className={cn("text-xs mt-0.5", colors.text.muted)}>Your bidding &amp; listing overview</p>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "w-5 h-5 shrink-0 transition-transform duration-200",
            colors.text.muted,
            open && "rotate-180",
          )}
        />
      </button>

      {/* Collapsible body */}
      {open && (
        <div>
          {/* Tab switcher */}
          <div className="px-5 flex gap-1 border-b border-slate-100 dark:border-slate-800">
            {(["stats", "won"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                  tab === t
                    ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300",
                )}
              >
                {t === "stats" ? (
                  <><BarChart2 className="w-3.5 h-3.5" /> Stats</>
                ) : (
                  <><Trophy className="w-3.5 h-3.5" /> Auctions Won
                    {wonBids.length > 0 && (
                      <span className={cn(badge.base, badge.sizes.sm, badge.variants.success, "ml-0.5")}>
                        {wonBids.length}
                      </span>
                    )}
                  </>
                )}
              </button>
            ))}
          </div>

          {/* Stats tab */}
          {tab === "stats" && (
            <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.map(({ label, value, icon, color }) => (
                <div key={label} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex flex-col gap-2">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-slate-800", color)}>
                    {icon}
                  </div>
                  <p className={cn("text-xl font-bold", colors.text.primary)}>{value}</p>
                  <p className={cn("text-xs", colors.text.muted)}>{label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Auctions Won tab */}
          {tab === "won" && (
            <div className="px-5 py-4">
              {wonBids.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8">
                  <Trophy className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                  <p className={cn("text-sm", colors.text.muted)}>No auctions won yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {wonBids.map((bid) => (
                    <Link
                      key={bid.auctionId}
                      href={`/auctions/${bid.auctionId}`}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800",
                        "hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors",
                      )}
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                        {bid.auctionImageUrl ? (
                          <Image
                            src={bid.auctionImageUrl}
                            alt={bid.auctionTitle ?? "Auction"}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Gavel className="w-5 h-5 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-semibold truncate", colors.text.primary)}>
                          {bid.auctionTitle ?? "Auction"}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={cn(badge.base, badge.sizes.sm, badge.variants.success)}>
                            <Trophy className="w-3 h-3" />
                            Won
                          </span>
                          <span className={cn("text-xs font-semibold", colors.text.brand)}>
                            {formatCurrency(bid.bidAmount)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn(card.base, "overflow-hidden")}>
      <div className="p-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div>
            <h2 className={cn("font-semibold", colors.text.primary)}>{title}</h2>
            <p className={cn("text-xs mt-0.5", colors.text.muted)}>{description}</p>
          </div>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Alert banner ─────────────────────────────────────────────────────────────

function Alert({ type, message }: { type: "success" | "error"; message: string }) {
  return (
    <div className={cn(
      "flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm",
      type === "success"
        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
        : "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400",
    )}>
      {type === "success"
        ? <Check className="w-4 h-4 mt-0.5 shrink-0" />
        : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
      <span>{message}</span>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { isAuthenticated, user: storeUser } = useAuth();
  const dispatch = useAppDispatch();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // ── Fetch latest profile ───────────────────────────────────────────────────
  const { data: profile } = useGetMeQuery(undefined, { skip: !isAuthenticated });
  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();

  // ── Stats data ─────────────────────────────────────────────────────────────
  const { data: myAuctions = [] } = useGetMyAuctionsQuery(undefined, { skip: !isAuthenticated });
  const { data: myBids = [] } = useGetMyBidsQuery(undefined, { skip: !isAuthenticated });

  // Use fetched profile if available, fall back to Redux store
  const user = profile ?? storeUser;

  // ── Account info form ──────────────────────────────────────────────────────
  const [username, setUsername]     = useState("");
  const [fullName, setFullName]     = useState("");
  const [infoAlert, setInfoAlert]   = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // ── Password form ──────────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword]   = useState("");
  const [newPassword, setNewPassword]           = useState("");
  const [confirmPassword, setConfirmPassword]   = useState("");
  const [pwAlert, setPwAlert]                   = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Populate form once user data arrives
  const initialized = useRef(false);
  useEffect(() => {
    if (user && !initialized.current) {
      setUsername(user.username ?? "");
      setFullName(user.fullName ?? "");
      initialized.current = true;
    }
  }, [user]);

  if (!mounted) return null;

  // ── Unauthenticated ────────────────────────────────────────────────────────
  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <User className="w-7 h-7 text-slate-400" />
        </div>
        <p className={typography.h4}>Sign in to view your profile</p>
        <Link href="/login" className={cn(button.base, button.variants.primary, button.sizes.md)}>
          Sign in
        </Link>
      </div>
    );
  }

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function handleInfoSave(e: React.FormEvent) {
    e.preventDefault();
    setInfoAlert(null);
    if (username.trim().length < 3) {
      setInfoAlert({ type: "error", msg: "Username must be at least 3 characters." });
      return;
    }
    try {
      const updated = await updateProfile({
        username: username.trim(),
        fullName: fullName.trim() || undefined,
      }).unwrap();
      dispatch(updateUser({ username: updated.username, fullName: updated.fullName }));
      setInfoAlert({ type: "success", msg: "Profile updated successfully." });
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        "Failed to update profile. Please try again.";
      setInfoAlert({ type: "error", msg });
    }
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    setPwAlert(null);
    if (!currentPassword) {
      setPwAlert({ type: "error", msg: "Please enter your current password." });
      return;
    }
    if (newPassword.length < 6) {
      setPwAlert({ type: "error", msg: "New password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwAlert({ type: "error", msg: "New passwords do not match." });
      return;
    }
    if (newPassword === currentPassword) {
      setPwAlert({ type: "error", msg: "New password cannot be the same as your current password." });
      return;
    }
    try {
      await updateProfile({ currentPassword, newPassword }).unwrap();
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPwAlert({ type: "success", msg: "Password changed successfully." });
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        "Failed to change password. Check your current password and try again.";
      setPwAlert({ type: "error", msg });
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">

      {/* Avatar + name header */}
      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-slate-200 dark:ring-slate-700"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center ring-2 ring-slate-200 dark:ring-slate-700">
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {getInitials(user.fullName, user.username)}
              </span>
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center">
            <Camera className="w-3 h-3 text-slate-400" />
          </div>
        </div>
        <div>
          <h1 className={typography.h3}>{user.fullName ?? user.username}</h1>
          <p className={cn("text-sm mt-0.5", colors.text.muted)}>@{user.username}</p>
        </div>
      </div>

      <div className={divider} />

      {/* Stats / Auctions Won accordion */}
      <StatsBar auctions={myAuctions} bids={myBids} />

      <div className={divider} />

      {/* Account info */}
      <Section
        icon={<User className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />}
        title="Account Information"
        description="Update your display name and username"
      >
        <form onSubmit={handleInfoSave} className="space-y-4">

          {/* Email — read only */}
          <div>
            <label className={inputTheme.label}>
              <Mail className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" />
              Email
            </label>
            <input
              type="email"
              value={user.email}
              readOnly
              className={cn(
                inputTheme.base, inputTheme.sizes.md, inputTheme.states.default,
                "opacity-60 cursor-not-allowed select-none",
              )}
            />
            <p className={inputTheme.hint}>Email cannot be changed.</p>
          </div>

          {/* Username */}
          <div>
            <label className={inputTheme.label}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength={3}
              maxLength={50}
              required
              className={cn(inputTheme.base, inputTheme.sizes.md, inputTheme.states.default)}
              placeholder="your_username"
            />
          </div>

          {/* Full name */}
          <div>
            <label className={inputTheme.label}>Full Name <span className={cn("font-normal", colors.text.muted)}>(optional)</span></label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={cn(inputTheme.base, inputTheme.sizes.md, inputTheme.states.default)}
              placeholder="Jane Doe"
            />
          </div>

          {infoAlert && <Alert type={infoAlert.type} message={infoAlert.msg} />}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSaving}
              className={cn(button.base, button.variants.primary, button.sizes.md)}
            >
              {isSaving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </Section>

      {/* Change password */}
      <Section
        icon={<Lock className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />}
        title="Change Password"
        description="Must provide current password to set a new one"
      >
        <form onSubmit={handlePasswordSave} className="space-y-4">

          <div>
            <label className={inputTheme.label}>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              className={cn(inputTheme.base, inputTheme.sizes.md, inputTheme.states.default)}
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className={inputTheme.label}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
              autoComplete="new-password"
              className={cn(inputTheme.base, inputTheme.sizes.md, inputTheme.states.default)}
              placeholder="••••••••"
            />
            <p className={inputTheme.hint}>Minimum 6 characters.</p>
          </div>

          <div>
            <label className={inputTheme.label}>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className={cn(inputTheme.base, inputTheme.sizes.md, inputTheme.states.default)}
              placeholder="••••••••"
            />
          </div>

          {pwAlert && <Alert type={pwAlert.type} message={pwAlert.msg} />}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSaving}
              className={cn(button.base, button.variants.primary, button.sizes.md)}
            >
              {isSaving ? "Saving…" : "Change password"}
            </button>
          </div>
        </form>
      </Section>
    </div>
  );
}
