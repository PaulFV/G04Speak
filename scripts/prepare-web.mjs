import { copyFile, readFile, writeFile } from 'node:fs/promises';

const distUrl = new URL('../dist/', import.meta.url);
const indexUrl = new URL('index.html', distUrl);
const notFoundUrl = new URL('404.html', distUrl);
const noJekyllUrl = new URL('.nojekyll', distUrl);

let html = await readFile(indexUrl, 'utf8');

// Der von Expo erzeugte Titel richtet sich nach app.json ("G04Speak", dem
// internen Projektnamen) - nicht nach dem Markennamen "GoSpeak". Ein fest
// verdrahteter Suchtext ("<title>GoSpeak</title>") traf deshalb nie zu und
// liess Titel, Meta-Beschreibung und Open-Graph-Tags stillschweigend weg.
// Ein Regex-Ersatz auf den tatsaechlichen Titel behebt das zuverlaessig.
html = html
  .replace('<html lang="en">', '<html lang="de">')
  // viewport-fit=cover gibt der App die Flaeche hinter Notch/Home-Indikator frei -
  // sonst bleibt im Vollbildmodus (Home-Bildschirm-Icon) oben/unten ein weisser Rand.
  .replace(
    '<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />',
  )
  .replace(
    /<title>[^<]*<\/title>/,
    `<title>GoSpeak – Sprachen spielerisch lernen</title>
    <meta name="description" content="Lerne acht Sprachen kostenlos, spielerisch und ohne Konto. Dein Fortschritt bleibt lokal auf deinem Gerät." />
    <meta name="theme-color" content="#090B3D" />
    <meta property="og:title" content="GoSpeak – Sprachen spielerisch lernen" />
    <meta property="og:description" content="56 Sprachkurse, kurze Übungen und privater Lernfortschritt – kostenlos im Browser ausprobieren." />
    <!-- "Zum Home-Bildschirm hinzufuegen" oeffnet die App dann ohne Browser-Leiste, im Vollbild. -->
    <link rel="manifest" href="/G04Speak/manifest.webmanifest" />
    <link rel="apple-touch-icon" href="/G04Speak/icons/apple-touch-icon.png" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="GoSpeak" />`,
  );

await writeFile(indexUrl, html, 'utf8');
// GitHub Pages ignoriert sonst _expo/ und braucht fuer direkte SPA-Routen eine Fallback-Seite.
await writeFile(noJekyllUrl, '', 'utf8');
await copyFile(indexUrl, notFoundUrl);
