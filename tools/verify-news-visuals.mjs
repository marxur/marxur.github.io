import fs from 'node:fs';
import assert from 'node:assert/strict';
import {newsImage} from './editorial/news-visuals.mjs';
const manifest=JSON.parse(fs.readFileSync('tools/editorial/news-visuals.json','utf8'));
const data=JSON.parse(fs.readFileSync('data.json','utf8'));
const bySlug=new Map(data.articles.map(a=>[a.slug,a]));
const reviewed=new Map(manifest.entries.map(e=>[e.slug,e]));
assert.equal(reviewed.size,manifest.entries.length,'An article has duplicate image assignments');
assert.equal(new Set(manifest.entries.map(e=>e.src)).size,manifest.entries.length,'Different articles share an illustration');
for(const e of manifest.entries){assert(bySlug.has(e.slug),'Unknown article '+e.slug);assert(fs.existsSync('.'+e.src),'Missing image '+e.src);assert(e.prompt||e.sourceUrl,'Image provenance is required');}
assert.equal(newsImage({slug:'unreviewed-example',topic:'China',title:'AI code and science'}),null,'Generic fallback must stay disabled');
let cards=0;
function check(folder){for(const e of fs.readdirSync(folder,{withFileTypes:true})){if(['.git','tools','docs','.github','assets','ilustraciones'].includes(e.name))continue;const p=folder+'/'+e.name;if(e.isDirectory()){check(p);continue;}if(!p.endsWith('.html'))continue;const html=fs.readFileSync(p,'utf8');for(const m of html.matchAll(/<article class="story-card(?: story-card--text)?"[\s\S]*?<\/article>/g)){const slug=m[0].match(/data-slug="([^"]+)"/)?.[1];if(!bySlug.has(slug))continue;const actual=m[0].match(/<img[^>]*src="([^"]+)"/)?.[1]??null;assert.equal(actual,newsImage(bySlug.get(slug)),p+': incorrect image for '+slug);cards++;}assert(!/src="(?:null|undefined|)"/.test(html),p+': empty image source');}}
check('.');
console.log(JSON.stringify({reviewedImages:reviewed.size,checkedCards:cards,genericFallback:false}));
