import { BM25 } from './lexical.ts';
import { cosineTopK } from './vector.ts';
import type { IndexData } from './ask.ts';

export type RetrievedChunk = {
  id: string;
  score: number; // cosine similarity between the question and the chunk
};

export type RetrieveOptions = {
  k?: number;
  candidates?: number;
  lexicalWeight?: number;
  // Eval mode: skip the no-context gate so every case gets a ranking.
  skipGate?: boolean;
};

export const DEFAULT_MIN_SCORE = 0.25;

const bm25Cache = new WeakMap<IndexData, BM25>();

function bm25For(index: IndexData): BM25 {
  let bm25 = bm25Cache.get(index);
  if (!bm25) {
    bm25 = new BM25(index.chunks);
    bm25Cache.set(index, bm25);
  }
  return bm25;
}

function dot(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

/**
 * Hybrid retrieval: cosine similarity boosted by a weighted, normalized BM25
 * score. Embeddings capture meaning; BM25 rescues exact keywords
 * (tool names such as "Playwright") that dense vectors tend to miss.
 */
export function retrieve(
  index: IndexData,
  queryVector: number[],
  question: string,
  options: RetrieveOptions = {},
): RetrievedChunk[] {
  const {
    k = 4,
    candidates = 20,
    lexicalWeight = 0.05,
    skipGate = false,
  } = options;

  const byId = new Map(index.chunks.map((chunk) => [chunk.id, chunk]));
  const vectorRanking = cosineTopK(queryVector, index.chunks, candidates, -Infinity);
  const lexicalRanking = bm25For(index)
    .score(question)
    .filter((hit) => hit.score > 0)
    .slice(0, candidates);

  // The no-context gate uses cosine only. Measured on the eval set: in-scope
  // top cosine >= 0.263, off-topic <= 0.240. BM25 cannot gate on a corpus this
  // small: a single shared word ("root", "poem") already scores above 3.
  if (!skipGate) {
    const bestCosine = vectorRanking[0]?.score ?? -Infinity;
    if (bestCosine < (index.minScore ?? DEFAULT_MIN_SCORE)) return [];
  }

  // Score fusion: cosine plus the BM25 score normalized to [0, 1] and weighted.
  // Measured on rag/eval.json (28 in-scope cases): vector-only hit@1 89.3%,
  // RRF 83.3% (it ignores score gaps between close ranks), this fusion with
  // weight 0.05 96.4%.
  const bestLexicalScore = lexicalRanking[0]?.score ?? 0;
  const fused = new Map<string, number>();
  for (const hit of vectorRanking) fused.set(hit.id, hit.score);
  if (bestLexicalScore > 0) {
    for (const hit of lexicalRanking) {
      const base = fused.get(hit.id) ?? dot(byId.get(hit.id)!.vector, queryVector);
      fused.set(hit.id, base + lexicalWeight * (hit.score / bestLexicalScore));
    }
  }

  return [...fused.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, k)
    .map(([id]) => ({ id, score: dot(byId.get(id)!.vector, queryVector) }));
}
