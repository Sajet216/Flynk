"use client";
import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import storesData from "@/lib/mock-data/stores.json";
import categoriesData from "@/lib/mock-data/categories.json";
import productsData from "@/lib/mock-data/products.json";

// Zomato Color Palette
const Z = {
  red: "#E23744",
  redHover: "#cb202d",
  redLight: "#fef0f1",
  bg: "#f8f8f8",
  white: "#ffffff",
  text: "#1c1c1c",
  textSub: "#3d4152",
  muted: "#686b78",
  border: "#e9e9eb",
  green: "#60b246",
  greenLight: "#eaf5e7",
  orange: "#f37a20",
  orangeLight: "#fef3eb",
  blue: "#1a73e8",
  blueLight: "#e8f0fe",
  purple: "#7c3aed",
  purpleLight: "#f3e8ff",
};

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  storeId: string;
  storeName: string;
}

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLocality, setSelectedLocality] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Store modal & active ordering
  const [activeStore, setActiveStore] = useState<any | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Checkout state
  const [customerName, setCustomerName] = useState<string>("Rahul Sharma");
  const [customerPhone, setCustomerPhone] = useState<string>("+91 98450 12345");
  const [customerAddress, setCustomerAddress] = useState<string>("Flat 302, 12th Main, Koramangala 4th Block, Bengaluru");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [placedOrder, setPlacedOrder] = useState<any | null>(null);

  // Filter stores
  const filteredStores = useMemo(() => {
    return storesData.filter((s: any) => {
      const matchCat = selectedCategory === "all" || s.categorySlug === selectedCategory;
      const matchLoc = selectedLocality === "all" || s.area?.toLowerCase() === selectedLocality.toLowerCase();
      const matchQuery =
        !searchQuery.trim() ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.tags && s.tags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchCat && matchLoc && matchQuery;
    });
  }, [selectedCategory, selectedLocality, searchQuery]);

  // Localities list
  const localities = useMemo(() => {
    const set = new Set<string>();
    storesData.forEach((s: any) => {
      if (s.area) set.add(s.area);
    });
    return Array.from(set).sort();
  }, []);

  // Products for active store
  const activeProducts = useMemo(() => {
    if (!activeStore) return [];
    const direct = productsData.filter((p: any) => p.storeId === activeStore.id);
    if (direct.length > 0) return direct;
    // Fallback menu for stores with no default mock items
    return [
      { id: `${activeStore.id}-p1`, storeId: activeStore.id, name: `${activeStore.name} Special Combo`, price: 180, category: "Chef Special" },
      { id: `${activeStore.id}-p2`, storeId: activeStore.id, name: "Signature Bengaluru Pack", price: 120, category: "Popular" },
      { id: `${activeStore.id}-p3`, storeId: activeStore.id, name: "Fresh Express Delivery Item", price: 65, category: "Essentials" },
      { id: `${activeStore.id}-p4`, storeId: activeStore.id, name: "Premium Artisan Add-on", price: 45, category: "Add-ons" },
    ];
  }, [activeStore]);

  // Cart operations
  const addToCart = (product: any, store: any) => {
    // If cart has items from another store, reset cart with confirmation
    if (cart.length > 0 && cart[0].storeId !== store.id) {
      if (!confirm(`Your cart has items from "${cart[0].storeName}". Reset cart to order from "${store.name}"?`)) {
        return;
      }
      setCart([{ id: product.id, name: product.name, price: product.price, quantity: 1, storeId: store.id, storeName: store.name }]);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1, storeId: store.id, storeName: store.name }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === productId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const deliveryFee = cartTotal > 200 || cartTotal === 0 ? 0 : 35;
  const grandTotal = cartTotal + deliveryFee;

  // Submit Order to API
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      const orderPayload = {
        storeId: cart[0].storeId,
        storeName: cart[0].storeName,
        customerName: customerName.trim() || "Rahul Sharma",
        customerPhone: customerPhone.trim() || "+91 98450 12345",
        customerAddress: customerAddress.trim() || "Koramangala, Bengaluru",
        items: cart.map((c) => ({
          name: c.name,
          quantity: c.quantity,
          price: c.price,
        })),
        totalAmount: grandTotal,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      if (res.ok) {
        const data = await res.json();
        setPlacedOrder(data.order);
        setCart([]);
        setIsCartOpen(false);
        setActiveStore(null);
      } else {
        alert("Failed to submit order. Please try again.");
      }
    } catch (err) {
      alert("Network error submitting order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: Z.bg, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", color: Z.text }}>
      
      {/* ── TOP ZOMATO-STYLE HEADER ── */}
      <header style={{ background: Z.white, borderBottom: `1px solid ${Z.border}`, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          
          {/* Logo & Locality Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: Z.red, letterSpacing: "-1.5px" }}>flynk</span>
            </Link>

            {/* Locality Selector */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f6f6f7", padding: "6px 12px", borderRadius: 8, border: `1px solid ${Z.border}` }}>
              <span style={{ fontSize: 13 }}>📍</span>
              <select
                value={selectedLocality}
                onChange={(e) => setSelectedLocality(e.target.value)}
                style={{ border: "none", background: "transparent", fontSize: 13, fontWeight: 700, color: Z.textSub, outline: "none", cursor: "pointer" }}
              >
                <option value="all">All Bengaluru Zones</option>
                {localities.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{ flex: 1, maxWidth: 420, display: "flex", alignItems: "center", background: "#f6f6f7", borderRadius: 10, padding: "8px 14px", border: `1px solid ${Z.border}` }}>
            <span style={{ fontSize: 14, color: Z.muted, marginRight: 8 }}>🔍</span>
            <input
              type="text"
              placeholder="Search for MTR, Namdhari's, Dosa, Milk, Biryani..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: "100%", border: "none", background: "transparent", fontSize: 13, outline: "none", color: Z.text }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 12, color: Z.muted }}>✕</button>
            )}
          </div>

          {/* Quick Demo Navigation & Cart Button */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link
              href="/store-portal"
              target="_blank"
              style={{
                textDecoration: "none",
                fontSize: 12,
                fontWeight: 700,
                color: Z.textSub,
                padding: "8px 12px",
                borderRadius: 8,
                border: `1px solid ${Z.border}`,
                background: Z.white,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span>🏪</span>
              <span>Store Portal</span>
            </Link>

            <Link
              href="/rider-portal"
              target="_blank"
              style={{
                textDecoration: "none",
                fontSize: 12,
                fontWeight: 700,
                color: Z.textSub,
                padding: "8px 12px",
                borderRadius: 8,
                border: `1px solid ${Z.border}`,
                background: Z.white,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span>🛵</span>
              <span>Rider App</span>
            </Link>

            <Link
              href="/insights"
              style={{
                textDecoration: "none",
                fontSize: 12,
                fontWeight: 700,
                color: Z.purple,
                padding: "8px 12px",
                borderRadius: 8,
                background: Z.purpleLight,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span>🧠</span>
              <span>AI Insights</span>
            </Link>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              style={{
                background: cart.length > 0 ? Z.red : Z.white,
                color: cart.length > 0 ? Z.white : Z.text,
                border: `1.5px solid ${cart.length > 0 ? Z.red : Z.border}`,
                borderRadius: 8,
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: cart.length > 0 ? "0 2px 8px rgba(226, 55, 68, 0.3)" : "none",
                transition: "all 0.15s ease",
              }}
            >
              <span>🛒</span>
              <span>{cart.length > 0 ? `${cart.reduce((a, b) => a + b.quantity, 0)} Items • ₹${grandTotal}` : "Cart"}</span>
            </button>
          </div>

        </div>
      </header>

      {/* ── CATEGORY PILLS BAR (Zomato UI) ── */}
      <nav style={{ background: Z.white, borderBottom: `1px solid ${Z.border}`, padding: "12px 20px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", gap: 10, overflowX: "auto" }}>
          <button
            onClick={() => setSelectedCategory("all")}
            style={{
              padding: "8px 18px",
              borderRadius: 24,
              border: `1px solid ${selectedCategory === "all" ? Z.red : Z.border}`,
              background: selectedCategory === "all" ? Z.redLight : Z.white,
              color: selectedCategory === "all" ? Z.red : Z.textSub,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            🍽️ All Neighborhood Stores ({storesData.length})
          </button>

          {categoriesData.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              style={{
                padding: "8px 18px",
                borderRadius: 24,
                border: `1px solid ${selectedCategory === cat.slug ? Z.red : Z.border}`,
                background: selectedCategory === cat.slug ? Z.redLight : Z.white,
                color: selectedCategory === cat.slug ? Z.red : Z.textSub,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>{cat.icon || "🏬"}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ── BANNER / PROMO CALLOUT ── */}
      <section style={{ maxWidth: 1200, margin: "20px auto 0", padding: "0 20px" }}>
        <div style={{ background: "linear-gradient(135deg, #fff2f3 0%, #ffffff 100%)", border: `1px solid ${Z.red}25`, borderRadius: 12, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24 }}>⚡</span>
            <div>
              <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 900, color: Z.text }}>
                Real-Time End-to-End Ordering Enabled
              </p>
              <p style={{ margin: 0, fontSize: 12, color: Z.muted }}>
                Choose any store below, add items to cart, and place an order. It will immediately pop up live in the <strong>Store Partner Portal</strong> and <strong>Rider App</strong>!
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: Z.green, background: Z.greenLight, padding: "4px 10px", borderRadius: 12 }}>
              ● In-Memory Dispatch Active
            </span>
          </div>
        </div>
      </section>

      {/* ── STORES GRID ── */}
      <main style={{ maxWidth: 1200, margin: "24px auto 60px", padding: "0 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: Z.text, margin: 0 }}>
            {selectedCategory === "all" ? "Popular Stores in Bengaluru" : `${categoriesData.find((c: any) => c.slug === selectedCategory)?.name || "Stores"}`}
          </h2>
          <span style={{ fontSize: 13, color: Z.muted, fontWeight: 600 }}>
            {filteredStores.length} stores available
          </span>
        </div>

        {filteredStores.length === 0 ? (
          <div style={{ background: Z.white, border: `1px solid ${Z.border}`, borderRadius: 16, padding: "60px 20px", textAlign: "center", color: Z.muted }}>
            <span style={{ fontSize: 40, display: "block", marginBottom: 12 }}>🔍</span>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: Z.text, margin: "0 0 6px" }}>No stores found</h3>
            <p style={{ fontSize: 13, margin: 0 }}>Try clearing your search query or switching to another category.</p>
            <button
              onClick={() => { setSelectedCategory("all"); setSelectedLocality("all"); setSearchQuery(""); }}
              style={{ marginTop: 16, background: Z.red, color: Z.white, border: "none", padding: "8px 18px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13 }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
            {filteredStores.map((store: any) => (
              <div
                key={store.id}
                onClick={() => setActiveStore(store)}
                style={{
                  background: Z.white,
                  border: `1px solid ${Z.border}`,
                  borderRadius: 14,
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                }}
              >
                {/* Store Image & Tags */}
                <div style={{ position: "relative", height: 160, background: "#ececec" }}>
                  <img
                    src={store.image || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500"}
                    alt={store.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e: any) => {
                      e.target.src = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500";
                    }}
                  />
                  <div style={{ position: "absolute", bottom: 10, left: 10, background: "rgba(0,0,0,0.75)", color: Z.white, fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6 }}>
                    ⏱ {store.deliveryTime || "25-35 min"}
                  </div>
                  {store.isOpen && (
                    <div style={{ position: "absolute", top: 10, right: 10, background: Z.green, color: Z.white, fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 10 }}>
                      OPEN
                    </div>
                  )}
                </div>

                {/* Store Body */}
                <div style={{ padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: Z.text, lineHeight: 1.3 }}>
                      {store.name}
                    </h3>
                    <span style={{ fontSize: 12, fontWeight: 800, background: Z.greenLight, color: Z.green, padding: "2px 6px", borderRadius: 6, display: "flex", alignItems: "center", gap: 3 }}>
                      ★ {store.rating || "4.5"}
                    </span>
                  </div>

                  <p style={{ margin: "0 0 6px", fontSize: 12, color: Z.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {store.tags?.join(" • ") || store.area}
                  </p>

                  <p style={{ margin: "0 0 14px", fontSize: 12, color: Z.textSub, height: 32, overflow: "hidden", lineHeight: 1.3 }}>
                    {store.description}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${Z.border}`, paddingTop: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: Z.muted }}>
                      📍 {store.area || "Bengaluru"}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: Z.red }}>
                      View Menu &amp; Order →
                    </span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── STORE MENU MODAL (ORDERING DRAWER) ── */}
      {activeStore && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", justifyContent: "center", alignItems: "center", padding: 20 }}>
          <div style={{ background: Z.white, borderRadius: 16, width: "100%", maxWidth: 650, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            
            {/* Modal Header */}
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${Z.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start", background: "#fcfcfc" }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, color: Z.red, background: Z.redLight, padding: "3px 8px", borderRadius: 4, textTransform: "uppercase" }}>
                  {activeStore.area} • {activeStore.deliveryTime || "25 min"}
                </span>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: Z.text, margin: "6px 0 2px" }}>
                  {activeStore.name}
                </h2>
                <p style={{ margin: 0, fontSize: 12, color: Z.muted }}>{activeStore.description}</p>
              </div>

              <button
                onClick={() => setActiveStore(null)}
                style={{ border: "none", background: "#eee", width: 32, height: 32, borderRadius: 16, fontSize: 14, fontWeight: 800, cursor: "pointer", color: Z.textSub }}
              >
                ✕
              </button>
            </div>

            {/* Apriori Algorithm Feature Badge inside Menu */}
            <div style={{ background: Z.purpleLight, padding: "10px 24px", borderBottom: `1px solid ${Z.purple}30`, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 16 }}>💡</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: Z.purple }}>
                Apriori Smart Upsell active for this store: Pairing suggestions will appear as you add items!
              </span>
            </div>

            {/* Menu Items List */}
            <div style={{ padding: "16px 24px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
              {activeProducts.map((prod: any) => {
                const inCart = cart.find((item) => item.id === prod.id);
                return (
                  <div
                    key={prod.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "14px 16px",
                      border: `1px solid ${Z.border}`,
                      borderRadius: 10,
                      background: inCart ? Z.redLight : "#fafafa",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 800, color: Z.muted, textTransform: "uppercase" }}>{prod.category}</span>
                      <h4 style={{ margin: "2px 0 4px", fontSize: 15, fontWeight: 800, color: Z.text }}>{prod.name}</h4>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color: Z.textSub }}>₹{prod.price}</p>
                    </div>

                    <div>
                      {inCart ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, background: Z.white, border: `1.5px solid ${Z.red}`, borderRadius: 8, padding: "4px 8px" }}>
                          <button
                            onClick={() => updateQuantity(prod.id, -1)}
                            style={{ border: "none", background: "transparent", color: Z.red, fontWeight: 900, fontSize: 16, cursor: "pointer", width: 24 }}
                          >
                            -
                          </button>
                          <span style={{ fontSize: 14, fontWeight: 900, color: Z.text, minWidth: 20, textAlign: "center" }}>{inCart.quantity}</span>
                          <button
                            onClick={() => updateQuantity(prod.id, 1)}
                            style={{ border: "none", background: "transparent", color: Z.red, fontWeight: 900, fontSize: 16, cursor: "pointer", width: 24 }}
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(prod, activeStore)}
                          style={{
                            background: Z.white,
                            border: `1.5px solid ${Z.red}`,
                            color: Z.red,
                            borderRadius: 8,
                            padding: "6px 20px",
                            fontSize: 13,
                            fontWeight: 800,
                            cursor: "pointer",
                            boxShadow: "0 2px 4px rgba(226, 55, 68, 0.1)",
                          }}
                        >
                          + ADD
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer with Cart Summary */}
            <div style={{ padding: "16px 24px", borderTop: `1px solid ${Z.border}`, background: Z.white, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: 12, color: Z.muted }}>Total in Cart:</span>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: Z.text }}>
                  ₹{cartTotal} <span style={{ fontSize: 12, color: Z.muted }}>({cart.reduce((a, b) => a + b.quantity, 0)} items)</span>
                </p>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setActiveStore(null)}
                  style={{ background: "#eee", border: "none", borderRadius: 8, padding: "10px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer", color: Z.textSub }}
                >
                  Close
                </button>
                <button
                  disabled={cart.length === 0}
                  onClick={() => setIsCartOpen(true)}
                  style={{
                    background: cart.length > 0 ? Z.red : "#ccc",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 24px",
                    fontWeight: 800,
                    fontSize: 13,
                    color: Z.white,
                    cursor: cart.length > 0 ? "pointer" : "not-allowed",
                  }}
                >
                  Proceed to Checkout →
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── CART & CHECKOUT DRAWER ── */}
      {isCartOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", justifyContent: "flex-end" }}>
          <div style={{ background: Z.white, width: "100%", maxWidth: 440, height: "100%", display: "flex", flexDirection: "column", boxShadow: "-4px 0 20px rgba(0,0,0,0.15)", overflowY: "auto" }}>
            
            {/* Cart Header */}
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${Z.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>🛒</span>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: Z.text }}>Checkout &amp; Place Order</h3>
              </div>
              <button onClick={() => setIsCartOpen(false)} style={{ border: "none", background: "#eee", width: 28, height: 28, borderRadius: 14, cursor: "pointer", fontWeight: 800 }}>✕</button>
            </div>

            {cart.length === 0 ? (
              <div style={{ padding: "60px 20px", textAlign: "center", color: Z.muted }}>
                <span style={{ fontSize: 44, display: "block", marginBottom: 12 }}>🧺</span>
                <p style={{ fontSize: 16, fontWeight: 800, color: Z.text, margin: "0 0 6px" }}>Your cart is empty</p>
                <p style={{ fontSize: 13, margin: "0 0 20px" }}>Browse any Bengaluru store and add items to place a live order.</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  style={{ background: Z.red, color: Z.white, border: "none", padding: "10px 20px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}
                >
                  Browse Stores
                </button>
              </div>
            ) : (
              <div style={{ padding: "20px 24px", flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Store Name */}
                <div style={{ background: Z.redLight, padding: "10px 14px", borderRadius: 8, border: `1px solid ${Z.red}30` }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: Z.red, textTransform: "uppercase" }}>Ordering From</span>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color: Z.text }}>{cart[0].storeName}</p>
                </div>

                {/* Items List */}
                <div>
                  <h4 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 800, color: Z.muted, textTransform: "uppercase" }}>Order Items</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {cart.map((item) => (
                      <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: Z.text }}>{item.name}</p>
                          <p style={{ margin: 0, fontSize: 12, color: Z.muted }}>₹{item.price} each</p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <button onClick={() => updateQuantity(item.id, -1)} style={{ border: `1px solid ${Z.border}`, background: Z.white, borderRadius: 4, width: 24, height: 24, cursor: "pointer", fontWeight: 800 }}>-</button>
                          <span style={{ fontSize: 13, fontWeight: 900 }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} style={{ border: `1px solid ${Z.border}`, background: Z.white, borderRadius: 4, width: 24, height: 24, cursor: "pointer", fontWeight: 800 }}>+</button>
                          <span style={{ fontSize: 14, fontWeight: 900, color: Z.text, minWidth: 45, textAlign: "right" }}>₹{item.price * item.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Details (Pre-filled for fast presentation) */}
                <div style={{ background: "#fafafa", padding: "16px", borderRadius: 10, border: `1px solid ${Z.border}` }}>
                  <h4 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 800, color: Z.text }}>Delivery Details (Demo)</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: Z.muted, display: "block", marginBottom: 3 }}>Customer Name</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: `1px solid ${Z.border}`, fontSize: 13, outline: "none" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: Z.muted, display: "block", marginBottom: 3 }}>Phone</label>
                      <input
                        type="text"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: `1px solid ${Z.border}`, fontSize: 13, outline: "none" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: Z.muted, display: "block", marginBottom: 3 }}>Delivery Address</label>
                      <input
                        type="text"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: `1px solid ${Z.border}`, fontSize: 13, outline: "none" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bill Breakdown */}
                <div style={{ borderTop: `1px solid ${Z.border}`, paddingTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: Z.textSub }}>
                    <span>Item Subtotal</span>
                    <span>₹{cartTotal}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: Z.textSub }}>
                    <span>Delivery Partner Fee</span>
                    <span>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 900, color: Z.text, marginTop: 6, borderTop: `1px dashed ${Z.border}`, paddingTop: 8 }}>
                    <span>Total Amount</span>
                    <span style={{ color: Z.red }}>₹{grandTotal}</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  style={{
                    background: isSubmitting ? Z.muted : Z.red,
                    color: Z.white,
                    border: "none",
                    borderRadius: 10,
                    padding: "14px 0",
                    fontSize: 15,
                    fontWeight: 900,
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 12px rgba(226, 55, 68, 0.3)",
                    marginTop: 10,
                  }}
                >
                  {isSubmitting ? "Placing Order..." : `Place Order (₹${grandTotal}) ➔`}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── ORDER CONFIRMATION MODAL ── */}
      {placedOrder && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 400, display: "flex", justifyContent: "center", alignItems: "center", padding: 20 }}>
          <div style={{ background: Z.white, borderRadius: 16, width: "100%", maxWidth: 500, padding: "32px 28px", textAlign: "center", boxShadow: "0 24px 48px rgba(0,0,0,0.2)" }}>
            <span style={{ fontSize: 52, display: "block", marginBottom: 12 }}>🎉</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: Z.green, background: Z.greenLight, padding: "4px 12px", borderRadius: 12 }}>
              ORDER DISPATCHED LIVE
            </span>

            <h2 style={{ fontSize: 24, fontWeight: 900, color: Z.text, margin: "14px 0 6px" }}>
              Order #{placedOrder.orderNumber} Placed!
            </h2>

            <p style={{ fontSize: 13, color: Z.muted, lineHeight: 1.5, margin: "0 0 20px" }}>
              Your order from <strong>{placedOrder.storeName}</strong> has been transmitted in real time to the merchant kitchen.
            </p>

            <div style={{ background: "#fafafa", border: `1px solid ${Z.border}`, borderRadius: 12, padding: "14px 18px", textAlign: "left", marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: Z.muted }}>Status</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: Z.orange }}>🟡 Sent to Kitchen</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: Z.muted }}>Customer</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: Z.text }}>{placedOrder.customerName}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: Z.muted }}>Total Paid</span>
                <span style={{ fontSize: 13, fontWeight: 900, color: Z.text }}>₹{placedOrder.totalAmount}</span>
              </div>
            </div>

            {/* Quick Demo CTA Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Link
                href="/store-portal"
                target="_blank"
                style={{
                  display: "block",
                  textDecoration: "none",
                  background: Z.red,
                  color: Z.white,
                  fontWeight: 800,
                  fontSize: 14,
                  padding: "12px 0",
                  borderRadius: 8,
                }}
              >
                🏪 View Order in Store Partner Portal ➔
              </Link>

              <Link
                href="/rider-portal"
                target="_blank"
                style={{
                  display: "block",
                  textDecoration: "none",
                  background: Z.green,
                  color: Z.white,
                  fontWeight: 800,
                  fontSize: 14,
                  padding: "12px 0",
                  borderRadius: 8,
                }}
              >
                🛵 Track Rider in Delivery App ➔
              </Link>

              <button
                onClick={() => setPlacedOrder(null)}
                style={{ background: "#eee", border: "none", borderRadius: 8, padding: "10px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", color: Z.textSub, marginTop: 4 }}
              >
                Back to Home Page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer style={{ background: Z.white, borderTop: `1px solid ${Z.border}`, padding: "30px 20px", textAlign: "center" }}>
        <p style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 900, color: Z.red }}>flynk</p>
        <p style={{ margin: 0, fontSize: 12, color: Z.muted }}>Bengaluru Hyperlocal Commerce &amp; Machine Learning Dispatch Engine</p>
      </footer>

    </div>
  );
}
