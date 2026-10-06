// ============================================================
// FP-GROWTH ALGORITHM — Step-by-Step Implementation
// ============================================================
import { Transaction, FrequentItemset, AssociationRule } from "./apriori";

export interface FPTreeNode {
  item: string | null;
  count: number;
  parent: FPTreeNode | null;
  children: Map<string, FPTreeNode>;
  nodeLink: FPTreeNode | null;
}

export interface FPStep {
  step: number;
  label: string;
  description: string;
  data?: Record<string, unknown>;
}

export interface FPGrowthResult {
  steps: FPStep[];
  frequentItemsets: FrequentItemset[];
  rules: AssociationRule[];
  totalTransactions: number;
  minSupport: number;
  executionTimeMs: number;
}

function createNode(item: string | null, parent: FPTreeNode | null): FPTreeNode {
  return { item, count: 0, parent, children: new Map(), nodeLink: null };
}

export function runFPGrowth(
  transactions: Transaction[],
  minSupportRatio: number = 0.3,
  minConfidence: number = 0.5
): FPGrowthResult {
  const start = performance.now();
  const n = transactions.length;
  const minCount = Math.ceil(minSupportRatio * n);
  const steps: FPStep[] = [];

  // ── Step 1: First scan — count item frequencies ──────────
  const freq: Map<string, number> = new Map();
  transactions.forEach((t) =>
    t.items.forEach((item) => freq.set(item, (freq.get(item) || 0) + 1))
  );

  const freqItems = Array.from(freq.entries())
    .filter(([, c]) => c >= minCount)
    .sort((a, b) => b[1] - a[1]);

  steps.push({
    step: 1,
    label: "First Database Scan — Item Frequency Count",
    description: `Scan all ${n} transactions once to count each item. Keep items with count ≥ ${minCount}. Sort by frequency (descending) to build the header table.`,
    data: {
      headerTable: freqItems.map(([item, count]) => ({
        item,
        count,
        support: (count / n).toFixed(2),
      })),
    },
  });

  const freqItemSet = new Set(freqItems.map(([item]) => item));
  const itemOrder = new Map(freqItems.map(([item], i) => [item, i]));

  // ── Step 2: Filter and sort transactions ─────────────────
  const filteredTxns = transactions.map((t) => ({
    ...t,
    items: t.items
      .filter((item) => freqItemSet.has(item))
      .sort(
        (a, b) => (itemOrder.get(a) ?? 999) - (itemOrder.get(b) ?? 999)
      ),
  }));

  steps.push({
    step: 2,
    label: "Filter & Sort Transactions",
    description:
      "Remove infrequent items from each transaction. Sort remaining items by frequency (most frequent first). This ordering ensures maximum prefix sharing in the FP-Tree.",
    data: {
      sample: filteredTxns.slice(0, 5).map((t) => ({
        id: t.id,
        original: transactions.find((o) => o.id === t.id)?.items,
        filtered: t.items,
      })),
    },
  });

  // ── Step 3: Build FP-Tree ─────────────────────────────────
  const root: FPTreeNode = createNode(null, null);
  const headerTable: Map<string, FPTreeNode[]> = new Map();

  filteredTxns.forEach((t) => {
    let current = root;
    t.items.forEach((item) => {
      let child = current.children.get(item);
      if (!child) {
        child = createNode(item, current);
        current.children.set(item, child);
        if (!headerTable.has(item)) headerTable.set(item, []);
        headerTable.get(item)!.push(child);
      }
      child.count++;
      current = child;
    });
  });

  // Count tree nodes for visualization
  let nodeCount = 0;
  const countNodes = (node: FPTreeNode) => {
    nodeCount++;
    node.children.forEach(countNodes);
  };
  countNodes(root);

  steps.push({
    step: 3,
    label: "Build FP-Tree (Second Scan)",
    description: `Insert filtered transactions into the FP-Tree. Shared prefixes increment existing nodes (no new node created). Only one more database scan needed! Tree has ${nodeCount} nodes — much more compact than a flat candidate list.`,
    data: {
      treeStats: {
        totalNodes: nodeCount,
        headerEntries: headerTable.size,
        rootChildren: Array.from(root.children.entries()).map(([item, node]) => ({
          item,
          count: node.count,
        })),
      },
    },
  });

  // ── Step 4: Mine conditional pattern bases ────────────────
  const allFrequent: FrequentItemset[] = [];
  const conditionalBases: Record<string, { pattern: string[]; count: number }[]> = {};

  // Mine from each frequent item (bottom-up)
  freqItems
    .slice()
    .reverse()
    .forEach(([item]) => {
      const nodes = headerTable.get(item) || [];
      const patterns: { pattern: string[]; count: number }[] = [];

      nodes.forEach((node) => {
        const path: string[] = [];
        let cur = node.parent;
        while (cur && cur.item !== null) {
          path.unshift(cur.item);
          cur = cur.parent;
        }
        if (path.length > 0) {
          patterns.push({ pattern: path, count: node.count });
        }
      });

      conditionalBases[item] = patterns;

      // Mine frequent itemsets from conditional pattern base
      const condFreq: Map<string, number> = new Map();
      patterns.forEach(({ pattern, count }) => {
        pattern.forEach((i) => condFreq.set(i, (condFreq.get(i) || 0) + count));
      });

      const totalCount = nodes.reduce((s, nd) => s + nd.count, 0);
      allFrequent.push({ items: [item], support: totalCount / n, count: totalCount });

      condFreq.forEach((cnt, i) => {
        if (cnt >= minCount) {
          allFrequent.push({
            items: [i, item].sort(),
            support: cnt / n,
            count: cnt,
          });
        }
      });
    });

  steps.push({
    step: 4,
    label: "Mine Conditional Pattern Bases",
    description:
      "For each frequent item (bottom-up), extract conditional pattern base — all prefix paths leading to that item in the FP-Tree. Build a conditional FP-Tree from each base and recursively mine it.",
    data: {
      sample: Object.entries(conditionalBases)
        .slice(0, 4)
        .map(([item, patterns]) => ({ item, conditionalPatterns: patterns.slice(0, 3) })),
    },
  });

  // Deduplicate
  const seen = new Set<string>();
  const dedupedFrequent = allFrequent.filter((f) => {
    const key = [...f.items].sort().join(",");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // ── Step 5: Generate rules ────────────────────────────────
  const rules: AssociationRule[] = [];
  dedupedFrequent
    .filter((f) => f.items.length >= 2)
    .forEach(({ items, support, count }) => {
      [[0, 1], [1, 0]].forEach(([ai, ci]) => {
        const ant = [items[ai]];
        const con = [items[ci]];
        const antCount = allFrequent.find(
          (f) => f.items.length === 1 && f.items[0] === ant[0]
        )?.count || 1;
        const confidence = count / antCount;
        if (confidence >= minConfidence) {
          const conSupport =
            allFrequent.find((f) => f.items.length === 1 && f.items[0] === con[0])
              ?.support || 0.01;
          const lift = confidence / conSupport;
          rules.push({ antecedent: ant, consequent: con, support, confidence, lift });
        }
      });
    });

  steps.push({
    step: 5,
    label: "Generate Association Rules",
    description: `From all ${dedupedFrequent.length} frequent itemsets, generate rules with confidence ≥ ${(minConfidence * 100).toFixed(0)}%. Calculate lift = confidence / expected confidence. Higher lift = stronger non-random association.`,
    data: {
      totalFrequent: dedupedFrequent.length,
      rulesGenerated: rules.length,
    },
  });

  rules.sort((a, b) => b.lift - a.lift);

  return {
    steps,
    frequentItemsets: dedupedFrequent,
    rules: rules.slice(0, 20),
    totalTransactions: n,
    minSupport: minSupportRatio,
    executionTimeMs: performance.now() - start,
  };
}
