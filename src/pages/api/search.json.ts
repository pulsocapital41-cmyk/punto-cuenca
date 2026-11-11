import { getCollection } from 'astro:content';

export async function GET() {
  const articles = await getCollection('noticias');

  const searchIndex = articles
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .map((item) => ({
      slug: item.id,
      title: item.data.title,
      subtitle: item.data.subtitle || item.data.excerpt || '',
      category: item.data.category,
      author: item.data.author,
      pubDate: item.data.pubDate.toLocaleDateString('es-EC', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    }));

  return new Response(JSON.stringify(searchIndex), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
