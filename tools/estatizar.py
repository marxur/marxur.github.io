#!/usr/bin/env python3
"""Convierte la copia de ianoticias.org en web 100 % estática (GitHub Pages).
- Quita el script de Cloudflare inyectado (/cdn-cgi/...) de todas las páginas.
- Quita la interfaz del asistente (/api/assistant necesita backend).
- Genera search.json (52 noticias + 10 temas) a partir de data.json y temas/*.html.
Idempotente: se puede ejecutar varias veces."""
import glob, html, json, re
CF = re.compile(r'<script>\(function\(\)\{function c\(\)\{var b=a\.contentDocument.*?</script>', re.S)
BTN = re.compile(r'<button class="assistant-trigger"[^>]*>.*?</button>', re.S)
DLG = re.compile(r'<dialog[^>]*id="assistant-dialog".*?</dialog>', re.S)
n = 0
for f in sorted(glob.glob('**/*.html', recursive=True)):
    s = open(f, encoding='utf-8').read()
    t = DLG.sub('', BTN.sub('', CF.sub('', s)))
    if t != s:
        open(f, 'w', encoding='utf-8').write(t); n += 1
print('HTML modificados:', n)
arts = json.load(open('data.json', encoding='utf-8'))['articles']
items = [{k: a.get(k, '') for k in ('slug','title','summary','category','topic','source','date')} | {'url': f"/noticias/{a['slug']}.html", 'type': 'noticia'} for a in arts]
for f in sorted(glob.glob('temas/*.html')):
    s = open(f, encoding='utf-8').read()
    g = lambda p: html.unescape((re.search(p, s, re.S) or [None, ''])[1]).strip()
    slug = f[6:-5]
    items.append({'slug': 'tema-' + slug, 'title': g(r'<h1[^>]*>(.*?)</h1>') and re.sub('<[^>]+>', '', g(r'<h1[^>]*>(.*?)</h1>')) or g(r'<title>(.*?)</title>'),
                  'summary': g(r'<meta name="description" content="([^"]*)"'), 'category': 'Tema', 'topic': slug.replace('-', ' '),
                  'source': 'Noticias IA', 'date': '', 'url': f'/temas/{slug}.html', 'type': 'tema'})
json.dump({'generated': 'estatizar.py', 'items': items}, open('search.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('search.json:', sum(i['type']=='noticia' for i in items), 'noticias,', sum(i['type']=='tema' for i in items), 'temas')
