export function companyOf(a) {
  if(a.company==='Moonshot AI')return 'Kimi';
  if(a.company==='Alibaba')return 'Qwen';
  if(a.company)return a.company;
  const s=[a.source,a.topic].join(' ').toLowerCase();
  return /openai|chatgpt/.test(s)?'OpenAI':/anthropic|claude/.test(s)?'Anthropic':/google|gemini|notebook/.test(s)?'Google':/grok|x.ai/.test(s)?'xAI':/deepseek/.test(s)?'DeepSeek':/qwen/.test(s)?'Qwen':/kimi/.test(s)?'Kimi':a.source;
}
export function topicsOf(a) {
  const company=companyOf(a),tags=[company,a.topic,...(a.tags??[])];
  if(['DeepSeek','Qwen','Kimi'].includes(company))tags.push('China');
  if(/agent|dots|bots/i.test([a.title,a.topic].join(' ')))tags.push('Agentes IA');
  return [...new Set(tags)];
}
