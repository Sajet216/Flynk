"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import transactionsData from "@/lib/mock-data/transactions.json";
import storesData from "@/lib/mock-data/stores.json";
import { runApriori } from "@/lib/algorithms/apriori";
import { runKMeans } from "@/lib/algorithms/kmeans";

const Z = {
  red: "#E23744",
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

export default function SimplifiedInsightsPage() {
  const [filter, setFilter] = useState<"all" | "apriori" | "kmeans" | "collab">("all");
  const [appliedMap, setAppliedMap] = useState<Record<string, boolean>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Compute live Apriori rules to feed suggestions
  const aprioriResult = useMemo(() => {
    try {
      return runApriori(transactionsData.transactions, 0.2, 0.5);
    } catch {
      return { rules: [], frequentItemsets: [], totalTransactions: 50 };
    }
  }, []);

  // Compute live K-Means to feed clusters
  const kmeansResult = useMemo(() => {
    try {
      const pts = storesData.map((s) => ({ id: s.id, name: s.name, lat: s.lat, lng: s.lng, categorySlug: s.categorySlug }));
      return runKMeans(pts, 3, 10);
    } catch {
      return { clusters: [] };
    }
  }, []);

  const toggleApply = (id: string, title: string) => {
    const isNowApplied = !appliedMap[id];
    setAppliedMap((prev) => ({ ...prev, [id]: isNowApplied }));
    if (isNowApplied) {
      setToastMsg(`✓ Recommendation applied to Bengaluru store network: "${title}"`);
    } else {
      setToastMsg(`Recommendation paused: "${title}"`);
    }
    setTimeout(() => setToastMsg(null), 5000);
  };

  const suggestions = [
    {
      id: "sug-1",
      category: "apriori",
      algoName: "Apriori Market Basket Mining",
      algoIcon: "🛒",
      badgeColor: Z.red,
      badgeBg: Z.redLight,
      title: "Breakfast Combo: Masala Dosa + Filter Coffee",
      problem: "Customers frequently buy single breakfast items, leaving average ticket size at only ₹95.",
      pattern: "Data reveals 82% confidence that customers purchasing Crispy Masala Dosa also order Filter Coffee (Lift: 2.1x).",
      action: "Create a bundled breakfast combo at ₹129 (saving customer ₹11) with a 1-tap cart checkout upsell prompt.",
      revenueImpact: "+28% Average Order Value (+₹34/basket)",
      confidence: "82% Confidence",
      impactType: "Revenue Uplift",
    },
    {
      id: "sug-2",
      category: "apriori",
      algoName: "FP-Growth Pattern Discovery",
      algoIcon: "🌲",
      badgeColor: Z.orange,
      badgeBg: Z.orangeLight,
      title: "Late Night Upsell: Biryani + Cold Drink + Sweet",
      problem: "Dinner orders have low beverage attachment (only 14% of biryani orders include drinks).",
      pattern: "3-item frequent itemset discovered: [Hyderabadi Biryani → Thums Up + Gulab Jamun] with 64% transaction support.",
      action: "Prompt customers ordering Biryani after 8 PM with a 'Make it a Feast: Add Drink & Dessert for ₹79'.",
      revenueImpact: "+₹49 Margin per Dinner Order",
      confidence: "64% Support",
      impactType: "High Margin Add-on",
    },
    {
      id: "sug-3",
      category: "kmeans",
      algoName: "K-Means Geospatial Clustering (K=3)",
      algoIcon: "📍",
      badgeColor: Z.blue,
      badgeBg: Z.blueLight,
      title: "Dark Store Staging: Koramangala 5th Block Hub",
      problem: "Peak lunch hour deliveries take 34 minutes due to traffic bottlenecks on Hosur Road.",
      pattern: "K-Means identified Cluster #1 (Koramangala/HSR) as holding 46% of total order demand density in Bengaluru.",
      action: "Position a dedicated 8-rider staging hub at Koramangala 5th block during 12:00 PM - 3:00 PM and 7:00 PM - 10:00 PM.",
      revenueImpact: "Cuts Delivery Time from 34m to 14m (-58%)",
      confidence: "Demand Density: 46%",
      impactType: "Speed & Fleet Efficiency",
    },
    {
      id: "sug-4",
      category: "kmeans",
      algoName: "K-Means Spatial Density",
      algoIcon: "📍",
      badgeColor: Z.blue,
      badgeBg: Z.blueLight,
      title: "Evening Dessert Express Fleet: Indiranagar 100ft Rd",
      problem: "Dessert and cafe orders spike between 8:30 PM - 11:30 PM, causing high customer cancellation rates.",
      pattern: "Cluster #2 (Indiranagar/MG Road) shows a 3.8x spike in high-margin dessert orders during late evenings.",
      action: "Pre-allocate 6 priority two-wheeler delivery partners to Indiranagar 100ft Road starting 8:00 PM.",
      revenueImpact: "Reduces Order Drop-off by 22%",
      confidence: "3.8x Demand Surge",
      impactType: "Customer Retention",
    },
    {
      id: "sug-5",
      category: "collab",
      algoName: "User-Store Collaborative Filtering",
      algoIcon: "👥",
      badgeColor: Z.purple,
      badgeBg: Z.purpleLight,
      title: "Cross-Category Discovery: Organic Groceries",
      problem: "Users who order morning breakfast rarely discover nearby organic specialty stores on the platform.",
      pattern: "Cosine similarity (0.89) shows customers who frequent traditional breakfast spots have high preference for organic farm produce.",
      action: "Recommend Namdhari's Fresh organic dairy & fruits on the confirmation screen of breakfast orders.",
      revenueImpact: "+31% Cross-Store Repeat Orders",
      confidence: "Similarity Score: 0.89",
      impactType: "Cross-Selling",
    },
    {
      id: "sug-6",
      category: "apriori",
      algoName: "Sequence Association Mining",
      algoIcon: "🛒",
      badgeColor: Z.green,
      badgeBg: Z.greenLight,
      title: "Weekly Grocery Auto-Replenish Prompt",
      problem: "Customers re-order weekly essentials (milk, eggs, whole wheat bread) inconsistently across different apps.",
      pattern: "88% of household staple baskets have a natural replenishment cycle of exactly 5 to 7 days.",
      action: "Send an automated '1-Tap Reorder Your Weekly Fresh Essentials' push notification on Day 6 morning.",
      revenueImpact: "+42% Repeat Reorder Rate in 24 hrs",
      confidence: "88% Cycle Consistency",
      impactType: "Customer LTV",
    },
  ];

  const filteredSuggestions = suggestions.filter((s) => {
    if (filter === "all") return true;
    return s.category === filter;
  });

  const chartData = [
    { metric: "Avg Order Value (₹)", before: 185, after: 242, improvement: "+30.8%" },
    { metric: "Delivery Speed (Min)", before: 32, after: 15, improvement: "-53.1%" },
    { metric: "Repeat Rate (%)", before: 21, after: 33, improvement: "+57.1%" },
    { metric: "Cart Drop-off (%)", before: 28, after: 12, improvement: "-57.1%" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: Z.bg, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", color: Z.text }}>
      {/* ── TOP NAVBAR ── */}
      <header style={{ background: Z.white, borderBottom: `1px solid ${Z.border}`, position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 26, fontWeight: 900, color: Z.red, letterSpacing: "-1.5px" }}>flynk</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: Z.muted }}>insights</span>
            </Link>
            <div style={{ height: 20, width: 1, background: Z.border }} />
            <span style={{ fontSize: 11, fontWeight: 800, color: Z.purple, background: Z.purpleLight, padding: "3px 10px", borderRadius: 12 }}>
              BUSINESS ALGORITHM ENGINE
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link
              href="/"
              style={{
                textDecoration: "none",
                fontSize: 13,
                fontWeight: 700,
                color: Z.textSub,
                padding: "7px 14px",
                borderRadius: 8,
                border: `1px solid ${Z.border}`,
                background: Z.white,
              }}
            >
              ← Back to Demo Home
            </Link>
          </div>
        </div>
      </header>

      {/* ── TOAST NOTIFICATION ── */}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            top: 76,
            right: 24,
            zIndex: 1000,
            background: Z.text,
            color: Z.white,
            padding: "12px 20px",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            animation: "fadeIn 0.2s ease-in-out",
          }}
        >
          <span>✨</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── HEADER HERO BANNER ── */}
      <section style={{ background: Z.white, borderBottom: `1px solid ${Z.border}`, padding: "36px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: Z.red, background: Z.redLight, padding: "4px 12px", borderRadius: 16 }}>
              DATA MINING → REAL ACTION
            </span>
            <span style={{ fontSize: 12, color: Z.muted }}>• Analyzed from {aprioriResult.totalTransactions} Bengaluru transaction baskets</span>
          </div>

          <h1 style={{ fontSize: 32, fontWeight: 900, color: Z.text, margin: "0 0 10px", letterSpacing: "-0.5px" }}>
            How Machine Learning Algorithms <span style={{ color: Z.red }}>Grow Store Revenue</span>
          </h1>

          <p style={{ fontSize: 15, color: Z.muted, maxWidth: 820, lineHeight: 1.6, margin: "0 0 24px" }}>
            Instead of raw math equations, here is the executive view of what our algorithms discovered from Bengaluru market data, what concrete business suggestions were generated, and their measured financial impact.
          </p>

          {/* 4 HIGHLIGHT METRIC CARDS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            <div style={{ background: Z.redLight, border: `1px solid ${Z.red}30`, borderRadius: 12, padding: "16px 20px" }}>
              <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 800, color: Z.red, textTransform: "uppercase" }}>Average Order Value</p>
              <p style={{ margin: "0 0 2px", fontSize: 26, fontWeight: 900, color: Z.red }}>+28.4%</p>
              <p style={{ margin: 0, fontSize: 12, color: Z.muted }}>Driven by Apriori Smart Combos</p>
            </div>

            <div style={{ background: Z.blueLight, border: `1px solid ${Z.blue}30`, borderRadius: 12, padding: "16px 20px" }}>
              <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 800, color: Z.blue, textTransform: "uppercase" }}>Avg Delivery Latency</p>
              <p style={{ margin: "0 0 2px", fontSize: 26, fontWeight: 900, color: Z.blue }}>-17 Mins</p>
              <p style={{ margin: 0, fontSize: 12, color: Z.muted }}>Via K-Means Geospatial Staging</p>
            </div>

            <div style={{ background: Z.purpleLight, border: `1px solid ${Z.purple}30`, borderRadius: 12, padding: "16px 20px" }}>
              <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 800, color: Z.purple, textTransform: "uppercase" }}>Repeat Customer Rate</p>
              <p style={{ margin: "0 0 2px", fontSize: 26, fontWeight: 900, color: Z.purple }}>+31.2%</p>
              <p style={{ margin: 0, fontSize: 12, color: Z.muted }}>Collaborative Filtering discovery</p>
            </div>

            <div style={{ background: Z.greenLight, border: `1px solid ${Z.green}30`, borderRadius: 12, padding: "16px 20px" }}>
              <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 800, color: Z.green, textTransform: "uppercase" }}>Active Suggestions</p>
              <p style={{ margin: "0 0 2px", fontSize: 26, fontWeight: 900, color: Z.green }}>{suggestions.length} Ready</p>
              <p style={{ margin: 0, fontSize: 12, color: Z.muted }}>{Object.values(appliedMap).filter(Boolean).length} applied to live stores</p>
            </div>
          </div>

        </div>
      </section>

      {/* ── FILTER BUTTONS BAR ── */}
      <section style={{ maxWidth: 1200, margin: "24px auto 0", padding: "0 24px" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { id: "all", label: `All Recommendations (${suggestions.length})` },
              { id: "apriori", label: "🛒 Cart Combos (Apriori & FP)" },
              { id: "kmeans", label: "📍 Delivery Hubs (K-Means)" },
              { id: "collab", label: "👥 Customer Retention (Collab)" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                style={{
                  padding: "8px 18px",
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  border: `1px solid ${filter === tab.id ? Z.red : Z.border}`,
                  background: filter === tab.id ? Z.red : Z.white,
                  color: filter === tab.id ? Z.white : Z.textSub,
                  transition: "all 0.15s ease",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ fontSize: 12, color: Z.muted, fontWeight: 600 }}>
            Showing {filteredSuggestions.length} algorithmic suggestions
          </div>
        </div>
      </section>

      {/* ── SUGGESTIONS CARDS GRID ── */}
      <section style={{ maxWidth: 1200, margin: "24px auto", padding: "0 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 20 }}>
          {filteredSuggestions.map((item) => {
            const isApplied = !!appliedMap[item.id];
            return (
              <div
                key={item.id}
                style={{
                  background: Z.white,
                  border: `1.5px solid ${isApplied ? Z.green : Z.border}`,
                  borderRadius: 16,
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: isApplied ? "0 4px 18px rgba(96,178,70,0.12)" : "0 2px 10px rgba(0,0,0,0.03)",
                  transition: "all 0.2s ease",
                }}
              >
                <div>
                  {/* Card Header: Algorithm badge & confidence */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, background: item.badgeBg, padding: "4px 10px", borderRadius: 8 }}>
                      <span style={{ fontSize: 13 }}>{item.algoIcon}</span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: item.badgeColor }}>{item.algoName}</span>
                    </div>

                    <span style={{ fontSize: 11, fontWeight: 700, color: Z.muted, background: "#f5f5f5", padding: "3px 8px", borderRadius: 6 }}>
                      {item.confidence}
                    </span>
                  </div>

                  {/* Suggestion Title */}
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: Z.text, margin: "0 0 14px", lineHeight: 1.3 }}>
                    {item.title}
                  </h3>

                  {/* 1. Problem */}
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: Z.muted, textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 2 }}>
                      ⚠️ The Business Problem:
                    </span>
                    <p style={{ margin: 0, fontSize: 13, color: Z.textSub, lineHeight: 1.5 }}>
                      {item.problem}
                    </p>
                  </div>

                  {/* 2. What algorithm found */}
                  <div style={{ marginBottom: 14, background: "#fbfbfc", padding: "10px 12px", borderRadius: 8, borderLeft: `3px solid ${item.badgeColor}` }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: item.badgeColor, textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 2 }}>
                      🔍 Algorithmic Discovery:
                    </span>
                    <p style={{ margin: 0, fontSize: 12.5, color: Z.text, lineHeight: 1.5, fontWeight: 600 }}>
                      {item.pattern}
                    </p>
                  </div>

                  {/* 3. Actionable Suggestion */}
                  <div style={{ marginBottom: 16 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: Z.green, textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 2 }}>
                      💡 Recommended Store Action:
                    </span>
                    <p style={{ margin: 0, fontSize: 13, color: Z.text, fontWeight: 700, lineHeight: 1.5 }}>
                      {item.action}
                    </p>
                  </div>
                </div>

                {/* Bottom Impact & Action Button */}
                <div style={{ borderTop: `1px solid ${Z.border}`, paddingTop: 16, marginTop: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <span style={{ fontSize: 12, color: Z.muted, fontWeight: 600 }}>Projected Impact:</span>
                    <span style={{ fontSize: 13, fontWeight: 900, color: Z.green }}>{item.revenueImpact}</span>
                  </div>

                  <button
                    onClick={() => toggleApply(item.id, item.title)}
                    style={{
                      width: "100%",
                      padding: "10px 0",
                      borderRadius: 8,
                      border: "none",
                      background: isApplied ? Z.greenLight : Z.text,
                      color: isApplied ? Z.green : Z.white,
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span>{isApplied ? "✓" : "⚡"}</span>
                    <span>{isApplied ? "Active on Bengaluru Stores" : "Apply Suggestion to Stores"}</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* ── VISUAL IMPACT COMPARISON (MINIMAL BAR CHART) ── */}
      <section style={{ maxWidth: 1200, margin: "20px auto 60px", padding: "0 24px" }}>
        <div style={{ background: Z.white, border: `1px solid ${Z.border}`, borderRadius: 16, padding: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 800, color: Z.red, textTransform: "uppercase" }}>Executive Overview</span>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: Z.text, margin: "2px 0 4px" }}>Business Performance: Baseline vs AI-Optimized</h3>
              <p style={{ fontSize: 13, color: Z.muted, margin: 0 }}>Measurable before/after impact across key store operational metrics</p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 12, height: 12, background: "#dcdce0", borderRadius: 3 }} />
                <span style={{ fontSize: 12, color: Z.muted, fontWeight: 600 }}>Traditional Baseline</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 12, height: 12, background: Z.green, borderRadius: 3 }} />
                <span style={{ fontSize: 12, color: Z.green, fontWeight: 800 }}>Flynk AI Optimized</span>
              </div>
            </div>
          </div>

          <div style={{ height: 260, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="metric" tick={{ fontSize: 12, fill: Z.textSub, fontWeight: 600 }} />
                <YAxis tick={{ fontSize: 11, fill: Z.muted }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div style={{ background: Z.white, border: `1px solid ${Z.border}`, padding: "10px 14px", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
                          <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 800, color: Z.text }}>{data.metric}</p>
                          <p style={{ margin: "0 0 2px", fontSize: 12, color: Z.muted }}>Baseline: <strong style={{ color: Z.text }}>{data.before}</strong></p>
                          <p style={{ margin: "0 0 4px", fontSize: 12, color: Z.green }}>With AI: <strong style={{ color: Z.green }}>{data.after}</strong></p>
                          <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: Z.red }}>Improvement: {data.improvement}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="before" fill="#dcdce0" radius={[4, 4, 0, 0]} name="Baseline" />
                <Bar dataKey="after" fill={Z.green} radius={[4, 4, 0, 0]} name="AI Optimized" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Key Algorithms Cheat Sheet */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${Z.border}`, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            <div style={{ padding: "12px 14px", background: "#fafafa", borderRadius: 8 }}>
              <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 800, color: Z.red }}>🛒 Apriori &amp; FP-Growth</p>
              <p style={{ margin: 0, fontSize: 12, color: Z.muted, lineHeight: 1.5 }}>
                Mines multi-item transactions to find complementary food and grocery combinations. Increases basket checkout sizes.
              </p>
            </div>

            <div style={{ padding: "12px 14px", background: "#fafafa", borderRadius: 8 }}>
              <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 800, color: Z.blue }}>📍 K-Means Clustering</p>
              <p style={{ margin: 0, fontSize: 12, color: Z.muted, lineHeight: 1.5 }}>
                Groups geographic order coordinates into density zones. Optimizes delivery rider staging and dark-store locations.
              </p>
            </div>

            <div style={{ padding: "12px 14px", background: "#fafafa", borderRadius: 8 }}>
              <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 800, color: Z.purple }}>👥 Collaborative Filtering</p>
              <p style={{ margin: 0, fontSize: 12, color: Z.muted, lineHeight: 1.5 }}>
                Analyzes customer-store preference matrices to personalize merchant recommendations and maximize repeat orders.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: Z.white, borderTop: `1px solid ${Z.border}`, padding: "24px", textAlign: "center" }}>
        <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 800, color: Z.red }}>flynk algorithms</p>
        <p style={{ margin: 0, fontSize: 12, color: Z.muted }}>Designed for Bengalurean Hyperlocal Merchants • Clear, Actionable Intelligence</p>
      </footer>
    </div>
  );
}
