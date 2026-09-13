import { describe, it, expect, vi } from 'vitest';
import { createHandler } from '../../../api/ask.ts';

describe('api ask handler', () => {
  // guards: 503 when index is missing
  it('returns 503 if index cannot be loaded', async () => {
    const handler = createHandler({ loadIndex: () => null });
    const res = await handler(new Request('http://localhost', { method: 'POST' }));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: 'unavailable' });
  });

  // guards: 400 for invalid JSON
  it('returns 400 for invalid JSON', async () => {
    const handler = createHandler({ loadIndex: () => ({ chunks: [] }) });
    const res = await handler(new Request('http://localhost', { method: 'POST', body: '{badjson' }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'invalid_request' });
  });

  // guards: 400 for null body
  it('returns 400 for null body', async () => {
    const handler = createHandler({ loadIndex: () => ({ chunks: [] }) });
    const res = await handler(new Request('http://localhost', { method: 'POST', body: 'null' }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'invalid_question' });
  });

  // guards: 500 for unexpected errors
  it('returns 500 on unexpected exception', async () => {
    // Force an internal error by mocking request.json() to throw a generic error, which is caught by the first catch,
    // wait, request.json() throwing goes to 400.
    // To trigger 500, we can make the request object completely broken so `await request.json()` fails in a weird way?
    // Actually, `request.headers.get` throwing is easier to simulate if we pass a bad request object.
    const handler = createHandler({ loadIndex: () => ({ chunks: [] }) });
    const badReq = {
      json: async () => ({ question: 'valid' }),
      headers: { get: () => { throw new Error('internal'); } }
    } as any;
    const res = await handler(badReq);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'internal' });
  });
});
