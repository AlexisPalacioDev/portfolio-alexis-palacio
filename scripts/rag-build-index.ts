import fs from 'node:fs';
import path from 'node:path';
import { chunkMarkdown } from '../rag/lib/chunk.ts';
import type { Chunk } from '../rag/lib/chunk.ts';
import { createEmbedder } from '../rag/lib/embeddings.ts';
import { scanForSecrets } from '../rag/lib/scan.ts';

const kbDir = path.join(process.cwd(), 'rag', 'kb');
const indexPath = path.join(process.cwd(), 'rag', 'index.json');

function walk(dir: string, fileList: string[] = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walk(filePath, fileList);
    } else if (file.endsWith('.md')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

async function buildIndex() {
  const files = walk(kbDir).sort();
  const allChunks: Chunk[] = [];
  let totalChars = 0;

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    
    if (scanForSecrets(content)) {
      console.error(`FATAL: Secret detected in ${file}`);
      process.exit(1);
    }

    const fileId = path.relative(kbDir, file).replace(/\.md$/, '');
    const chunks = chunkMarkdown(fileId, content);
    allChunks.push(...chunks);

    for (const c of chunks) {
      totalChars += c.text.length;
    }
  }

  const embedder = createEmbedder(process.env);
  const textsToEmbed = allChunks.map(c => `${c.title}\n\n${c.text}`);

  console.log(`Generating embeddings for ${allChunks.length} chunks (approx ${Math.round(totalChars / 4)} tokens)...`);

  const vectors = await embedder.embed(textsToEmbed);

  let existingMinScore = 0.25;
  let existingMinLexical = 2.0;
  if (fs.existsSync(indexPath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
      if (typeof existing.minScore === 'number') {
        existingMinScore = existing.minScore;
      }
      if (typeof existing.minLexical === "number") {
        existingMinLexical = existing.minLexical;
      }
    } catch (e) {
      // Ignore
    }
  }

  const indexData = {
    version: 1,
    embeddingModel: embedder.model,
    dims: vectors[0].length,
    createdAt: new Date().toISOString(),
    minScore: existingMinScore,
    minLexical: existingMinLexical,
    chunks: allChunks.map((c, i) => ({
      id: c.id,
      title: c.title,
      text: c.text,
      vector: vectors[i].map(v => Number(v.toFixed(6))),
    })),
  };

  fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2));
  console.log(`Index saved to ${indexPath}`);
}

buildIndex().catch(e => { console.error(e); process.exit(1); });
