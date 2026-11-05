// Rebuild only the homepage, preserving the recorded edition and every article.
import fs from 'node:fs';
import {renderMosaic} from './editorial/mosaic.mjs';
const data = JSON.parse(fs.readFileSync('data.json','utf8'));
const bySlug = new Map(data.articles.map(a => [a.slug,a]));
const articles = (data.selectedSlugs ?? data.articles.map(a => a.slug)).map(slug => bySlug.get(slug)).filter(Boolean);
const latest = articles.filter(a => a.kind !== 'guide' && a.verification !== 'pending').sort((a,b) => b.date.localeCompare(a.date));
const mosaic = renderMosaic(latest);
let html = fs.readFileSync('index.html','utf8');
if (html.includes('id="muro-ia"')) html = html.replace(/<section class="ia-mosaic"[\s\S]*?<\/section>/, () => mosaic);
else {
  const anchor = '</div><div class="wrap"><section class="news-briefing"';
  if (!html.includes(anchor)) throw new Error('Homepage insertion point not found');
  html = html.replace(anchor, '</div>'+mosaic+'<div class="wrap"><section class="news-briefing"');
}
if (!html.includes('href="/mosaico.css?v=20261105-3"')) html = html.replace('</head>', '<link rel="stylesheet" href="/mosaico.css?v=20261105-3"><script defer src="/mosaico.js?v=20261105-3"></script></head>');
if (!html.includes('class="mosaic-entry"')) html = html.replace('Actualidad, herramientas y contexto en español.</p>', 'Actualidad, herramientas y contexto en español.</p><a class="mosaic-entry" href="#muro-ia">Explorar el muro visual <span aria-hidden="true">↗</span></a>');
fs.writeFileSync('index.html', html);
console.log('Homepage rebuilt; article data and review date preserved.');
