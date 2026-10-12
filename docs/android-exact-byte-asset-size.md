# Android APK: exact-byte media deduplication

Android previously shipped multiple byte-identical copies of the same photographs, trophies, crests and design resources. Vite emits hashed media files while the static-copy build also preserves their original URLs. Several history files are also identical in the original and enhanced folders. Deleting files based on unused-looking folders would break dynamic history, editing, notification and offline paths.

The Android workflow now builds a baseline APK, removes only redundant image copies from the generated Android assets, installs a native alias map, and builds the optimized APK. Every original URL remains available. Images are grouped by SHA-256 **and original filename extension**. There is no image resizing, format conversion, lossy compression, or modification to original repository media, source Java, public resources or desktop output. JavaScript, stylesheets, HTML, JSON, video and audio files remain physically packaged.

## Local built-tree measurement

Measured against the web build from main `087658a` on 12 October 2026:

| Measurement | Bytes | Decimal MB |
| --- | ---: | ---: |
| Android public assets before | 189,338,001 | 189.34 |
| Redundant image bytes removed | 25,033,048 | 25.03 |
| Android public assets after | 164,304,953 | 164.30 |
| Native alias manifest | 14,211 | 0.014 |
| Assets after, including aliases | 164,319,164 | 164.32 |
| Net asset reduction | 25,018,837 | 25.02 |

834 original web paths are inventoried; 111 redundant image copies are removed. Examples include the trophy PNG published three times, both original moments images published twice, Vite hashes plus public design backgrounds, and identical original/enhanced history photographs. Distinct enhanced photographs and all original content remain.

The removed image data occupies approximately 24,843,916 bytes even if every removed image were ZIP-deflated at level 6. This is an estimate of potential APK savings; APK signing, native classes and package compression add overhead. The workflow measures the **actual two APK file sizes from the same build** and writes the exact reduction to the Actions summary and `Liga-Juventino-Android-Size-Report` artifact. No estimated APK size is presented as a completed Gradle measurement.

The optimized package must be rebuilt with `./gradlew clean assembleDebug`. The first CI attempt compiled both native versions successfully and verified every final asset, but an incremental second build reduced the actual APK by only 137,588 bytes (183,620,236 → 183,482,648 bytes). APKflinger retained deleted payload space as unnamed virtual ZIP entries. Google's [Zipflinger documentation](https://android.googlesource.com/platform/tools/base/+/refs/heads/mirror-goog-studio-master-dev/zipflinger/README.md) describes this behavior. A clean package rebuild removes that space without touching media or app functionality.

The final verifier now reads the actual compressed sizes of removed image entries from the baseline APK and requires the actual APK reduction to cover those bytes, allowing only a bounded overhead budget for the native alias implementation and signing. A regression fixture with correct indexed media and two megabytes of orphaned ZIP padding fails this check. Merely proving missing central-directory entries is insufficient.

## Native behavior

`LigaAssetAliases` uses the installed Capacitor 7 Android `Bridge.Builder.setRouteProcessor` API. `WebViewLocalServer` invokes this processor immediately before opening packaged assets. It serves the retained canonical image stream through Capacitor's existing request and response implementation. The original URL, query string, MIME detection, content headers and Range handling remain intact. WebView, fetch/XHR, CSS/image loading, canvas and service-worker requests share this server path. Videos are excluded from deduplication.

The processor is registered in the **generated** MainActivity before the bridge starts. Vite hashed images are preferred as physical canonical copies so the initial CSS/image URLs remain available during bridge construction. Original history/resource URLs are aliases to the same original bytes. Alias lookup is disabled for file-hosted bundles; native content/file routes and custom asset roots retain their original behavior.

The app's native notification image loader is the one direct public-image `AssetManager.open` consumer. The packaging script patches only its generated copy to use the same alias map. Other audited Capacitor consumers load configuration/plugin metadata or `www/` paths; these are not deduplicated. The installed `AndroidProtocolHandler` is reached through the existing local-server route processor.

## Verification

- Fail-first tests prove exact bytes and extension preservation for every original fixture URL, including dynamically assembled history paths, CSS resources and notification icons. Equal-looking filenames containing different bytes are retained; video copies and cross-extension images are retained.
- Separate corruption tests require packaging verification to fail if a reachable canonical image is missing or changed. An unfamiliar generated native notification loader aborts before any media deletion.
- APK ZIP tests verify real final archive bytes, reject missing/changed media, and compare measured archive sizes. The release verifier checks every pre-optimization file's SHA-256 and byte count inside the final APK, resolves aliases, and rejects copies unexpectedly left in the APK.
- The native Android workflow builds both baseline and optimized APKs with Gradle. This verifies the generated MainActivity, notification copy and alias module against the installed Android/Capacitor APIs.

Local verification passed all 19 Android/calendar tests, including the four new tests. The clean-build GitHub Actions run also passed native Java compilation, actual APK inventory checks and compiled browser checks against the optimized native asset tree. No physical Android device or emulator is implied by those checks. The alias inventory proves retention of all previously packaged bytes; it does not prove the baseline build included every remotely hosted or dynamically requested asset. Existing runtime tests remain necessary for that separate concern.

## Verified release measurement

Source `188f93bb1c0e93b9aa2511d8ddb6e6533a8c37c6`, build `v1461-mobile-clean-boot-smaller-apk-r4`, GitHub Actions run [38213078489](https://github.com/jairofrancog7-star/App-liga-/actions/runs/38213078489):

| Actual APK | Bytes | Decimal MB |
| --- | ---: | ---: |
| Baseline | 183,620,514 | 183.62 |
| Compact APK | 158,558,436 | 158.56 |
| Saved | 25,062,078 | 25.06 |

836 original runtime paths retained identical bytes; 111 redundant image copies removed. The optimized native tree passed all 35 captured mobile routes, seven initial delegated routes and all 111 original alias URLs. A sampler observed 1,283 visible frames without a legacy-design frame. Forward/reverse animation and exact previous scroll restoration also passed before APK publication.

Published APK SHA-256: `b4d3ac4d5acd915216ed46b4573c63de67b54fb51935d21162a40ed2bc2e82d8`.
