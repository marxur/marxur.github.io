// Update imagery in existing HTML while preserving published text and metadata.
import fs from 'node:fs';
import path from 'node:path';
import {newsImage} from './editorial/news-visuals.mjs';
const data=JSON.parse(fs.readFileSync('data.json','utf8'));
const articles=new Map(data.articles.map(a=>[a.slug,a]));
let pages=0,images=0;
function replacePicture(fragment,article) {
  if(!article)return fragment;
  return fragment.replace(/(<img\b[^>]*\bsrc=")[^"]+("[^>]*>)/,(_,start,end)=>{
    images++; return start+newsImage(article)+end.replace(' style="object-fit:contain"','');
  });
}
function walk(folder) {
  for(const entry of fs.readdirSync(folder,{withFileTypes:true})) {
    if(['.git','node_modules','tools','.github','docs'].includes(entry.name))continue;
    const file=path.join(folder,entry.name);
    if(entry.isDirectory()){walk(file);continue;}
    if(!file.endsWith('.html'))continue;
    const before=fs.readFileSync(file,'utf8');let html=before;
    html=html.replace(/<article class="story-card"[\s\S]*?<\/article>/g,card=>{
      const slug=card.match(/data-slug="([^"]+)"/)?.[1];return replacePicture(card,articles.get(slug));
    });
    html=html.replace(/<article class="featured">[\s\S]*?<\/article>/g,feature=>{
      const slug=feature.match(/href="\/noticias\/([^"/]+)\.html"/)?.[1];return replacePicture(feature,articles.get(slug));
    });
    const article=folder.replaceAll('\\','/').endsWith('noticias')?articles.get(path.basename(file,'.html')):null;
    if(article) {
      html=html.replace(/<div class="article-cover">[\s\S]*?<\/div>/,cover=>replacePicture(cover,article));
      html=html.replace(/(<meta property="og:image" content=")[^"]+("\s*\/?>)/,`$1https://www.ianoticias.org${newsImage(article)}$2`);
      html=html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,(tag,json)=>{
        const value=JSON.parse(json);
        if(['Article','NewsArticle'].includes(value['@type']))value.image='https://www.ianoticias.org'+newsImage(article);
        return '<script type="application/ld+json">'+JSON.stringify(value).replace(/</g,'\\u003c')+'</script>';
      });
    }
    if(html!==before){fs.writeFileSync(file,html);pages++;}
  }
}
walk('.');
console.log(JSON.stringify({pages,images,articles:data.articles.length}));
