#!/usr/bin/env python3
"""Convierte la copia de ianoticias.org en web 100 % estática (GitHub Pages).
- Quita el script de Cloudflare inyectado (/cdn-cgi/...) de todas las páginas.
- Quita la interfaz del asistente (/api/assistant necesita backend).
- Genera search.json (52 noticias + 10 temas) a partir de data.json y temas/*.html.
- Añade la cuenta de X @IANoticiasNews (sameAs, twitter:site, iconos y pie).
Idempotente: se puede ejecutar varias veces."""
import glob, html, json, re

CF = re.compile(r'<script>\(function\(\)\{function c\(\)\{var b=a\.contentDocument.*?</script>', re.S)
BTN = re.compile(r'<button class="assistant-trigger"[^>]*>.*?</button>', re.S)
DLG = re.compile(r'<dialog[^>]*id="assistant-dialog".*?</dialog>', re.S)

X_URL = 'https://x.com/IANoticiasNews'
X_HANDLE = '@IANoticiasNews'
X_SYMBOL = (
    '<symbol id="i-x" viewBox="0 0 24 24">'
    '<path d="M4 4h4.2l4.1 5.7L16.9 4H20l-6.2 7.2L20.5 20H16.3l-4.5-6.2L7.1 20H4l6.5-7.6L4 4z"/>'
    '</symbol>'
)
X_TOP = (
    f'<a href="{X_URL}" target="_blank" rel="noopener noreferrer" '
    f'aria-label="Noticias IA en X"><svg aria-hidden="true"><use href="#i-x"/></svg></a>'
)
X_FOOTER = (
    f'<a href="{X_URL}" target="_blank" rel="noopener noreferrer">'
    f'X · {X_HANDLE} ↗</a>'
)
TW_SITE = f'<meta name="twitter:site" content="{X_HANDLE}">'

TOP_TIKTOK_END = re.compile(
    r'(<a href="https://www\.tiktok\.com/@noticiasia\.news"[^>]*>.*?</a>)(</div>)',
    re.S,
)
FOOTER_TIKTOK = re.compile(
    r'(<a href="https://www\.tiktok\.com/@noticiasia\.news"[^>]*>TikTok · @noticiasia\.news ↗</a>)(</nav>)',
    re.S,
)
SAMEAS = re.compile(
    r'("sameAs"\s*:\s*\[)([^\]]*https://www\.tiktok\.com/@noticiasia\.news[^\]]*)(\])',
    re.S,
)
TW_CARD = re.compile(r'(<meta name="twitter:card" content="summary_large_image">)')
TIKTOK_SYMBOL = re.compile(r'(<symbol id="i-tiktok"[^>]*>.*?</symbol>)', re.S)
SAMEAS_BLOCK = re.compile(r'"sameAs"\s*:\s*\[[^\]]*\]')


def inject_x(s: str) -> str:
    if 'id="i-x"' not in s and 'id="i-tiktok"' in s:
        s = TIKTOK_SYMBOL.sub(r'\1' + X_SYMBOL, s, count=1)
    if 'aria-label="Noticias IA en X"' not in s and 'top-social' in s:
        s2, n = TOP_TIKTOK_END.subn(r'\1' + X_TOP + r'\2', s, count=1)
        if n:
            s = s2
    if 'X · @IANoticiasNews' not in s and 'aria-label="Redes sociales"' in s:
        s2, n = FOOTER_TIKTOK.subn(r'\1' + X_FOOTER + r'\2', s, count=1)
        if n:
            s = s2
    if 'name="twitter:site"' not in s and 'twitter:card' in s:
        s = TW_CARD.sub(r'\1' + TW_SITE, s, count=1)
    m = SAMEAS_BLOCK.search(s)
    if m and X_URL not in m.group(0):
        def add_sameas(mm):
            mid = mm.group(2).rstrip()
            if mid.endswith('"'):
                mid = mid + f',"{X_URL}"'
            else:
                mid = mid + f', "{X_URL}"'
            return mm.group(1) + mid + mm.group(3)
        s = SAMEAS.sub(add_sameas, s, count=1)
    return s


n = 0
nx = 0
for f in sorted(glob.glob('**/*.html', recursive=True)):
    s = open(f, encoding='utf-8').read()
    t = DLG.sub('', BTN.sub('', CF.sub('', s)))
    t2 = inject_x(t)
    if t2 != s:
        open(f, 'w', encoding='utf-8').write(t2)
        n += 1
        if t2 != t:
            nx += 1
print('HTML modificados:', n, '(con X:', nx, ')')

arts = json.load(open('data.json', encoding='utf-8'))['articles']
items = [{k: a.get(k, '') for k in ('slug', 'title', 'summary', 'category', 'topic', 'source', 'date')} | {'url': f"/noticias/{a['slug']}.html", 'type': 'noticia'} for a in arts]
for f in sorted(glob.glob('temas/*.html')):
    s = open(f, encoding='utf-8').read()
    g = lambda p: html.unescape((re.search(p, s, re.S) or [None, ''])[1]).strip()
    slug = f[6:-5]
    items.append({
        'slug': 'tema-' + slug,
        'title': g(r'<h1[^>]*>(.*?)</h1>') and re.sub('<[^>]+>', '', g(r'<h1[^>]*>(.*?)</h1>')) or g(r'<title>(.*?)</title>'),
        'summary': g(r'<meta name="description" content="([^"]*)"'),
        'category': 'Tema',
        'topic': slug.replace('-', ' '),
        'source': 'Noticias IA',
        'date': '',
        'url': f'/temas/{slug}.html',
        'type': 'tema',
    })
json.dump({'generated': 'estatizar.py', 'items': items}, open('search.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('search.json:', sum(i['type'] == 'noticia' for i in items), 'noticias,', sum(i['type'] == 'tema' for i in items), 'temas')
