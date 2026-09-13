export type EvalResult = {
  expected: string[] | null; // null means out-of-scope
  hitIds: string[]; // up to 4
  scores: number[]; // up to 4
};

export type Metrics = {
  inScope: {
    count: number;
    hitAt1: number;
    hitAt4: number;
    mrr: number;
    top1Scores: { min: number; median: number; max: number; p10: number };
  };
  outScope: {
    count: number;
    top1Scores: { min: number; median: number; max: number };
  };
  suggestedMinScore: number;
};

export function calculateMetrics(results: EvalResult[]): Metrics {
  const inScope = results.filter(r => r.expected !== null);
  const outScope = results.filter(r => r.expected === null);

  const getPercentile = (sorted: number[], p: number) => {
    if (sorted.length === 0) return 0;
    const index = (sorted.length - 1) * p;
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;
    if (lower === upper) return sorted[lower];
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  };

  const getDistribution = (scores: number[], withP10 = false) => {
    if (scores.length === 0) return withP10 ? { min: 0, median: 0, max: 0, p10: 0 } : { min: 0, median: 0, max: 0 };
    const sorted = [...scores].sort((a, b) => a - b);
    const dist: any = {
      min: sorted[0],
      median: getPercentile(sorted, 0.5),
      max: sorted[sorted.length - 1],
    };
    if (withP10) {
      dist.p10 = getPercentile(sorted, 0.1);
    }
    return dist;
  };

  let hitAt1Count = 0;
  let hitAt4Count = 0;
  let mrrSum = 0;
  const inScopeTop1Scores = [];

  for (const res of inScope) {
    const expected = res.expected!;
    const top1Score = res.scores.length > 0 ? res.scores[0] : 0;
    inScopeTop1Scores.push(top1Score);

    let foundRank = -1;
    for (let i = 0; i < res.hitIds.length; i++) {
      if (expected.includes(res.hitIds[i])) {
        foundRank = i + 1;
        break;
      }
    }

    if (foundRank === 1) hitAt1Count++;
    if (foundRank > 0 && foundRank <= 4) hitAt4Count++;
    if (foundRank > 0) mrrSum += 1 / foundRank;
  }

  const outScopeTop1Scores = outScope.map(res => res.scores.length > 0 ? res.scores[0] : 0);

  const inScopeDist = getDistribution(inScopeTop1Scores, true);
  const outScopeDist = getDistribution(outScopeTop1Scores, false);

  const outScopeMax = outScopeDist.max;
  const inScopeP10 = inScopeDist.p10;
  const suggestedMinScore = (outScopeMax + inScopeP10) / 2;

  return {
    inScope: {
      count: inScope.length,
      hitAt1: inScope.length > 0 ? hitAt1Count / inScope.length : 0,
      hitAt4: inScope.length > 0 ? hitAt4Count / inScope.length : 0,
      mrr: inScope.length > 0 ? mrrSum / inScope.length : 0,
      top1Scores: inScopeDist as any,
    },
    outScope: {
      count: outScope.length,
      top1Scores: outScopeDist as any,
    },
    suggestedMinScore,
  };
}
