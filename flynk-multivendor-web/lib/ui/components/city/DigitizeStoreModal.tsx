"use client";

import React, { useState } from "react";
import { mockDataService, Store } from "@/lib/services/mockDataService";

export default function DigitizeStoreModal({
  isOpen,
  onClose,
  onStoreAdded,
}: {
  isOpen: boolean;
  onClose: () => void;
  onStoreAdded: (store: Store) => void;
}) {
  const categories = mockDataService.getCategories();
  const localities = mockDataService.getLocalities();

  const [name, setName] = useState("");
  const [categorySlug, setCategorySlug] = useState(categories[0]?.slug || "food");
  const [locality, setLocality] = useState(localities[0] || "Indiranagar");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("+91 98450 ");
  const [description, setDescription] = useState("");
  const [sampleProducts, setSampleProducts] = useState("Filter Coffee:40, Ghee Mysore Pak:120, Badam Halwa:150");
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdStore, setCreatedStore] = useState<Store | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const cat = categories.find((c) => c.slug === categorySlug);
    const initialProducts = sampleProducts
      .split(",")
      .map((item) => {
        const parts = item.split(":");
        return {
          name: parts[0]?.trim() || "Item",
          price: parseInt(parts[1]?.trim() || "100", 10),
          category: cat?.name || "General",
        };
      })
      .filter((p) => p.name.length > 0);

    const store = mockDataService.addStore({
      name,
      categorySlug,
      categoryId: cat?.id || "cat-1",
      locality,
      address: address || `Near Metro Station, ${locality}, Bengaluru`,
      lat: 12.9716 + (Math.random() - 0.5) * 0.05,
      lng: 77.5946 + (Math.random() - 0.5) * 0.05,
      deliveryTimeMins: 30,
      minOrder: 100,
      isOpen: true,
      phone,
      description: description || `Authentic local offline merchant in ${locality}, now digitized on Flynk.`,
      tags: [locality, cat?.name || "Retail", "Offline Digitized"],
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=60",
      initialProducts,
    });

    setCreatedStore(store);
    setIsSuccess(true);
    onStoreAdded(store);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
        >
          ✕
        </button>

        {isSuccess ? (
          <div className="text-center py-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-600 mb-3 animate-bounce">
              🎉
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Store Digitized Successfully!
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-orange-600">{createdStore?.name}</span> is now active online on Flynk Bengaluru!
            </p>
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-left">
              <p>📍 Locality: <strong>{createdStore?.locality}</strong></p>
              <p>🏬 Category: <strong>{createdStore?.categorySlug}</strong></p>
              <p>⚡ Status: <strong>Verified Offline Merchant</strong></p>
            </div>
            <button
              onClick={() => {
                setIsSuccess(false);
                setName("");
                onClose();
              }}
              className="mt-6 w-full rounded-xl bg-orange-500 py-2.5 text-sm font-bold text-white shadow-md hover:bg-orange-600"
            >
              Done & View Stores
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <span className="inline-block rounded-full bg-orange-100 px-2.5 py-0.5 text-[11px] font-bold text-orange-700 dark:bg-orange-950/50 dark:text-orange-300">
                City Merchant Onboarding
              </span>
              <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                Digitize an Offline Bengaluru Store
              </h2>
              <p className="text-xs text-gray-500">
                Connect any offline neighborhood shop to Bengaluru consumers in seconds.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Store / Shop Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SLV Corner Tiffin, Shanti Sweets, Koramangala Books"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-xs text-gray-900 focus:border-orange-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Category
                  </label>
                  <select
                    value={categorySlug}
                    onChange={(e) => setCategorySlug(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 p-2 text-xs text-gray-900 focus:border-orange-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Locality (Bengaluru)
                  </label>
                  <select
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 p-2 text-xs text-gray-900 focus:border-orange-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    {localities.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Street Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. 8th Cross, 3rd Block, Jayanagar"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 p-2 text-xs text-gray-900 focus:border-orange-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Initial Catalog Products (Name:Price comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Masala Dosa:80, Filter Coffee:30, Vada:40"
                  value={sampleProducts}
                  onChange={(e) => setSampleProducts(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 p-2 text-xs text-gray-900 focus:border-orange-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-orange-500 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-orange-600 active:scale-95 transition-all"
                >
                  Launch Store Online 🚀
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
