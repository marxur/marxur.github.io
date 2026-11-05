# Imágenes editoriales y portada interactiva

Se han generado quince ilustraciones editoriales con la herramienta integrada image_gen y se han optimizado en WebP de 1000 píxeles de ancho. Cada una de las quince noticias del muro tiene una imagen asignada expresamente a su asunto. Las páginas del archivo y sus tarjetas reutilizan estas imágenes por temática; las noticias futuras utilizan la misma selección temática hasta recibir una imagen específica.

Los archivos finales están en `assets/news-visuals/`. El conjunto de prompts, la correspondencia entre noticia y recurso y el aviso sobre su naturaleza conceptual están en `tools/editorial/news-visuals.json`. Son ilustraciones conceptuales, no fotografías documentales de los productos anunciados. La selección automática está en `tools/editorial/news-visuals.mjs`.

La primera pantalla presenta «Noticias IA» con una fuente variable Geist alojada localmente: las letras ganan peso y tamaño cerca del cursor, reaccionan a un clic y respiran suavemente en reposo. El efecto se detiene fuera de pantalla y respeta la preferencia de movimiento reducido. La licencia de la fuente está en `assets/fonts/Geist-OFL.txt`.

La portada enlaza directamente a las noticias y al muro. Se conserva la ampliación de imágenes dentro del muro al pasar el ratón o navegar con teclado, sin ventana aparte. Las URLs, los textos de las noticias, las fechas y los enlaces a las fuentes se conservan.

Integración: `liquid-type.css`, `liquid-type.js` y `tools/editorial/liquid-hero.mjs`. Los generadores editoriales incluyen tanto las nuevas imágenes como la portada para mantenerlos en futuras actualizaciones.
