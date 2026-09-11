interface RgbPoint {
  r: number;
  g: number;
  b: number;
}

function distanceSq(a: RgbPoint, b: RgbPoint): number {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return dr * dr + dg * dg + db * db;
}

function toHex({ r, g, b }: RgbPoint): string {
  const h = (n: number) => Math.round(n).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`.toUpperCase();
}

// Simple seeded PRNG (mulberry32) so results are reproducible across runs
// on the same image, rather than depending on Math.random().
function createRng(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// k-means++ seeding: pick the first centroid uniformly at random, then
// each subsequent centroid with probability proportional to its squared
// distance from the nearest already-chosen centroid. This avoids the
// failure mode of naive seeding (e.g. evenly-spaced sampling) picking two
// centroids from the same dense cluster and leaving another cluster
// unrepresented, which produces visibly wrong/blended results.
function seedCentroids(
  points: RgbPoint[],
  k: number,
  rng: () => number,
): RgbPoint[] {
  const centroids: RgbPoint[] = [points[Math.floor(rng() * points.length)]];

  while (centroids.length < k) {
    const distances = points.map((p) =>
      Math.min(...centroids.map((c) => distanceSq(p, c))),
    );
    const total = distances.reduce((sum, d) => sum + d, 0);

    if (total === 0) {
      centroids.push(points[Math.floor(rng() * points.length)]);
      continue;
    }

    let threshold = rng() * total;
    let chosen = points[points.length - 1];
    for (let i = 0; i < points.length; i++) {
      threshold -= distances[i];
      if (threshold <= 0) {
        chosen = points[i];
        break;
      }
    }
    centroids.push(chosen);
  }

  return centroids.map((c) => ({ ...c }));
}

// K-means clustering over sampled pixel colors, seeded with k-means++ for
// reliable separation between clusters (see seedCentroids for why naive
// seeding can silently produce wrong results).
export function extractDominantColors(
  pixels: Uint8ClampedArray,
  k: number,
  maxIterations = 10,
): { hex: string; percentage: number }[] {
  const points: RgbPoint[] = [];
  for (let i = 0; i < pixels.length; i += 4) {
    const alpha = pixels[i + 3];
    if (alpha < 128) continue; // skip mostly-transparent pixels
    points.push({ r: pixels[i], g: pixels[i + 1], b: pixels[i + 2] });
  }

  if (points.length === 0) return [];
  const clusterCount = Math.min(k, points.length);

  const rng = createRng(0xc0ffee);
  const centroids: RgbPoint[] = seedCentroids(points, clusterCount, rng);

  let assignments = new Array<number>(points.length).fill(0);

  for (let iter = 0; iter < maxIterations; iter++) {
    let changed = false;

    for (let p = 0; p < points.length; p++) {
      let bestCluster = 0;
      let bestDist = Infinity;
      for (let c = 0; c < centroids.length; c++) {
        const d = distanceSq(points[p], centroids[c]);
        if (d < bestDist) {
          bestDist = d;
          bestCluster = c;
        }
      }
      if (assignments[p] !== bestCluster) {
        assignments[p] = bestCluster;
        changed = true;
      }
    }

    const sums = centroids.map(() => ({ r: 0, g: 0, b: 0, count: 0 }));
    for (let p = 0; p < points.length; p++) {
      const c = assignments[p];
      sums[c].r += points[p].r;
      sums[c].g += points[p].g;
      sums[c].b += points[p].b;
      sums[c].count++;
    }

    for (let c = 0; c < centroids.length; c++) {
      if (sums[c].count > 0) {
        centroids[c] = {
          r: sums[c].r / sums[c].count,
          g: sums[c].g / sums[c].count,
          b: sums[c].b / sums[c].count,
        };
      }
    }

    if (!changed) break;
  }

  const counts = new Array<number>(centroids.length).fill(0);
  for (const a of assignments) counts[a]++;

  return centroids
    .map((centroid, i) => ({
      hex: toHex(centroid),
      percentage: (counts[i] / points.length) * 100,
    }))
    .sort((a, b) => b.percentage - a.percentage);
}
