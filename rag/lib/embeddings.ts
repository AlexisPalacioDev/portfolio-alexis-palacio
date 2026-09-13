import { normalize } from './vector.ts';

export class MissingKeyError extends Error {
  constructor(message: string = 'Missing API key') {
    super(message);
    this.name = 'MissingKeyError';
  }
}

export function createEmbedder(
  env: Record<string, string | undefined>,
  fetchImpl: typeof fetch = fetch
) {
  const baseUrl = env.EMBEDDINGS_BASE_URL ?? 'https://api.openai.com/v1';
  const apiKey = env.EMBEDDINGS_API_KEY ?? env.OPENAI_API_KEY;
  const model = env.EMBEDDINGS_MODEL ?? 'text-embedding-3-small';

  return {
    model,
    async embed(texts: string[]): Promise<number[][]> {
      if (!apiKey) {
        throw new MissingKeyError();
      }

      const vectors: number[][] = new Array(texts.length);
      const batchSize = 64;

      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        const res = await fetchImpl(`${baseUrl}/embeddings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            input: batch,
          }),
        });

        if (!res.ok) {
          throw new Error(`Embeddings API error: HTTP ${res.status}`);
        }

        const data = await res.json();
        
        for (const item of data.data) {
          const globalIndex = i + item.index;
          vectors[globalIndex] = normalize(item.embedding);
        }
      }

      return vectors;
    }
  };
}
