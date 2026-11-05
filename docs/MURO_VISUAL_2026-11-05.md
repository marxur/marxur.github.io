# Muro visual de Noticias IA

Integración solicitada por Marcos a partir de una grabación de «Moments» de Motion. Implementación propia con las ilustraciones editoriales ya publicadas; no se importan código ni imágenes de la referencia.

El módulo `tools/editorial/mosaic.mjs` toma las quince noticias más recientes de la selección de portada, excluyendo rumores y pendientes. Se inserta después de los destacados y antes del radar. La cabecera de la portada ofrece un enlace directo a `/#muro-ia`. Cada tarjeta conserva un enlace HTML al artículo, además de su fecha de fuente. JavaScript añade una ampliación con resumen, enlace al artículo y fuente original; sin JavaScript se navega directamente al artículo.

`mosaico.css` y `mosaico.js` se cargan solo en la portada. El diseño responde al ancho disponible, mantiene navegación de teclado, diálogo nativo con cierre por Escape y devolución del foco, y respeta reducción de movimiento. Utiliza las ilustraciones locales de cada noticia, sin dependencias nuevas ni cookies.

Para actualizaciones editoriales: el generador habitual `tools/render-edition.mjs` ya incorpora el muro mediante `renderSite`. No mantener manualmente las quince tarjetas. Para regenerar exclusivamente la portada sin modificar datos ni revisión, ejecutar `node tools/render-mosaic-home.mjs` desde la raíz del repositorio.

La integración no modifica datos, artículos, archivo, sitemap, canonicals, dominio, horarios ni políticas de publicación. La versión activa se publica en GitHub Pages, repositorio `marxur/marxur.github.io`, rama `main`; no desplegar la copia antigua de Sites.

Verificación: quince enlaces y recursos locales válidos; una H1 y canonical original; enlaces existentes conservados; datos y sitemap idénticos al estado anterior. Navegador: apertura, cierre con Escape, retorno de foco y enlace al artículo comprobados; vista móvil de 390 píxeles sin desbordamiento horizontal, incluido el diálogo.

## Revisión de movimiento

Tras comparar de nuevo la grabación, la vista de escritorio utiliza un mosaico compacto de tamaños distintos. La tarjeta bajo el cursor aumenta de tamaño y descubre su titular, con un desplazamiento inercial leve del conjunto. Se detiene al salir de pantalla o al ocultar la pestaña. No hay un bucle de animación permanente.

La ampliación de escritorio comparte la imagen entre su posición en el muro y la ventana de lectura, y vuelve al origen al cerrar. Las animaciones usan transformaciones y opacidad; se eliminan los desenfoques de fondo. Las ilustraciones se decodifican con antelación al detectar intención de abrirlas. El cierre durante la apertura parte de la posición visible en ese momento. La anchura de la página conserva el espacio de la barra de desplazamiento.

En móvil se utiliza una entrada y salida breve, sin el recorrido entre posiciones. Se respeta la preferencia de reducir movimiento. Las noticias, metadatos y enlaces no cambian en esta revisión.
