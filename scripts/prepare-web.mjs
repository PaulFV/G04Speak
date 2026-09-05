import { copyFile, readFile, writeFile } from 'node:fs/promises';

const distUrl = new URL('../dist/', import.meta.url);
const indexUrl = new URL('index.html', distUrl);
const notFoundUrl = new URL('404.html', distUrl);
const noJekyllUrl = new URL('.nojekyll', distUrl);

let html = await readFile(indexUrl, 'utf8');

html = html
  .replace('<html lang="en">', '<html lang="de">')
  .replace(
    '<title>GoSpeak</title>',
    `<title>GoSpeak – Sprachen spielerisch lernen</title>
    <meta name="description" content="Lerne acht Sprachen kostenlos, spielerisch und ohne Konto. Dein Fortschritt bleibt lokal auf deinem Gerät." />
    <meta name="theme-color" content="#090B3D" />
    <meta property="og:title" content="GoSpeak – Sprachen spielerisch lernen" />
    <meta property="og:description" content="56 Sprachkurse, kurze Übungen und privater Lernfortschritt – kostenlos im Browser ausprobieren." />`,
  );

await writeFile(indexUrl, html, 'utf8');
// GitHub Pages ignoriert sonst _expo/ und braucht fuer direkte SPA-Routen eine Fallback-Seite.
await writeFile(noJekyllUrl, '', 'utf8');
await copyFile(indexUrl, notFoundUrl);
