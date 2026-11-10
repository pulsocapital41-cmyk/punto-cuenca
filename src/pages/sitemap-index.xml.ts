import { getCollection } from 'astro:content';

export async function GET() {
  const noticias = await getCollection('noticias');
  const categories = ['capital', 'politica', 'economia', 'sociedad', 'opinion'];

  const urls = [
    `<url><loc>https://puntocuenca.net/</loc><changefreq>hourly</changefreq><priority>1.0</priority></url>`,
    ...categories.map(
      (cat) =>
        `<url><loc>https://puntocuenca.net/categoria/${cat}/</loc><changefreq>daily</changefreq><priority>0.8</priority></url>`
    ),
    ...noticias.map(
      (post) =>
        `<url><loc>https://puntocuenca.net/noticias/${post.id}/</loc><lastmod>${post.data.pubDate.toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>`
    ),
  ].join('\n  ');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
</urlset>`;

  return new Response(xml.trim(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
