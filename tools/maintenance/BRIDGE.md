# Apoyo desde Codex: imágenes y publicación

Harness prepara la edición; Codex facilita ilustraciones y publica mediante su conexión de GitHub. No se transfieren credenciales entre aplicaciones. El agente principal sigue siendo la sesión dedicada de DeepSeek Harness.

En el entorno de Harness, Node está incluido en su runtime aunque no figure en PATH. Resolverlo con `load_workspace_dependencies` y utilizar la ruta devuelta para ejecutar los scripts. No instalar programas ni buscar credenciales para preparar una propuesta.

## Entrega de Harness

Cada día, a las 21:15 Europe/Madrid, investiga siguiendo EDITOR.md y deposita una propuesta en `tools/maintenance/drafts/AAAA-MM-DD/edition.json`. No cambies `data.json`, HTML ni el manifiesto publicado durante esta fase. Formato:

```
{
  "status": "ready_for_review",
  "reviewedAt": "fecha real ISO",
  "baseCommitSha": "commit remoto consultado",
  "articles": ["objetos nuevos con el mismo formato editorial de data.json"],
  "xSelection": {"posts": [], "checkedAt": "fecha real ISO", "coverage": "cobertura real"},
  "sources": [{"url": "fuente original", "checkedAt": "fecha real ISO", "evidence": "qué se verificó"}],
  "limitations": []
}
```

El ejemplo ilustra el esquema: `articles` contiene objetos reales, nunca cadenas de ejemplo. Incluye los campos editoriales necesarios para el renderizador: slug, title, summary, date, publishedAt, category, topic, source, sourceUrl, sourceTitle, body, takeaway, caveat, kind, verification y label. Deduplica contra el estado público actual. Guarda las solicitudes de imagen por slug en `tools/maintenance/image-requests/`.

Acota cada revisión: hasta 6 noticias justificadas, un máximo de 20 consultas de red de investigación y sin búsquedas indefinidas cuando X bloquee la lectura. Conserva los enlaces concretos verificables y declara la cobertura parcial. Usa las fuentes primarias accesibles. Si no puede terminar, guarda `status: blocked` y explica el motivo. No compres servicios ni manipules credenciales. Para conocer el commit y los datos remotos puede utilizar la API pública de GitHub y raw.githubusercontent.com; no necesita Git para preparar una propuesta.

## Revisión y publicación en Codex

A las 21:45 Europe/Madrid, revisar la entrega de hoy. Si falta, es antigua, está bloqueada o carece de evidencia, informar del bloqueo y no publicar una edición ficticia. Registrar el resultado real y no renombrar la fecha de una selección vieja.

Consultar el estado remoto actual; no pisar cambios concurrentes. Comprobar fuentes originales, deduplicación, fechas y política de publicación. Atender únicamente las solicitudes de imágenes ligadas a artículos aprobados: usar la herramienta integrada de generación cuando esté disponible; crear una imagen diferente y pertinente por artículo, inspeccionarla, optimizarla y registrar prompt y procedencia. Para archivos libres, comprobar licencia, atribución y correspondencia visual. Si no hay herramienta o cuota, dejar pendiente y avisar. Nunca sustituir por una imagen genérica ni prometer una entrega que no existe.

Tras revisar, cambiar el estado de la propuesta a `approved_for_publication`, añadir `approvedAt` real y ejecutar `node tools/maintenance/apply-edition.mjs RUTA_PROPUESTA`. El integrador conserva los artículos existentes y las envolturas HTML, impide reemplazar artículos o duplicar acontecimientos y actualiza archivo, temas, búsqueda y sitemap. Comprobar después `node tools/verify-news-visuals.mjs`; preservar la portada interactiva, la navegación compacta, vídeo, SEO y el resto de secciones. Revisar el diff antes de publicar exclusivamente en `marxur/marxur.github.io`, rama `main`, con control del padre y sin force push. Confirmar despliegue y resultado público. Guardar el informe, marcar la propuesta `published` con el commit y marcar solicitudes completadas solo cuando el recurso esté incorporado. Si una propuesta ya está publicada, comprobar su recibo y no repetir la integración ni generar otra vez las imágenes.

Este apoyo usa una automatización local de Codex, además de la tarea local de Harness. Ambos hosts necesitan estar abiertos y el ordenador disponible para ejecutar a su hora. Una tarea configurada no acredita que una edición haya sido publicada.
