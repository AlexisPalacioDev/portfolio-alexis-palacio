import fs from 'node:fs';
import path from 'node:path';
import { chunkMarkdown } from '../rag/lib/chunk.ts';

const kbDir = path.join(process.cwd(), 'rag', 'kb');

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

const files = walk(kbDir).sort();
let totalChunks = 0;
let totalChars = 0;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  const fileId = path.relative(kbDir, file).replace(/\.md$/, '');
  const chunks = chunkMarkdown(fileId, content);
  
  console.log(`\n--- ${fileId} ---`);
  for (const chunk of chunks) {
    console.log(`ID: ${chunk.id}`);
    totalChunks++;
    totalChars += chunk.text.length;
  }
}

console.log(`\nTotal Chunks: ${totalChunks}`);
console.log(`Estimated Tokens: ${Math.round(totalChars / 4)}`);
