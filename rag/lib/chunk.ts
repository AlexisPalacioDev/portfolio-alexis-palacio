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
  
  let inGlobalCodeBlock = false;
  for (const line of lines) {
    if (line.startsWith('```')) {
      inGlobalCodeBlock = !inGlobalCodeBlock;
      continue;
    }
    if (!inGlobalCodeBlock && line.startsWith('# ') && !line.startsWith('##')) {
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
      // Save previous section. We don't include H1 or H2 in the text!
      const text = currentSectionContent.join('\n').trim();
      if (text) {
        sections.push({ title: currentSectionTitle, text });
      }
      
      const h2Title = line.substring(3).trim();
      currentSectionTitle = h1Title ? `${h1Title} › ${h2Title}` : h2Title;
      currentSectionContent = [];
    } else {
      if (!inCodeBlock && line.startsWith("# ") && !line.startsWith("##")) continue;
      currentSectionContent.push(line);
    }
  }
  
  const text = currentSectionContent.join('\n').trim();
  if (text) {
    sections.push({ title: currentSectionTitle, text });
  }

  const chunks: Chunk[] = [];
  const usedIds = new Set<string>();

  for (const section of sections) {
    if (!section.text.trim()) continue;

    const parts = section.title.split(' › ');
    const lastPart = parts[parts.length - 1] || 'section';
    const baseSlug = slugify(lastPart) || 'section';
    
    let count = 1;
    let slug = baseSlug;
    let baseId = `${fileId}#${slug}`;
    while (usedIds.has(baseId)) {
      count++;
      slug = `${baseSlug}-${count}`;
      baseId = `${fileId}#${slug}`;
    }
    usedIds.add(baseId);

    if (section.text.length <= 1500) {
      chunks.push({ id: baseId, title: section.title, text: section.text });
    } else {
      const splitParts = splitTextByParagraphsAndCodeBlocks(section.text, 1400);
      for (let i = 0; i < splitParts.length; i++) {
        const partText = splitParts[i];
        if (!partText.trim()) continue;
        const partId = i === 0 ? baseId : `${baseId}-p${i + 1}`;
        usedIds.add(partId);
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
  let lastCodeFence = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      if (inCodeBlock) lastCodeFence = line;
    }

    const isBlank = line.trim() === '';
    
    if (isBlank && currentLen > 0) {
      let nextParaLen = 0;
      let j = i + 1;
      let nextInCodeBlock = inCodeBlock;
      for (; j < lines.length; j++) {
        if (lines[j].startsWith('```')) nextInCodeBlock = !nextInCodeBlock;
        if (lines[j].trim() === '') break;
        nextParaLen += lines[j].length + 1;
      }
      
      if (currentLen + nextParaLen > maxLen && currentLen > 0) {
        if (inCodeBlock) {
          currentPart.push('```');
        }
        result.push(currentPart.join('\n').trim());
        currentPart = [];
        currentLen = 0;
        if (inCodeBlock) {
          currentPart.push(lastCodeFence);
          currentLen += lastCodeFence.length + 1;
        }
        continue;
      }
    }
    
    currentPart.push(line);
    currentLen += line.length + 1;
  }
  
  if (currentPart.length > 0) {
    const txt = currentPart.join('\n').trim();
    if (txt) result.push(txt);
  }
  
  return result;
}
