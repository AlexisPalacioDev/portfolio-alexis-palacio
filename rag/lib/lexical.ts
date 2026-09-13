export type BM25Chunk = {
  id: string;
  tokens: string[];
  docLength: number;
};

export class BM25 {
  private chunks: BM25Chunk[] = [];
  private avgDocLength = 0;
  private df = new Map<string, number>();
  private numDocs = 0;
  private k1 = 1.2;
  private b = 0.75;

  constructor(chunks: { id: string; title: string; text: string }[]) {
    this.numDocs = chunks.length;
    let totalLen = 0;
    
    for (const chunk of chunks) {
      const tokens = tokenize(`${chunk.title} ${chunk.text}`);
      this.chunks.push({
        id: chunk.id,
        tokens,
        docLength: tokens.length
      });
      totalLen += tokens.length;
      
      const uniqueTokens = new Set(tokens);
      for (const t of uniqueTokens) {
        this.df.set(t, (this.df.get(t) || 0) + 1);
      }
    }
    
    this.avgDocLength = this.numDocs > 0 ? totalLen / this.numDocs : 0;
  }

  score(query: string): { id: string; score: number }[] {
    const qTokens = tokenize(query);
    const results = this.chunks.map(chunk => {
      let docScore = 0;
      
      const tfMap = new Map<string, number>();
      for (const t of chunk.tokens) {
        tfMap.set(t, (tfMap.get(t) || 0) + 1);
      }

      for (const qt of qTokens) {
        const tf = tfMap.get(qt) || 0;
        if (tf === 0) continue;
        
        const df = this.df.get(qt) || 0;
        if (df === 0) continue;

        // IDF
        const idf = Math.log(1 + (this.numDocs - df + 0.5) / (df + 0.5));
        
        // TF normalization
        const term = (tf * (this.k1 + 1)) / (tf + this.k1 * (1 - this.b + this.b * (chunk.docLength / this.avgDocLength)));
        
        docScore += idf * term;
      }

      return { id: chunk.id, score: docScore };
    });

    return results.sort((a, b) => b.score - a.score);
  }
}

const STOPWORDS = new Set([
  // ES
  'el','la','los','las','un','una','unos','unas','y','o','pero','si','no','en','por','con','de','del','al','para',
  'como','que','cual','cuales','quien','donde','cuando','cuanto','cuantos','cuantas','porque','es','su','sus','tu','mi','te','me','se',
  'le','lo','les','ha','han','hay','ser','esta','este','esto','sobre','muy','mas','ya','hoy','sabe','tiene','hace','hizo','puede',
  // EN
  'the','a','an','and','or','but','if','not','in','by','with','of','to','for','as','that','which','who','where',
  'when','how','because','is','are','was','were','it','its','my','your','his','her','their',
  'what','whats','does','do','did','has','have','had','he','she','him','be','been','can','could','would','should',
  'will','about','on','at','from','this','these','those','there','any','some','today','tell','me','like','know'
]);

export function tokenize(text: string): string[] {
  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
    
  const tokens = normalized.split(/[^a-z0-9]+/);
  
  return tokens.filter(t => t.length >= 2 && !STOPWORDS.has(t));
}
