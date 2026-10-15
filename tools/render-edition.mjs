import fs from 'node:fs';
import {renderSite} from './editorial/render.mjs';
import {articleArt} from './editorial/article-art.ts';
const data=JSON.parse(fs.readFileSync('data.json','utf8'));
const changed=JSON.parse(fs.readFileSync('tools/editorial/changed.json','utf8'));
const bySlug=new Map(data.articles.map(a=>[a.slug,a]));
const selected=(data.selectedSlugs||data.articles.map(a=>a.slug)).map(s=>bySlug.get(s)).filter(Boolean);
const paths=['/','/archivo.html',...fs.readdirSync('temas').filter(f=>f.endsWith('.html')).map(f=>'/temas/'+f),...changed.map(s=>'/noticias/'+s+'.html')];
for(const path of paths){let view={...data,articles:path==='/'?selected:data.articles};let target=path==='/'?'index.html':path.slice(1);fs.writeFileSync(target,renderSite(view,path,'https://www.ianoticias.org'));}
for(const slug of changed)fs.writeFileSync('ilustraciones/'+slug+'.svg',articleArt(bySlug.get(slug)));
let xml=fs.readFileSync('sitemap.xml','utf8');for(const slug of changed){const url='https://www.ianoticias.org/noticias/'+slug+'.html';if(!xml.includes(url))xml=xml.replace('</urlset>','<url><loc>'+url+'</loc><lastmod>'+data.reviewedAt+'</lastmod></url></urlset>');}fs.writeFileSync('sitemap.xml',xml);
console.log('Rendered',paths.length,'pages;',changed.length,'new/corrected articles');
