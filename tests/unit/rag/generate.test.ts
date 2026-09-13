import { describe, it, expect, vi } from 'vitest';
import { createGenerator } from '../../../rag/lib/generate.ts';
import { MissingKeyError } from '../../../rag/lib/embeddings.ts';

describe('generator', () => {
  // guards: proper payload shape
  it('sends correct request shape', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'hello' } }] })
    });
    const gen = createGenerator({ LLM_API_KEY: 'test', LLM_MODEL: 'test-model' }, fetchMock as any);
    await gen.generate([{ role: 'user', content: 'hi' }]);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.openai.com/v1/chat/completions');
    expect(init.headers.Authorization).toBe('Bearer test');
    const body = JSON.parse(init.body);
    expect(body.model).toBe('test-model');
    expect(body.messages[0].content).toBe('hi');
    expect(body.temperature).toBeDefined();
    expect(body.max_tokens).toBeDefined();
  });

  // guards: missing key throws MissingKeyError
  it('throws MissingKeyError if no key', async () => {
    const gen = createGenerator({}, vi.fn() as any);
    await expect(gen.generate([])).rejects.toThrow(MissingKeyError);
  });

  // guards: http error throws
  it('throws on HTTP error without leaking key', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    const gen = createGenerator({ LLM_API_KEY: 'secret' }, fetchMock as any);
    const error = await gen.generate([]).then(
      () => null,
      (err: Error) => err,
    );
    // A swallowed HTTP error (resolving instead of throwing) must fail here.
    expect(error).toBeInstanceOf(Error);
    expect(error!.message).toContain('500');
    expect(error!.message).not.toContain('secret');
  });

  // guards: timeout aborts fetch
  it('aborts on timeout', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockImplementation(async (url, init) => {
      return new Promise((resolve, reject) => {
        init.signal.addEventListener('abort', () => reject(new Error('AbortError')));
      });
    });
    const gen = createGenerator({ LLM_API_KEY: 'test' }, fetchMock as any);
    const p = gen.generate([]);
    vi.advanceTimersByTime(25000);
    await expect(p).rejects.toThrow('AbortError');
    vi.useRealTimers();
  });
});
