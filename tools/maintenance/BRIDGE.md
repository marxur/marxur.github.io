# Preparación y publicación con Codex

Codex investiga, redacta, revisa X, prepara imágenes y publica. La tarea diaria se ejecuta a las 21:45, hora de Madrid. Los radares que Marcos indique pueden servir para recuperar noticias pendientes. Verifica el anuncio original y su fecha antes de incorporar cada pieza.

## Preparación local

Guarda la propuesta en `tools/maintenance/drafts/AAAA-MM-DD/edition.json`. Registra `reviewedAt`, `baseCommitSha`, `articles`, `xSelection`, `sources` y `limitations`. Usa objetos de artículo con el formato de `data.json`. Compara las claves, slugs, fuentes y títulos con la versión remota. Mantén la fecha original de cada fuente y registra por separado el momento de edición. Conserva las selecciones válidas de X con sus fechas si faltan publicaciones nuevas verificadas.

Revisa cada recurso visual antes de incorporarlo. Optimiza las imágenes en `assets/news-visuals/` y registra la asignación exacta, prompt o fuente, licencia y atribución en `tools/editorial/news-visuals.json`. Guarda las solicitudes pendientes por slug en `tools/maintenance/image-requests/`.

## Integración y comprobación

1. Cambia el estado de la propuesta validada a `approved_for_publication` y añade `approvedAt` con la hora real. Ejecuta `node tools/maintenance/apply-edition.mjs RUTA_PROPUESTA`. Conserva las URL y los artículos anteriores, así como la portada interactiva y el menú compacto.
2. Ejecuta `node tools/verify-news-visuals.mjs` y `git diff --check`. Revisa cambios y enlaces. Publica en `marxur/marxur.github.io`, rama `main`, con control del padre y sin force push. Ante cambios concurrentes, revisa el estado nuevo y vuelve a comprobar la deduplicación.
3. Confirma GitHub Pages y las páginas públicas. Guarda el resultado en `tools/maintenance/runs/AAAA-MM-DD.json`. Marca una propuesta como `published` solo con el commit y comprobación pública. Evita repetir una integración ya publicada.
