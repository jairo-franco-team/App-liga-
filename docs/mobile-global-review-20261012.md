# Revisión móvil de Liga Juventino Rosas

Build verificado: `v1461-mobile-clean-boot-smaller-apk-r4`. Se conservaron los diseños aprobados; no se añadieron módulos nuevos al móvil ni se rediseñó PC.

## Correcciones

- Algunas rutas externas construían Inicio antes de montar su página. Ahora montan directamente su contenido sin cargar ese Inicio innecesario.
- La decoración esperaba otro fotograma y podía pintar primero los colores anteriores. Las mutaciones se agrupan y se decoran antes de pintar.
- Un módulo anterior podía dejar temporalmente su identificador en el cuerpo. La URL solicitada ahora determina el diseño y evita decorar otra página.
- Se eliminó una importación a una hoja antigua inexistente y se mantuvo su regla funcional de controles ocultos. Las acciones ocultas por permisos siguen ocultas.
- El cálculo de estilos y la restauración del scroll podían consumir la animación antes de dibujarla. Su inicio se conserva hasta que el navegador está listo; una navegación posterior cancela el inicio pendiente.
- Los vídeos decorativos se pausan al ocultar la aplicación y sólo se reanudan si están dentro de la pantalla. Los reproductores de partidos conservan sus controles.
- La APK guarda una sola copia de cada imagen idéntica manteniendo todas las direcciones y bytes originales. La compilación limpia elimina el espacio residual del empaquetado incremental.

## Verificación

691 pruebas unitarias aprobadas. La app compilada pasó las 35 secciones personalizadas y la comparación de 14 pantallas protegidas. También se verificaron formularios, permisos ocultos, galerías, textos blancos, tablas horizontales, seis y doce jugadores mediante Ver más, regreso al mismo scroll, movimiento reducido y el onboarding en 360 y 412 píxeles.

[Revisión móvil](https://github.com/jairofrancog7-star/App-liga-/actions/runs/38213078538). [Compilación Android](https://github.com/jairofrancog7-star/App-liga-/actions/runs/38213078489).

APK: 183,62 → 158,56 MB, ahorro real de 25,06 MB. Las 836 direcciones empaquetadas conservaron los bytes originales. Las pruebas de APIs del sistema en el navegador usan límites simulados; no sustituyen una prueba de instalación y permisos en un teléfono físico.

## Funciones que conviene priorizar

La app ya tiene equipos, jugadores, calendario, clasificación, goleo, disciplina, herramientas administrativas y avisos. Conviene terminar las integraciones existentes antes de añadir más pantallas.

| Prioridad | Estado comprobado | Mejora útil |
| --- | --- | --- |
| Avisos con la APK cerrada | Firebase/FCM sigue pendiente de configuración; los avisos locales continúan disponibles | Configurar y probar entrega remota en Android |
| Cuenta y preferencias entre dispositivos | `data/account-cloud-config.json` tiene la nube desactivada y sin servidor configurado | Activar la integración existente y verificar sincronización/recuperación |
| Cuotas y recibos | Hay honorarios locales de árbitros y convenios de patrocinio; el carrito no cobra | Si la Liga lo necesita, centralizar inscripción/arbitraje, recibos y estado de pago con permisos administrativos |

La comparación se hizo con fuentes oficiales: [Spond para fútbol](https://www.spond.com/en-us/activity/football-soccer/) reúne calendario, asistencia, comunicación, registros y cuotas; [TeamLinkt para ligas](https://teamlinkt.com/solutions/for-leagues) incluye inscripciones con pagos, calendarios, resultados y sincronización de plantillas. Las prioridades anteriores son una recomendación basada en esa comparación y el código actual; no se activaron cobros ni cuentas nuevas.
