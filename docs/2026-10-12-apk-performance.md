# APK V1462: rendimiento, barras y navegación

Revisión de Corrgirr.zip: 5 videos y 44 capturas recortadas, más sus originales.
Las correcciones se concentran en móvil/APK. Los fondos aprobados de Inicio,
Competición y los diseños independientes de PC conservan sus paletas.

## Causas corregidas

- Inicio y el navegador principal ahora se cargan aparte del paquete de
  funciones secundarias. Una prueba bloquea ese paquete y comprueba que Inicio
  y la navegación siguen disponibles. Se conserva el alcance privado del
  código y la sustitución de la clave pública de Street View durante el build.
- Android no reservaba espacio para las barras del sistema. Capacitor 7 ahora
  usa `android.adjustMarginsForEdgeToEdge=force`. La ventana mantiene iconos
  claros sobre azul y el contenido queda fuera de la hora, batería y recorte.
- Las búsquedas de fotos recorrían y normalizaban toda la plantilla por cada
  fila. Ahora el índice se reconstruye cuando cambia la fuente oficial.
  En una plantilla de 2.000 jugadores, veinte búsquedas repetidas pasaron de
  40.100 conversiones a menos de 200, con el mismo resultado y control de nombres
  ambiguos entre clubes.
- Una foto fallida podía generar inserciones y solicitudes repetidas. Conserva
  el fallback de esa URL en el elemento; una fuente nueva sigue pudiendo cargar.
- El optimizador de imágenes forzaba layout con `getBoundingClientRect` mientras
  otros módulos montaban la página. Usa el lazy loading nativo, conserva prioridad
  normal y no cambia fuentes, dimensiones ni controles de imágenes.
- Las escrituras de clases sin cambios disparaban medidas de cabecera. Se
  ignoran esos registros. Scroll sólo actualiza el chrome cuando cambia el
  estado compacto; navegación guarda únicamente superficies que se desplazaron.

## Comportamiento

- Cabeceras e iconos bajados y con más altura en móvil, incluida Historia,
  Equipos, Máximo goleador, Más herramientas, Hospitalidad, Inicio, Estadísticas
  y búsqueda. Historia y las cabeceras compatibles se reducen al desplazarse.
- Las tres pestañas de Competición comparten tamaño y posición. Esta cabecera
  permanece estable aunque las vistas tengan diferente longitud.
- Android vuelve dentro de la app con su botón o gesto del sistema. La navegación
  web admite un deslizamiento hacia dentro desde cualquiera de los dos bordes;
  conserva ruta anterior, pestaña, listas ampliadas y scroll.
- Hay un círculo de carga al cambiar de sección. Se mantiene la protección que
  oculta la plantilla antigua durante el montaje.
- Los juegos tienen regreso accesible. Pronostica Seis mantiene sus subpantallas
  propias y vuelve al historial al salir; su menú de tres puntos se oculta.
  La flecha adicional sólo aparece cuando falta una propia: no cubre la flecha
  del menú interno de Quiz Arena ni interrumpe su confirmación de salida.
- El ranking local se presenta antes de iniciar en un cuadro azul desplegable,
  incluido el portal real de Quiz Arena. No se inventan puntos ni victorias.
- El texto del QR se mantiene arriba. El código está incluido en la APK y ya
  no depende de descargar una imagen externa.
- Sin internet tiene apartado en la APK, accesible desde Más, instalación,
  herramientas y Quiniela. Reutiliza datos incluidos, juegos locales, cédulas
  preparadas y respaldos. Videos en línea, novedades y envíos oficiales siguen
  requiriendo conexión. Se muestra la fecha de la copia oficial.
- El icono Android y PWA usa el escudo existente sobre fondo azul, sin línea
  blanca inferior. El build deja de depender de una descarga externa del icono.

## Validación

- `node --test tests/*.test.mjs`: 701 pruebas.
- `npm run build`: compilación de producción.
- `tests/mobile-shell.mjs`: geometría estable de pestañas, cabecera que reduce
  al hacer scroll, ausencia de medidas repetidas en reposo, carga, gesto de
  regreso, QR sin servicios externos y controles visibles en Quiz Arena.
- `tests/navigation-motion.mjs`: regreso a la posición anterior, transiciones
  en ambas direcciones y cambios rápidos entre secciones.
- `tests/mobile-clean-boot.mjs`: siete entradas directas y 35 pantallas, sin
  construir Inicio debajo de módulos delegados ni mostrar su diseño antiguo.
- El workflow Android ejecuta la nueva prueba de shell además de sus pruebas
  existentes. La medición definitiva de la APK depende de instalar el artefacto
  compilado en un teléfono físico; no se afirma una tasa de FPS del dispositivo.

## Investigación de funciones y automatización

Fuentes oficiales consultadas el 12 de octubre de 2026:

- [Tournify](https://tournifyapp.com/en/features): planificación de encuentros,
  marcadores, clasificación, acceso de organizadores y publicaciones para fans.
- [TeamLinkt](https://teamlinkt.com/sports-management-software/team-app): avisos
  de cambios de horario y recordatorios de partidos.
- [Google AI Edge](https://ai.google.dev/gemma/docs/integrations/mobile): ejecución
  de modelos en el dispositivo. Un modelo generativo requiere medir descarga,
  memoria y consumo en el teléfono; no se añade uno al arranque de una app que
  está presentando lentitud.
- [MDN: offline y segundo plano](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation):
  copias locales, cola de operaciones y límites de tareas en segundo plano.

La app ya contiene asistentes locales de avisos, revisión de suspensiones,
auditoría y respaldos. Conservamos esas funciones ligeras. Los workflows actuales
revisan avisos y procesan los aprobados; no se crea un segundo proceso que publique
cambios sin aprobación administrativa. Como siguientes ampliaciones, las ideas
útiles son detectar choques de campo/horario y preparar recordatorios a equipos
seguidos. Los proveedores externos de correo/SMS no se configuran ni se usan
para enviar mensajes como parte de esta corrección.
