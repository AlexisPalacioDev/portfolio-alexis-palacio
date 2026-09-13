import { MissingKeyError } from './embeddings.ts';

export function createGenerator(
  env: Record<string, string | undefined>,
  fetchImpl: typeof fetch = fetch
) {
  const baseUrl = env.LLM_BASE_URL ?? 'https://api.openai.com/v1';
  const apiKey = env.LLM_API_KEY ?? env.OPENAI_API_KEY;
  const model = apiKey ? (env.LLM_MODEL ?? 'gpt-4.1-mini') : null;

  return {
    model,
    async generate(messages: { role: 'system' | 'user'; content: string }[]): Promise<string> {
      if (!apiKey || !model) {
        throw new MissingKeyError();
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      try {
        const res = await fetchImpl(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: 0.2,
            max_tokens: 400,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`LLM API error: HTTP ${res.status}`);
        }

        const data = await res.json();
        return (data.choices[0]?.message?.content || '').trim();
      } finally {
        clearTimeout(timeoutId);
      }
    }
  };
}
