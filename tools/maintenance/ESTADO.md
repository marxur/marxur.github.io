# Noticias IA: mantenimiento diario

Configuración comprobada el 5 de noviembre de 2026, zona Europe/Madrid.

- DeepSeek Harness tiene un espacio dedicado `noticias-ia-visual` y la tarea «Noticias IA — mantenimiento diario» a las 21:15. Investiga fuentes primarias, verifica noticias y publicaciones concretas de X, y entrega propuestas y solicitudes de imagen.
- Codex tiene activo el apoyo «Noticias IA · imágenes y publicación» a las 21:45. Revisa las propuestas, facilita imágenes, valida e integra los cambios, publica en GitHub Pages y comprueba la web.
- Wikimedia Commons se ha probado sin clave: devuelve candidatos con licencia y autor. Necesitan revisión visual y atribución según su licencia.
- Harness dispone de búsqueda web y lectura de fuentes. No tiene generador de imágenes ni autenticación propia para publicar. Estas funciones las cubre el apoyo de Codex con sus herramientas y conexión disponibles; no se copian credenciales entre aplicaciones.
- La lectura de cronologías completas de X no está disponible de forma fiable. Sí se ha verificado una publicación concreta reciente mediante el oEmbed oficial. La cobertura se declara parcial.
- Ambas programaciones son locales: el ordenador y los hosts correspondientes deben estar abiertos y disponibles. Si una herramienta, cuota o fuente falla, el resultado se registra como bloqueo; una tarea programada no prueba que una edición se haya publicado.

La primera entrega de Harness se revisó antes de integrarla: se retiró una afirmación sobre cierre remoto de sesión que no se pudo confirmar en la fuente consultada. Se incorporó únicamente la novedad documentada sobre listas de IP en Claude Console, con una imagen propia, y una publicación reciente de OpenAI verificada por separado.

Las imágenes se asignan por artículo, sin fallback por categorías. Las piezas anteriores sin imagen revisada mantienen una tarjeta de texto. Los borradores, solicitudes e informes de ejecución permanecen locales y excluidos de Git. El flujo y sus límites se describen en EDITOR.md y BRIDGE.md.
