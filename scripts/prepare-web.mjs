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
    <meta name="apple-mobile-web-app-title" content="GoSpeak" />
    <!-- Dunkler Hintergrund fuer den Bereich hinter Notch/Home-Indikator, bevor die
         App-JS geladen ist - sonst blitzt dort kurz Browser-Weiss durch. -->
    <style>html, body { background-color: #090B3D; }</style>`,
  );

// Der eigentliche Grund fuer die Luecke am unteren Bildschirmrand (Home-
// Bildschirm-App im Vollbild): Expos eigener Reset (Style-Tag "expo-reset",
// weiter unten im <head>) setzt html/body/#root auf "height: 100%". In
// Safaris Standalone-Modus (viewport-fit=cover) ist "100%" aber nicht
// zuverlaessig gleich der tatsaechlichen Bildschirmhoehe - der Bereich hinter
// dem Home-Indikator kann dabei verloren gehen, wodurch App-Inhalt UND
// Tab-Leiste zu kurz geraten und darunter echter, unbemalter Leerraum bleibt
// (die "Luecke", die durch die Hintergrundfarbe zwar unauffaelliger, aber
// nicht kleiner wurde). "100dvh" (dynamic viewport height) entspricht der
// echten sichtbaren Flaeche und behebt das zuverlaessig. Diese Regel muss
// NACH dem expo-reset-Block stehen, damit sie bei gleicher Spezifitaet
// gewinnt - deshalb haengen wir sie erst hier, kurz vor "</head>", an.
html = html.replace(
  '</head>',
  `  <style>
    @supports (height: 100dvh) {
      html, body, #root { height: 100dvh; }
    }
  </style>
</head>`,
);

await writeFile(indexUrl, html, 'utf8');
// GitHub Pages ignoriert sonst _expo/ und braucht fuer direkte SPA-Routen eine Fallback-Seite.
await writeFile(noJekyllUrl, '', 'utf8');
await copyFile(indexUrl, notFoundUrl);
