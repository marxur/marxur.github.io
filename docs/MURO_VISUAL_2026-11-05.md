# Muro visual de Noticias IA

Integración solicitada por Marcos a partir de una grabación de «Moments» de Motion. Implementación propia con las ilustraciones editoriales ya publicadas; no se importan código ni imágenes de la referencia.

El módulo `tools/editorial/mosaic.mjs` toma las quince noticias más recientes de la selección de portada, excluyendo rumores y pendientes. Se inserta después de los destacados y antes del radar. La cabecera de la portada ofrece un enlace directo a `/#muro-ia`. Cada tarjeta conserva un enlace HTML al artículo, además de su fecha de fuente. JavaScript añade una ampliación con resumen, enlace al artículo y fuente original; sin JavaScript se navega directamente al artículo.

`mosaico.css` y `mosaico.js` se cargan solo en la portada. El diseño responde al ancho disponible, mantiene navegación de teclado, diálogo nativo con cierre por Escape y devolución del foco, y respeta reducción de movimiento. Utiliza las ilustraciones locales de cada noticia, sin dependencias nuevas ni cookies.

Para actualizaciones editoriales: el generador habitual `tools/render-edition.mjs` ya incorpora el muro mediante `renderSite`. No mantener manualmente las quince tarjetas. Para regenerar exclusivamente la portada sin modificar datos ni revisión, ejecutar `node tools/render-mosaic-home.mjs` desde la raíz del repositorio.

La integración no modifica datos, artículos, archivo, sitemap, canonicals, dominio, horarios ni políticas de publicación. La versión activa se publica en GitHub Pages, repositorio `marxur/marxur.github.io`, rama `main`; no desplegar la copia antigua de Sites.

Verificación: quince enlaces y recursos locales válidos; una H1 y canonical original; enlaces existentes conservados; datos y sitemap idénticos al estado anterior. Navegador: apertura, cierre con Escape, retorno de foco y enlace al artículo comprobados; vista móvil de 390 píxeles sin desbordamiento horizontal, incluido el diálogo.
