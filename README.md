# GoSpeak

Eine Sprachlern-App für iPhone und Android — nach dem Vorbild von Duolingo, gebaut mit React Native und Expo.

**Acht Sprachen, 56 Kurse:** Deutsch · Englisch · Spanisch · Rumänisch · Russisch · Türkisch · Ungarisch · Polnisch

---

## Die Idee dahinter

Jeder Vokabeleintrag trägt eine Übersetzung in **allen acht Sprachen**:

```ts
w('bread', 'food', 'das Brot', 'the bread', 'el pan', 'pâinea', 'хлеб', 'ekmek', 'a kenyér', 'chleb')
```

Dadurch ist kein Inhalt an eine Sprachrichtung gebunden. Die App erzeugt jede Kombination aus Muttersprache und Lernsprache aus demselben Datensatz — **8 × 7 = 56 Kurse** ohne doppelte Pflege. Auch die Oberfläche folgt automatisch der gewählten Muttersprache.

## Funktionen

| Bereich | Umsetzung |
|---|---|
| **Lernpfad** | Linearer Pfad mit geschlängelten Knoten, gesperrten Lektionen und Einheiten-Bannern |
| **Übungstypen** | Auswahl, Hörverstehen (Sprachausgabe), Satzbau aus Wortkacheln, freie Eingabe, Paare zuordnen |
| **XP & Level** | 10 XP pro Lektion, +5 Bonus für eine fehlerfreie Runde, 100 XP je Level |
| **Tagesserie** | Zählt aufeinanderfolgende Lerntage, bricht bei einem verpassten Tag |
| **Herzen** | 5 Leben, eins pro Fehler; regenerieren alle 30 Minuten oder gegen 50 Edelsteine |
| **Wiederholung** | Leitner-System mit Stufen (0 / 1 / 3 / 7 / 16 / 35 Tage), fällige Wörter werden eingestreut |
| **Liga** | Wochen-Rangliste mit Auf- und Abstiegszone |
| **Erfolge** | Acht Abzeichen mit Fortschrittsanzeige |
| **Tagesziel** | Wählbar: 10 / 20 / 30 / 50 XP pro Tag |

Falsch beantwortete Aufgaben wandern ans Ende der Runde und müssen erneut gelöst werden, bevor die Lektion endet.

## Im Browser ausprobieren

**[paulfv.github.io/GoSpeek](https://paulfv.github.io/GoSpeek/)** — die Web-Fassung, gebaut und veröffentlicht bei jedem Push auf `main`.

Sie dient zum schnellen Reinschauen. Die eigentliche App ist die native Fassung: nur dort gibt es Sprachausgabe mit den Gerätestimmen, haptisches Feedback und echte Flaggen-Symbole.

## Schnellstart

```bash
npm install
npx expo start
```

Danach den QR-Code mit der **Expo Go** App scannen ([iOS](https://apps.apple.com/app/expo-go/id982107779) · [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)). Alternativ `npm run android` oder `npm run ios`.

> Xcode oder Android Studio werden für den Start **nicht** benötigt — Expo Go reicht.

## Builds für die Stores

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview    # APK zum Ausprobieren
eas build --platform all --profile production     # Store-Builds
```

Die Profile stehen in [`eas.json`](eas.json), die App-Identität (Bundle-ID `com.gospeak.app`) in [`app.json`](app.json).

## Aufbau

```
app/                       Bildschirme (expo-router, dateibasiert)
├── index.tsx              Einstieg: Onboarding oder Lernpfad
├── onboarding.tsx         Kurswahl in zwei Schritten
├── (tabs)/
│   ├── index.tsx          Lernpfad
│   ├── league.tsx         Wochenliga
│   ├── quests.tsx         Erfolge
│   └── profile.tsx        Profil, Tagesziel, Einstellungen
└── lesson/[id].tsx        Lektionsablauf und Abschluss

src/
├── data/
│   ├── languages.ts       Die acht Sprachen samt Stimmen-Codes
│   ├── vocabulary.ts      Begriffe und Einheiten — der Inhaltskern
│   ├── i18n.ts            Oberflächentexte in acht Sprachen
│   └── achievements.ts    Erfolge
├── lib/
│   ├── course.ts          Baut den Lernpfad aus den Einheiten
│   ├── exercises.ts       Erzeugt die Aufgaben einer Lektion
│   ├── srs.ts             Verteiltes Wiederholen (Leitner)
│   ├── league.ts          Rangliste
│   └── speech.ts          Sprachausgabe
├── store/useStore.ts      Zustand, lokal gespeichert (AsyncStorage)
├── components/            Wiederverwendbare Bausteine
└── theme/theme.ts         Farben, Abstände, Typografie
```

## Inhalte erweitern

Neue Vokabel in [`src/data/vocabulary.ts`](src/data/vocabulary.ts) ergänzen — eine Zeile, acht Übersetzungen:

```ts
w('window', 'home', 'das Fenster', 'the window', 'la ventana', 'fereastra',
  'окно', 'pencere', 'az ablak', 'okno'),
```

Der Lernpfad wächst automatisch mit: je fünf Begriffe ergeben eine Lektion, am Ende jeder Einheit steht eine Wiederholung.

Eine neue Einheit braucht zusätzlich einen Eintrag in `UNITS` mit Titel in allen acht Sprachen. Eine neunte Sprache erfordert einen neuen Code in `LANG_CODES` — TypeScript zeigt danach jede Stelle an, an der die Übersetzung noch fehlt.

## Technik

- **React Native 0.76** über **Expo SDK 52**
- **expo-router** für dateibasierte Navigation
- **zustand** mit AsyncStorage-Persistenz
- **expo-speech** für die Sprachausgabe (nutzt die Stimmen des Geräts)
- TypeScript im `strict`-Modus

Es gibt keinen Server: aller Fortschritt liegt auf dem Gerät, die App funktioniert offline und sammelt keine Daten.

## Lizenz

MIT — siehe [LICENSE](LICENSE).

*GoSpeak ist ein eigenständiges Lernprojekt und steht in keiner Verbindung zu Duolingo.*
