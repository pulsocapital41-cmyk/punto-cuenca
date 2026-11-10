const SYSTEM_PROMPT = `Eres el Editor General de "Punto Cuenca" (puntocuenca.net), el diario digital de referencia de Cuenca, la provincia del Azuay y el Austro ecuatoriano.
Tu tarea es redactar una nota periodística completa, rigurosa, imparcial y con estilo de gran diario latinoamericano (como El Universo, El Comercio o El País) lista para publicar.

REGLAS ESTRICTAS DE SALIDA:
Devuelve ÚNICAMENTE un objeto JSON válido (sin bloques markdown \`\`\`json, solo el JSON puro) con esta estructura exacta:
{
  "title": "Titular periodístico atractivo, directo y sin punto final (máximo 110 caracteres)",
  "subtitle": "Bajada o sumario informativo de 1 a 2 oraciones que resuma el hecho principal",
  "category": "Capital" | "Política" | "Economía" | "Sociedad" | "Opinión",
  "author": "Redacción Punto Cuenca",
  "readTime": "4 min",
  "imageCaption": "Pie de foto descriptivo y periodístico. / Foto: Punto Cuenca",
  "body": "Cuerpo completo de la noticia en formato Markdown. Mínimo 4 párrafos bien estructurados, usando subtítulos (## ), citas textuales si las hay y datos clave en negritas (**texto**). No incluyas el título principal dentro del body."
}`;

function extractTagContent(html: string, regex: RegExp): string {
  const match = html.match(regex);
  return match && match[1] ? match[1].trim() : '';
}

async function scrapeArticleUrl(targetUrl: string) {
  let html = '';

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      html = await res.text();
    }
  } catch (_) {
    // Fallback to AllOrigins proxy if blocked
  }

  if (!html) {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error('No se pudo acceder a la URL proporcionada.');
    const data = await res.json();
    html = data.contents || '';
  }

  if (!html) {
    throw new Error('El sitio web bloqueó la lectura automática. Copia y pega el texto en la pestaña "Pegar Boletín / Texto".');
  }

  const ogTitle =
    extractTagContent(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
    extractTagContent(html, /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i) ||
    extractTagContent(html, /<title[^>]*>([^<]+)<\/title>/i);

  const ogDesc =
    extractTagContent(html, /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
    extractTagContent(html, /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i) ||
    extractTagContent(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);

  const ogImage =
    extractTagContent(html, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
    extractTagContent(html, /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ||
    extractTagContent(html, /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);

  const paragraphMatches = Array.from(html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi));
  const paragraphs = paragraphMatches
    .map((m) =>
      m[1]
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim()
    )
    .filter((text) => text.length > 45);

  const extractedText = `TÍTULO ORIGINAL: ${ogTitle}\nDESCRIPCIÓN: ${ogDesc}\n\nCONTENIDO EXTRAÍDO:\n${paragraphs.slice(0, 28).join('\n\n')}`;

  if (extractedText.length < 100) {
    throw new Error('No se encontró suficiente texto legible en ese enlace. Intenta con la pestaña "Pegar Boletín / Texto".');
  }

  let resolvedImage = ogImage;
  if (resolvedImage && resolvedImage.startsWith('/')) {
    try {
      const u = new URL(targetUrl);
      resolvedImage = `${u.origin}${resolvedImage}`;
    } catch (_) {}
  }

  return { text: extractedText, image: resolvedImage };
}

export default async (req: Request, context: any) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers });
  }

  const clientContext = context?.clientContext;
  const authHeader = req.headers.get('authorization') || '';
  if (!clientContext?.user && !authHeader.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ error: 'No autorizado. Debes iniciar sesión en el panel editorial (/admin).' }),
      { status: 401, headers }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'GEMINI_API_KEY no está configurada en las variables de entorno del servidor (Netlify).' }),
      { status: 500, headers }
    );
  }

  try {
    const payload = await req.json();
    const { mode, url, rawText, instructions } = payload || {};

    let sourceContent = '';
    let scrapedImage = '';

    if (mode === 'url') {
      if (!url || typeof url !== 'string') {
        return new Response(JSON.stringify({ error: 'Debes proporcionar una URL válida.' }), { status: 400, headers });
      }
      const scraped = await scrapeArticleUrl(url.trim());
      sourceContent = scraped.text;
      scrapedImage = scraped.image;
    } else if (mode === 'text') {
      if (!rawText || typeof rawText !== 'string' || rawText.trim().length < 20) {
        return new Response(JSON.stringify({ error: 'El texto o boletín proporcionado es demasiado corto.' }), { status: 400, headers });
      }
      sourceContent = rawText.trim();
    } else {
      return new Response(JSON.stringify({ error: 'Modo inválido. Usa "url" o "text".' }), { status: 400, headers });
    }

    const userPrompt = `${SYSTEM_PROMPT}\n\n${
      instructions ? `ENFOQUE EDITORIAL SOLICITADO POR EL DIRECTOR: ${instructions}\n\n` : ''
    }FUENTE / BOLETÍN / TEXTO BASE:\n${sourceContent.slice(0, 18000)}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.4,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!geminiRes.ok) {
      const errData = await geminiRes.json().catch(() => ({}));
      const msg = errData?.error?.message || `Error HTTP ${geminiRes.status} al conectar con Gemini API`;
      return new Response(JSON.stringify({ error: msg }), { status: 502, headers });
    }

    const data = await geminiRes.json();
    const rawJsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!rawJsonText) {
      return new Response(JSON.stringify({ error: 'Gemini no devolvió contenido. Intenta nuevamente.' }), { status: 502, headers });
    }

    const cleaned = rawJsonText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(cleaned);

    return new Response(
      JSON.stringify({
        draft: parsed,
        scrapedImage: scrapedImage || '',
      }),
      { status: 200, headers }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || 'Error interno al procesar la nota con IA.' }),
      { status: 500, headers }
    );
  }
};
