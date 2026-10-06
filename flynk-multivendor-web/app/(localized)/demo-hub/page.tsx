"use client";

import React, { useState, useEffect, useCallback } from "react";

const STORES = [
  {
    id: "store-1",
    name: "MTR Foods – Indiranagar",
    locality: "Indiranagar",
    address: "100ft Road, Indiranagar, Bengaluru",
    items: [
      { name: "Masala Dosa", price: 80, quantity: 2 },
      { name: "Filter Coffee", price: 30, quantity: 2 },
    ],
    total: 220,
  },
  {
    id: "store-2",
    name: "Namdhari's Fresh – Koramangala",
    locality: "Koramangala",
    address: "5th Block, Koramangala, Bengaluru",
    items: [
      { name: "Organic Milk 1L", price: 45, quantity: 2 },
      { name: "Whole Wheat Bread", price: 40, quantity: 1 },
    ],
    total: 130,
  },
  {
    id: "store-3",
    name: "Nilgiris – HSR Layout",
    locality: "HSR Layout",
    address: "Sector 7, HSR Layout, Bengaluru",
    items: [
      { name: "Chocolate Cake Slice", price: 90, quantity: 1 },
      { name: "Cold Coffee", price: 70, quantity: 2 },
    ],
    total: 230,
  },
];

const CUSTOMER_ADDRESSES = [
  "42, 12th Main, HAL 2nd Stage, Indiranagar, Bengaluru",
  "Flat 201, Brigade Towers, Koramangala, Bengaluru",
  "No. 8, 27th Cross, HSR Layout Sector 2, Bengaluru",
];

function nowStr() {
  return new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function DemoHubPage() {
  const [storeKey, setStoreKey] = useState(0);
  const [riderKey, setRiderKey] = useState(0);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState(0);
  const [activityLog, setActivityLog] = useState<
    { time: string; msg: string; type: "order" | "store" | "rider" | "info" }[]
  >([{ time: nowStr(), msg: "Flynk Demo Hub ready – Bengaluru Live Orders", type: "info" }]);
  const [layout, setLayout] = useState<"side" | "stack">("side");

  const addLog = useCallback(
    (msg: string, type: "order" | "store" | "rider" | "info" = "info") => {
      setActivityLog((prev) => [{ time: nowStr(), msg, type }, ...prev].slice(0, 25));
    },
    []
  );

  const placeTestOrder = async () => {
    setIsPlacingOrder(true);
    const store = STORES[selectedStore];
    const address =
      CUSTOMER_ADDRESSES[Math.floor(Math.random() * CUSTOMER_ADDRESSES.length)];
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: store.id,
          storeName: store.name,
          storeLocality: store.locality,
          storeAddress: store.address,
          items: store.items,
          totalAmount: store.total,
          deliveryFee: 25,
          customerAddress: address,
          customerPhone: `+91 ${Math.floor(9000000000 + Math.random() * 999999999)}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLastOrderId(data.order.id);
        addLog(
          `🆕 Order ${data.order.id} placed at ${store.name} (₹${store.total})`,
          "order"
        );
        // Reload both iframes
        setStoreKey((k) => k + 1);
        setRiderKey((k) => k + 1);
      }
    } catch {
      addLog("❌ Failed to place order – check dev server", "info");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Poll for status changes and log them
  useEffect(() => {
    const prev: Record<string, string> = {};
    const poll = async () => {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        if (data.orders) {
          (data.orders as any[]).forEach((o) => {
            if (prev[o.id] && prev[o.id] !== o.status) {
              const emoji =
                o.status === "ACCEPTED"
                  ? "✅"
                  : o.status === "PREPARING"
                  ? "🍳"
                  : o.status === "READY_FOR_PICKUP"
                  ? "📦"
                  : o.status === "PICKED_UP"
                  ? "🚴"
                  : o.status === "DELIVERED"
                  ? "🏁"
                  : "🔄";
              addLog(
                `${emoji} ${o.id} → ${o.status.replace(/_/g, " ")}${
                  o.riderName ? ` (${o.riderName})` : ""
                }`,
                o.status === "PICKED_UP" || o.status === "DELIVERED" ? "rider" : "store"
              );
            }
            prev[o.id] = o.status;
          });
        }
      } catch {}
    };
    const interval = setInterval(poll, 1500);
    return () => clearInterval(interval);
  }, [addLog]);

  const logColor: Record<string, string> = {
    order: "#f59e0b",
    store: "#f97316",
    rider: "#10b981",
    info: "#64748b",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        height: "100vh",
        background: "linear-gradient(135deg, #0a0f1a 0%, #0d1b2a 50%, #0f1a14 100%)",
        color: "#f1f5f9",
        fontFamily:
          "'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* TOP BAR */}
      <div
        style={{
          background: "rgba(15,23,42,0.97)",
          borderBottom: "1px solid rgba(148,163,184,0.12)",
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          flexWrap: "wrap",
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: "linear-gradient(135deg, #75d04b, #10b981)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 17,
              fontWeight: 900,
              color: "#0a0f1a",
              boxShadow: "0 4px 10px rgba(117,208,75,0.35)",
              flexShrink: 0,
            }}
          >
            F
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#f1f5f9" }}>
              Flynk Demo Hub
            </div>
            <div style={{ fontSize: 10, color: "#475569" }}>
              Bengaluru · Single-Laptop Live Demo
            </div>
          </div>
        </div>

        <div
          style={{
            width: 1,
            height: 28,
            background: "rgba(148,163,184,0.15)",
            flexShrink: 0,
          }}
        />

        {/* Store selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Order from:</span>
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(Number(e.target.value))}
            style={{
              background: "rgba(30,41,59,0.95)",
              border: "1px solid rgba(148,163,184,0.2)",
              borderRadius: 8,
              color: "#f97316",
              padding: "5px 10px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              outline: "none",
            }}
          >
            {STORES.map((s, i) => (
              <option key={s.id} value={i} style={{ background: "#1e293b" }}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Place Order */}
        <button
          onClick={placeTestOrder}
          disabled={isPlacingOrder}
          style={{
            background: isPlacingOrder
              ? "rgba(245,158,11,0.25)"
              : "linear-gradient(135deg, #f59e0b, #f97316)",
            border: "none",
            borderRadius: 9,
            color: "#0a0f1a",
            padding: "7px 16px",
            fontSize: 12,
            fontWeight: 800,
            cursor: isPlacingOrder ? "wait" : "pointer",
            boxShadow: "0 4px 12px rgba(245,158,11,0.3)",
            whiteSpace: "nowrap",
          }}
        >
          {isPlacingOrder ? "⏳ Placing..." : "🛒 Place Test Order"}
        </button>

        {/* Layout */}
        <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
          {(["side", "stack"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLayout(l)}
              style={{
                background:
                  layout === l ? "rgba(117,208,75,0.2)" : "rgba(30,41,59,0.7)",
                border: `1px solid ${
                  layout === l ? "rgba(117,208,75,0.4)" : "rgba(148,163,184,0.15)"
                }`,
                borderRadius: 7,
                color: layout === l ? "#75d04b" : "#64748b",
                padding: "5px 11px",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {l === "side" ? "⬜ Side-by-Side" : "☰ Stacked"}
            </button>
          ))}
          <a
            href="/store-portal"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "rgba(249,115,22,0.15)",
              border: "1px solid rgba(249,115,22,0.3)",
              borderRadius: 7,
              color: "#f97316",
              padding: "5px 11px",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            🏬 Store ↗
          </a>
          <a
            href="/rider-portal"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "rgba(16,185,129,0.15)",
              border: "1px solid rgba(16,185,129,0.3)",
              borderRadius: 7,
              color: "#10b981",
              padding: "5px 11px",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            🚴 Rider ↗
          </a>
        </div>
      </div>

      {/* Order placed notice */}
      {lastOrderId && (
        <div
          style={{
            background: "rgba(245,158,11,0.08)",
            borderBottom: "1px solid rgba(245,158,11,0.25)",
            padding: "7px 20px",
            fontSize: 11,
            color: "#fcd34d",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#f59e0b",
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          Last order: <strong style={{ color: "#fb923c" }}>{lastOrderId}</strong> →
          Store Portal: Accept &amp; Start Prep → Mark Ready → Rider Portal: Accept &amp;
          Pick Up → Complete Delivery!
        </div>
      )}

      {/* IFRAME PANELS */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: layout === "side" ? "row" : "column",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        <Panel
          title="🏬 Store Partner Portal"
          subtitle="Merchant dashboard – accept orders, manage kitchen"
          color="#f97316"
          href="/store-portal"
          iframeKey={storeKey}
          layout={layout}
        />
        <div
          style={{
            [layout === "side" ? "width" : "height"]: 2,
            background: "rgba(148,163,184,0.08)",
            flexShrink: 0,
          }}
        />
        <Panel
          title="🚴 Delivery Rider Portal"
          subtitle="Kiran S. – Indiranagar zone · pickup & deliver"
          color="#10b981"
          href="/rider-portal"
          iframeKey={riderKey}
          layout={layout}
        />
      </div>

      {/* ACTIVITY LOG */}
      <div
        style={{
          background: "rgba(3,7,18,0.98)",
          borderTop: "1px solid rgba(148,163,184,0.08)",
          padding: "6px 20px",
          height: 90,
          overflowY: "auto",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: 9,
            color: "#334155",
            fontWeight: 700,
            letterSpacing: "0.1em",
            marginBottom: 3,
            textTransform: "uppercase",
          }}
        >
          Live Activity Log
        </div>
        {activityLog.map((entry, i) => (
          <div
            key={i}
            style={{
              fontSize: 11,
              color: logColor[entry.type],
              fontFamily: "'Courier New', monospace",
              lineHeight: 1.55,
              opacity: Math.max(0.25, 1 - i * 0.07),
            }}
          >
            <span style={{ color: "#1e293b", marginRight: 8 }}>{entry.time}</span>
            {entry.msg}
          </div>
        ))}
      </div>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  color,
  href,
  iframeKey,
  layout,
}: {
  title: string;
  subtitle: string;
  color: string;
  href: string;
  iframeKey: number;
  layout: "side" | "stack";
}) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        minWidth: 0,
        minHeight: 0,
      }}
    >
      <div
        style={{
          padding: "7px 14px",
          background: "rgba(15,23,42,0.9)",
          borderBottom: `1px solid ${color}25`,
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: color,
            boxShadow: `0 0 8px ${color}80`,
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#f1f5f9" }}>{title}</div>
          <div
            style={{
              fontSize: 10,
              color: "#64748b",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {subtitle}
          </div>
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            marginLeft: "auto",
            fontSize: 10,
            color,
            textDecoration: "none",
            background: `${color}18`,
            border: `1px solid ${color}35`,
            borderRadius: 6,
            padding: "3px 8px",
            fontWeight: 700,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          Open Full ↗
        </a>
      </div>
      <iframe
        key={iframeKey}
        src={href}
        style={{ flex: 1, border: "none", width: "100%", minHeight: 0 }}
        title={title}
      />
    </div>
  );
}
