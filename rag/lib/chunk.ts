export type Chunk = {
  id: string;
  title: string;
  text: string;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function chunkMarkdown(fileId: string, markdown: string): Chunk[] {
  const lines = markdown.split('\n');
  let h1Title = '';
  
  // Find first H1
  for (const line of lines) {
    if (line.startsWith('# ') && !line.startsWith('##')) {
      h1Title = line.substring(2).trim();
      break;
    }
  }

  const sections: { title: string; text: string }[] = [];
  let currentSectionTitle = h1Title;
  let currentSectionContent: string[] = [];
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
    }

    if (!inCodeBlock && line.startsWith('## ')) {
      // Save previous section
      const text = currentSectionContent.join('\n').trim();
      if (text) {
        sections.push({ title: currentSectionTitle, text });
      }
      
      const h2Title = line.substring(3).trim();
      currentSectionTitle = h1Title ? `${h1Title} › ${h2Title}` : h2Title;
      currentSectionContent = [line];
    } else {
      currentSectionContent.push(line);
    }
  }
  
  const text = currentSectionContent.join('\n').trim();
  if (text) {
    sections.push({ title: currentSectionTitle, text });
  }

  const chunks: Chunk[] = [];
  const slugCounts = new Map<string, number>();

  for (const section of sections) {
    // Determine if it's empty. If it only contains the heading, it's empty.
    const textWithoutHeading = section.text.replace(/^#+ .*\n?/g, '').trim();
    if (!textWithoutHeading) {
      continue;
    }

    // Determine base slug
    const parts = section.title.split(' › ');
    const lastPart = parts[parts.length - 1] || 'section';
    const baseSlug = slugify(lastPart) || 'section';
    
    let count = slugCounts.get(baseSlug) || 1;
    let slug = baseSlug;
    if (count > 1) {
      slug = `${baseSlug}-${count}`;
    }
    slugCounts.set(baseSlug, count + 1);

    const baseId = `${fileId}#${slug}`;

    if (section.text.length <= 1500) {
      chunks.push({ id: baseId, title: section.title, text: section.text });
    } else {
      // Need to split
      const parts = splitTextByParagraphsAndCodeBlocks(section.text, 1500);
      for (let i = 0; i < parts.length; i++) {
        const partText = parts[i];
        if (!partText.trim()) continue;
        const partId = i === 0 ? baseId : `${baseId}-p${i + 1}`;
        chunks.push({ id: partId, title: section.title, text: partText });
      }
    }
  }

  return chunks;
}

function splitTextByParagraphsAndCodeBlocks(text: string, maxLen: number): string[] {
  const lines = text.split('\n');
  const result: string[] = [];
  let currentPart: string[] = [];
  let currentLen = 0;
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
    }

    const isBlank = line.trim() === '';
    
    // If not in code block and it's a paragraph boundary (blank line)
    // and current part + next paragraph > maxLen, start a new part
    // but at least keep one paragraph in the part if it's already > maxLen
    
    if (!inCodeBlock && isBlank && currentLen > 0) {
      // Look ahead to see next paragraph length
      let nextParaLen = 0;
      let j = i + 1;
      let nextInCodeBlock = inCodeBlock;
      for (; j < lines.length; j++) {
        if (lines[j].startsWith('```')) nextInCodeBlock = !nextInCodeBlock;
        if (!nextInCodeBlock && lines[j].trim() === '') break;
        nextParaLen += lines[j].length + 1; // +1 for newline
      }
      
      if (currentLen + nextParaLen > maxLen && currentLen > 0) {
        result.push(currentPart.join('\n').trim());
        currentPart = [];
        currentLen = 0;
        continue;
      }
    }
    
    currentPart.push(line);
    currentLen += line.length + 1;
  }
  
  if (currentPart.length > 0) {
    const txt = currentPart.join('\n').trim();
    if (txt) {
      result.push(txt);
    }
  }
  
  return result;
}
