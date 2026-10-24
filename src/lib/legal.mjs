import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { languages, legalPages } from '../config.mjs';

const splitHeadingId = (value) => {
  const idMatch = /^(.*) \{#([A-Za-z0-9-]+)\}$/.exec(value.trim());
  return idMatch ? { text: idMatch[1], id: idMatch[2] } : { text: value.trim() };
};

const withId = (block, id) => (id ? { ...block, id } : block);

export const parseLegalBody = (body) =>
  body
    .trim()
    .split(/^## (?!#)/m)
    .filter(Boolean)
    .map((chunk) => {
      const breakAt = chunk.indexOf('\n');
      const heading = splitHeadingId(breakAt === -1 ? chunk : chunk.slice(0, breakAt));
      const rest = breakAt === -1 ? '' : chunk.slice(breakAt + 1).trim();
      const blocks = rest
        ? rest
            .split(/\n{2,}/)
            .map((chunk) => chunk.trim())
            .filter(Boolean)
            .map((chunk) => {
              const subheading = /^### ([^\n]+)$/.exec(chunk);
              if (!subheading) return { type: 'p', text: chunk };
              const parsed = splitHeadingId(subheading[1]);
              return withId({ type: 'h3', text: parsed.text }, parsed.id);
            })
        : [];
      return withId({ title: heading.text, blocks }, heading.id);
    });

export const parseLegalDocument = (source) => {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(source);
  if (!match) throw new Error('Legal markdown is missing frontmatter');
  const data = {};
  for (const line of match[1].split('\n')) {
    if (!line.trim()) continue;
    const field = /^([A-Za-z]+): (.*)$/.exec(line);
    if (!field) throw new Error(`Invalid legal frontmatter: ${line}`);
    data[field[1]] = JSON.parse(field[2]);
  }
  for (const key of ['title', 'updated']) {
    if (typeof data[key] !== 'string' || data[key].trim() === '')
      throw new Error(`Missing legal ${key}`);
  }
  if (data.intro != null && (typeof data.intro !== 'string' || data.intro.trim() === ''))
    throw new Error('Missing legal intro');
  if (data.note != null && (typeof data.note !== 'string' || data.note.trim() === ''))
    throw new Error('Missing legal note');
  return {
    title: data.title,
    ...(typeof data.intro === 'string' ? { intro: data.intro } : {}),
    ...(typeof data.note === 'string' ? { note: data.note } : {}),
    updated: data.updated,
    sections: parseLegalBody(match[2]),
  };
};

export const loadLegal = async () => {
  const documents = {};
  for (const lang of languages) {
    documents[lang] = {};
    for (const kind of legalPages) {
      const source = await readFile(
        resolve(process.cwd(), 'src/content/legal', lang, `${kind}.md`),
        'utf8',
      );
      documents[lang][kind] = parseLegalDocument(source);
    }
  }
  return documents;
};
