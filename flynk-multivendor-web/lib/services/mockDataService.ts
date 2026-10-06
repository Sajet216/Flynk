import categoriesData from "@/lib/mock-data/categories.json";
import storesData from "@/lib/mock-data/stores.json";
import productsData from "@/lib/mock-data/products.json";
import transactionsData from "@/lib/mock-data/transactions.json";
import { runApriori, AssociationRule } from "@/lib/algorithms/apriori";

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description: string;
}

export interface Store {
  id: string;
  name: string;
  categoryId: string;
  categorySlug: string;
  description: string;
  locality: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
  deliveryTimeMins: number;
  minOrder: number;
  isOpen: boolean;
  isDigitized: boolean;
  phone: string;
  tags: string[];
  image: string;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  price: number;
  category: string;
  rating?: number;
  description?: string;
  image?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  store: Store;
}

// In-memory additions during runtime/presentation
let runtimeStores: Store[] = [...(storesData as Store[])];
let runtimeProducts: Product[] = [...(productsData as Product[])];

export const mockDataService = {
  getCategories(): Category[] {
    return categoriesData as Category[];
  },

  getCategoryBySlug(slug: string): Category | undefined {
    return (categoriesData as Category[]).find((c) => c.slug === slug);
  },

  getStores(filter?: { categorySlug?: string; locality?: string; query?: string }): Store[] {
    let list = [...runtimeStores];
    if (filter?.categorySlug && filter.categorySlug !== "all") {
      list = list.filter((s) => s.categorySlug === filter.categorySlug);
    }
    if (filter?.locality && filter.locality !== "all") {
      list = list.filter((s) => s.locality.toLowerCase() === filter.locality?.toLowerCase());
    }
    if (filter?.query && filter.query.trim().length > 0) {
      const q = filter.query.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.locality.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  },

  getStoreById(id: string): Store | undefined {
    return runtimeStores.find((s) => s.id === id);
  },

  getProductsByStore(storeId: string): Product[] {
    return runtimeProducts.filter((p) => p.storeId === storeId);
  },

  getProductById(id: string): Product | undefined {
    return runtimeProducts.find((p) => p.id === id);
  },

  getLocalities(): string[] {
    const set = new Set<string>();
    runtimeStores.forEach((s) => set.add(s.locality));
    return Array.from(set).sort();
  },

  getTransactions() {
    return transactionsData.transactions;
  },

  getStoreVisits() {
    return transactionsData.storeVisits;
  },

  // Market basket recommendations for a given product or set of items
  getFrequentlyBoughtTogether(itemNames: string[]): {
    recommendations: { name: string; confidence: number; lift: number }[];
    matchingRules: AssociationRule[];
  } {
    const aprioriResult = runApriori(transactionsData.transactions, 0.15, 0.4);
    const recsMap = new Map<string, { confidence: number; lift: number }>();
    const matchingRules: AssociationRule[] = [];

    aprioriResult.rules.forEach((rule) => {
      // If rule antecedent is in the items
      const matches = rule.antecedent.some((ant) => itemNames.includes(ant));
      if (matches) {
        matchingRules.push(rule);
        rule.consequent.forEach((con) => {
          if (!itemNames.includes(con)) {
            const existing = recsMap.get(con);
            if (!existing || rule.confidence > existing.confidence) {
              recsMap.set(con, {
                confidence: rule.confidence,
                lift: rule.lift,
              });
            }
          }
        });
      }
    });

    const recommendations = Array.from(recsMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 4);

    return { recommendations, matchingRules };
  },

  // Onboard new offline store in Bengaluru (instant digitizing)
  addStore(newStore: Omit<Store, "id" | "isDigitized" | "rating" | "reviewCount"> & { initialProducts?: { name: string; price: number; category: string }[] }): Store {
    const id = `store-${runtimeStores.length + 1}-${Date.now().toString().slice(-4)}`;
    const store: Store = {
      ...newStore,
      id,
      isDigitized: true,
      rating: 4.8,
      reviewCount: 1,
    };
    runtimeStores = [store, ...runtimeStores];

    if (newStore.initialProducts && newStore.initialProducts.length > 0) {
      const prods: Product[] = newStore.initialProducts.map((p, idx) => ({
        id: `p-${id}-${idx + 1}`,
        storeId: id,
        name: p.name,
        price: p.price,
        category: p.category,
      }));
      runtimeProducts = [...runtimeProducts, ...prods];
    }

    return store;
  },
};
