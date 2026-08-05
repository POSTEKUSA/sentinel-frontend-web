/** Deterministic PRNG helpers used to generate large, stable mock datasets. */

export type Rng = () => number;

/** mulberry32 — fast, deterministic PRNG. Same seed always yields the same sequence. */
export function createRng(seed: number): Rng {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function randInt(rng: Rng, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function randFloat(rng: Rng, min: number, max: number): number {
  return rng() * (max - min) + min;
}

export function randChoice<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)];
}

export function shuffle<T>(rng: Rng, items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Picks an index from `weights` proportionally to their value. */
export function weightedIndex(rng: Rng, weights: readonly number[]): number {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

/** Binary search over a cumulative-sum array — used for large weighted-pick loops (fast). */
export function pickFromCumulative(rng: Rng, cumulative: readonly number[]): number {
  const target = rng() * cumulative[cumulative.length - 1];
  let lo = 0;
  let hi = cumulative.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (cumulative[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

export function toCumulative(weights: readonly number[]): number[] {
  const out: number[] = [];
  let sum = 0;
  for (const w of weights) {
    sum += w;
    out.push(sum);
  }
  return out;
}

/**
 * Distributes an integer `total` across `weights` proportionally, rounding with the
 * largest-remainder method so the result always sums to exactly `total`.
 */
export function distributeCount(total: number, weights: readonly number[]): number[] {
  if (weights.length === 0) return [];
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  const raw = weights.map(w => (w / sum) * total);
  const floors = raw.map(Math.floor);
  const allocated = floors.reduce((a, b) => a + b, 0);
  let remainder = total - allocated;
  const order = raw
    .map((v, i) => ({ i, frac: v - floors[i] }))
    .sort((a, b) => b.frac - a.frac);
  const result = [...floors];
  let k = 0;
  while (remainder > 0 && order.length > 0) {
    result[order[k % order.length].i]++;
    remainder--;
    k++;
  }
  return result;
}
