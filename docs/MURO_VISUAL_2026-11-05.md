# Muro visual de Noticias IA

Integración solicitada por Marcos a partir de «Moments» de Motion. La versión actual amplía imágenes al pasar el cursor, dentro del propio mosaico. No abre una ventana ni un diálogo. Se conservan los enlaces nativos: el clic abre el artículo y en móvil basta un toque.

El módulo tools/editorial/mosaic.mjs toma las quince noticias más recientes de la selección de portada, excluyendo rumores y pendientes. Usa las ilustraciones editoriales locales ya publicadas. No importa código ni recursos de la referencia. Las fechas son las originales de las fuentes.

mosaico.js crea una única ampliación visual dentro del muro. Tiene pointer-events:none para poder alcanzar las imágenes vecinas aun cuando quedan parcialmente cubiertas; la ampliación cambia de imagen y posición sin cerrar nada. El teclado ofrece la misma vista al enfocar las tarjetas. La vista ampliada es decorativa para tecnologías de asistencia y los enlaces originales siguen siendo accesibles. Al salir del muro se repliega; Escape también la oculta. No se bloquea el desplazamiento de la página.

Las animaciones usan transformaciones y opacidad, sin desenfoques. El desplazamiento leve del conjunto se detiene al asentarse, al salir de pantalla y al ocultar la pestaña. Respeta reducción de movimiento. En móvil conserva títulos legibles y enlaces directos, sin ampliación flotante.

El generador habitual tools/render-edition.mjs incorpora el muro mediante renderSite. No mantener manualmente sus tarjetas. Para regenerar únicamente esta sección de portada sin tocar metadatos o revisión: node tools/render-mosaic-home.mjs. mosaico.css y mosaico.js se cargan solo en portada.

Publicación: GitHub Pages, marxur/marxur.github.io, main. No desplegar la copia antigua de Sites. No modificar DNS, horarios, datos de noticias ni políticas editoriales por esta integración.

Verificado: cambio entre tarjetas por foco y entrada del cursor; ampliación sin interceptar el puntero; clic al artículo correcto; cero diálogos en el muro; desplazamiento libre; móvil de 390 píxeles sin desbordamiento horizontal y acceso directo al artículo. Se conservan datos, artículos, canonical y datos estructurados.
