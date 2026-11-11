import { getCollection } from 'astro:content';

export async function GET() {
  const noticias = (await getCollection('noticias')).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );

  const itemsXml = noticias
    .map(
      (post) => `
    <item>
      <title><![CDATA[${post.data.title}]]></title>
      <link>https://puntocuenca.net/noticias/${post.id}/</link>
      <guid isPermaLink="true">https://puntocuenca.net/noticias/${post.id}/</guid>
      <description><![CDATA[${post.data.subtitle || post.data.excerpt || ''}]]></description>
      <category><![CDATA[${post.data.category === 'Capital' ? 'Cuenca' : post.data.category}]]></category>
      <pubDate>${post.data.pubDate.toUTCString()}</pubDate>
    </item>`
    )
    .join('');

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Punto Cuenca — La información en su punto</title>
    <description>Periodismo independiente desde Cuenca, Azuay y el Austro ecuatoriano.</description>
    <link>https://puntocuenca.net</link>
    <language>es-ec</language>
    <atom:link href="https://puntocuenca.net/rss.xml" rel="self" type="application/rss+xml"/>
    ${itemsXml}
  </channel>
</rss>`;

  return new Response(rssXml.trim(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
