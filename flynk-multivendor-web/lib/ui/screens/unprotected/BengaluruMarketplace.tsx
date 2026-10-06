"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { mockDataService, Store, Category } from "@/lib/services/mockDataService";
import CityNavbar from "@/lib/ui/components/city/CityNavbar";
import CityCartDrawer from "@/lib/ui/components/city/CityCartDrawer";
import DigitizeStoreModal from "@/lib/ui/components/city/DigitizeStoreModal";

export default function BengaluruMarketplace() {
  const categories = useMemo(() => mockDataService.getCategories(), []);
  const localities = useMemo(() => mockDataService.getLocalities(), []);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLocality, setSelectedLocality] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isOnboardOpen, setIsOnboardOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const filteredStores: Store[] = useMemo(() => {
    return mockDataService.getStores({
      categorySlug: selectedCategory,
      locality: selectedLocality,
      query: searchQuery,
    });
  }, [selectedCategory, selectedLocality, searchQuery, refreshTrigger]);

  const handleStoreAdded = (store: Store) => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 pb-20">
      <CityNavbar
        selectedLocality={selectedLocality}
        onSelectLocality={setSelectedLocality}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenOnboard={() => setIsOnboardOpen(true)}
      />
      <CityCartDrawer />
      <DigitizeStoreModal
        isOpen={isOnboardOpen}
        onClose={() => setIsOnboardOpen(false)}
        onStoreAdded={handleStoreAdded}
      />

      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50 via-white to-gray-50 pt-10 pb-12 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 border-b border-gray-100 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-100/70 px-3 py-1 text-xs font-semibold text-orange-800 dark:border-orange-800 dark:bg-orange-950/60 dark:text-orange-300 mb-4">
                <span>🏙️ Bengaluru City Digitization Initiative</span>
                <span>•</span>
                <span className="font-bold">Offline Retail to Online</span>
              </div>

              <h1 className="text-3xl font-black tracking-tight text-gray-900 sm:text-5xl dark:text-white leading-tight">
                Empowering Bengaluru's Neighborhood Stores Online.
              </h1>

              <p className="mt-4 text-base text-gray-600 dark:text-gray-300">
                Discover your favorite local bakeries, Kirana supermarkets, traditional tiffin outlets, boutique fashion, and pharmacies across Indiranagar, Koramangala, Jayanagar, and beyond — with smart hyperlocal delivery.
              </p>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsOnboardOpen(true)}
                  className="rounded-xl bg-orange-500 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-orange-500/25 hover:bg-orange-600 active:scale-95 transition-all"
                >
                  ➕ Digitize Your Offline Store
                </button>
                <Link
                  href="/insights"
                  className="flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-5 py-3 text-xs font-bold text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-300 transition-colors"
                >
                  <span>⚡</span>
                  <span>Explore Algorithm Passes (Apriori & K-Means)</span>
                </Link>
              </div>
            </div>

            {/* Quick Metrics Badge Card */}
            <div className="rounded-3xl border border-gray-200 bg-white/80 p-6 backdrop-blur-md shadow-xl dark:border-gray-800 dark:bg-gray-900/80 max-w-sm w-full">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                Bengaluru Network Pulse
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Offline Stores Digitized</span>
                  <span className="text-base font-black text-orange-600">20+ Local Merchants</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
                  <span className="text-xs text-gray-600 dark:text-gray-400">City Localities Active</span>
                  <span className="text-base font-black text-emerald-600">8 Bengaluru Zones</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Algorithmic Engine</span>
                  <span className="text-base font-black text-purple-600">Apriori + K-Means</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Avg Delivery Fulfillment</span>
                  <span className="text-base font-black text-blue-600">25 - 35 mins</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Locality Filter Chips */}
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 mr-1">Filter by Area:</span>
            <button
              onClick={() => setSelectedLocality("all")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                selectedLocality === "all"
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
              }`}
            >
              All Areas
            </button>
            {localities.map((loc) => (
              <button
                key={loc}
                onClick={() => setSelectedLocality(loc)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  selectedLocality === loc
                    ? "bg-orange-500 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                }`}
              >
                📍 {loc}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Categories Bar */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Explore All Store Categories
            </h2>
            <button
              onClick={() => setSelectedCategory("all")}
              className="text-xs font-semibold text-orange-600 hover:underline"
            >
              Reset Category
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`flex flex-col items-center justify-center rounded-2xl p-3.5 text-center transition-all ${
                selectedCategory === "all"
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/20 scale-102"
                  : "bg-white text-gray-800 hover:bg-gray-100 border border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-800"
              }`}
            >
              <span className="text-2xl mb-1">🏢</span>
              <span className="text-xs font-bold">All Stores</span>
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`flex flex-col items-center justify-center rounded-2xl p-3.5 text-center transition-all ${
                  selectedCategory === cat.slug
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/20 scale-102"
                    : "bg-white text-gray-800 hover:bg-gray-100 border border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-800"
                }`}
              >
                <span className="text-2xl mb-1">{cat.icon}</span>
                <span className="text-xs font-bold line-clamp-1">{cat.name.split("&")[0]}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Stores Grid */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Digitized Stores in Bengaluru
              </h2>
              <p className="text-xs text-gray-500">
                Showing {filteredStores.length} store{filteredStores.length === 1 ? "" : "s"}
                {selectedLocality !== "all" ? ` in ${selectedLocality}` : ""}
                {selectedCategory !== "all" ? ` (${selectedCategory})` : ""}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Sort:</span>
              <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                ⭐ Top Rated First
              </span>
            </div>
          </div>

          {filteredStores.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
              <span className="text-4xl mb-2 block">🔍</span>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                No stores found matching your filters
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Try selecting "All Areas" or digitize this store to add it to the platform!
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedLocality("all");
                  setSearchQuery("");
                }}
                className="mt-4 rounded-xl bg-orange-500 px-4 py-2 text-xs font-semibold text-white"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStores.map((store) => (
                <div
                  key={store.id}
                  className="group flex flex-col justify-between rounded-3xl border border-gray-100 bg-white p-6 shadow-xs hover:shadow-xl hover:border-orange-200 transition-all dark:border-gray-800 dark:bg-gray-900"
                >
                  <div>
                    {/* Top tags */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="rounded-md bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                        {store.categorySlug.toUpperCase()}
                      </span>
                      <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                        <span>✓</span> Verified Local
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors dark:text-white">
                      {store.name}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                      {store.description}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        ⭐ <strong className="text-gray-900 dark:text-white">{store.rating}</strong> ({store.reviewCount})
                      </span>
                      <span>•</span>
                      <span>📍 {store.locality}</span>
                      <span>•</span>
                      <span>⏱️ {store.deliveryTimeMins} mins</span>
                    </div>

                    <p className="mt-2 text-[11px] text-gray-400 line-clamp-1">
                      📌 {store.address}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
                    <span className="text-[11px] font-medium text-emerald-600">
                      🟢 Open for Delivery
                    </span>

                    <Link
                      href={`/stores/${store.id}`}
                      className="rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-orange-600 active:scale-95 transition-all"
                    >
                      Shop Store Catalog →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Associative Mining Callout Section */}
        <section className="mt-16 rounded-3xl border border-purple-200 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="rounded-md bg-purple-500/30 px-2.5 py-1 text-xs font-bold text-purple-200 border border-purple-400/30">
                Academic & Practical Innovation
              </span>
              <h3 className="mt-2 text-2xl font-black">
                Market Basket Mining & Spatial Clustering Built-in
              </h3>
              <p className="mt-2 max-w-xl text-xs text-purple-200/90 leading-relaxed">
                Flynk processes local order baskets using Apriori and FP-Growth association algorithms to optimize complementary stock delivery, and uses K-Means to partition Bengaluru into optimal localized delivery hubs.
              </p>
            </div>

            <Link
              href="/insights"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-xs font-bold text-purple-950 shadow-lg hover:bg-purple-50 active:scale-95 transition-all shrink-0"
            >
              <span>Inspect Step-by-Step Passes</span>
              <span>➔</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
