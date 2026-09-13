import { describe, it, expect, vi } from 'vitest';
import { createEmbedder, MissingKeyError } from '../../../rag/lib/embeddings.ts';

describe('embeddings', () => {
  // guards: correct mapping of shuffled API responses to input order
  it('maps shuffled response indices correctly', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          { index: 1, embedding: [0, 1] },
          { index: 0, embedding: [1, 0] }
        ]
      })
    });
    const embedder = createEmbedder({ EMBEDDINGS_API_KEY: 'test' }, fetchMock as any);
    const result = await embedder.embed(['a', 'b']);
    expect(result[0][0]).toBe(1); // normalized [1, 0]
    expect(result[1][1]).toBe(1); // normalized [0, 1]
  });

  // guards: proper batching for inputs > 64
  it('batches inputs into sizes of 64 and 1 for 65 items', async () => {
    const fetchMock = vi.fn().mockImplementation(async (url, init) => {
      const body = JSON.parse(init.body);
      const data = body.input.map((_: any, i: number) => ({ index: i, embedding: [1, 0] }));
      return { ok: true, json: async () => ({ data }) };
    });
    const embedder = createEmbedder({ EMBEDDINGS_API_KEY: 'test' }, fetchMock as any);
    const inputs = new Array(65).fill('test');
    await embedder.embed(inputs);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).input.length).toBe(64);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).input.length).toBe(1);
  });

  // guards: API omission of an index results in an error
  it('throws when an index is missing from response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ index: 0, embedding: [1, 0] }] })
    }); // index 1 is missing
    const embedder = createEmbedder({ EMBEDDINGS_API_KEY: 'test' }, fetchMock as any);
    await expect(embedder.embed(['a', 'b'])).rejects.toThrow('Missing vector for input index 1');
  });

  // guards: sensitive keys do not leak in HTTP error messages
  it('does not leak API key in HTTP error messages', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 401 });
    const embedder = createEmbedder({ EMBEDDINGS_API_KEY: 'super-secret-key' }, fetchMock as any);
    const error = await embedder.embed(['a']).then(
      () => null,
      (err: Error) => err,
    );
    // A swallowed HTTP error (resolving instead of throwing) must fail here.
    expect(error).toBeInstanceOf(Error);
    expect(error!.message).toContain('401');
    expect(error!.message).not.toContain('super-secret-key');
  });

  // guards: network timeout aborts fetch
  it('aborts on timeout', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockImplementation(async (url, init) => {
      return new Promise((resolve, reject) => {
        init.signal.addEventListener('abort', () => reject(new Error('AbortError')));
      });
    });
    const embedder = createEmbedder({ EMBEDDINGS_API_KEY: 'test' }, fetchMock as any);
    const p = embedder.embed(['a'], 100);
    vi.advanceTimersByTime(150);
    await expect(p).rejects.toThrow('AbortError');
    vi.useRealTimers();
  });
  
  it('throws MissingKeyError if no key', async () => {
    const embedder = createEmbedder({}, vi.fn() as any);
    await expect(embedder.embed(['a'])).rejects.toThrow(MissingKeyError);
  });
});
