// ============================================================
// APRIORI ALGORITHM — Full Step-by-Step Implementation
// ============================================================

export interface Transaction {
  id: string;
  items: string[];
}

export interface FrequentItemset {
  items: string[];
  support: number;
  count: number;
}

export interface AssociationRule {
  antecedent: string[];
  consequent: string[];
  support: number;
  confidence: number;
  lift: number;
}

export interface AprioriStep {
  pass: number;
  label: string;
  candidates: { itemset: string[]; count: number; support: number; pruned: boolean }[];
  frequentItemsets: FrequentItemset[];
  description: string;
}

export interface AprioriResult {
  steps: AprioriStep[];
  frequentItemsets: FrequentItemset[];
  rules: AssociationRule[];
  totalTransactions: number;
  minSupport: number;
  minConfidence: number;
  executionTimeMs: number;
}

// Generate all subsets of an array
function getSubsets<T>(arr: T[]): T[][] {
  const result: T[][] = [];
  const total = Math.pow(2, arr.length);
  for (let i = 1; i < total; i++) {
    const subset: T[] = [];
    for (let j = 0; j < arr.length; j++) {
      if (i & (1 << j)) subset.push(arr[j]);
    }
    result.push(subset);
  }
  return result;
}

// Count occurrences of an itemset across all transactions
function countItemset(itemset: string[], transactions: Transaction[]): number {
  return transactions.filter((t) =>
    itemset.every((item) => t.items.includes(item))
  ).length;
}

// Generate candidate itemsets of size k from frequent itemsets of size k-1
function generateCandidates(prev: FrequentItemset[], k: number): string[][] {
  const candidates: string[][] = [];
  for (let i = 0; i < prev.length; i++) {
    for (let j = i + 1; j < prev.length; j++) {
      const a = [...prev[i].items].sort();
      const b = [...prev[j].items].sort();
      // Join if first k-2 items are identical
      if (k === 2 || a.slice(0, k - 2).join(",") === b.slice(0, k - 2).join(",")) {
        const combined = Array.from(new Set([...a, ...b])).sort();
        if (combined.length === k) {
          const key = combined.join(",");
          if (!candidates.some((c) => c.join(",") === key)) {
            candidates.push(combined);
          }
        }
      }
    }
  }
  return candidates;
}

export function runApriori(
  transactions: Transaction[],
  minSupportRatio: number = 0.3,
  minConfidence: number = 0.5
): AprioriResult {
  const start = performance.now();
  const n = transactions.length;
  const minCount = Math.ceil(minSupportRatio * n);
  const steps: AprioriStep[] = [];
  const allFrequent: FrequentItemset[] = [];

  // ── Pass 1: Single items ──────────────────────────────────
  const itemCounts = new Map<string, number>();
  transactions.forEach((t) =>
    t.items.forEach((item) => itemCounts.set(item, (itemCounts.get(item) || 0) + 1))
  );

  const pass1Candidates = Array.from(itemCounts.entries()).map(([item, count]) => ({
    itemset: [item],
    count,
    support: count / n,
    pruned: count < minCount,
  }));

  const freq1: FrequentItemset[] = pass1Candidates
    .filter((c) => !c.pruned)
    .map((c) => ({ items: c.itemset, support: c.support, count: c.count }));

  steps.push({
    pass: 1,
    label: "Pass 1 — Generate 1-Itemsets",
    candidates: pass1Candidates,
    frequentItemsets: freq1,
    description: `Scan all ${n} transactions. Count each individual item. Keep items with count ≥ ${minCount} (support ≥ ${(minSupportRatio * 100).toFixed(0)}%). Found ${freq1.length} frequent 1-itemsets.`,
  });
  allFrequent.push(...freq1);

  // ── Passes 2, 3, ... until no more frequent sets ─────────
  let prevFrequent = freq1;
  let k = 2;

  while (prevFrequent.length >= 2 && k <= 4) {
    const rawCandidates = generateCandidates(prevFrequent, k);
    const candidateDetails = rawCandidates.map((itemset) => {
      const count = countItemset(itemset, transactions);
      return {
        itemset,
        count,
        support: count / n,
        pruned: count < minCount,
      };
    });

    const freqK: FrequentItemset[] = candidateDetails
      .filter((c) => !c.pruned)
      .map((c) => ({ items: c.itemset, support: c.support, count: c.count }));

    steps.push({
      pass: k,
      label: `Pass ${k} — Generate ${k}-Itemsets`,
      candidates: candidateDetails,
      frequentItemsets: freqK,
      description: `Join frequent ${k - 1}-itemsets to generate ${candidateDetails.length} candidate ${k}-itemsets. Prune those below minimum support. Found ${freqK.length} frequent ${k}-itemsets.`,
    });

    allFrequent.push(...freqK);
    prevFrequent = freqK;
    k++;
  }

  // ── Generate Association Rules ────────────────────────────
  const rules: AssociationRule[] = [];

  for (const { items, support, count } of allFrequent) {
    if (items.length < 2) continue;
    const subsets = getSubsets(items).filter(
      (s) => s.length > 0 && s.length < items.length
    );
    for (const antecedent of subsets) {
      const consequent = items.filter((x) => !antecedent.includes(x));
      if (consequent.length === 0) continue;

      const antCount = countItemset(antecedent, transactions);
      const confidence = antCount === 0 ? 0 : count / antCount;

      if (confidence >= minConfidence) {
        const consSupport = countItemset(consequent, transactions) / n;
        const lift = consSupport === 0 ? 0 : confidence / consSupport;
        rules.push({ antecedent, consequent, support, confidence, lift });
      }
    }
  }

  // Sort by lift descending
  rules.sort((a, b) => b.lift - a.lift);

  return {
    steps,
    frequentItemsets: allFrequent,
    rules: rules.slice(0, 20),
    totalTransactions: n,
    minSupport: minSupportRatio,
    minConfidence,
    executionTimeMs: performance.now() - start,
  };
}
