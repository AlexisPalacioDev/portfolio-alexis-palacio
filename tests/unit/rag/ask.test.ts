import { describe, it, expect, vi } from 'vitest';
import { createAsk } from '../../../rag/lib/ask.ts';
import { MissingKeyError } from '../../../rag/lib/embeddings.ts';

describe('ask', () => {
  const index = { minScore: -Infinity, chunks: [{ id: '1', title: 'A', text: 'B', vector: [1, 0, 0] }] };
  const mockEmbedder = { embed: vi.fn().mockResolvedValue([[1, 0, 0]]) };
  const mockGenerator = { generate: vi.fn().mockResolvedValue('answer') };
  const getAsk = (deps = {}) => createAsk({ index, embedder: mockEmbedder, generator: mockGenerator, ...deps });

  // guards: 400 validation
  it('returns 400 for invalid lengths', async () => {
    const ask = getAsk();
    expect((await ask('a', 'client')).status).toBe(400); // too short
    expect((await ask('a'.repeat(501), 'client')).status).toBe(400); // too long
  });

  // guards: rate limit resets after 60s
  it('returns 429 and resets', async () => {
    let time = 1000;
    const ask = getAsk({ now: () => time });
    for (let i = 0; i < 8; i++) {
      expect((await ask('valid question', 'c1')).status).toBe(200);
    }
    expect((await ask('valid question', 'c1')).status).toBe(429);
    time += 60001; // wait > 60s
    expect((await ask('valid question', 'c1')).status).toBe(200);
  });

  // guards: rate limit map cap eviction
  it('evicts oldest from rate limit map', async () => {
    let time = 1000;
    const ask = getAsk({ now: () => time, rateLimitCap: 2 });
    await ask('valid question', 'client1');
    time += 1000;
    await ask('valid question', 'client2');
    time += 1000;
    await ask('valid question', 'client3'); // evicts client1
    
    // wait 60s is not needed to check eviction. Just check if client1 can now do 8 requests at current time.
    for (let i = 0; i < 8; i++) {
      expect((await ask('valid question', 'client1')).status).toBe(200);
    }
    expect((await ask('valid question', 'client1')).status).toBe(429);
  });

  // guards: missing embeddings key = 503
  it('returns 503 for missing embeddings key', async () => {
    const ask = getAsk({ embedder: { embed: vi.fn().mockRejectedValue(new MissingKeyError()) } });
    expect((await ask('valid question', 'c1')).status).toBe(503);
  });

  // guards: embedder generic error = 502
  it('returns 502 for embedder generic error', async () => {
    const ask = getAsk({ embedder: { embed: vi.fn().mockRejectedValue(new Error()) } });
    expect((await ask('valid question', 'c1')).status).toBe(502);
  });

  // guards: generator generic error = 502
  it('returns 502 for generator generic error', async () => {
    const ask = getAsk({ generator: { generate: vi.fn().mockRejectedValue(new Error()) } });
    expect((await ask('valid question', 'c1')).status).toBe(502);
  });

  // guards: no-context mode does not call generator
  it('returns no-context without calling generator', async () => {
    const genSpy = vi.fn();
    const ask = getAsk({ 
      index: { minScore: 0.9, chunks: [{ id: '1', title: 'A', text: 'B', vector: [0, 1, 0] }] },
      generator: { generate: genSpy } 
    });
    const res = await ask('valid question', 'c1');
    expect(res.status).toBe(200);
    expect(res.body.mode).toBe('no-context');
    expect(genSpy).not.toHaveBeenCalled();
  });

  // guards: missing generator key = retrieval-only
  it('returns retrieval-only when generator lacks key', async () => {
    const ask = getAsk({ generator: { generate: vi.fn().mockRejectedValue(new MissingKeyError()) } });
    const res = await ask('valid question', 'c1');
    expect(res.body.mode).toBe('retrieval-only');
  });

  // guards: happy path generation
  it('returns generated answer', async () => {
    const ask = getAsk();
    const res = await ask('valid question', 'c1');
    expect(res.body.mode).toBe('generated');
    expect(res.body.answer).toBe('answer');
  });

  // guards: default minScore logic
  it('uses default minScore if index lacks it', async () => {
    // If minScore is used, and it's 0.25 (default), an orthogonal vector ([0,1,0] vs [1,0,0]) gives 0
    // so it should hit no-context.
    const ask = getAsk({ index: { chunks: [{ id: '1', title: 'A', text: 'B', vector: [0, 1, 0] }] } });
    const res = await ask('valid question', 'c1');
    expect(res.body.mode).toBe('no-context');
  });
});
