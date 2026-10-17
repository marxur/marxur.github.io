import fs from 'node:fs';

// Preserve dates for unchanged pages and add every newly published article.
export function updateSitemap(paths, modifiedAt) {
  const origin = 'https://www.ianoticias.org';
  const xml = fs.readFileSync('sitemap.xml', 'utf8');
  const entries = new Map();
  for (const match of xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>([\s\S]*?)<\/url>/g)) {
    entries.set(match[1], match[2].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1]);
  }
  for (const path of paths) entries.set(origin + path, modifiedAt);
  const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
  for (const article of data.articles) {
    const url = `${origin}/noticias/${article.slug}.html`;
    if (!entries.has(url)) entries.set(url, article.modifiedAt ?? article.publishedAt);
  }
  for (const [url, date] of entries) {
    if (!date || Number.isNaN(Date.parse(date))) throw new Error(`Missing real modification date: ${url}`);
  }
  fs.writeFileSync('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    [...entries].map(([url, date]) => `  <url><loc>${url}</loc><lastmod>${date}</lastmod></url>`).join('\n') + '\n</urlset>\n');
}
