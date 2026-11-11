import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const noticias = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/noticias' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    excerpt: z.string().optional(),
    category: z.enum(['Capital', 'Política', 'Economía', 'Sociedad', 'Opinión']),
    author: z.string().default('Redacción Punto Cuenca'),
    pubDate: z.coerce.date(),
    image: z.string(),
    imageCaption: z.string().optional(),
    featured: z.boolean().default(false),
    breaking: z.boolean().default(false),
    readTime: z.string().default('4 min'),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = { noticias };
