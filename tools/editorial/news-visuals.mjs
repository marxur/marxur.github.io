import manifest from './news-visuals.json' with {type:'json'};
const exact = new Map(manifest.entries.map(item => [item.slug,item]));
// Images belong to one reviewed article; never infer them from a topic.
export const newsVisual = article => exact.get(article.slug) ?? null;
export const newsImage = article => newsVisual(article)?.src ?? null;
