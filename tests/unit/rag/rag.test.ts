import { describe, it, expect, vi } from 'vitest';
import { chunkMarkdown } from '../../../rag/lib/chunk.ts';
import { normalize, cosineTopK } from '../../../rag/lib/vector.ts';
import { createEmbedder, MissingKeyError } from '../../../rag/lib/embeddings.ts';
import { buildMessages } from '../../../rag/lib/prompt.ts';
import { createGenerator } from '../../../rag/lib/generate.ts';
import { createAsk } from '../../../rag/lib/ask.ts';
import { scanForSecrets } from '../../../rag/lib/scan.ts';
import { calculateMetrics } from '../../../rag/lib/metrics.ts';

describe('chunkMarkdown', () => {
  it('handles headings and preamble', () => {
    const md = `# Title\nPreamble\n## Section 1\nContent 1`;
    const chunks = chunkMarkdown('file', md);
    expect(chunks).toHaveLength(2);
    expect(chunks[0].title).toBe('Title');
    expect(chunks[0].text).toBe('# Title\nPreamble');
    expect(chunks[0].id).toBe('file#title');
    expect(chunks[1].title).toBe('Title › Section 1');
    expect(chunks[1].text).toBe('## Section 1\nContent 1');
  });

  it('drops empty sections', () => {
    const md = `# Title\n\n## Section 1\n\n## Section 2\nContent 2`;
    const chunks = chunkMarkdown('file', md);
    expect(chunks).toHaveLength(1);
    expect(chunks[0].title).toBe('Title › Section 2');
    expect(chunks[0].text).toBe('## Section 2\nContent 2');
  });

  it('handles duplicate slugs and diacritics', () => {
    const md = `# Title\n## Álgebra\nContent\n## Álgebra\nContent 2`;
    const chunks = chunkMarkdown('file', md);
    // Since # Title has no text besides the header, it should be dropped.
    expect(chunks[0].id).toBe('file#algebra');
    expect(chunks[1].id).toBe('file#algebra-2');
  });

  it('splits long content without breaking code blocks', () => {
    const p = 'a'.repeat(800);
    const code = '```\n' + 'b'.repeat(800) + '\n```';
    const md = `# T\n## S\n${p}\n\n${code}\n\n${p}`;
    const chunks = chunkMarkdown('file', md);
    // Should split, keeping code block intact
    expect(chunks.length).toBeGreaterThan(1);
    // No code block marker should be alone
    const codeBlocks = chunks.map(c => c.text.match(/```/g) || []).flat();
    expect(codeBlocks.length % 2).toBe(0); // Pairs of ```
  });
});

describe('vector', () => {
  it('normalize', () => {
    const v = [3, 4];
    expect(normalize(v)).toEqual([0.6, 0.8]);
    expect(normalize([0, 0])).toEqual([0, 0]);
  });

  it('cosineTopK', () => {
    const items = [
      { id: '1', vector: [1, 0] },
      { id: '2', vector: [0, 1] },
      { id: '3', vector: [0.707, 0.707] }
    ];
    const top = cosineTopK([1, 0], items, 2, 0.5);
    expect(top).toHaveLength(2);
    expect(top[0].id).toBe('1');
    expect(top[0].score).toBeCloseTo(1);
    expect(top[1].id).toBe('3');
    expect(top[1].score).toBeCloseTo(0.707);
  });
});

describe('embeddings', () => {
  it('throws on missing key', async () => {
    const embedder = createEmbedder({});
    await expect(embedder.embed(['test'])).rejects.toThrow(MissingKeyError);
  });

  it('batches and normalizes and orders correctly', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [{ index: 0, embedding: [3, 4] }]
      })
    });
    const embedder = createEmbedder({ EMBEDDINGS_API_KEY: 'test' }, fetchImpl as any);
    const texts = Array(65).fill('test');
    const vecs = await embedder.embed(texts);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(vecs).toHaveLength(65);
    expect(vecs[0]).toEqual([0.6, 0.8]);
  });

  it('throws HTTP error without key leakage', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    const embedder = createEmbedder({ EMBEDDINGS_API_KEY: 'secret_key' }, fetchImpl as any);
    await expect(embedder.embed(['test'])).rejects.toThrow('Embeddings API error: HTTP 500');
    // Ensure 'secret_key' is not in the error
    try {
      await embedder.embed(['test']);
    } catch (e: any) {
      expect(e.message).not.toContain('secret_key');
    }
  });
});

describe('prompt', () => {
  it('builds messages correctly', () => {
    const msgs = buildMessages('Q?', [{ n: 1, title: 'T', text: 'Txt' }]);
    expect(msgs[0].role).toBe('system');
    expect(msgs[0].content).toContain('Alexis Palacio');
    expect(msgs[0].content).toContain('alexis26-93@live.com');
    expect(msgs[1].role).toBe('user');
    expect(msgs[1].content).toContain('[1] T\nTxt');
    expect(msgs[1].content).toContain('Question: Q?');
  });
});

describe('generate', () => {
  it('throws on missing key', async () => {
    const gen = createGenerator({});
    await expect(gen.generate([])).rejects.toThrow(MissingKeyError);
  });

  it('makes correct request', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: '  answer  ' } }] })
    });
    const gen = createGenerator({ LLM_API_KEY: 'key' }, fetchImpl as any);
    const ans = await gen.generate([{ role: 'user', content: 'hello' }]);
    expect(ans).toBe('answer');
    
    const reqBody = JSON.parse(fetchImpl.mock.calls[0][1].body);
    expect(reqBody.model).toBe('gpt-4.1-mini');
    expect(reqBody.temperature).toBe(0.2);
    expect(reqBody.max_tokens).toBe(400);
  });
});

describe('ask', () => {
  it('handles invalid questions', async () => {
    const ask = createAsk({} as any);
    const res = await ask('hi', 'client1');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('invalid_question');
  });

  it('enforces rate limit', async () => {
    let time = 0;
    const ask = createAsk({ now: () => time } as any);
    for (let i = 0; i < 8; i++) {
      const res = await ask('valid question', 'client1');
      // Should fail since embedder is missing, but it means rate limit allowed it
      expect(res.status).not.toBe(429);
      time += 1000;
    }
    const res = await ask('valid question', 'client1');
    expect(res.status).toBe(429);
    expect(res.body.error).toBe('rate_limited');
  });

  it('handles zero hits', async () => {
    const embedder = { embed: async () => [[1, 0]] };
    const generator = { generate: async () => 'ans' };
    const index = { chunks: [] };
    const ask = createAsk({ index, embedder, generator } as any);
    const res = await ask('question', 'client1');
    expect(res.status).toBe(200);
    expect(res.body.mode).toBe('no-context');
  });

  it('handles retrieval-only (no LLM key)', async () => {
    const embedder = { embed: async () => [[1, 0]] };
    const generator = { generate: async () => { throw new MissingKeyError(); } };
    const index = { chunks: [{ id: '1', title: 'T', text: 'txt', vector: [1, 0] }] };
    const ask = createAsk({ index, embedder, generator } as any);
    const res = await ask('question', 'client1');
    expect(res.status).toBe(200);
    expect(res.body.mode).toBe('retrieval-only');
    expect(res.body.sources).toHaveLength(1);
  });

  it('returns generated answer', async () => {
    const embedder = { embed: async () => [[1, 0]] };
    const generator = { generate: async () => 'answer' };
    const index = { chunks: [{ id: '1', title: 'T', text: 'txt', vector: [1, 0] }] };
    const ask = createAsk({ index, embedder, generator } as any);
    const res = await ask('question', 'client1');
    expect(res.status).toBe(200);
    expect(res.body.mode).toBe('generated');
    expect(res.body.answer).toBe('answer');
  });
});

describe('scan', () => {
  it('detects secrets', () => {
    expect(scanForSecrets('sk-12345678901234567890')).toBe(true);
    expect(scanForSecrets('password = secret')).toBe(true);
    expect(scanForSecrets('192.168.1.1')).toBe(true);
    expect(scanForSecrets('normal text')).toBe(false);
  });
});

describe('metrics', () => {
  it('calculates properly', () => {
    const results = [
      { expected: ['A'], hitIds: ['A'], scores: [0.9] },
      { expected: ['B'], hitIds: ['C', 'B'], scores: [0.8, 0.7] },
      { expected: null, hitIds: ['X'], scores: [0.5] }
    ];
    const m = calculateMetrics(results);
    expect(m.inScope.hitAt1).toBe(0.5); // 1 out of 2
    expect(m.inScope.hitAt4).toBe(1);   // 2 out of 2
    expect(m.inScope.mrr).toBeCloseTo(0.75); // 1/1 + 1/2 = 1.5 / 2 = 0.75
    expect(m.suggestedMinScore).toBeCloseTo(0.655);
  });
});
