import { MissingKeyError } from './embeddings.ts';
import { buildMessages } from './prompt.ts';
import { retrieve } from './retrieve.ts';

type RateLimitEntry = {
  timestamps: number[];
  lastAccess: number;
};

export type IndexData = {
  minScore?: number;
  minLexical?: number;
  chunks: { id: string; title: string; text: string; vector: number[] }[];
};

export type AskDeps = {
  rateLimitMaxHits?: number;
  rateLimitCap?: number;
  index: IndexData;
  embedder: { embed(texts: string[]): Promise<number[][]> };
  generator: { generate(messages: any[]): Promise<string> };
  now?: () => number;
};

export function createAsk({ index, embedder, generator, now = Date.now, rateLimitMaxHits = 8, rateLimitCap = 5000 }: AskDeps) {
  const rateLimits = new Map<string, RateLimitEntry>();

  return async function ask(question: string, clientId: string) {
    const trimmed = question.trim();
    if (trimmed.length < 3 || trimmed.length > 500) {
      return { status: 400, body: { error: 'invalid_question' } };
    }

    const currentTime = now();
    
    // Rate limit check
    let rl = rateLimits.get(clientId);
    if (!rl) {
      rl = { timestamps: [], lastAccess: currentTime };
      rateLimits.set(clientId, rl);
    }
    
    rl.lastAccess = currentTime;
    rl.timestamps = rl.timestamps.filter(t => currentTime - t < 60000);
    
    if (rl.timestamps.length >= rateLimitMaxHits) {
      return { status: 429, body: { error: 'rate_limited' } };
    }
    
    rl.timestamps.push(currentTime);

    // Evict oldest if map too big
    if (rateLimits.size > rateLimitCap) {
      let oldestId: string | null = null;
      let oldestTime = Infinity;
      for (const [id, entry] of rateLimits.entries()) {
        if (entry.lastAccess < oldestTime) {
          oldestTime = entry.lastAccess;
          oldestId = id;
        }
      }
      if (oldestId) {
        rateLimits.delete(oldestId);
      }
    }

    let queryVector: number[];
    try {
      const vectors = await embedder.embed([trimmed]);
      queryVector = vectors[0];
    } catch (err) {
      if (err instanceof MissingKeyError) {
        return { status: 503, body: { error: 'unavailable' } };
      }
      return { status: 502, body: { error: 'upstream' } };
    }

    const topChunks = retrieve(index, queryVector, trimmed);

    if (topChunks.length === 0) {
      return {
        status: 200,
        body: {
          mode: 'no-context',
          answer: null,
          sources: []
        }
      };
    }

    const sources = topChunks.map((hit, i) => {
      const chunk = index.chunks.find(c => c.id === hit.id)!;
      return { n: i + 1, id: chunk.id, title: chunk.title, score: hit.score };
    });

    const contexts = topChunks.map((hit, i) => {
      const chunk = index.chunks.find(c => c.id === hit.id)!;
      return { n: i + 1, title: chunk.title, text: chunk.text };
    });

    const todayStr = new Date(now()).toISOString().slice(0, 10);
    const messages = buildMessages(trimmed, contexts, todayStr);

    try {
      const answer = await generator.generate(messages);
      return {
        status: 200,
        body: {
          mode: 'generated',
          answer,
          sources
        }
      };
    } catch (err) {
      if (err instanceof MissingKeyError) {
        return {
          status: 200,
          body: {
            mode: 'retrieval-only',
            answer: null,
            sources
          }
        };
      }
      return { status: 502, body: { error: 'upstream' } };
    }
  };
}
