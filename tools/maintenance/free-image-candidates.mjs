// Wikimedia Commons is public and does not require an API key.
// Results still require visual review and compliance with each file's license.
const query=process.argv.slice(2).join(' ').trim();
if(!query){console.error('Usage: node tools/maintenance/free-image-candidates.mjs "specific subject"');process.exit(2);}
const endpoint=new URL('https://commons.wikimedia.org/w/api.php');
for(const [k,v] of Object.entries({action:'query',format:'json',generator:'search',gsrsearch:query,gsrnamespace:'6',gsrlimit:'8',prop:'imageinfo',iiprop:'url|extmetadata|size',iiurlwidth:'1200'}))endpoint.searchParams.set(k,v);
const response=await fetch(endpoint,{headers:{'User-Agent':'NoticiasIA-editorial/1.0 (https://www.ianoticias.org/contacto.html)'},signal:AbortSignal.timeout(25000)});
if(!response.ok)throw new Error('Wikimedia HTTP '+response.status);
const data=await response.json();if(data.error)throw new Error(data.error.info);
const clean=s=>String(s??'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
const files=Object.values(data.query?.pages??{}).flatMap(p=>(p.imageinfo??[]).map(i=>({title:p.title,url:i.url,preview:i.thumburl??i.url,page:i.descriptionurl,width:i.width,height:i.height,license:clean(i.extmetadata?.LicenseShortName?.value),licenseUrl:clean(i.extmetadata?.LicenseUrl?.value),artist:clean(i.extmetadata?.Artist?.value),description:clean(i.extmetadata?.ImageDescription?.value),approved:false})));
console.log(JSON.stringify({provider:'Wikimedia Commons',checkedAt:new Date().toISOString(),query,files},null,2));
