import fs from 'node:fs';
import path from 'node:path';
import { createAsk, IndexData } from '../rag/lib/ask.ts';
import { createEmbedder } from '../rag/lib/embeddings.ts';
import { createGenerator } from '../rag/lib/generate.ts';

let indexCache: IndexData | null = null;
let askFn: ReturnType<typeof createAsk> | null = null;
let indexLoadAttempted = false;

function getAskFn() {
  if (!askFn && !indexLoadAttempted) {
    indexLoadAttempted = true;
    const indexPath = path.join(process.cwd(), 'rag', 'index.json');
    try {
      if (fs.existsSync(indexPath)) {
        indexCache = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
        const embedder = createEmbedder(process['env']);
        const generator = createGenerator(process['env']);
        askFn = createAsk({ index: indexCache!, embedder, generator });
      }
    } catch (e) {
      console.error('Failed to load rag/index.json', e);
    }
  }
  return askFn;
}

export async function GET() {
  return new Response('Method Not Allowed', { status: 405 });
}

export async function POST(request: Request): Promise<Response> {
  const ask = getAskFn();
  if (!ask) {
    return new Response(JSON.stringify({ error: 'unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });
  }

  let body: any;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'invalid_request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });
  }

  if (typeof body.question !== 'string') {
    return new Response(JSON.stringify({ error: 'invalid_question' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });
  }

  const forwardedFor = request.headers.get('x-forwarded-for');
  let clientId = 'anon';
  if (forwardedFor) {
    clientId = forwardedFor.split(',')[0].trim();
  }

  const result = await ask(body.question, clientId);

  return new Response(JSON.stringify(result.body), {
    status: result.status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}
