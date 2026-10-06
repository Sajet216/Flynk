// ============================================================
// K-MEANS CLUSTERING — Step-by-Step Implementation
// ============================================================

export interface StorePoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  categorySlug: string;
}

export interface Centroid {
  lat: number;
  lng: number;
}

export interface Cluster {
  id: number;
  centroid: Centroid;
  stores: StorePoint[];
  color: string;
  label: string;
}

export interface KMeansStep {
  iteration: number;
  label: string;
  description: string;
  centroids: Centroid[];
  assignments: { storeId: string; clusterId: number; distance: number }[];
  converged: boolean;
}

export interface KMeansResult {
  steps: KMeansStep[];
  clusters: Cluster[];
  finalCentroids: Centroid[];
  iterations: number;
  converged: boolean;
}

const CLUSTER_COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"];
const CLUSTER_LABELS = ["Zone A", "Zone B", "Zone C", "Zone D", "Zone E"];

function euclideanDistance(a: Centroid, b: Centroid): number {
  return Math.sqrt(Math.pow(a.lat - b.lat, 2) + Math.pow(a.lng - b.lng, 2));
}

function computeCentroid(stores: StorePoint[]): Centroid {
  if (stores.length === 0) return { lat: 0, lng: 0 };
  return {
    lat: stores.reduce((s, p) => s + p.lat, 0) / stores.length,
    lng: stores.reduce((s, p) => s + p.lng, 0) / stores.length,
  };
}

function centroidsEqual(a: Centroid[], b: Centroid[], epsilon = 0.0001): boolean {
  return a.every(
    (c, i) =>
      Math.abs(c.lat - b[i].lat) < epsilon && Math.abs(c.lng - b[i].lng) < epsilon
  );
}

export function runKMeans(stores: StorePoint[], k: number = 4): KMeansResult {
  const steps: KMeansStep[] = [];

  // Initialize centroids using k-means++ style (spread out)
  const sortedByLat = [...stores].sort((a, b) => a.lat - b.lat);
  const chunkSize = Math.floor(stores.length / k);
  let centroids: Centroid[] = Array.from({ length: k }, (_, i) => {
    const chunk = sortedByLat.slice(i * chunkSize, (i + 1) * chunkSize);
    return computeCentroid(chunk.length > 0 ? chunk : [stores[i]]);
  });

  let assignments: number[] = new Array(stores.length).fill(0);
  let converged = false;
  let iteration = 0;
  const maxIterations = 10;

  while (!converged && iteration < maxIterations) {
    iteration++;

    // Assign each store to the nearest centroid
    const newAssignments = stores.map((store) => {
      let minDist = Infinity;
      let nearest = 0;
      centroids.forEach((c, i) => {
        const d = euclideanDistance({ lat: store.lat, lng: store.lng }, c);
        if (d < minDist) {
          minDist = d;
          nearest = i;
        }
      });
      return nearest;
    });

    const assignmentDetails = stores.map((store, idx) => ({
      storeId: store.id,
      clusterId: newAssignments[idx],
      distance: euclideanDistance({ lat: store.lat, lng: store.lng }, centroids[newAssignments[idx]]),
    }));

    // Recompute centroids
    const newCentroids = Array.from({ length: k }, (_, ci) => {
      const clusterStores = stores.filter((_, idx) => newAssignments[idx] === ci);
      return computeCentroid(clusterStores.length > 0 ? clusterStores : [stores[ci] || stores[0]]);
    });

    converged = centroidsEqual(centroids, newCentroids);
    assignments = newAssignments;

    steps.push({
      iteration,
      label: `Iteration ${iteration}`,
      description:
        iteration === 1
          ? `Initialize ${k} centroids spread across Bengaluru. Assign each store to nearest centroid using Euclidean distance on lat/lng coordinates.`
          : converged
          ? `Centroids have converged (moved < 0.0001 degrees). K-Means complete after ${iteration} iterations!`
          : `Recompute centroids as mean of assigned stores. Reassign stores to new nearest centroids. Centroids are still moving.`,
      centroids: newCentroids,
      assignments: assignmentDetails,
      converged,
    });

    centroids = newCentroids;
  }

  // Build final clusters
  const clusters: Cluster[] = Array.from({ length: k }, (_, i) => {
    const clusterStores = stores.filter((_, idx) => assignments[idx] === i);
    return {
      id: i,
      centroid: centroids[i],
      stores: clusterStores,
      color: CLUSTER_COLORS[i % CLUSTER_COLORS.length],
      label: CLUSTER_LABELS[i % CLUSTER_LABELS.length],
    };
  });

  // Label clusters by dominant category
  clusters.forEach((cluster) => {
    const catCount: Record<string, number> = {};
    cluster.stores.forEach((s) => {
      catCount[s.categorySlug] = (catCount[s.categorySlug] || 0) + 1;
    });
    const dominant = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0];
    if (dominant) {
      cluster.label = `${dominant[0].charAt(0).toUpperCase() + dominant[0].slice(1)} Zone`;
    }
  });

  return { steps, clusters, finalCentroids: centroids, iterations: iteration, converged };
}
