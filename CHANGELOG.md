# Änderungsprotokoll

## 2.0.0

**Neue Funktionen**
- Lokale Erinnerungen (`Profil → Erinnerungen`): warnt, wenn die Tagesserie in Gefahr ist, und meldet sich, sobald die Herzen wieder voll sind. Komplett auf dem Gerät geplant, ohne Server oder Konto - standardmäßig ausgeschaltet, bis in den Einstellungen aktiviert.
- Fortschritt sichern/wiederherstellen (`Profil → Fortschritt sichern`): der gesamte lokale Fortschritt lässt sich als JSON-Datei exportieren und auf einem anderen Gerät oder nach einer Neuinstallation wieder einspielen.
- Fünf neue Erfolge: fünf fehlerfreie Lektionen in Folge, zwei Sprachen gleichzeitig lernen, an vier verschiedenen Wochenendtagen gelernt, den aktuellen Kurs komplett abgeschlossen.
- Echtes Profilbild auch auf iOS/Android (vorher nur im Web möglich) über die native Bildauswahl.

**Behoben**
- Der helle Modus zeigte "ausgewählt"-Zustände (Sprachkarten beim Einrichten, Chips im Profil) weiterhin in festen dunklen Farben statt in der hellen Palette - jetzt vollständig themefähig.

**Intern**
- Testabdeckung für die Kernlogik ergänzt (Leitner-Wiederholung, Übungsgenerierung, Lernpfad, Store/Statistiken) - `npm test`.

## 1.0.0

Erste Version: acht Sprachen, 56 Kurse aus einem einzigen Datensatz, fünf Übungstypen, Leitner-Wiederholung, Herzen/XP/Tagesserie, simulierte Wochenliga, acht Erfolge, Web-Fassung über GitHub Pages.
