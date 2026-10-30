import fs from 'node:fs';
import {renderSite} from './editorial/render.mjs';
import {updateSitemap} from './editorial/sitemap.mjs';
const data=JSON.parse(fs.readFileSync('data.json','utf8'));
const bySlug=new Map(data.articles.map(a=>[a.slug,a]));
const selected=(data.selectedSlugs||data.articles.map(a=>a.slug)).map(s=>bySlug.get(s)).filter(Boolean);
const paths=['/','/archivo.html',...fs.readdirSync('temas').filter(f=>f.endsWith('.html')).map(f=>'/temas/'+f),...data.articles.filter(a=>a.summary?.trim()==='Breve').map(a=>'/noticias/'+a.slug+'.html')];
const changed=[];
for(const path of paths){
 const file=path==='/'?'index.html':path.slice(1);
 const html=renderSite({...data,articles:path==='/'?selected:data.articles},path,'https://www.ianoticias.org');
 if(fs.readFileSync(file,'utf8')!==html){fs.writeFileSync(file,html);changed.push(path);}
}
if(changed.length)updateSitemap(changed,new Date().toISOString());
console.log(JSON.stringify({generated:paths.length,changed,articlesPreserved:data.articles.length,edition:data.edition}));
