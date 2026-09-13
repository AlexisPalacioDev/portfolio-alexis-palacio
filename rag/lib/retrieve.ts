import { BM25 } from './lexical.ts';
import { cosineTopK } from './vector.ts';
import type { IndexData } from './ask.ts';

export type RetrievedChunk = {
  id: string;
  score: number; // The cosine score
};

let bm25Instance: BM25 | null = null;
let lastIndexRef: any = null;

export function retrieve(
  index: IndexData,
  queryVector: number[],
  question: string,
  ignoreMinScoreForEval: boolean = false
): RetrievedChunk[] {
  const minScore = ignoreMinScoreForEval ? -Infinity : (index.minScore ?? 0.25);
  const minLexical = 2.0;

  if (bm25Instance === null || lastIndexRef !== index) {
    bm25Instance = new BM25(index.chunks);
    lastIndexRef = index;
  }

  // Vector ranking (top 20, no threshold yet)
  const vectorTop20 = cosineTopK(queryVector, index.chunks, 20, -Infinity);
  
  // BM25 ranking (top 20, score > 0)
  const bm25All = bm25Instance.score(question);
  const bm25Top20 = bm25All.filter(h => h.score > 0).slice(0, 20);

  // Reciprocal Rank Fusion (k = 60)
  const k = 60;
  const rrfScores = new Map<string, number>();

  for (let i = 0; i < vectorTop20.length; i++) {
    const id = vectorTop20[i].id;
    rrfScores.set(id, (rrfScores.get(id) || 0) + 1 / (k + i + 1));
  }

  for (let i = 0; i < bm25Top20.length; i++) {
    const id = bm25Top20[i].id;
    rrfScores.set(id, (rrfScores.get(id) || 0) + 1 / (k + i + 1));
  }

  const fused = Array.from(rrfScores.entries())
    .map(([id, rrfScore]) => ({ id, rrfScore }))
    .sort((a, b) => b.rrfScore - a.rrfScore)
    .slice(0, 4);

  // No-context gating
  let bestCosine = -Infinity;
  if (vectorTop20.length > 0) {
    bestCosine = vectorTop20[0].score;
  }

  let bestBm25 = -Infinity;
  if (bm25All.length > 0) {
    bestBm25 = bm25All[0].score;
  }

  if (bestCosine < minScore && bestBm25 < minLexical) {
    return [];
  }

  return fused.map(f => {
    // Each source keeps score = its cosine score
    const vHit = vectorTop20.find(v => v.id === f.id);
    const score = vHit ? vHit.score : (index.chunks.find(c => c.id === f.id)?.vector ? 
      // If it wasn't in top 20 cosine, compute it? Or just use vHit?
      // Well, wait. cosineTopK returned top 20. If it wasn't there, it means its cosine is very low.
      // I can just recompute if missing.
      vectorTop20.find(v => v.id === f.id)?.score || 0 : 0);
      
    // Actually, I can just recompute cosine directly.
    let finalScore = 0;
    if (vHit) {
      finalScore = vHit.score;
    } else {
      const chunk = index.chunks.find(c => c.id === f.id);
      if (chunk) {
        finalScore = chunk.vector.reduce((sum, val, idx) => sum + val * queryVector[idx], 0);
      }
    }
    
    return {
      id: f.id,
      score: finalScore
    };
  });
}
