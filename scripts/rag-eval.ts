import fs from 'node:fs';
import path from 'node:path';
import { createEmbedder } from '../rag/lib/embeddings.ts';
import { cosineTopK } from '../rag/lib/vector.ts';
import { calculateMetrics, EvalResult } from '../rag/lib/metrics.ts';

const indexPath = path.join(process.cwd(), 'rag', 'index.json');
const evalPath = path.join(process.cwd(), 'rag', 'eval.json');
const reportPath = path.join(process.cwd(), 'rag', 'eval-report.md');

async function evaluate() {
  if (!fs.existsSync(indexPath) || !fs.existsSync(evalPath)) {
    console.error('Missing index.json or eval.json');
    process.exit(1);
  }

  const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  const evalData = JSON.parse(fs.readFileSync(evalPath, 'utf-8'));

  const embedder = createEmbedder(process['env']);
  const questions = evalData.cases.map((c: any) => c.question);
  
  console.log(`Embedding ${questions.length} questions...`);
  const vectors = await embedder.embed(questions);

  const results: EvalResult[] = [];
  const details: any[] = [];

  for (let i = 0; i < evalData.cases.length; i++) {
    const c = evalData.cases[i];
    const topChunks = cosineTopK(vectors[i], index.chunks, 4, 0); // Get top 4 disregarding minScore for evaluation

    const hitIds = topChunks.map(hit => hit.id);
    const scores = topChunks.map(hit => hit.score);

    results.push({
      expected: c.expected,
      hitIds,
      scores,
    });

    let isHit = false;
    if (c.expected !== null) {
      isHit = c.expected.some((exp: string) => hitIds.includes(exp));
    } else {
      // For out of scope, a "hit" means we successfully filtered it out?
      // Actually we just record it.
      isHit = true; // Not strictly used for the table hit/miss visual unless we want
    }

    details.push({
      question: c.question,
      expected: c.expected ? c.expected.join(', ') : 'OUT OF SCOPE',
      top3: topChunks.slice(0, 3).map(hit => `${hit.id} (${hit.score.toFixed(3)})`).join('<br>'),
      hit: c.expected === null ? 'N/A' : (isHit ? '✅' : '❌')
    });
  }

  const metrics = calculateMetrics(results);

  console.log('\n--- Metrics ---');
  console.log(`Hit@1: ${(metrics.inScope.hitAt1 * 100).toFixed(2)}%`);
  console.log(`Hit@4: ${(metrics.inScope.hitAt4 * 100).toFixed(2)}%`);
  console.log(`MRR: ${metrics.inScope.mrr.toFixed(4)}`);
  
  console.log('\nIn-Scope Top-1 Scores:');
  console.log(`  Min: ${metrics.inScope.top1Scores.min.toFixed(4)}`);
  console.log(`  P10: ${metrics.inScope.top1Scores.p10.toFixed(4)}`);
  console.log(`  Median: ${metrics.inScope.top1Scores.median.toFixed(4)}`);
  console.log(`  Max: ${metrics.inScope.top1Scores.max.toFixed(4)}`);

  console.log('\nOut-of-Scope Top-1 Scores:');
  console.log(`  Min: ${metrics.outScope.top1Scores.min.toFixed(4)}`);
  console.log(`  Median: ${metrics.outScope.top1Scores.median.toFixed(4)}`);
  console.log(`  Max: ${metrics.outScope.top1Scores.max.toFixed(4)}`);

  console.log(`\nSuggested minScore: ${metrics.suggestedMinScore.toFixed(4)}`);

  let reportMd = `# RAG Evaluation Report\n\n`;
  reportMd += `## Metrics\n`;
  reportMd += `- Hit@1: ${(metrics.inScope.hitAt1 * 100).toFixed(2)}%\n`;
  reportMd += `- Hit@4: ${(metrics.inScope.hitAt4 * 100).toFixed(2)}%\n`;
  reportMd += `- MRR: ${metrics.inScope.mrr.toFixed(4)}\n`;
  reportMd += `- Suggested minScore: ${metrics.suggestedMinScore.toFixed(4)}\n\n`;
  
  reportMd += `## Cases\n\n`;
  reportMd += `| Question | Expected | Top 3 Hits | Hit |\n`;
  reportMd += `|---|---|---|---|\n`;
  for (const d of details) {
    reportMd += `| ${d.question} | ${d.expected} | ${d.top3} | ${d.hit} |\n`;
  }

  fs.writeFileSync(reportPath, reportMd);
  console.log(`\nReport saved to ${reportPath}`);

  if (metrics.inScope.hitAt4 < 0.85) {
    console.error('Hit@4 is below 0.85. Failing.');
    process.exit(1);
  }
}

evaluate().catch(console.error);
