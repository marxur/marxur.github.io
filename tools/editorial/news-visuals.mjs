import manifest from './news-visuals.json' with {type:'json'};
const exact = new Map(manifest.entries.map(item => [item.slug,item]));
const assets = new Map(manifest.entries.map(item => [item.key,item]));

// Exact artwork for the current wall; thematic artwork keeps future cards visual.
export function newsVisual(article) {
  if (exact.has(article.slug)) return exact.get(article.slug);
  const words = [article.topic,article.category,article.title,article.company,article.source,...(article.tags??[])].join(' ').toLowerCase();
  let key = 'open-model';
  if (/firefox|mozilla/.test(words)) key='smart-browser';
  else if (/voz|audio|rime|prism|dictado|scribe|elevenlabs/.test(words)) key='voice-prism';
  else if (/realidad extendida|\bxr\b|gafas/.test(words)) key='xr-glasses';
  else if (/ciencia|científic|laboratorio|medicin|investigaci/.test(words)) key='ai-science';
  else if (/seguridad|ciber|vulnerabilidad|riesgo|privacidad/.test(words)) key='carbon-model';
  else if (/chip|npu|gpu|nvidia|hardware|procesador/.test(words)) key='neural-chip';
  else if (/ia local|móvil|smartphone|litert/.test(words)) key='local-ai-phone';
  else if (/android/.test(words)) key='android-code';
  else if (/programación|código|github|copilot|cursor|codex/.test(words)) key='coding-workflow';
  else if (/china|qwen|deepseek|kimi|baidu|tencent|ling/.test(words)) key='china-model';
  else if (/búsqueda|buscar|search/.test(words)) key='search-agents';
  else if (/navegador|chrome|opera|correo|gmail|formulario/.test(words)) key='browser-forms';
  else if (/agente|aplicaci|conectar|mcp/.test(words)) key='connected-apps';
  else if (/vídeo|imagen|diseño|runway|creativ/.test(words)) key='code-gateway';
  return assets.get(key);
}

export const newsImage = article => newsVisual(article).src;
