#!/usr/bin/env python3
"""Convierte la copia de ianoticias.org en web 100 % estática (GitHub Pages).
- Quita el script de Cloudflare inyectado (/cdn-cgi/...) de todas las páginas.
- Quita la interfaz del asistente (/api/assistant necesita backend).
- Genera search.json (52 noticias + 10 temas) a partir de data.json y temas/*.html.
- Asegura YouTube, Instagram, TikTok y X en cabecera, pie y sameAs (portada).
- Incrusta Shorts públicos (youtube-nocookie) y VideoObject en JSON-LD.
Idempotente: se puede ejecutar varias veces."""
import glob, html, json, re

CF = re.compile(r'<script>\(function\(\)\{function c\(\)\{var b=a\.contentDocument.*?</script>', re.S)
BTN = re.compile(r'<button class="assistant-trigger"[^>]*>.*?</button>', re.S)
DLG = re.compile(r'<dialog[^>]*id="assistant-dialog".*?</dialog>', re.S)

# Redes oficiales (URLs exactas)
SOCIALS = [
    ('YouTube', 'https://www.youtube.com/@NoticiasIAes', 'youtube', 'Noticias IA en YouTube'),
    ('Instagram', 'https://www.instagram.com/noticiasiaes', 'instagram', 'Noticias IA en Instagram'),
    ('TikTok', 'https://www.tiktok.com/@noticiasia.news', 'tiktok', 'Noticias IA en TikTok'),
    ('X', 'https://x.com/IANoticiasNews', 'x', 'Noticias IA en X'),
]
SAMEAS_URLS = [u for _, u, _, _ in SOCIALS]
X_HANDLE = '@IANoticiasNews'
X_SYMBOL = (
    '<symbol id="i-x" viewBox="0 0 24 24">'
    '<path d="M4 4h4.2l4.1 5.7L16.9 4H20l-6.2 7.2L20.5 20H16.3l-4.5-6.2L7.1 20H4l6.5-7.6L4 4z"/>'
    '</symbol>'
)
TW_SITE = f'<meta name="twitter:site" content="{X_HANDLE}">'
TW_CARD = re.compile(r'(<meta name="twitter:card" content="summary_large_image">)')
TIKTOK_SYMBOL = re.compile(r'(<symbol id="i-tiktok"[^>]*>.*?</symbol>)', re.S)
TOP_SOCIAL_BLOCK = re.compile(
    r'(<div class="top-social">)(.*?)(</div>)', re.S
)
FOOTER_REDES = re.compile(
    r'(<nav class="footer-links" aria-label="Redes sociales">)(.*?)(</nav>)', re.S
)
SAMEAS_BLOCK = re.compile(r'("sameAs"\s*:\s*)\[[^\]]*\]')

# Shorts públicos verificados por oEmbed (15/10/2026). Sin página: 5S5_EbJ6BtM, ExnzuMOHcVg.
# Pendientes (no públicos): Jf574jAphdo, y1dcsXi9tD8, gI9_i5dR7NI.
SHORTS = {
    'd5t_kJGXTPU': {
        'page': 'index.html',
        'name': 'Bienvenidos a Noticias IA: la IA en menos de un minuto',
        'description': 'Presentación del canal Noticias IA: noticias de inteligencia artificial en español, en menos de un minuto y con fuente.',
        'thumbnailUrl': 'https://i.ytimg.com/vi/d5t_kJGXTPU/hqdefault.jpg',
        'uploadDate': '2026-10-13T19:00:00+02:00',
    },
    'pZUmmmgcNjI': {
        'page': 'noticias/google-gemini-4-argon-app-tareas.html',
        'name': 'Gemini 4 Argon ya está disponible en todo el mundo',
        'description': 'Google lleva Gemini 4 Argon a la API, a la app Gemini y al Modo IA de Search.',
        'thumbnailUrl': 'https://i.ytimg.com/vi/pZUmmmgcNjI/hqdefault.jpg',
        'uploadDate': '2026-10-14T14:00:00+02:00',
    },
    'IPrTGAj-AFY': {
        'page': 'noticias/nvidia-uk-safety-compute-20261014.html',
        'name': 'NVIDIA invierte 250 M$ para seguridad de agentes, adiós a GPT-4o en la API y más | Noticias IA 14/10',
        'description': 'Resumen del 14/10: NVIDIA en Reino Unido, retirada de GPT-4o/GPT-4.1 de la API, Meta Muse Wonder y Claude Haiku 5.5.',
        'thumbnailUrl': 'https://i.ytimg.com/vi/IPrTGAj-AFY/hqdefault.jpg',
        'uploadDate': '2026-10-14T21:00:00+02:00',
    },
    'sqbxukWxrzs': {
        'page': 'noticias/meta-muse-spark-open-20261015.html',
        'name': 'Noticias de Última Hora | Meta lanza Muse Spark Open: 816B y pesos abiertos | Noticias IA',
        'description': 'Meta publica Muse Spark Open, modelo de pesos abiertos con 816.000 M de parámetros (42.000 M activos) y un millón de tokens de contexto.',
        'thumbnailUrl': 'https://i.ytimg.com/vi/sqbxukWxrzs/hqdefault.jpg',
        'uploadDate': '2026-10-15T20:03:46+02:00',
    },
    'sWN4eATrNyg': {
        'page': 'noticias/chatgpt-chrome-pestanas-20261015.html',
        'name': 'Noticias de Última Hora | ChatGPT ya usa tus pestañas de Chrome | Noticias IA',
        'description': 'OpenAI lleva el uso del ordenador a Chrome: ChatGPT puede usar tus pestañas para responder mejor y hacer tareas. Disponible en todos los planes.',
        'thumbnailUrl': 'https://i.ytimg.com/vi/sWN4eATrNyg/hqdefault.jpg',
        'uploadDate': '2026-10-16T00:06:48+02:00',
    },
    'I79RbDEYdfU': {
        'page': 'noticias/chatgpt-gpt-live-1-1-voces-20261015.html',
        'name': 'Noticias de Última Hora | OpenAI lanza GPT-Live-1.1: voces nuevas en ChatGPT | Noticias IA',
        'description': 'OpenAI lanza GPT-Live-1.1, su nuevo modelo de voz para ChatGPT, Codex y dots: voces nuevas, mejores acentos y menos esperas.',
        'thumbnailUrl': 'https://i.ytimg.com/vi/I79RbDEYdfU/hqdefault.jpg',
        'uploadDate': '2026-10-16T00:41:56+02:00',
    },
}

SHORT_CSS = (
    '.short-embed{margin:28px auto;max-width:360px}'
    '.short-embed-frame{position:relative;aspect-ratio:9/16;background:#101829;border-radius:3px;overflow:hidden}'
    '.short-embed-frame iframe{position:absolute;inset:0;width:100%;height:100%;border:0}'
    '.short-embed figcaption{margin-top:10px;font-size:12px;text-align:center}'
    '.short-embed figcaption a{text-decoration:underline;text-underline-offset:3px}'
    '.shorts-section .short-embed{margin:0 auto 28px}'
)


def short_figure(vid: str, meta: dict) -> str:
    title = html.escape(meta['name'], quote=True)
    return (
        f'<figure class="short-embed" data-short-id="{vid}">'
        f'<div class="short-embed-frame">'
        f'<iframe title="{title}" '
        f'src="https://www.youtube-nocookie.com/embed/{vid}" '
        f'loading="lazy" allow="encrypted-media; picture-in-picture" '
        f'allowfullscreen referrerpolicy="strict-origin-when-cross-origin">'
        f'</iframe></div>'
        f'<figcaption><a href="https://www.youtube.com/shorts/{vid}" '
        f'target="_blank" rel="noopener noreferrer">Ver Short en YouTube ↗</a></figcaption>'
        f'</figure>'
    )


def video_object(vid: str, meta: dict) -> dict:
    return {
        '@type': 'VideoObject',
        'name': meta['name'],
        'description': meta['description'],
        'thumbnailUrl': meta['thumbnailUrl'],
        'uploadDate': meta['uploadDate'],
        'embedUrl': f'https://www.youtube-nocookie.com/embed/{vid}',
        'contentUrl': f'https://www.youtube.com/shorts/{vid}',
    }


def top_social_html() -> str:
    parts = []
    for _name, url, icon, label in SOCIALS:
        parts.append(
            f'<a href="{url}" target="_blank" rel="noopener noreferrer" '
            f'aria-label="{label}"><svg aria-hidden="true"><use href="#i-{icon}"/></svg></a>'
        )
    return ''.join(parts)


def footer_social_html() -> str:
    labels = {
        'YouTube': 'YouTube · @NoticiasIAes ↗',
        'Instagram': 'Instagram · @noticiasiaes ↗',
        'TikTok': 'TikTok · @noticiasia.news ↗',
        'X': 'X · @IANoticiasNews ↗',
    }
    return ''.join(
        f'<a href="{url}" target="_blank" rel="noopener noreferrer">{labels[name]}</a>'
        for name, url, _icon, _label in SOCIALS
    )


def ensure_socials(s: str) -> str:
    if 'id="i-x"' not in s and 'id="i-tiktok"' in s:
        s = TIKTOK_SYMBOL.sub(r'\1' + X_SYMBOL, s, count=1)
    if 'class="top-social"' in s:
        s = TOP_SOCIAL_BLOCK.sub(
            lambda m: m.group(1) + top_social_html() + m.group(3), s, count=1
        )
    if 'aria-label="Redes sociales"' in s:
        s = FOOTER_REDES.sub(
            lambda m: m.group(1) + footer_social_html() + m.group(3), s, count=1
        )
    if 'name="twitter:site"' not in s and 'twitter:card' in s:
        s = TW_CARD.sub(r'\1' + TW_SITE, s, count=1)
    if '"sameAs"' in s:
        same = json.dumps(SAMEAS_URLS, ensure_ascii=False, separators=(',', ':'))
        s = SAMEAS_BLOCK.sub(r'\1' + same, s, count=1)
    # Normalizar Instagram con barra final residual fuera de los bloques ya reescritos
    s = s.replace(
        'https://www.instagram.com/noticiasiaes/',
        'https://www.instagram.com/noticiasiaes',
    )
    return s


def inject_short_noticia(s: str, vid: str, meta: dict) -> str:
    if f'data-short-id="{vid}"' in s or f'youtube-nocookie.com/embed/{vid}' in s:
        # Asegurar VideoObject aunque el iframe ya exista
        pass
    else:
        fig = short_figure(vid, meta)
        # Tras la portada ilustrada / caption, antes del cuerpo
        pat = re.compile(
            r'(<div class="article-cover">.*?</div>\s*(?:<p class="image-caption">.*?</p>\s*)?)'
            r'(<div class="article-content">)',
            re.S,
        )
        s2, n = pat.subn(r'\1' + fig + r'\2', s, count=1)
        if n:
            s = s2
        else:
            # Fallback: tras el deck
            pat2 = re.compile(
                r'(<p class="article-deck">.*?</p>)',
                re.S,
            )
            s2, n = pat2.subn(r'\1' + fig, s, count=1)
            if n:
                s = s2

    # JSON-LD VideoObject en NewsArticle
    def add_video(m):
        try:
            data = json.loads(m.group(1))
        except json.JSONDecodeError:
            return m.group(0)
        vo = video_object(vid, meta)
        existing = data.get('video')
        if isinstance(existing, dict) and existing.get('contentUrl', '').endswith(vid):
            data['video'] = vo
        elif isinstance(existing, list):
            rest = [v for v in existing if not (isinstance(v, dict) and str(v.get('contentUrl', '')).endswith(vid))]
            data['video'] = rest + [vo] if rest else vo
        else:
            data['video'] = vo
        return (
            '<script type="application/ld+json">'
            + json.dumps(data, ensure_ascii=False, separators=(',', ':'))
            + '</script>'
        )

    s = re.sub(
        r'<script type="application/ld\+json">(.*?)</script>',
        add_video,
        s,
        count=1,
        flags=re.S,
    )
    return s


def inject_short_index(s: str, vid: str, meta: dict) -> str:
    fig = short_figure(vid, meta)
    if f'data-short-id="{vid}"' not in s:
        # Insertar el iframe de bienvenida al inicio de la sección de Shorts
        pat = re.compile(
            r'(<section class="shorts-section"[^>]*>\s*<div class="wrap">\s*'
            r'<div class="shorts-heading">.*?</div>)',
            re.S,
        )
        s2, n = pat.subn(r'\1' + fig, s, count=1)
        if n:
            s = s2
        else:
            # Fallback tras intro
            pat2 = re.compile(r'(<section class="shorts-section"[^>]*>)', re.S)
            s = pat2.sub(r'\1' + fig, s, count=1)

    def add_vo_graph(m):
        try:
            data = json.loads(m.group(1))
        except json.JSONDecodeError:
            return m.group(0)
        vo = video_object(vid, meta)
        vo['@id'] = f'https://www.ianoticias.org/#short-{vid}'
        if isinstance(data, dict) and '@graph' in data:
            graph = [
                g for g in data['@graph']
                if not (isinstance(g, dict) and g.get('@type') == 'VideoObject'
                        and str(g.get('contentUrl', '')).endswith(vid))
            ]
            graph.append(vo)
            data['@graph'] = graph
        elif isinstance(data, dict) and data.get('@type') == 'VideoObject':
            data = {'@context': 'https://schema.org', '@graph': [data, vo]}
        else:
            return m.group(0)
        return (
            '<script type="application/ld+json">'
            + json.dumps(data, ensure_ascii=False, separators=(',', ':'))
            + '</script>'
        )

    # Solo el bloque principal de Organization/WebSite en portada
    s = re.sub(
        r'<script type="application/ld\+json">(\{.*?"@graph".*?\})</script>',
        add_vo_graph,
        s,
        count=1,
        flags=re.S,
    )
    return s


def ensure_short_css():
    path = 'style.css'
    css = open(path, encoding='utf-8').read()
    if '.short-embed{' in css or '.short-embed-frame{' in css:
        return False
    open(path, 'w', encoding='utf-8').write(css.rstrip() + '\n' + SHORT_CSS + '\n')
    return True


def update_videos_json():
    """Mantiene la cola pública de Shorts para el carrusel de la portada."""
    path = 'videos.json'
    try:
        data = json.load(open(path, encoding='utf-8'))
    except (OSError, json.JSONDecodeError):
        data = {}
    order = ['d5t_kJGXTPU', 'pZUmmmgcNjI', 'IPrTGAj-AFY', 'ExnzuMOHcVg', '5S5_EbJ6BtM']
    # Solo los que tienen oEmbed OK; Exnzu y 5S5 son públicos aunque sin noticia
    meta_extra = {
        'ExnzuMOHcVg': (
            'Google DeepMind y Singapur ajustan Gemma para detectar estafas en el móvil',
            '2026-10-15T14:00:00+02:00',
        ),
        '5S5_EbJ6BtM': (
            'GPT-5.6 Sol ayuda a hackear Chrome en 6 días: 250.000 $ de recompensa',
            '2026-10-14T19:00:00+02:00',
        ),
    }
    videos = []
    for vid in order:
        if vid in SHORTS:
            m = SHORTS[vid]
            videos.append({
                'id': vid,
                'title': m['name'],
                'publishedAt': m['uploadDate'],
            })
        elif vid in meta_extra:
            title, published = meta_extra[vid]
            videos.append({'id': vid, 'title': title, 'publishedAt': published})
    data['videos'] = videos
    data['channelUrl'] = 'https://www.youtube.com/@NoticiasIAes/shorts'
    data['feedAvailable'] = False
    json.dump(data, open(path, 'w', encoding='utf-8'), ensure_ascii=False, indent=4)
    print('videos.json:', len(videos), 'shorts públicos')


# --- main ---
css_changed = ensure_short_css()
print('style.css short-embed:', 'añadido' if css_changed else 'ya estaba')

n = 0
nx = 0
for f in sorted(glob.glob('**/*.html', recursive=True)):
    s = open(f, encoding='utf-8').read()
    t = DLG.sub('', BTN.sub('', CF.sub('', s)))
    t = ensure_socials(t)
    for vid, meta in SHORTS.items():
        if meta['page'] == f or (f == meta['page']):
            if f == 'index.html':
                t = inject_short_index(t, vid, meta)
            else:
                t = inject_short_noticia(t, vid, meta)
    if t != s:
        open(f, 'w', encoding='utf-8').write(t)
        n += 1
print('HTML modificados:', n)

update_videos_json()

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
