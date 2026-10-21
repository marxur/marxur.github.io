// Usage: node tools/update-x-module.mjs /path/to/reviewed-x-selection.json
// Input: {posts: [...], checkedAt: ISO timestamp, coverage: string}
// Source discovery and evidence review happen before this deterministic step.
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {renderSite} from './editorial/render.mjs';
const selection=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
if(!Array.isArray(selection.posts)||!selection.posts.length)throw new Error('Keep the current selection when no usable posts were found.');
if(!Number.isFinite(Date.parse(selection.checkedAt)))throw new Error('A real review timestamp is required.');
const reviewDate=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Madrid',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(selection.checkedAt));
const ids=new Set();
for(const p of selection.posts){
  for(const key of ['name','handle','title','summary','url','date','type','access','checkedAt'])if(!p[key])throw new Error('Missing '+key);
  const url=new URL(p.url);
  if(!['x.com','twitter.com'].includes(url.hostname)||!/^\/[A-Za-z0-9_]+\/status\/\d+(?:\/.*)?$/.test(url.pathname))throw new Error('An original post URL is required.');
  const id=url.pathname.match(/\/status\/(\d+)/)[1];
  if(ids.has(id))throw new Error('Duplicate post '+id);ids.add(id);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(p.date)||p.date>reviewDate)throw new Error('Invalid post date.');
}
const data=JSON.parse(fs.readFileSync('data.json','utf8'));
data.xPosts=selection.posts;
data.xModule={checkedAt:selection.checkedAt,coverage:selection.coverage||'Selección parcial; no cronologías completas.'};
fs.writeFileSync('data.json',JSON.stringify(data,null,2)+'\n');
fs.writeFileSync('tools/editorial/x-posts.json',JSON.stringify(selection.posts,null,2)+'\n');
const bySlug=new Map(data.articles.map(a=>[a.slug,a]));
const selected=(data.selectedSlugs||data.articles.map(a=>a.slug)).map(s=>bySlug.get(s)).filter(Boolean);
fs.writeFileSync('index.html',renderSite({...data,articles:selected},'/','https://www.ianoticias.org'));
// The legacy static converter also rewrites videos.json from old constants.
// Keep the existing video catalog intact during an X-only update.
const videoBytes=fs.readFileSync('videos.json');
try{const result=spawnSync('python',['tools/estatizar.py'],{encoding:'utf8'});if(result.status!==0)throw new Error(result.stderr||result.stdout);}
finally{fs.writeFileSync('videos.json',videoBytes);}
console.log('Updated X module:',selection.posts.length,'posts; review',selection.checkedAt);
