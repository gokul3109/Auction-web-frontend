"use client";

import Link from "next/link";
import { Zap, Github, Twitter, Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/cn";
import { typography, colors, divider } from "@/lib/theme";

export default function Footer() {
  const { isAuthenticated } = useAuth();

  const platformLinks = [
    { label: "Browse Auctions", href: "/" },
    ...(isAuthenticated
      ? [
          { label: "List an Item", href: "/auctions/create" },
          { label: "My Bids", href: "/my-bids" },
          { label: "My Listings", href: "/my-auctions" },
        ]
      : []),
  ];

  const accountLinks = isAuthenticated
    ? [
        { label: "Profile", href: "/profile" },
        { label: "My Listings", href: "/my-auctions" },
        { label: "My Bids", href: "/my-bids" },
      ]
    : [
        { label: "Sign In", href: "/login" },
        { label: "Register", href: "/register" },
      ];

  const linkSections = [
    { title: "Platform", items: platformLinks },
    { title: "Account", items: accountLinks },
  ];

  return (
    <footer className={cn("border-t", colors.border.base, colors.bg.surface)}>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">

          {/* Brand */}
          <div className="sm:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 w-fit group">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className={cn("font-bold text-lg", colors.text.primary)}>
                Auction<span className="text-indigo-600">Web</span>
              </span>
            </Link>
            <p className={cn(typography.bodySm, "max-w-xs")}>
              A real-time auction platform where you can buy and sell unique items with live competitive bidding.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/gokul3109"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {linkSections.map(({ title, items }) => (
            <div key={title} className="space-y-3">
              <h4 className={cn("text-sm font-semibold", colors.text.primary)}>{title}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(typography.bodySm, "hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors")}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className={cn("mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3", divider)}>
          <p className={typography.caption}>
            © {new Date().getFullYear()} AuctionWeb. All rights reserved.
          </p>
          <p className={cn(typography.caption, "flex items-center gap-1")}>
            Built with <Heart className="w-3 h-3 text-red-400 fill-red-400" /> by Gokul
          </p>
        </div>
      </div>
    </footer>
  );
}
