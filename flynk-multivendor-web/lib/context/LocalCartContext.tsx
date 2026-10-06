"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Product, Store } from "@/lib/services/mockDataService";

export interface CartItem {
  product: Product;
  store: Store;
  quantity: number;
}

interface LocalCartContextType {
  items: CartItem[];
  addItem: (product: Product, store: Store) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalAmount: number;
  totalCount: number;
  checkoutModalOpen: boolean;
  setCheckoutModalOpen: (open: boolean) => void;
}

const LocalCartContext = createContext<LocalCartContextType | undefined>(undefined);

export function LocalCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("flynk_bengaluru_cart");
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Failed to load cart from storage", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("flynk_bengaluru_cart", JSON.stringify(items));
    } catch (e) {
      console.warn("Failed to save cart", e);
    }
  }, [items]);

  const addItem = (product: Product, store: Store) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.product.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx].quantity += 1;
        return next;
      }
      return [...prev, { product, store, quantity: 1 }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <LocalCartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalAmount,
        totalCount,
        checkoutModalOpen,
        setCheckoutModalOpen,
      }}
    >
      {children}
    </LocalCartContext.Provider>
  );
}

export function useLocalCart() {
  const ctx = useContext(LocalCartContext);
  if (!ctx) {
    throw new Error("useLocalCart must be used within LocalCartProvider");
  }
  return ctx;
}
