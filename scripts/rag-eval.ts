import fs from 'node:fs';
import path from 'node:path';
import { createEmbedder } from '../rag/lib/embeddings.ts';
import { cosineTopK } from '../rag/lib/vector.ts';
import { retrieve } from '../rag/lib/retrieve.ts';
import { calculateMetrics } from '../rag/lib/metrics.ts';
import type { EvalResult } from '../rag/lib/metrics.ts';

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

  const embedder = createEmbedder(process.env);
  const questions = evalData.cases.map((c: any) => c.question);
  
  console.log(`Embedding ${questions.length} questions...`);
  const vectors = await embedder.embed(questions);

  const resultsVector: EvalResult[] = [];
  const resultsHybrid: EvalResult[] = [];
  const details: any[] = [];

  for (let i = 0; i < evalData.cases.length; i++) {
    const c = evalData.cases[i];
    
    // Vector only
    const topVector = cosineTopK(vectors[i], index.chunks, 4, -Infinity);
    resultsVector.push({
      expected: c.expected,
      hitIds: topVector.map(hit => hit.id),
      scores: topVector.map(hit => hit.score),
    });

    // Hybrid
    const topHybrid = retrieve(index, vectors[i], c.question, { skipGate: true });
    const hitIdsHybrid = topHybrid.map(hit => hit.id);
    resultsHybrid.push({
      expected: c.expected,
      hitIds: hitIdsHybrid,
      scores: topHybrid.map(hit => hit.score),
    });

    let isHit = false;
    if (c.expected !== null) {
      isHit = c.expected.some((exp: string) => hitIdsHybrid.includes(exp));
    } else {
      isHit = true;
    }

    details.push({
      question: c.question,
      expected: c.expected ? c.expected.join(', ') : 'OUT OF SCOPE',
      top3Vector: topVector.slice(0, 3).map(hit => `${hit.id}`).join('<br>'),
      top3Hybrid: topHybrid.slice(0, 3).map(hit => `${hit.id}`).join('<br>'),
      hit: c.expected === null ? 'N/A' : (isHit ? '✅' : '❌')
    });
  }

  const metricsVector = calculateMetrics(resultsVector);
  const metricsHybrid = calculateMetrics(resultsHybrid);

  console.log("\n--- Sensitive Cases ---");
  for (const c of evalData.sensitive || []) {
    console.log(`- ${c.question}`);
  }


  console.log('\n--- Metrics (Vector vs Hybrid) ---');
  console.log(`Hit@1: ${(metricsVector.inScope.hitAt1 * 100).toFixed(2)}% vs ${(metricsHybrid.inScope.hitAt1 * 100).toFixed(2)}%`);
  console.log(`Hit@4: ${(metricsVector.inScope.hitAt4 * 100).toFixed(2)}% vs ${(metricsHybrid.inScope.hitAt4 * 100).toFixed(2)}%`);
  console.log(`MRR: ${metricsVector.inScope.mrr.toFixed(4)} vs ${metricsHybrid.inScope.mrr.toFixed(4)}`);

  let reportMd = `# RAG Evaluation Report\n\n`;
  reportMd += `## Metrics (Vector vs Hybrid)\n`;
  reportMd += `- Hit@1: ${(metricsVector.inScope.hitAt1 * 100).toFixed(2)}% | ${(metricsHybrid.inScope.hitAt1 * 100).toFixed(2)}%\n`;
  reportMd += `- Hit@4: ${(metricsVector.inScope.hitAt4 * 100).toFixed(2)}% | ${(metricsHybrid.inScope.hitAt4 * 100).toFixed(2)}%\n`;
  reportMd += `- MRR: ${metricsVector.inScope.mrr.toFixed(4)} | ${metricsHybrid.inScope.mrr.toFixed(4)}\n\n`;
  
  reportMd += `## Cases (Hybrid)\n\n`;
  reportMd += `| Question | Expected | Top 3 Vector | Top 3 Hybrid | Hit |\n`;
  reportMd += `|---|---|---|---|---|\n`;
  for (const d of details) {
    reportMd += `| ${d.question.replace(/\|/g, "\\|")} | ${d.expected.replace(/\|/g, "\\|")} | ${d.top3Vector.replace(/\|/g, "\\|")} | ${d.top3Hybrid.replace(/\|/g, "\\|")} | ${d.hit} |\n`;
  }

  fs.writeFileSync(reportPath, reportMd);
  console.log(`\nReport saved to ${reportPath}`);

  if (metricsHybrid.inScope.hitAt4 < 0.85) {
    console.error('Hybrid Hit@4 is below 0.85. Failing.');
    process.exit(1);
  }
}

evaluate().catch(e => { console.error(e); process.exit(1); });
