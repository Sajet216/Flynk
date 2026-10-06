"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { mockDataService, Store, Product } from "@/lib/services/mockDataService";
import { useLocalCart } from "@/lib/context/LocalCartContext";
import CityNavbar from "@/lib/ui/components/city/CityNavbar";
import CityCartDrawer from "@/lib/ui/components/city/CityCartDrawer";

export default function StoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const storeId = resolvedParams.id;
  const store = mockDataService.getStoreById(storeId);
  const { addItem, items } = useLocalCart();

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Store Not Found</h1>
        <p className="text-sm text-gray-600 mb-4">The requested Bengaluru store could not be located.</p>
        <Link href="/" className="rounded-xl bg-orange-500 px-4 py-2 text-white font-medium">
          ← Back to All Stores
        </Link>
      </div>
    );
  }

  const products = mockDataService.getProductsByStore(store.id);
  const productCategories = Array.from(new Set(products.map((p) => p.category)));
  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

  // Run Apriori recommendation for the top store item
  const topProduct = products[0]?.name ? [products[0].name] : [];
  const basketInsights = mockDataService.getFrequentlyBoughtTogether(topProduct);

  const handleAdd = (product: Product) => {
    addItem(product, store);
    setAddedNotice(`Added "${product.name}" to cart!`);
    setTimeout(() => setAddedNotice(null), 2500);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      <CityNavbar />
      <CityCartDrawer />

      {/* Floating Add Notification */}
      {addedNotice && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xl animate-in slide-in-from-bottom">
          <span>✓</span>
          <span>{addedNotice}</span>
        </div>
      )}

      {/* Store Banner */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-orange-600 dark:text-gray-400"
            >
              ← Back to Bengaluru Stores
            </Link>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="rounded-md bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                  {store.categorySlug.toUpperCase()}
                </span>
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  ✓ Verified Bengaluru Offline Store
                </span>
                <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  📍 {store.locality}
                </span>
              </div>

              <h1 className="text-3xl font-black text-gray-900 dark:text-white sm:text-4xl">
                {store.name}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-300">
                {store.description}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  ⭐ <strong className="text-gray-900 dark:text-white">{store.rating}</strong> ({store.reviewCount} reviews)
                </span>
                <span>•</span>
                <span>⏱️ {store.deliveryTimeMins} mins delivery</span>
                <span>•</span>
                <span>📞 {store.phone}</span>
                <span>•</span>
                <span>📌 {store.address}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-purple-100 bg-purple-50/70 p-4 dark:border-purple-900 dark:bg-purple-950/30 max-w-xs">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">⚡</span>
                <h4 className="text-xs font-bold text-purple-900 dark:text-purple-200">
                  Digitized by Flynk BLR
                </h4>
              </div>
              <p className="text-[11px] text-purple-800 dark:text-purple-300">
                This store's inventory is synced with in-city demand prediction & market basket mining.
              </p>
              <Link
                href="/insights"
                className="mt-2.5 inline-block text-[11px] font-bold text-purple-700 hover:underline dark:text-purple-400"
              >
                Inspect store clustering & rules →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Market Basket Mining Callout: Frequently Bought Together */}
        {basketInsights.recommendations.length > 0 && (
          <div className="mb-10 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5 dark:border-amber-900 dark:from-amber-950/30 dark:to-orange-950/20 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🛒</span>
                <div>
                  <h3 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                    Frequently Bought Together (Apriori Algorithm Insight)
                  </h3>
                  <p className="text-xs text-amber-800 dark:text-amber-400">
                    Based on market basket analysis across Bengaluru order transactions
                  </p>
                </div>
              </div>
              <Link
                href="/insights"
                className="hidden sm:inline-flex items-center rounded-lg bg-amber-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-amber-700"
              >
                View Full Pass Graph ↗
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {basketInsights.recommendations.map((rec) => (
                <div
                  key={rec.name}
                  className="flex items-center justify-between rounded-xl bg-white p-3 shadow-xs border border-amber-100 dark:border-gray-800 dark:bg-gray-900"
                >
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">
                      {rec.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-500">
                      <span className="font-semibold text-emerald-600">
                        Confidence: {(rec.confidence * 100).toFixed(0)}%
                      </span>
                      <span>•</span>
                      <span className="text-orange-600 font-medium">
                        Lift: {rec.lift.toFixed(1)}x
                      </span>
                    </div>
                  </div>
                  <span className="rounded-md bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                    Combo Pair
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Filter Tabs */}
        {productCategories.length > 1 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory("all")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                activeCategory === "all"
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
              }`}
            >
              All Items ({products.length})
            </button>
            {productCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  activeCategory === cat
                    ? "bg-orange-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Product Catalog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const inCart = items.find((i) => i.product.id === product.id);

            return (
              <div
                key={product.id}
                className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-xs hover:shadow-md transition-shadow dark:border-gray-800 dark:bg-gray-900"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                      {product.category}
                    </span>
                    <span className="text-xs text-emerald-600 font-semibold">
                      In Stock
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
                  <div>
                    <span className="text-lg font-black text-gray-900 dark:text-white">
                      ₹{product.price}
                    </span>
                    <span className="text-[10px] text-gray-400 block">
                      Local store price
                    </span>
                  </div>

                  <button
                    onClick={() => handleAdd(product)}
                    className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-orange-600 active:scale-95 transition-all"
                  >
                    <span>+</span>
                    <span>{inCart ? `Add More (${inCart.quantity})` : "Add to Basket"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
