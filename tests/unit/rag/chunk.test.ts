import { describe, it, expect } from 'vitest';
import { chunkMarkdown } from '../../../rag/lib/chunk.ts';

describe('chunkMarkdown', () => {
  it('splits oversized sections respecting code fences', () => {
    let largeContent = '## Big Section\n\nSome text.\n\n```typescript\n';
    for (let i = 0; i < 90; i++) largeContent += `const a${i} = ${i};\n\n`;
    largeContent += '```\n\nMore text.\n';
    for (let i = 0; i < 50; i++) largeContent += `Paragraph ${i}.\n\n`;

    const chunks = chunkMarkdown('file1', largeContent);
    expect(chunks.length).toBeGreaterThan(1);
    for (const c of chunks) {
      expect(c.text.length).toBeLessThanOrEqual(1500);
      const fences = (c.text.match(/^```/gm) || []).length;
      expect(fences % 2).toBe(0);
    }
  });

  it('ignores # title inside code fences', () => {
    const md = '```\n# Not H1\n```\n# Real H1\n## Section\nText';
    const chunks = chunkMarkdown('file1', md);
    expect(chunks[1].title).toBe('Real H1 › Section');
  });

  it('guarantees unique ids for colliding suffixes', () => {
    const md = '# H1\n## Foo\nText 1\n## Foo\nText 2\n## Foo 2\nText 3';
    const chunks = chunkMarkdown('file1', md);
    const ids = chunks.map(c => c.id);
    expect(new Set(ids).size).toBe(3);
    expect(ids).toContain('file1#foo');
    expect(ids).toContain('file1#foo-2');
  });

  it('does not repeat the heading line in the chunk body', () => {
    const md = '# H1\n## Section\nContent here.';
    const chunks = chunkMarkdown('file1', md);
    expect(chunks[0].text).toBe('Content here.');
    expect(chunks[0].text).not.toContain('## Section');
  });
});
