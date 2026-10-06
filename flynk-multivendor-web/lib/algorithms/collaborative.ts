// ============================================================
// COLLABORATIVE FILTERING — Item-Based & User-Based
// ============================================================

export interface UserRating {
  userId: string;
  userName: string;
  storeId: string;
  storeName: string;
  rating: number; // 1 to 5
}

export interface SimilarityResult {
  source: string;
  target: string;
  similarity: number; // 0 to 1 Cosine similarity
}

export interface Recommendation {
  storeId: string;
  storeName: string;
  score: number;
  reason: string;
}

export interface CollaborativeFilteringResult {
  userMatrix: { [userId: string]: { [storeId: string]: number } };
  storeSimilarities: SimilarityResult[];
  userRecommendations: { [userId: string]: Recommendation[] };
  stats: {
    totalUsers: number;
    totalStores: number;
    sparsity: number;
  };
}

// Compute Cosine Similarity between two rating vectors
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function runCollaborativeFiltering(ratings: UserRating[]): CollaborativeFilteringResult {
  const users = Array.from(new Set(ratings.map((r) => r.userId)));
  const stores = Array.from(new Set(ratings.map((r) => r.storeId)));
  const storeNames = new Map<string, string>();
  ratings.forEach((r) => storeNames.set(r.storeId, r.storeName));

  // Build User-Store Matrix
  const userMatrix: { [userId: string]: { [storeId: string]: number } } = {};
  users.forEach((u) => {
    userMatrix[u] = {};
    stores.forEach((s) => {
      userMatrix[u][s] = 0;
    });
  });

  ratings.forEach((r) => {
    if (userMatrix[r.userId]) {
      userMatrix[r.userId][r.storeId] = r.rating;
    }
  });

  // Calculate Item-Item Similarities (Cosine)
  const storeSimilarities: SimilarityResult[] = [];
  for (let i = 0; i < stores.length; i++) {
    for (let j = i + 1; j < stores.length; j++) {
      const storeA = stores[i];
      const storeB = stores[j];
      const vecA = users.map((u) => userMatrix[u][storeA]);
      const vecB = users.map((u) => userMatrix[u][storeB]);
      const sim = cosineSimilarity(vecA, vecB);
      if (sim > 0.05) {
        storeSimilarities.push({
          source: storeNames.get(storeA) || storeA,
          target: storeNames.get(storeB) || storeB,
          similarity: parseFloat(sim.toFixed(3)),
        });
      }
    }
  }

  // Sort by highest similarity
  storeSimilarities.sort((a, b) => b.similarity - a.similarity);

  // Generate User Recommendations
  const userRecommendations: { [userId: string]: Recommendation[] } = {};
  users.forEach((userId) => {
    const unvisited = stores.filter((s) => userMatrix[userId][s] === 0);
    const scored: Recommendation[] = [];

    unvisited.forEach((targetStore) => {
      let score = 0;
      let topMatch = "";
      let highestSim = 0;

      stores
        .filter((s) => userMatrix[userId][s] > 0)
        .forEach((visitedStore) => {
          const vecA = users.map((u) => userMatrix[u][targetStore]);
          const vecB = users.map((u) => userMatrix[u][visitedStore]);
          const sim = cosineSimilarity(vecA, vecB);
          if (sim > highestSim) {
            highestSim = sim;
            topMatch = storeNames.get(visitedStore) || visitedStore;
          }
          score += sim * userMatrix[userId][visitedStore];
        });

      if (score > 0) {
        scored.push({
          storeId: targetStore,
          storeName: storeNames.get(targetStore) || targetStore,
          score: parseFloat((score / 5).toFixed(2)),
          reason: topMatch ? `Because you shopped at ${topMatch}` : "Popular in your locality",
        });
      }
    });

    scored.sort((a, b) => b.score - a.score);
    userRecommendations[userId] = scored.slice(0, 4);
  });

  const totalEntries = users.length * stores.length;
  const nonZero = ratings.length;
  const sparsity = parseFloat(((1 - nonZero / totalEntries) * 100).toFixed(1));

  return {
    userMatrix,
    storeSimilarities: storeSimilarities.slice(0, 15),
    userRecommendations,
    stats: {
      totalUsers: users.length,
      totalStores: stores.length,
      sparsity,
    },
  };
}
