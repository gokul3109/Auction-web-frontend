"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Gavel,
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  Plus,
  LayoutDashboard,
  TrendingUp,
  Zap,
  Heart,
  Bell,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/cn";
import { button, colors, divider } from "@/lib/theme";
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkReadMutation,
  useMarkAllReadMutation,
} from "@/store/api/notificationApi";

// ─── Static data ──────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: "/",            label: "Auctions",    icon: <Gavel          className="w-4 h-4" />, authOnly: false },
  { href: "/my-auctions", label: "My Listings", icon: <LayoutDashboard className="w-4 h-4" />, authOnly: true  },
  { href: "/my-bids",    label: "My Bids",     icon: <TrendingUp     className="w-4 h-4" />, authOnly: true  },
  { href: "/watchlist",  label: "Watchlist",   icon: <Heart          className="w-4 h-4" />, authOnly: true  },
];

// ─── Shared class strings ─────────────────────────────────────────────────────

const NAV_LINK_BASE    = "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[15px] font-medium transition-all duration-150";
const NAV_LINK_ACTIVE  = "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400";
const NAV_LINK_DEFAULT = "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800";

const MOBILE_ITEM_BASE    = "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors";
const MOBILE_ITEM_ACTIVE  = "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400";
const MOBILE_ITEM_DEFAULT = "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);

  const { data: notifications = [] } = useGetNotificationsQuery(undefined, {
    skip: !isAuthenticated,
    pollingInterval: 30000,
  });
  const { data: unreadData } = useGetUnreadCountQuery(undefined, {
    skip: !isAuthenticated,
    pollingInterval: 30000,
  });
  const [markRead] = useMarkReadMutation();
  const [markAllRead] = useMarkAllReadMutation();

  const unreadCount = unreadData?.count ?? 0;

  // Scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile on route change
  useEffect(() => setMobileOpen(false), [pathname]);

  const getInitials = () => {
    if (user?.fullName) return user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    if (user?.username) return user.username.slice(0, 2).toUpperCase();
    return "??";
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm border-b border-slate-200/60 dark:border-slate-700/60"
            : "bg-transparent",
        )}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/30 group-hover:shadow-indigo-500/50 group-hover:scale-105 transition-all duration-200">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-slate-900 dark:text-white font-bold text-xl tracking-tight">
                Auction<span className="text-indigo-600">Web</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                if (link.authOnly && !isAuthenticated) return null;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(NAV_LINK_BASE, isActive ? NAV_LINK_ACTIVE : NAV_LINK_DEFAULT)}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  {/* Create button */}
                  <Link
                    href="/auctions/create"
                    className={cn("hidden sm:flex", button.base, button.variants.primary, button.sizes.md)}
                  >
                    <Plus className="w-4 h-4" />
                    List Item
                  </Link>

                  {/* Notification bell */}
                  <div className="relative" ref={bellRef}>
                    <button
                      onClick={() => setBellOpen(!bellOpen)}
                      className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      aria-label="Notifications"
                    >
                      <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </button>

                    {bellOpen && (
                      <div className={cn(
                        "absolute right-0 mt-2 w-80 rounded-2xl overflow-hidden",
                        colors.bg.surface,
                        "shadow-xl shadow-slate-900/10 dark:shadow-black/30",
                        "border", colors.border.base,
                      )}>
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</span>
                          {unreadCount > 0 && (
                            <button
                              onClick={() => markAllRead()}
                              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>

                        {/* List */}
                        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                          {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
                              No notifications yet
                            </div>
                          ) : (
                            notifications.slice(0, 10).map((n) => (
                              <button
                                key={n.id}
                                onClick={() => {
                                  if (!n.read) markRead(n.id);
                                  setBellOpen(false);
                                  if (n.auctionId) router.push(`/auctions/${n.auctionId}`);
                                }}
                                className={cn(
                                  "w-full text-left px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60",
                                  !n.read && "bg-indigo-50/50 dark:bg-indigo-950/30",
                                )}
                              >
                                <div className="flex items-start gap-2">
                                  {!n.read && <span className="mt-1.5 w-2 h-2 rounded-full bg-indigo-500 shrink-0" />}
                                  <div className={cn(!n.read ? "" : "pl-4")}>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{n.title}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                                    <p className="text-[11px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                                  </div>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Avatar dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                    >
                      {/* Avatar */}
                      {user?.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.username}
                          className="w-8 h-8 rounded-lg object-cover ring-2 ring-indigo-500/30"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                          {getInitials()}
                        </div>
                      )}
                      <ChevronDown
                        className={cn("w-3.5 h-3.5 text-slate-400 transition-transform duration-200", dropdownOpen && "rotate-180")}
                      />
                    </button>

                    {/* Dropdown */}
                    {dropdownOpen && (
                      <div className={cn(
                        "absolute right-0 mt-2 w-56 rounded-2xl overflow-hidden",
                        colors.bg.surface,
                        "shadow-xl shadow-slate-900/10 dark:shadow-black/30",
                        "border", colors.border.base,
                      )}>
                        {/* User info */}
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {user?.fullName || user?.username}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {user?.email}
                          </p>
                        </div>

                        {/* Links */}
                        <div className="py-1.5">
                          <DropdownLink href="/profile" icon={<User className="w-4 h-4" />} onClick={() => setDropdownOpen(false)}>
                            Profile
                          </DropdownLink>
                          <DropdownLink href="/my-auctions" icon={<LayoutDashboard className="w-4 h-4" />} onClick={() => setDropdownOpen(false)}>
                            My Listings
                          </DropdownLink>
                          <DropdownLink href="/my-bids" icon={<TrendingUp className="w-4 h-4" />} onClick={() => setDropdownOpen(false)}>
                            My Bids
                          </DropdownLink>
                          <DropdownLink href="/watchlist" icon={<Heart className="w-4 h-4" />} onClick={() => setDropdownOpen(false)}>
                            Watchlist
                          </DropdownLink>
                          <DropdownLink href="/auctions/create" icon={<Plus className="w-4 h-4" />} onClick={() => setDropdownOpen(false)}>
                            List an Item
                          </DropdownLink>
                        </div>

                        {/* Logout */}
                        <div className="py-1.5 border-t border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => { setDropdownOpen(false); logout(); }}
                            className={cn("w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors", button.variants.dangerGhost)}
                          >
                            <LogOut className="w-4 h-4" />
                            Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    href="/login"
                    className={cn(button.base, button.variants.ghost, button.sizes.md)}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className={cn(button.base, button.variants.primary, button.sizes.md)}
                  >
                    Get started
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
              className={cn("md:hidden p-2 rounded-lg transition-colors", button.variants.ghost)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={cn(
          "fixed inset-0 z-40 md:hidden transition-all duration-300",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />

        {/* Menu panel */}
        <div
          className={cn(
            "absolute top-0 right-0 h-full w-72 shadow-2xl transition-transform duration-300",
            colors.bg.surface,
            mobileOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">
                Auction<span className="text-indigo-600">Web</span>
              </span>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          <div className="p-4 space-y-1">
            {isAuthenticated && user && (
              <div className="flex items-center gap-3 p-3 mb-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.username} className="w-10 h-10 rounded-xl object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                    {getInitials()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.fullName || user.username}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
            )}

            {NAV_LINKS.map((link) => {
              if (link.authOnly && !isAuthenticated) return null;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(MOBILE_ITEM_BASE, isActive ? MOBILE_ITEM_ACTIVE : MOBILE_ITEM_DEFAULT)}
                >
                  {link.icon}
                  {link.label}
                </Link>
              );
            })}

            {isAuthenticated ? (
              <>
                <Link href="/auctions/create" className={cn(MOBILE_ITEM_BASE, MOBILE_ITEM_DEFAULT)}>
                  <Plus className="w-4 h-4" /> List an Item
                </Link>
                <Link href="/profile" className={cn(MOBILE_ITEM_BASE, MOBILE_ITEM_DEFAULT)}>
                  <User className="w-4 h-4" /> Profile
                </Link>
                <Link href="/watchlist" className={cn(MOBILE_ITEM_BASE, MOBILE_ITEM_DEFAULT)}>
                  <Heart className="w-4 h-4" /> Watchlist
                </Link>
                <Link href="/notifications" className={cn(MOBILE_ITEM_BASE, MOBILE_ITEM_DEFAULT)}>
                  <span className="relative">
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </span>
                  Notifications {unreadCount > 0 && `(${unreadCount})`}
                </Link>
                <button
                  onClick={logout}
                  className={cn("w-full", MOBILE_ITEM_BASE, "text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30")}
                >
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </>
            ) : (
              <div className="pt-2 space-y-2">
                <Link href="/login" className={cn(button.base, button.variants.outline, button.sizes.md, "w-full justify-center")}>
                  Sign in
                </Link>
                <Link href="/register" className={cn(button.base, button.variants.primary, button.sizes.md, "w-full justify-center")}>
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Dropdown Link ─────────────────────────────────────────────────────────

interface DropdownLinkProps {
  href: string;
  icon: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
}

function DropdownLink({ href, icon, onClick, children }: DropdownLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 px-4 py-2 text-[15px] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
    >
      <span className="text-slate-400">{icon}</span>
      {children}
    </Link>
  );
}
