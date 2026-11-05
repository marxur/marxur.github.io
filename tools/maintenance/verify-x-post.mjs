// Verify a known public post through X's official public oEmbed endpoint.
const supplied=new URL(process.argv[2]);
if(!['x.com','twitter.com'].includes(supplied.hostname)||!/^\/[A-Za-z0-9_]+\/status\/\d+$/.test(supplied.pathname))throw new Error('An original X post URL is required');
const endpoint=new URL('https://publish.x.com/oembed');endpoint.searchParams.set('url',supplied.href);endpoint.searchParams.set('omit_script','true');
const response=await fetch(endpoint,{signal:AbortSignal.timeout(20000)});
if(!response.ok)throw new Error('X oEmbed HTTP '+response.status);
const json=await response.json();
console.log(JSON.stringify({url:supplied.href,checkedAt:new Date().toISOString(),author:json.author_name,authorUrl:json.author_url,html:json.html,provider:json.provider_name},null,2));
