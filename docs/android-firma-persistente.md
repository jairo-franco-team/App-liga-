# Firma persistente para APK Android (instalación directa)

El flujo `.github/workflows/android-debug.yml` produce actualmente una APK **debug**. Una máquina nueva de GitHub Actions normalmente crea una clave debug nueva, lo que puede causar el error de Android `INSTALL_FAILED_UPDATE_INCOMPATIBLE` al instalar una APK encima de una versión firmada con otra clave.

## Qué resuelve y qué NO

Si se configura el secreto `LJR_ANDROID_DEBUG_KEYSTORE_B64`, GitHub reutilizará **la misma clave** para todas las APK debug futuras, siempre que se mantengan el identificador de paquete y el incremento de `versionCode`. Con el secreto ausente, la compilación sigue funcionando pero el estado de firma se marca como temporal. Este cambio no recupera una clave perdida.

**Una APK antigua firmada con otra clave no puede actualizarse en el mismo paquete usando esta clave nueva.** Para migrar desde esa APK antigua es necesario recuperar la firma original o, tras respaldar los datos locales que sea posible, desinstalar la versión antigua e instalar la nueva. Desinstalar normalmente elimina datos locales.

## Configuración segura para APK debug (una sola vez)

1. En un equipo privado con JDK/Android Studio, crea un archivo de firma **nuevo** que conservarás y respaldarás fuera de GitHub. Para el mecanismo debug de Android, el alias debe ser `androiddebugkey` y ambas contraseñas deben ser `android`:

   ```bash
   keytool -genkeypair -keystore liga-debug.keystore -storetype JKS -alias androiddebugkey -storepass android -keypass android -keyalg RSA -keysize 3072 -validity 10000 -dname "CN=Liga Juventino Android Debug,O=Liga Juventino"
   ```

2. Codifica el archivo en base64 **sin saltos de línea**, en tu propio equipo, sin publicarlo ni enviarlo al chat:

   ```bash
   base64 < liga-debug.keystore | tr -d '\n' > liga-debug-keystore.b64
   ```

3. En el repositorio GitHub abre **Settings → Secrets and variables → Actions → New repository secret**. Crea `LJR_ANDROID_DEBUG_KEYSTORE_B64` y pega allí el contenido del archivo base64.
4. Conserva el archivo `.keystore` original en un lugar privado y protegido. Borra de ubicaciones compartidas cualquier archivo base64 de trabajo.
5. Ejecuta **Build Android Debug APK** manualmente en GitHub Actions y verifica en el resumen de la versión `android-latest` el indicador `persistent debug key`. Prueba primero con una instalación de la nueva serie, luego actualiza esa instalación con la siguiente APK.

**Seguridad:** una clave debug sirve como transición para instalaciones directas, pero **no equivale a una firma de distribución**. Para una aplicación publicada o de producción, usa una clave de firma de lanzamiento con contraseñas fuertes, fuera del repositorio, y un flujo `assembleRelease`/firma de lanzamiento separado. Nunca subas archivos `.keystore`, `.jks`, claves privadas, contraseñas o su base64 al repositorio ni los compartas en mensajes.

## Limitaciones conocidas

- El usuario no conserva actualmente la firma anterior, de modo que no es posible prometer actualización sobre esas instalaciones previas.
- No se ha configurado todavía el secreto de GitHub. Hasta que se configure, este cambio **no** hace que las APK generadas puedan actualizarse entre sí.
- `versionCode` debe aumentar en cada APK publicada y `appId` debe seguir igual. Cambiar `appId` crea una aplicación paralela y no repara un conflicto de firma.
