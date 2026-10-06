"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocalCart } from "@/lib/context/LocalCartContext";

export default function CityNavbar({
  selectedLocality = "all",
  onSelectLocality,
  searchQuery = "",
  onSearchChange,
  onOpenOnboard,
}: {
  selectedLocality?: string;
  onSelectLocality?: (loc: string) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onOpenOnboard?: () => void;
}) {
  const pathname = usePathname();
  const { totalCount, setCheckoutModalOpen } = useLocalCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const localities = [
    "all",
    "Indiranagar",
    "Koramangala",
    "Jayanagar",
    "Malleshwaram",
    "Whitefield",
    "HSR Layout",
    "MG Road",
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-md shadow-xs dark:border-gray-800 dark:bg-gray-900/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand & City */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-xl font-black text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              F
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Flynk
                </span>
                <span className="rounded-md bg-orange-100 px-1.5 py-0.5 text-[10px] font-semibold text-orange-700 dark:bg-orange-950/60 dark:text-orange-300">
                  Bengaluru 🇮🇳
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                City Offline Stores Digitized
              </p>
            </div>
          </Link>

          {/* Locality Dropdown if onSelectLocality available */}
          {onSelectLocality && (
            <div className="hidden lg:flex items-center gap-1.5 ml-4 rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
              <span className="text-gray-400">📍 Area:</span>
              <select
                value={selectedLocality}
                onChange={(e) => onSelectLocality(e.target.value)}
                className="bg-transparent font-medium text-gray-800 dark:text-gray-100 focus:outline-none cursor-pointer"
              >
                <option value="all">All Bengaluru Localities</option>
                {localities.filter((l) => l !== "all").map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Search bar if onSearchChange provided */}
        {onSearchChange && (
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search local stores, dosas, groceries, books..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full rounded-full border border-gray-200 bg-gray-50/80 px-4 py-2 pl-10 text-sm text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
              />
              <span className="absolute left-3.5 top-2.5 text-gray-400 text-sm">
                🔍
              </span>
            </div>
          </div>
        )}

        {/* Navigation & Actions */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/insights"
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-all ${
              pathname === "/insights"
                ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                : "bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
            }`}
          >
            <span>⚡</span>
            <span>Data Mining & Algorithms</span>
            <span className="ml-1 inline-flex items-center rounded-full bg-purple-200 px-1.5 py-0.2 text-[9px] font-bold text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              Apriori
            </span>
          </Link>

          <Link
            href="/store-portal"
            target="_blank"
            className="hidden xl:inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          >
            <span>🏬 Store (Phone 1)</span>
          </Link>

          <Link
            href="/rider-portal"
            target="_blank"
            className="hidden xl:inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          >
            <span>🚴 Rider (Phone 2)</span>
          </Link>

          {onOpenOnboard && (
            <button
              onClick={onOpenOnboard}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors"
            >
              <span>+</span>
              <span>Digitize Store</span>
            </button>
          )}

          {/* Cart Icon / Drawer opener */}
          <button
            onClick={() => setCheckoutModalOpen(true)}
            className="relative flex items-center gap-1.5 rounded-full bg-orange-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-orange-600 active:scale-95 transition-all"
          >
            <span>🛍️</span>
            <span>Cart</span>
            {totalCount > 0 && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-black text-orange-600">
                {totalCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
