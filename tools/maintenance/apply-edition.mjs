// A reviewed draft is integrated locally; publication is a separate checked step.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {renderSite} from '../editorial/render.mjs';
import {updateSitemap} from '../editorial/sitemap.mjs';
const file=process.argv[2];assert(file,'A reviewed edition JSON is required');
const draft=JSON.parse(fs.readFileSync(file,'utf8'));
assert.equal(draft.status,'approved_for_publication','Codex must review the draft before integration');
assert(Number.isFinite(Date.parse(draft.approvedAt)),'A genuine approval timestamp is required');
const data=JSON.parse(fs.readFileSync('data.json','utf8'));
const before=new Map(data.articles.map(a=>[a.slug,JSON.stringify(a)]));
const known=new Set(data.articles.map(a=>a.dedup_key??a.slug));
const added=[];
for(const a of draft.articles??[]){
  assert(/^[a-z0-9-]+$/.test(a.slug),'Invalid slug');
  assert(!before.has(a.slug),'Existing articles require a separate explicit correction');
  assert(!known.has(a.dedup_key??a.slug),'Duplicate event');
  for(const k of ['title','summary','source','sourceUrl','date','publishedAt','category','topic','kind','verification'])assert(a[k],'Missing '+k);
  assert.equal(new URL(a.sourceUrl).protocol,'https:','HTTPS primary source required');
  assert(/^\d{4}-\d{2}-\d{2}$/.test(a.date)&&a.date<=draft.approvedAt.slice(0,10),'Invalid or future source date');
  assert(Array.isArray(a.body)&&a.body.length,'Article body is required');
  known.add(a.dedup_key??a.slug);data.articles.unshift(a);added.push(a.slug);
}
assert(added.length||(draft.xSelection?.posts?.length??0)>0,'No reviewed changes to integrate');
data.selectedSlugs=[...added,...(data.selectedSlugs??[])].filter((s,i,a)=>a.indexOf(s)===i);
if(draft.xSelection?.posts?.length){
  const seen=new Set();const posts=[...draft.xSelection.posts,...(data.xPosts??[])].filter(p=>!seen.has(p.url)&&seen.add(p.url));
  for(const p of posts){assert(/^https:\/\/(?:x|twitter)\.com\/[A-Za-z0-9_]+\/status\/\d+/.test(p.url),'Original X URL required');assert(p.name&&p.title&&p.date&&p.checkedAt&&p.access,'Incomplete X evidence');}
  data.xPosts=posts;data.xModule={checkedAt:draft.xSelection.checkedAt,coverage:draft.xSelection.coverage};
}
data.reviewedAt=draft.approvedAt;data.edition=draft.approvedAt;
for(const [slug,bytes] of before)assert.equal(JSON.stringify(data.articles.find(a=>a.slug===slug)),bytes,'Existing article modified: '+slug);
const bySlug=new Map(data.articles.map(a=>[a.slug,a]));
const selected=data.selectedSlugs.map(s=>bySlug.get(s)).filter(Boolean);
const paths=['/','/archivo.html',...fs.readdirSync('temas').filter(f=>f.endsWith('.html')).map(f=>'/temas/'+f),...added.map(s=>'/noticias/'+s+'.html')];
const updates=[];
for(const path of paths){const target=path==='/'?'index.html':path.slice(1);let html=renderSite({...data,articles:path==='/'?selected:data.articles},path,'https://www.ianoticias.org');
  // Retain the existing page shell, social links, video enhancements and metadata.
  if(fs.existsSync(target)&&!path.startsWith('/noticias/')){const original=fs.readFileSync(target,'utf8');const main=html.match(/<main\b[\s\S]*?<\/main>/)?.[0];assert(main,'Missing rendered main');assert(/<main\b[\s\S]*?<\/main>/.test(original),'Missing original main');html=original.replace(/<main\b[\s\S]*?<\/main>/,()=>main);}
  updates.push([target,html]);
}
fs.writeFileSync('data.json',JSON.stringify(data,null,2)+'\n');
if(draft.xSelection?.posts?.length)fs.writeFileSync('tools/editorial/x-posts.json',JSON.stringify(data.xPosts,null,2)+'\n');
fs.writeFileSync('tools/editorial/changed.json',JSON.stringify(added,null,2)+'\n');
for(const [target,html] of updates)fs.writeFileSync(target,html);
updateSitemap(paths,draft.approvedAt);
// Search retains its established object shape and adds only new article entries.
const search=JSON.parse(fs.readFileSync('search.json','utf8'));
const list=Array.isArray(search)?search:search.articles??search.items;
assert(Array.isArray(list),'Unknown search index shape; update deliberately');
for(const slug of added){const a=bySlug.get(slug);if(!list.some(i=>i.url==='/noticias/'+slug+'.html'||i.slug===slug))list.unshift({title:a.title,summary:a.summary,url:'/noticias/'+slug+'.html',category:a.category,topic:a.topic,date:a.date,type:'noticia',source:a.source,slug:a.slug});}
if(!Array.isArray(search))search.generated=draft.approvedAt;
fs.writeFileSync('search.json',JSON.stringify(search,null,2)+'\n');
console.log(JSON.stringify({newArticles:added,preservedArticles:before.size,xPosts:data.xPosts?.length,updatedPages:updates.length}));
