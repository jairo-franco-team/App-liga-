import { defineConfig } from 'vite';
import { copyFileSync, mkdirSync, existsSync, cpSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

function copyStaticReferences() {
  return {
    name: 'copy-static-references',
    closeBundle() {
      const files = [
        ['src/v606-control-registro-tools.js', 'dist/src/v606-control-registro-tools.js'],
        ['docs/Reglamento_Liga_Juventino_Rosas_2026_2027.pdf', 'dist/docs/Reglamento_Liga_Juventino_Rosas_2026_2027.pdf'],
        ['src/v606-control-registro-tools.css', 'dist/src/v606-control-registro-tools.css'],
        ['src/v1153-matchday-fullwidth-safe-crests.css', 'dist/src/v1153-matchday-fullwidth-safe-crests.css'],
        ['src/v1167-matchday-centered-official-crests.css', 'dist/src/v1167-matchday-centered-official-crests.css'],
        ['src/v1166-meeting-officers.css', 'dist/src/v1166-meeting-officers.css'],
        ['src/vendor/QRCODE-LICENSE.txt', 'dist/src/vendor/QRCODE-LICENSE.txt'],
        ['data/account-cloud-config.json', 'dist/data/account-cloud-config.json'],
        ['assets/liga-logo-original.webp', 'dist/assets/liga-logo-original.webp'],
        ['assets/liga-logo.webp', 'dist/assets/liga-logo.webp'],
        ['assets/reference/final-trophy-drive.png', 'dist/assets/reference/final-trophy-drive.png'],
        ['assets/reference/predictor-v36/liga-crest-white.webp', 'dist/assets/reference/predictor-v36/liga-crest-white.webp'],
        ['assets/moments/moments-original-a.png', 'dist/assets/moments/moments-original-a.png'],
        ['assets/moments/moments-original-b.png', 'dist/assets/moments/moments-original-b.png'],
        ['src/desktop-browser-editorial-20261011.css', 'dist/src/desktop-browser-editorial-20261011.css'],
        ['src/pc-home-uefa-colors-scroll-fast-20261012.css', 'dist/src/pc-home-uefa-colors-scroll-fast-20261012.css'],
        ['pc-exact-original-20261011.html', 'dist/pc-exact-original-20261011.html'],
        ['assets/home-players-user.png', 'dist/assets/home-players-user.png'],
        ['assets/home-players-fictional.jpg', 'dist/assets/home-players-fictional.jpg'],
      ];

      for (const [fromPath, toPath] of files) {
        const from = resolve(fromPath);
        const to = resolve(toPath);
        if (existsSync(from)) {
          mkdirSync(dirname(to), { recursive: true });
          copyFileSync(from, to);
        }
      }
      const rulebookPdf = resolve('dist/docs/Reglamento_Liga_Juventino_Rosas_2026_2027.pdf');
      if (!existsSync(rulebookPdf) || readFileSync(rulebookPdf).subarray(0,5).toString('ascii') !== '%PDF-') throw new Error('Falta el Reglamento PDF válido en el paquete publicado');
      for (const name of readdirSync(resolve('dist/assets')).filter(n=>n.endsWith('.css'))) {
        const file=resolve('dist/assets',name);
        writeFileSync(file,readFileSync(file,'utf8').replace(/env\(safe-area-inset-(top|bottom|left|right)(?:,[^)]*)?\)/g,(value,side)=>'var(--ljr-native-'+side+', '+value+')'));
      }
      const pcHTML = resolve('dist/pc-exact-original-20261011.html');
      if (!existsSync(pcHTML)) throw new Error('Falta portada PC en dist: pc-exact-original-20261011.html');
      const pcMarkup = readFileSync(pcHTML,'utf8');
      const pcStyles = [...pcMarkup.matchAll(/<link\b[^>]*href="\.\/([^"?]+\.css)(?:\?[^"]*)?"/gi)].map(m => m[1]);
      for (const css of new Set(pcStyles)) {
        if (!existsSync(resolve('dist',css))) throw new Error('CSS faltante en Inicio PC publicado: '+css);
      }
      const pcAssets = [...pcMarkup.matchAll(/(?:src|href)="\.\/([^"?]+\.(?:png|jpe?g|webp|svg))"/gi)].map(m => m[1]);
      for (const asset of new Set(pcAssets)) {
        if (!existsSync(resolve('dist', asset))) {
          throw new Error('Imagen o logo faltante en la portada PC publicada: ' + asset);
        }
      }

      for(const directory of ['assets/content-studio','assets/branding']){if(existsSync(resolve(directory)))cpSync(resolve(directory),resolve('dist',directory),{recursive:true,force:true})}
      const gamingSource = resolve('gaming');
      if (existsSync(gamingSource)) {
        cpSync(gamingSource, resolve('dist/gaming'), { recursive: true, force: true });
      }
      const seasonSource = resolve('assets/season-2026');
      if (existsSync(seasonSource)) {
        cpSync(seasonSource, resolve('dist/assets/season-2026'), { recursive: true, force: true });
      }
      for (const name of ['index.html','about.html','services.html','portfolio.html','blog.html','contact.html']) {
        const dest = resolve('dist/gaming', name);
        if (!existsSync(dest)) throw new Error('Página Gaming faltante: ' + name);
      }
      const gamingAssets = [
        'assets/branding/escudo-liga-azul-sin-fondo-v1007.png',
        'assets/home-players-user.png',
        'assets/moments/moments-original-a.png',
        'assets/moments/moments-original-b.png',
        'assets/history/archive-v224/la-esperanza-campeon-copa-veteranos50-08-nov-2025.webp',
        'assets/history/archive-v278/boavista-campeon-de-campeones-primera-18-ene-2015.jpg',
        'assets/reference/final-trophy-drive.png',
        'assets/season-2026/galacticos.webp',
        'assets/season-2026/lobos-cdg.webp',
      ];
      const historyFrom = resolve('assets/history');
      const historyTo = resolve('dist/assets/history');
      if (existsSync(historyFrom)) {
        mkdirSync(historyTo, { recursive: true });
        cpSync(historyFrom, historyTo, { recursive: true, force: true });
      }

      for (const asset of gamingAssets) {
        if (!existsSync(resolve('dist', asset))) throw new Error('Asset Gaming ausente en dist: ' + asset);
      }

      const sourceIndex = readFileSync(resolve('index.html'), 'utf8');
      const classicScriptRefs = [...sourceIndex.matchAll(/<script(?![^>]*type=["']module["'])[^>]*src=["']\.\/src\/([^"'?]+\.js)(?:\?[^"']*)?["'][^>]*><\/script>/g)]
        .map(match => match[1]);

      for (const relativeScript of new Set(classicScriptRefs)) {
        const from = resolve('src', relativeScript);
        const to = resolve('dist', 'src', relativeScript);
        if (!existsSync(from)) {
          throw new Error('Classic script referenced by index.html is missing: src/' + relativeScript);
        }
        mkdirSync(dirname(to), { recursive: true });
        if (relativeScript === 'main.js') {
          const mapsKey = JSON.stringify(process.env.VITE_GOOGLE_STREETVIEW_API_KEY || '');
          writeFileSync(to, 'window.LJR_STREETVIEW_API_KEY=' + mapsKey + ';\n' + readFileSync(from, 'utf8'));
        } else copyFileSync(from, to);
      }

      const esperanzaParts = [
        'src/v214-esperanza-photo-1.js',
        'src/v214-esperanza-photo-2.js',
        'src/v214-esperanza-photo-3.js',
        'src/v214-esperanza-photo-4.js',
      ];
      if (esperanzaParts.every(p => existsSync(resolve(p)))) {
        const base64 = esperanzaParts.map(p => {
          const source = readFileSync(resolve(p), 'utf8');
          const match = source.match(/LJR_ESPERANZA_2025_PARTS\.push\('([^']+)'\)/);
          if (!match) throw new Error('No se pudo leer el chunk de La Esperanza: ' + p);
          return match[1];
        }).join('');
        const bytes = Buffer.from(base64, 'base64');
        if (bytes.subarray(0, 4).toString('ascii') !== 'RIFF' || bytes.subarray(8, 12).toString('ascii') !== 'WEBP') {
          throw new Error('La fotografía reconstruida de La Esperanza no es un WEBP válido');
        }
        const target = resolve('dist/assets/history/archive-v224/la-esperanza-campeon-copa-veteranos50-08-nov-2025.webp');
        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(target, bytes);
      }

      // Bust stale Service Worker cache for classic scripts in dist/index.html
      const indexBuilt = resolve('dist/index.html');
      if (existsSync(indexBuilt)) {
        let html = readFileSync(indexBuilt, 'utf8');
        html = html.replace(/(src=["']\.\/src\/[^"'?]+\.js\?v=[^"']+)(["'])/g, '$1-rea20261105v12$2');
        const swPurge = `<script id="ljpc-sw-cache-purge-20261105">(function(){try{if('caches'in window){caches.keys().then(function(ks){ks.forEach(function(k){if(k.indexOf('20261105-rea-pc-v12')<0)caches.delete(k);});});}if('serviceWorker'in navigator){navigator.serviceWorker.getRegistrations().then(function(rs){rs.forEach(function(r){r.update();});});}}catch(_){}})();</script>\n`;
        if (!html.includes('v1166-meeting-officers.css')) {
          html = html.replace('</head>', '  <link rel="stylesheet" href="./src/v1166-meeting-officers.css" />\n' + swPurge + '</head>');
        } else {
          html = html.replace('</head>', swPurge + '</head>');
        }
        writeFileSync(indexBuilt, html);
      }
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [copyStaticReferences()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
