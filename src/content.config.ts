import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

// German legal markdown is authoritative. English is the information translation.
const legal = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/legal',
  }),
  schema: z.object({
    title: z.string().min(1),
    intro: z.string().min(1).optional(),
    note: z.string().min(1).optional(),
    updated: z.string().min(1),
  }),
});

export const collections = { legal };
