export function normalize(v: number[]): number[] {
  const sumSq = v.reduce((sum, val) => sum + val * val, 0);
  if (sumSq === 0) return v;
  const mag = Math.sqrt(sumSq);
  return v.map(val => val / mag);
}

export function cosineTopK(
  query: number[],
  items: { id: string; vector: number[] }[],
  k: number,
  minScore: number
): { id: string; score: number }[] {
  const results = items.map(item => {
    let score = 0;
    for (let i = 0; i < query.length && i < item.vector.length; i++) {
      score += query[i] * item.vector[i];
    }
    return { id: item.id, score };
  });

  return results
    .filter(res => res.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
