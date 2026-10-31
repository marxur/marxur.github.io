import fs from 'node:fs';
const data=JSON.parse(fs.readFileSync('data.json','utf8'));
const active=new Set(data.articles.map(a=>a.slug));
const withdrawn=[];const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
for(const file of fs.readdirSync('noticias').filter(f=>f.endsWith('.html'))){
 if(active.has(file.slice(0,-5)))continue;
 const path='noticias/'+file;let html=fs.readFileSync(path,'utf8');
 if(!html.includes('Seguimiento cerrado el 22 de octubre de 2026.'))continue;
 if(!/<meta name="robots" content="[^"]+">/.test(html))throw Error('Robots metadata missing: '+path);
 html=html.replace(/<meta name="robots" content="[^"]+">/,'<meta name="robots" content="noindex,follow">');
 html=html.replace(/(<title>|<h1\b[^>]*>)En seguimiento:/g,'$1Seguimiento cerrado:');
 html=html.replace(/(<meta property="og:title" content=")En seguimiento:/g,'$1Seguimiento cerrado:');
 fs.writeFileSync(path,html);withdrawn.push('https://www.ianoticias.org/'+path);
}
let sitemap=fs.readFileSync('sitemap.xml','utf8');
const excluded=new Set(withdrawn);
sitemap=sitemap.replace(/\s*<url>\s*<loc>([^<]+)<\/loc>[\s\S]*?<\/url>/g,(entry,url)=>excluded.has(url)?'':entry);
fs.writeFileSync('sitemap.xml',sitemap);
const historicalPath='noticias/rumores-claude-fable-5-5-gemini-4-carbon-grok-4-8.html';
if(fs.existsSync(historicalPath)){
 let html=fs.readFileSync(historicalPath,'utf8');
 const published=html.match(/"datePublished"\s*:\s*"([^"]+)"/)?.[1];
 const related=data.articles.filter(a=>a.verification!=='pending'&&/Carbon|Fable|Grok/i.test(a.title)&&a.date>'2026-10-17').sort((a,b)=>b.date.localeCompare(a.date)).slice(0,4);
 const note='<aside id="historical-context" class="caveat-box"><h2>Artículo de archivo</h2><p>Este texto recoge rumores y referencias de su fecha original. Las menciones a «hoy» o a la disponibilidad de los modelos deben leerse en ese contexto; no describen por sí solas el estado actual.</p>'+(related.length?'<h3>Lecturas posteriores relacionadas</h3><ul>'+related.map(a=>'<li><a href="/noticias/'+esc(a.slug)+'.html">'+esc(a.title)+'</a></li>').join('')+'</ul>':'')+'</aside>';
 html=html.replace(/<aside id="historical-context"[\s\S]*?<\/aside>/,'');
 if(!html.includes('<div class="article-content">'))throw Error('Historical article content missing');
 html=html.replace('<div class="article-content">','<div class="article-content">'+note);
 fs.writeFileSync(historicalPath,html);
 console.log(JSON.stringify({historical:historicalPath,published,followUps:related.map(a=>a.slug)}));
}
console.log(JSON.stringify({closedPages:withdrawn.length,excludedFromSitemap:withdrawn,pagesPreserved:true}));
// Adjust existing collection pages without rebuilding the newspaper home or its author portrait.
for(const path of ['archivo.html',...fs.readdirSync('temas').filter(f=>f.endsWith('.html')).map(f=>'temas/'+f)]){
 let html=fs.readFileSync(path,'utf8');
 if(!html.includes('id="lecturas-tema"'))html=html.replace('<div class="story-grid">','<h2 id="lecturas-tema">Lecturas de esta sección</h2><div class="story-grid">');
 if(path==='archivo.html'&&!html.includes('id="contexto-historico"'))html=html.replace('</main>','<section id="contexto-historico"><h2>Contexto histórico</h2><p>Las piezas de archivo conservan el contexto de su publicación. Las referencias a la disponibilidad de modelos deben contrastarse con las noticias posteriores.</p><p><a href="/noticias/rumores-claude-fable-5-5-gemini-4-carbon-grok-4-8.html">Fable 5.5, Gemini 4 Carbon y Grok 4.8: registro histórico de rumores</a></p></section></main>');
 fs.writeFileSync(path,html);
}
