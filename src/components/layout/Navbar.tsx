"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/cn";
import { button, colors, divider } from "@/lib/theme";

// ─── Static data ──────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: "/",            label: "Auctions",    icon: <Gavel          className="w-4 h-4" />, authOnly: false },
  { href: "/my-auctions", label: "My Listings", icon: <LayoutDashboard className="w-4 h-4" />, authOnly: true  },
  { href: "/my-bids",    label: "My Bids",     icon: <TrendingUp     className="w-4 h-4" />, authOnly: true  },
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
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
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
