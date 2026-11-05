import {newsImage} from './news-visuals.mjs';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date = value => new Intl.DateTimeFormat('es-ES', {day:'numeric',month:'short',year:'numeric',timeZone:'Europe/Madrid'}).format(new Date(value+'T12:00:00Z'));

export function renderMosaic(articles) {
  const items = articles.filter(a => a.kind !== 'rumor' && a.verification !== 'pending' && newsImage(a)).slice(0, 15);
  if (!items.length) return '';
  return `<section class="ia-mosaic" id="muro-ia" aria-labelledby="mosaic-title">
    <div class="mosaic-heading"><div><p class="mosaic-kicker">EXPLORA LA ACTUALIDAD</p><h2 id="mosaic-title">La IA, <em>de un vistazo.</em></h2><p>Un muro de ideas, avances y preguntas. Recorre las imágenes y pulsa para leer la noticia.</p></div><div class="mosaic-guide"><span class="mosaic-count">${String(items.length).padStart(2,'0')}</span><span>historias con contexto<br><span class="mosaic-hint">Pasa el ratón para ampliar ↗</span></span></div></div>
    <div class="mosaic-wall" aria-label="Muro visual de noticias">${items.map((a, i) => {
      const image = newsImage(a);
      return `<article class="mosaic-tile mosaic-shape-${i%5}" style="--tile-index:${i}"><a class="mosaic-open" href="/noticias/${esc(a.slug)}.html" data-mosaic-item data-source="${esc(a.source)}" data-source-url="${esc(a.sourceUrl)}"><img src="${esc(image)}" alt="" width="800" height="460" loading="lazy" decoding="async"><span class="mosaic-tile-top"><span>${esc(a.topic)}</span><span class="mosaic-expand" aria-hidden="true">↗</span></span><div class="mosaic-tile-caption"><span class="mosaic-date"><time datetime="${esc(a.date)}">${esc(date(a.date))}</time></span><h3>${esc(a.title)}</h3></div><p class="mosaic-summary" hidden>${esc(a.summary)}</p></a></article>`;
    }).join('')}</div>
    <div class="mosaic-foot"><span>Ilustraciones generadas con IA · Fechas de las fuentes originales</span><a href="/archivo.html">Todas las noticias, en el archivo ↗</a></div>
  </section>`;
}
